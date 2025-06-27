---
title: "Local Development Sandbox: Mirroring AWS Serverless on Your Machine 🔧"
description: "Discover how to create a fast, lightweight local development environment that closely mirrors AWS serverless infrastructure—without Docker or complex orchestration. Learn best practices, architecture, and tips for productive serverless development on your machine."
author: "Pedro Teixeira"
date: 2025-06-27
tags:
  [
    "local development",
    "serverless",
    "aws",
    "sandbox",
    "developer experience",
    "devops",
    "lambda",
    "dynamodb",
    "s3",
    "api gateway",
    "javascript",
    "nodejs",
    "vite",
    "best practices",
  ]
image: "/images/blog/local-development-sandox.jpg"
---

![Deploying PRs](/images/blog/local-development-sandox.jpg)

While our [PR deployment system](https://metaduck.com/deploying-pull-requests-a-complete-aws-stack-for-every-pr-/) creates isolated AWS environments for every pull request, developers need a fast, reliable local setup for day-to-day development. That's where our local sandbox comes in—a lightweight simulation of our serverless infrastructure that runs entirely on your machine.

This isn't about spinning up Docker containers or managing complex orchestration. Instead, we've built a simple, fast local development environment that mirrors our AWS setup as closely as possible while keeping things lightweight and developer-friendly.

## The Philosophy: Simplicity Over Complexity

When we designed our local development setup, we had a few key principles in mind:

- **Fast startup times** - No waiting for containers to build or services to initialize
- **Minimal resource usage** - Runs efficiently on any developer's machine
- **Close to production** - Simulates the serverless architecture we use in AWS
- **Easy debugging** - Full access to logs, breakpoints, and hot reloading
- **No Docker required** - Eliminates container management complexity

The result is a development environment that starts in seconds and provides a realistic simulation of our production infrastructure.

## The Architecture: How It All Fits Together

Our local sandbox consists of two main components:

1. **Architect Sandbox** - Simulates AWS Lambda, API Gateway, DynamoDB, SQS and S3
2. **Vite Dev Server** - Serves the frontend with hot module replacement

These work together to create a seamless development experience where your frontend code runs on Vite (port 3000) and your backend code runs in Architect's sandbox (port 3333), with API calls seamlessly proxied between them.

### The Backend: Architect Sandbox

Architect's sandbox is the star of the show. It takes your `app.arc` file—the same one that defines your AWS infrastructure—and creates local equivalents of all your serverless services.

```bash
# Start the sandbox
cd apps/backend
../../node_modules/.bin/sandbox
```

When you run this command, Architect:

- **Starts local Lambda functions** that mirror your AWS Lambda functions
- **Creates a local API Gateway** that handles HTTP routing
- **Spins up local DynamoDB** for database operations
- **Provides local S3** for file storage
- **Sets up WebSocket support** for real-time features

The beauty is that your code doesn't know the difference. The same Lambda functions that run in AWS also run locally, just in a different environment.

### The Frontend: Vite Dev Server

Our frontend runs on Vite, which provides lightning-fast hot module replacement and development server capabilities. The key to making this work seamlessly is the proxy configuration in our `vite.config.ts`:

```typescript
const serverOptions: UserConfig["server"] = {
  port: 3000,
  proxy: {
    "/api": {
      target: "http://localhost:3333",
      changeOrigin: true,
    },
    "/graphql": {
      target: "http://localhost:3333",
      changeOrigin: true,
    },
  },
  // ... other config
};
```

This proxy configuration means that when your frontend makes a request to `/api/auth/signin` or `/graphql`, Vite automatically forwards it to the Architect sandbox running on port 3333. Your frontend code doesn't need to know about different URLs for different environments—it just works.

## Environment Configuration: Bridging Local and Cloud

One of the trickiest parts of local development is managing environment variables and configuration. Our sandbox environment setup handles this elegantly.

### Dynamic Port Allocation

Since we might run multiple sandbox instances (for testing), we need to avoid port conflicts. Our `sandbox-env.ts` handles this:

```typescript
// configure Architect's ports
const newPorts = await getPorts(workerId, 6);
const [portBase, eventsPort, tablesPort, s3Port, arcPort] = newPorts;

const ports: Record<string, string> = {
  _arc: arcPort,
  http: portBase,
  tables: tablesPort,
  events: eventsPort,
  s3: s3Port,
};
```

Each sandbox instance gets its own set of ports, ensuring they can run simultaneously without conflicts.

### AWS Credentials and Local Services

For services that need AWS credentials (like S3 operations), our sandbox can use your local AWS configuration:

```typescript
const getAwsCredentials = async () =>
  (await getAwsCredentialsFromIni()) ?? getAwsCredentialsFromEnv();
```

This means you can use your AWS CLI credentials for local development, or the sandbox can run without them for most operations.

### Environment Variables

The sandbox sets up a comprehensive environment that mirrors production:

```typescript
const appConfig: Record<string, string | undefined> = {
  PORT: portBase,
  ARC_WSS_URL: `ws://localhost:${portBase}/`,
  NEXTAUTH_URL: new URL("api/auth", baseUrl(portBase)).href,
  APP_URL_BASE: `http://localhost:${portBase}`,
  VITE_WS_URL: `ws://localhost:${portBase}/ws`,
  // ... many more
};
```

This ensures that your application behaves the same way locally as it does in production.

## The Development Workflow

### Starting the Sandbox

Our `sandbox.sh` script orchestrates the entire development environment:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Build the backend
pnpm build:backend &

# Optionally start SSR server
if [ -n "${SSR:-}" ]; then
  nx serve server-side-rendering &
fi

# Start Architect sandbox
NEXTAUTH_URL=http://localhost:3000 ../../node_modules/.bin/sandbox
```

This script:

1. **Builds the backend** TypeScript code
2. **Optionally starts SSR** if needed
3. **Launches the Architect sandbox** with proper environment variables
4. **Handles cleanup** when you stop the process

### Hot Reloading and Development

The beauty of this setup is that you get the best of both worlds:

- **Frontend hot reloading** via Vite - changes to React components appear instantly
- **Backend hot reloading** via Architect - Lambda function changes are reflected immediately
- **Full debugging capabilities** - you can set breakpoints in both frontend and backend code

### Testing Integration

Our sandbox is also used for automated testing. The `sandbox.ts` file provides a programmatic interface for starting and stopping sandbox instances:

```typescript
function start(env: Env, config: Config): Promise<void> {
  return new Promise((resolve, reject) => {
    // Start sandbox process
    child = spawn(
      sandboxExecFilePath,
      ["--disable-symlinks", "--confirm", "--port", `${config.apiPort}`],
      {
        stdio: "pipe",
        env,
        cwd: sandboxWorkingDirPath,
      }
    );

    // Wait for startup
    child!.stdout!.on("data", (d) => {
      if (output.indexOf("Sandbox startup scripts ran") >= 0) {
        started = true;
        setTimeout(() => resolve(), 2000);
      }
    });
  });
}
```

This allows our test suite to spin up isolated sandbox instances for each test, ensuring complete isolation between test runs.

## What Works (and What Doesn't)

### What Works Well

- **HTTP API endpoints** - All your Lambda functions work exactly as they do in AWS
- **DynamoDB operations** - Local DynamoDB provides the same interface
- **S3 file operations** - Local S3 handles file uploads and storage
- **WebSocket connections** - Real-time features work locally
- **Authentication flows** - OAuth and JWT authentication work seamlessly
- **GraphQL queries** - All your GraphQL resolvers function normally

### What's Different

- **Performance characteristics** - Local DynamoDB and S3 are faster than AWS equivalents
- **Scaling behavior** - No auto-scaling or cold starts locally
- **Service limits** - No AWS service limits or throttling
- **Network latency** - Everything runs on localhost, so network calls are instant

### What Requires AWS

- **External AWS services** - If your code calls other AWS services (like SES for email), you'll need AWS credentials
- **Third-party integrations** - Services that require specific AWS configurations
- **Advanced features** - Some AWS-specific features might not have local equivalents

## Best Practices for Local Development

### Environment Management

Keep your local environment variables in a `.env.local` file:

```bash
# .env.local
OPENAI_API_KEY=your_key_here
STRIPE_SECRET_KEY=your_key_here
JWT_SECRET=local_development_secret
```

This keeps sensitive data out of your codebase while providing the configuration your app needs.

### Debugging Tips

1. **Check sandbox logs** - The sandbox outputs detailed logs for all requests
2. **Use browser dev tools** - Network tab shows proxied requests
3. **Set breakpoints** - You can debug both frontend and backend code
4. **Monitor ports** - Ensure no port conflicts between services

### Performance Optimization

- **Use watch mode** - `WATCH=true pnpm sandbox` for automatic rebuilding
- **Disable unnecessary services** - Only start what you need for your current task
- **Monitor resource usage** - The sandbox is lightweight but can accumulate memory over time

## When to Use Local vs. Cloud

### Use Local Sandbox For

- **Day-to-day development** - Fast iteration and debugging
- **Feature development** - Building new functionality
- **Bug fixes** - Isolating and fixing issues
- **Code reviews** - Testing changes before committing

### Use Cloud PR Deployments For

- **Integration testing** - Testing with real AWS services
- **Performance testing** - Understanding real-world performance
- **Stakeholder demos** - Sharing working features with non-technical team members
- **Production-like testing** - Final validation before merging

## The Bottom Line

![Deploying PRs](/images/blog/astronaut-wonderful.jpg)

Our local sandbox strikes a balance between simplicity and functionality. It's not a perfect replica of AWS—and it doesn't need to be. Instead, it provides a fast, reliable development environment that lets you focus on building features rather than managing infrastructure.

The key insight is that you don't need Docker containers or complex orchestration to have a great local development experience. Sometimes the simplest solution—running services directly on your machine with smart proxying—is the most effective.

For the full AWS experience with real Lambda functions, DynamoDB, and S3, check out our [PR deployment system](https://metaduck.com/deploying-pull-requests-a-complete-aws-stack-for-every-pr-/) that creates isolated cloud environments for every pull request.

Happy coding! 🚀
