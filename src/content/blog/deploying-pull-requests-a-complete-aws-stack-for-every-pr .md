---
title: "Deploying Pull Requests: A Complete AWS Stack for Every PR 🚀"
description: "Learn how to automatically deploy every pull request to its own isolated AWS environment, complete with custom domains, SSL certificates, and full-stack infrastructure. This guide covers the architecture, CI/CD pipeline, and best practices for building robust, production-like PR deployments that supercharge your team's development workflow."
author: "Pedro Teixeira"
date: 2025-06-25
tags:
  [
    "devops",
    "aws",
    "ci/cd",
    "pull requests",
    "serverless",
    "infrastructure as code",
    "github actions",
    "cloudformation",
    "automation",
    "ssl",
    "custom domains",
    "team productivity",
    "testing",
    "deployment",
  ]
image: "/images/blog/deploying-prs.png"
---

![Deploying PRs](/images/blog/deploying-prs-2.jpg)

Ever wondered how some teams manage to deploy every pull request to its own isolated environment? Well, buckle up! We're about to dive deep into how we built a CI/CD pipeline that creates a complete AWS infrastructure stack for every PR, complete with custom domains, SSL certificates, and full isolation.

This isn't just about deploying code—it's about creating a development experience that eliminates the "works on my machine" problem and gives every developer confidence that their changes will work in production. Let's explore how we achieved this and why it's such a game-changer for development teams.

## The Magic: What Happens When You Open a PR

When you open a pull request in our repository, here's what happens behind the scenes:

1. **GitHub Actions triggers** the deployment workflow
2. **A unique domain is generated** (e.g., `123.<MY_DOMAIN>.com` for PR #123)
3. **An entire AWS stack is provisioned** with Lambda functions, API Gateway, DynamoDB, S3, etc.
4. **SSL certificates are configured** for the custom domain
5. **Your code is deployed** to this isolated environment
6. **A Discord notification** tells the team where to find your deployment

The result? Every PR gets its own production-like environment that's completely isolated from others. No more "works on my machine" excuses! 🎉

### Why This Approach Matters

Traditional development workflows often suffer from several pain points:

- **Environment drift**: What works locally doesn't work in staging
- **Resource contention**: Multiple developers sharing the same staging environment
- **Slow feedback loops**: Waiting for staging to be available or for other deployments to complete
- **Limited testing**: Can't test integrations with external services easily

Our approach solves these problems by giving each PR its own complete environment. This means developers can:

- Test their changes in a production-like environment immediately
- Share working demos with stakeholders without waiting
- Debug issues that only appear in production-like conditions
- Experiment with changes without affecting other developers

## The Architecture: Building Blocks

### 1. Infrastructure as Code with Architect

We use [Architect](https://arc.codes) (arc) to define our infrastructure as code. The `app.arc` file is our blueprint:

```yaml
@app
decipad-backend

@http
any /*
any /graphql
post /api/auth/signin/:provider
# ... more routes

@tables
users
  id *String
  name String
  # ... more fields

@queues
sendemail
notify-subscriptions
# ... more queues

@plugins
s3
custom-domain
lambda-urls
nasa-gcn/architect-functions-search

@aws
region eu-west-2
timeout 60
runtime nodejs18.x
```

This single file defines:

- **HTTP routes** and API endpoints
- **DynamoDB tables** with indexes
- **SQS queues** for background processing
- **S3 buckets** for file storage
- **WebSocket connections**
- **Custom plugins** for domain management

**Why Architect?** We chose Architect because it provides a declarative way to define serverless infrastructure. Instead of writing hundreds of lines of CloudFormation YAML, we can express our infrastructure needs in a simple, readable format. This makes it easier to understand what resources we're creating and reduces the chance of configuration errors.

The beauty of this approach is that Architect handles the complexity of AWS service integration for us. It automatically creates the necessary IAM roles, sets up proper permissions, and configures services to work together seamlessly.

### 2. Custom Domain Plugin: The Secret Sauce

The magic happens in our custom domain plugin (`apps/backend/src/plugins/custom-domain/index.js`):

```javascript
module.exports = {
  deploy: {
    start: async ({ cloudformation, stage }) => {
      if (stage !== "staging") {
        return cloudformation;
      }

      const customDomain = process.env.CUSTOM_DOMAIN;
      const CertificateArn = process.env.CERTIFICATE_ARN;
      const HostedZoneId = process.env.ZONE_ID;

      if (customDomain) {
        cloudformation.Resources.HTTP.Properties.Domain = {
          DomainName: customDomain,
          CertificateArn,
          Route53: {
            HostedZoneId,
            DistributionDomainName: customDomain,
          },
        };
      }

      return cloudformation;
    },
  },
};
```

This plugin:

- **Intercepts the CloudFormation template** during deployment
- **Injects custom domain configuration** into the API Gateway
- **Configures Route53 DNS** to point to the new domain
- **Attaches SSL certificates** for HTTPS

**The Plugin Strategy**: We use Architect's plugin system to extend the deployment process. This allows us to customize the infrastructure for each PR without modifying the core application configuration. The plugin only runs for staging deployments (PR environments), ensuring that production deployments remain unchanged.

This approach gives us the flexibility to add custom domain support without cluttering our main application configuration. It's a clean separation of concerns that makes our infrastructure code more maintainable.

### 3. The CI/CD Pipeline: GitHub Actions Magic

Our deployment workflow (`.github/workflows/deploy-pr.yaml`) orchestrates the entire process:

```yaml
name: Deploy PR

on:
  pull_request:
    types: [opened, reopened, synchronize]

jobs:
  deploy:
    name: 🚧 Deploy PR
    runs-on: buildjet-4vcpu-ubuntu-2204
    concurrency:
      group: "deploy-pr-${{ github.event.pull_request.number }}"
      cancel-in-progress: false
```

Key features:

- **Concurrency control** ensures only one deployment per PR
- **BuildJet runners** for faster builds
- **Comprehensive caching** for dependencies

**Concurrency Strategy**: We use GitHub Actions' concurrency feature to prevent multiple deployments of the same PR from running simultaneously. This is crucial because AWS CloudFormation operations are not idempotent—running multiple deployments at the same time can cause resource conflicts and deployment failures.

The `cancel-in-progress: false` setting ensures that if a new commit is pushed while a deployment is running, the current deployment continues to completion. This prevents wasted resources and ensures that the latest code always gets deployed.

**BuildJet Runners**: We use BuildJet runners instead of GitHub's standard runners because they provide more CPU and memory resources, which significantly speeds up our build process. This is especially important when building WASM components and running multiple build steps.

## The Deployment Process: Step by Step

### Step 1: Environment Setup

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.DEV_AWS_ACCESS_KEY }}
    aws-secret-access-key: ${{ secrets.DEV_AWS_SECRET_ACCESS_KEY }}
    aws-region: eu-west-2
```

**AWS Credentials Strategy**: We use separate AWS credentials for development and production environments. This follows the principle of least privilege—development credentials have limited permissions and can only access development resources. This reduces the risk of accidentally affecting production systems during development.

### Step 2: Domain Configuration

```yaml
env:
  DEPLOY_NAME: "${{ github.event.pull_request.number }}"
  CUSTOM_DOMAIN: "${{ github.event.pull_request.number }}.<MY_DOMAIN>.com"
  ZONE_ID: "${{secrets.DEV_ZONE_ID}}"
  CERTIFICATE_ARN: "${{secrets.DEV_CERTIFICATE_ARN}}"
```

**Domain Naming Strategy**: We use the PR number as the subdomain prefix. This creates predictable, memorable URLs that are easy to share and reference. For example, PR #123 becomes `123.<MY_DOMAIN>.com`. This approach also makes it easy to identify which PR a deployment belongs to.

**Certificate Strategy**: We use a wildcard SSL certificate (`*.<MY_DOMAIN>.com`) that covers all possible PR subdomains. This eliminates the need to request new certificates for each PR and ensures that all deployments have valid HTTPS from the start.

### Step 3: Build Process

The deployment script (`scripts/deploy-pr.sh`) handles the build:

```bash
# Build WASM components
pnpm build:wasm

# Build frontend
pnpm build:frontend
cp -rT dist/apps/frontend/. apps/backend/public

# Build backend
pnpm build:backend:ssr

# Deploy with Architect
arc deploy --no-hydrate --name "$DEPLOY_NAME"
```

**Build Strategy**: Our build process is designed to create a complete, self-contained deployment package. We build all components (WASM, frontend, backend) and package them together. The `--no-hydrate` flag tells Architect not to create local development resources, which saves time and resources.

**WASM Integration**: We build WebAssembly components for compute-intensive operations. This allows us to run high-performance code in the browser and reduces server load. The WASM components are built once and reused across all deployments.

### Step 4: SAM Template Management

We use AWS SAM templates for infrastructure state management:

```bash
# Pull existing SAM template
export SAM_LOCATION="s3://<BUCKET>/${{env.CUSTOM_DOMAIN}}"
scripts/pull-sam.sh

# Deploy
pnpm deploy:pr

# Push updated SAM template
scripts/push-sam.sh
```

**SAM Template Strategy**: We store CloudFormation templates in S3 to maintain deployment state across runs. This allows us to update existing deployments instead of creating new ones from scratch, which is faster and more reliable. The templates are stored per domain, ensuring that each PR deployment maintains its own state.

## Infrastructure Components: What Gets Created

For each PR, we create a complete AWS stack:

### 1. **API Gateway**

- Custom domain with SSL certificate
- Route53 DNS configuration
- WebSocket support for real-time features

**API Gateway Strategy**: We use API Gateway as the entry point for all HTTP requests. It handles routing, authentication, rate limiting, and SSL termination. The custom domain configuration ensures that each PR has its own URL, making it easy to test and share.

### 2. **Lambda Functions**

- HTTP handlers for API endpoints
- WebSocket handlers for real-time communication
- Queue processors for background jobs

**Lambda Strategy**: We use serverless functions for all compute needs. This provides automatic scaling, pay-per-use pricing, and eliminates the need to manage servers. Each function is isolated and can be deployed independently.

### 3. **DynamoDB Tables**

- User data, permissions, workspaces
- Document storage and collaboration data
- Analytics and usage tracking

**Database Strategy**: We use DynamoDB for its scalability and serverless nature. Each PR deployment gets its own set of tables, ensuring complete data isolation. This allows developers to test with real data without affecting other environments.

### 4. **S3 Buckets**

- File attachments and uploads
- Static asset hosting
- Backup storage

**Storage Strategy**: S3 provides reliable, scalable storage for files and static assets. We use separate buckets for different types of data (attachments, backups, etc.) to maintain clear separation of concerns.

### 5. **SQS Queues**

- Email notifications
- Background processing
- Event-driven workflows

**Queue Strategy**: SQS handles asynchronous processing and decouples different parts of our system. This improves reliability and allows us to handle high-load scenarios gracefully.

### 6. **CloudWatch**

- Logging and monitoring
- Performance metrics
- Error tracking

**Monitoring Strategy**: CloudWatch provides comprehensive monitoring and alerting. We collect logs from all Lambda functions and set up alarms for errors and performance issues.

## Security and Isolation

### Environment Variables

Each deployment gets its own set of environment variables:

```yaml
env:
  NODE_ENV: "production"
  APP_URL_BASE: "https://${{ github.event.pull_request.number }}.<MY_DOMAIN>.com"
  JWT_SECRET: "${{secrets.JWT_SECRET}}"
  OPENAI_API_KEY: "${{secrets.OPENAI_API_KEY}}"
  # ... 50+ more environment variables
```

**Environment Variable Strategy**: We use environment variables to configure each deployment. This allows us to use the same codebase for different environments while maintaining proper separation. Sensitive data is stored in GitHub Secrets and injected during deployment.

### Secrets Management

- **GitHub Secrets** store sensitive data
- **Environment-specific** configurations
- **No hardcoded secrets** in the build

**Secrets Strategy**: We never hardcode secrets in our codebase. All sensitive data is stored in GitHub Secrets and injected as environment variables during deployment. This ensures that secrets are never committed to version control and can be rotated easily.

### Isolation Strategy

- **Separate CloudFormation stacks** per PR
- **Unique domain names** prevent conflicts
- **Independent databases** and storage
- **Isolated Lambda functions**

**Isolation Benefits**: Complete isolation between PR deployments provides several benefits:

- **No interference**: Changes in one PR don't affect others
- **Safe experimentation**: Developers can make risky changes without consequences
- **Parallel development**: Multiple teams can work simultaneously
- **Easy cleanup**: Failed deployments don't leave artifacts

## Monitoring and Notifications

### Discord Integration

```yaml
- name: Notify
  uses: decipad/discord-webhook@v5
  with:
    title: "💚 Deploy PR #${{ github.event.pull_request.number }}"
    description: "https://${{ github.event.pull_request.number }}.<MY_DOMAIN>.com"
```

**Notification Strategy**: We use Discord for team notifications because it provides real-time updates and integrates well with our development workflow. The notifications include the deployment URL, making it easy for team members to access and test PR deployments.

### Health Checks

- **Automated testing** on staging deployments
- **Performance monitoring** with CloudWatch
- **Error tracking** with Sentry

**Health Monitoring Strategy**: We monitor all deployments for health and performance issues. This helps us catch problems early and ensures that only healthy deployments are promoted to production.

## Cost Optimization

### Resource Management

- **Auto-scaling** Lambda functions
- **TTL indexes** on DynamoDB tables
- **Lifecycle policies** on S3 buckets
- **Cleanup scripts** for old deployments

**Cost Strategy**: Serverless architecture provides excellent cost optimization because we only pay for what we use. However, we still need to manage costs carefully:

- **Auto-scaling** ensures we don't over-provision resources
- **TTL indexes** automatically clean up old data
- **Lifecycle policies** move old files to cheaper storage
- **Cleanup scripts** remove old PR deployments

### Cleanup Strategy

```bash
# Example cleanup for old PR deployments
aws cloudformation delete-stack --stack-name pr-$PR_NUMBER
aws route53 delete-record --hosted-zone-id $ZONE_ID --change-batch file://delete-record.json
```

**Cleanup Importance**: Without proper cleanup, old PR deployments can accumulate and increase costs. We have automated scripts that remove deployments older than a certain age and clean up associated resources.

## How to Implement This Yourself

### Prerequisites

1. **AWS Account** with appropriate permissions
2. **Route53 hosted zone** for your domain
3. **SSL certificate** (wildcard or specific subdomains)
4. **GitHub repository** with Actions enabled

**Prerequisites Strategy**: Setting up the prerequisites requires careful planning:

- **AWS Account**: Ensure you have the necessary permissions for CloudFormation, Lambda, API Gateway, etc.
- **Route53**: You need a hosted zone for your domain to manage DNS records
- **SSL Certificate**: A wildcard certificate is recommended for PR deployments
- **GitHub Actions**: Enable Actions and configure the necessary secrets

### Step 1: Set Up Infrastructure

```bash
# Install Architect
pnpm install -g @architect/architect

# Create your app.arc file
arc init my-app
```

**Infrastructure Setup Strategy**: Start with a simple Architect application and gradually add complexity. This allows you to understand how each component works before adding more features.

### Step 2: Configure Custom Domains

```javascript
// plugins/custom-domain.js
module.exports = {
  deploy: {
    start: async ({ cloudformation, stage }) => {
      const customDomain = process.env.CUSTOM_DOMAIN;
      if (customDomain) {
        cloudformation.Resources.HTTP.Properties.Domain = {
          DomainName: customDomain,
          CertificateArn: process.env.CERTIFICATE_ARN,
          Route53: {
            HostedZoneId: process.env.ZONE_ID,
          },
        };
      }
      return cloudformation;
    },
  },
};
```

**Plugin Development Strategy**: Start with a simple plugin that adds basic domain support. You can then enhance it with additional features like custom headers, caching, or authentication.

### Step 3: Create GitHub Actions Workflow

```yaml
name: Deploy PR

on:
  pull_request:
    types: [opened, reopened, synchronize]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      - name: Deploy
        env:
          DEPLOY_NAME: "${{ github.event.pull_request.number }}"
          CUSTOM_DOMAIN: "${{ github.event.pull_request.number }}.staging.yourdomain.com"
          CERTIFICATE_ARN: "${{ secrets.CERTIFICATE_ARN }}"
          ZONE_ID: "${{ secrets.ZONE_ID }}"
        run: |
          arc deploy --name "$DEPLOY_NAME"
```

**Workflow Strategy**: Start with a simple workflow and add features incrementally. Begin with basic deployment, then add caching, notifications, and testing.

### Step 4: Set Up Secrets

Configure these GitHub secrets:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `CERTIFICATE_ARN`
- `ZONE_ID`

**Secrets Management Strategy**: Use descriptive names for secrets and document their purpose. Consider using different secrets for different environments to maintain proper separation.

## Best Practices and Lessons Learned

### 1. **Concurrency Control**

```yaml
concurrency:
  group: "deploy-pr-${{ github.event.pull_request.number }}"
  cancel-in-progress: false
```

**Concurrency Strategy**: Always use concurrency control to prevent deployment conflicts. This is especially important for CloudFormation deployments, which can fail if multiple operations run simultaneously.

### 2. **Resource Naming**

Use consistent naming patterns:

- Stack names: `pr-{number}`
- Domain names: `{number}.staging.domain.com`
- S3 buckets: `{project}-{environment}-{type}`

**Naming Strategy**: Consistent naming makes it easier to identify and manage resources. It also helps with automation and troubleshooting.

### 3. **Error Handling**

```bash
# Check for secrets in build artifacts
SEARCH_RESULT=`grep -rl "AWS_SECRET"`
if [ -n "${SEARCH_RESULT:-}" ]; then
  echo "Found AWS_SECRET in build"
  exit 1
fi
```

**Error Handling Strategy**: Implement comprehensive error checking to catch issues early. This includes checking for leaked secrets, validating configurations, and ensuring proper permissions.

### 4. **Monitoring**

- Set up CloudWatch alarms
- Monitor costs per deployment
- Track deployment success rates

**Monitoring Strategy**: Comprehensive monitoring helps you identify and resolve issues quickly. It also provides insights into system performance and usage patterns.

### 5. **Cleanup Automation**

```bash
# Clean up old PR deployments
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE | \
  jq -r '.StackSummaries[] | select(.StackName | startswith("pr-")) | .StackName' | \
  xargs -I {} aws cloudformation delete-stack --stack-name {}
```

**Cleanup Strategy**: Automated cleanup is essential for cost management. Set up scheduled jobs to remove old deployments and associated resources.

## Troubleshooting Common Issues

### 1. **Deployment Timeouts**

- Optimize build process
- Use faster runners (BuildJet)

**Timeout Strategy**: Timeouts often indicate resource constraints or inefficient processes. Monitor resource usage and optimize accordingly.

### 2. **Cost Spikes**

- Monitor CloudWatch metrics
- Set up billing alerts
- Implement automatic cleanup

**Cost Management Strategy**: Serverless doesn't mean cost-free. Monitor usage patterns and set up alerts to catch unexpected cost increases.

### 3. **SSL Certificate Issues**

- Verify certificate ARN is correct
- Check certificate covers wildcard domains
- Ensure certificate is in the correct region

**Certificate Strategy**: SSL certificate issues are common and can be difficult to debug. Always verify certificate configuration and ensure it covers the required domains.

## The Future: What's Next?

### Potential Improvements

1. **Multi-region deployments** for global performance
2. **Database migrations** in PR environments
3. **Automated testing** on PR deployments
4. **Performance benchmarking** between PRs
5. **Integration with feature flags**

**Future Strategy**: The system is designed to be extensible. We can add new features without disrupting existing functionality. This allows us to continuously improve the development experience.

### Scaling Considerations

- **Resource limits** per AWS account
- **Cost management** for large teams
- **Deployment frequency** optimization
- **Infrastructure as Code** versioning

**Scaling Strategy**: As the team grows, we need to consider resource limits and cost management. This includes monitoring usage patterns and implementing appropriate limits and alerts.

## Conclusion

Building a PR deployment system like this might seem complex, but the benefits are enormous:

- **Faster feedback loops** for developers
- **Better testing** in production-like environments
- **Reduced "works on my machine" issues**
- **Improved collaboration** with stakeholders
- **Confidence in deployments** to production

The key is starting simple and iterating. Begin with basic infrastructure, add custom domains, then layer on monitoring and automation. Before you know it, you'll have a robust system that makes every PR a joy to review! 🎉

**Implementation Philosophy**: This system represents a shift from traditional deployment models to a more developer-centric approach. Instead of treating deployments as a final step, we treat them as an integral part of the development process. This creates a feedback loop that improves code quality and reduces deployment risks.

Remember: The goal isn't just to deploy code—it's to create a development experience that makes your team more productive and confident in their changes. When developers can see their changes running in a production-like environment immediately, they're more likely to catch issues early and deliver higher-quality code.

Happy deploying! 🚀
