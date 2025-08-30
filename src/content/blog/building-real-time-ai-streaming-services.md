---
title: "Building Real-Time AI Streaming Services with AWS Lambda and Architect"
description: "A deep dive into building scalable, production-ready AI chat services with real-time streaming using AWS Lambda, Architect, and Vercel's AI SDK. Learn about architecture, local development, deployment strategies, and cost optimization for modern AI applications."
author: "Pedro Teixeira"
date: 2025-07-11
tags: ["AI & ML", "Serverless", "Real-time", "Architecture"]
image: "/images/blog/giant_astronaut.jpg"
---

![Giant astronaut](/images/blog/giant_astronaut.jpg)

> **TL;DR**: We built a production-ready streaming AI service using AWS Lambda, Architect, and Vercel's AI SDK that provides real-time responses with tool execution capabilities, complete with local development environment and custom deployment workflows.

---

## How we built a production-ready streaming AI service that works seamlessly in both development and production environments

## 🎯 Introduction

As CTO of a company that heavily relies on AI interactions, I've learned that traditional request-response patterns don't cut it for AI applications. Users expect real-time, streaming responses that feel conversational and responsive. While AWS Lambda isn't typically associated with streaming (and for good reason), we've built a robust streaming service that leverages Lambda's strengths while providing the real-time experience our users demand.

In this post, I'll walk you through how we set up a streaming AI service using AWS Lambda, Architect, and the ai-sdk package. We'll cover everything from the server-side streaming implementation to the client-side integration, including our custom local development environment that mimics production behavior.

> **💡 Pro Tip**: If you're new to Architect or want to learn more about deploying applications with custom domains and PR environments, check out [Deploying Pull Requests: A Complete AWS Stack for Every PR](https://metaduck.com/deploying-pull-requests-a-complete-aws-stack-for-every-pr-/) by Pedro Teixeira. It covers how to set up a complete CI/CD pipeline that creates isolated environments for every pull request.

## 🚀 The Challenge: Streaming with Lambda

AWS Lambda has a reputation for being ill-suited for streaming responses. Traditional Lambda functions are designed for quick, stateless operations that return a single response. However, with the introduction of Lambda Function URLs and response streaming, we can now build streaming services that work surprisingly well.

Our use case is an AI chat service where users interact with various AI models (OpenAI, Groq, DeepInfra, etc.) and expect real-time, token-by-token responses. We need:

| Requirement             | Description                      |
| ----------------------- | -------------------------------- |
| **Real-time streaming** | From AI providers to clients     |
| **Tool execution**      | With user confirmation flows     |
| **Local development**   | That mirrors production behavior |
| **Scalability**         | And cost-effectiveness           |

## 🏗️ Architecture Overview

Our streaming service consists of three main components:

| Component                        | Purpose                                             |
| -------------------------------- | --------------------------------------------------- |
| **🔗 Lambda Function URLs**      | For direct HTTP access to streaming Lambdas         |
| **🔧 Custom Architect Plugin**   | For local development and deployment                |
| **🤖 Vercel AI SDK Integration** | For seamless streaming on both backend and frontend |

### 🤖 The AI SDK: Our Foundation

We use [Vercel's AI SDK](https://ai-sdk.dev/docs/introduction) as the foundation for our streaming implementation. The AI SDK provides a unified API for working with multiple AI providers and handles the complexities of streaming, tool calling, and error handling across different platforms.

| Usage                 | Description                                                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **🔧 Backend Usage**  | On the server side, we use AI SDK Core functions like `streamText`, `pipeDataStreamToResponse`, and `generateText` to handle AI model interactions and streaming responses.                 |
| **🎨 Frontend Usage** | On the client side, we leverage AI SDK UI hooks like `useChat` to create seamless streaming chat interfaces that automatically handle the streaming protocol, tool calls, and error states. |

This unified approach ensures consistency between our backend streaming implementation and frontend user experience, while providing the flexibility to work with multiple AI providers (OpenAI, Groq, DeepInfra, Google Vertex AI, etc.).

Let's dive into each component.

## 1️⃣ Setting Up Lambda Function URLs

### 🚀 Getting Started with Architect

Before diving into Lambda Function URLs, let's quickly cover how to set up a basic Architect application. Architect is a framework for building serverless applications on AWS that provides a simple, declarative way to define your infrastructure.

#### 📋 Basic Architect Setup

| Step                     | Command                               | Description                          |
| ------------------------ | ------------------------------------- | ------------------------------------ |
| **1. Install CLI**       | `npm install -g @architect/architect` | Install the Architect CLI globally   |
| **2. Create Project**    | `arc init my-streaming-app`           | Initialize a new Architect project   |
| **3. Define Structure**  | Edit `app.arc`                        | Configure your application structure |
| **4. Local Development** | `arc sandbox`                         | Start local development server       |
| **5. Deploy**            | `arc deploy`                          | Deploy to AWS                        |

**Example `app.arc` configuration:**

```arc
@app
my-streaming-app

@http
get /
post /api/chat

@aws
region us-east-1
runtime nodejs18.x
```

> **💡 Advanced Setup**: For a more comprehensive setup with custom domains, PR environments, and advanced CI/CD, I highly recommend reading [Deploying Pull Requests: A Complete AWS Stack for Every PR](https://metaduck.com/deploying-pull-requests-a-complete-aws-stack-for-every-pr-/) which covers the complete infrastructure setup.

### 🔗 The `@lambda-urls` Directive

We start by defining our streaming endpoints in the Architect configuration:

```yaml
# apps/backend/app.arc
@lambda-urls
any /api/ai/chat-stream
```

This directive tells Architect to create a Lambda Function URL for our streaming endpoint. The `any` method allows all HTTP methods (GET, POST, etc.) to be handled by the same Lambda function.

### 🔧 The Custom Lambda URLs Plugin

The magic happens in our custom Architect plugin located at `apps/backend/src/plugins/lambda-urls/index.js`. This plugin handles both deployment and local development.

#### 🚀 Deployment Configuration

```javascript
// apps/backend/src/plugins/lambda-urls/index.js
const createURLLambdaResource = (cloudformation, lambdaDef) => {
  const lambdaLogicalId = getLambdaLogicalId(lambdaDef);
  const lambdaURLLogicalId = getLambdaURLLogicalId(lambdaDef);

  cloudformation.Resources[lambdaURLLogicalId] = {
    Type: "AWS::Lambda::Url",
    DependsOn: "Role",
    Properties: {
      AuthType: "NONE",
      Cors: {
        AllowCredentials: true,
        AllowHeaders: ["*"],
        ExposeHeaders: ["*"],
        AllowMethods: ["*"],
        AllowOrigins: ["*"],
        MaxAge: 6000,
      },
      InvokeMode: "RESPONSE_STREAM", // This is key!
      TargetFunctionArn: {
        "Fn::GetAtt": [lambdaLogicalId, "Arn"],
      },
    },
  };

  // Add resource-based policy for public invocation
  cloudformation.Resources[`${lambdaLogicalId}URLPolicy`] = {
    Type: "AWS::Lambda::Permission",
    Properties: {
      Action: "lambda:InvokeFunctionUrl",
      FunctionName: {
        "Fn::GetAtt": [lambdaLogicalId, "Arn"],
      },
      Principal: "*",
      FunctionUrlAuthType: "NONE",
    },
  };
};
```

> **🔑 Key Configuration**: The `InvokeMode: 'RESPONSE_STREAM'` setting enables streaming responses from the Lambda function.

## 2️⃣ Server-Side Streaming Implementation

### ⚡ The Lambda Handler

Our streaming Lambda handler is located at `libs/lambdas/src/http/any-api-ai-chat_stream/index.ts`. Here's how it works:

```typescript
// libs/lambdas/src/http/any-api-ai-chat_stream/index.ts
import { ResponseStream, streamifyResponse } from "lambda-stream";
import { pipeDataStreamToResponse, streamText } from "ai";

export const handler = streamifyResponse(async (event, responseStream) => {
  const httpResponseMetadata = {
    statusCode: 200,
    statusMessage: "OK",
    headers: {},
  };

  responseStream = HttpResponseStream.from(
    responseStream,
    httpResponseMetadata
  );

  // Parse request parameters
  const providerName = event.queryStringParameters?.provider;
  const model = event.queryStringParameters?.model;

  // Parse request body
  const body = JSON.parse(event.body);
  const { messages, notebookId, data } = body;

  // Set up AI provider
  const provider = providers[providerName]();

  // Pipe the AI stream to the response
  pipeDataStreamToResponse(
    enhanceResponseStream(responseStream, httpResponseMetadata),
    {
      status: 200,
      statusText: "OK",
      headers: {},
      execute: async (dataStream) => {
        const result = streamText({
          model: provider(model),
          messages: processedMessages,
          tools: processedTools,
          system: systemPrompt(new Date()),
          temperature: 1,
          seed: 42,
          onFinish: (finish) => {
            console.log("Stream finished:", finish.finishReason, finish.usage);
          },
          onError: ({ error }) => {
            console.error("Stream error:", error);
            replyWithError(responseStream, error as Error);
          },
        });

        result.mergeIntoDataStream(dataStream);
      },
    }
  );
});
```

### 🔧 Key Components

| Component                      | Purpose                                               |
| ------------------------------ | ----------------------------------------------------- |
| **`streamifyResponse`**        | Wraps our handler to enable streaming                 |
| **`ResponseStream`**           | The streaming interface provided by lambda-stream     |
| **`pipeDataStreamToResponse`** | Bridges the AI SDK's data stream to the HTTP response |
| **`streamText`**               | The AI SDK function that generates streaming text     |

> **🤝 Integration**: All of these components work together with the [Vercel AI SDK](https://ai-sdk.dev/docs/introduction) to provide a seamless streaming experience.

### 🔐 Authentication and Security

Before starting the streaming response, we implement authentication to prevent abuse from non-authenticated users:

```typescript
// libs/lambdas/src/http/any-api-ai-chat_stream/index.ts
import { expectAuthenticated } from "@decipad/services/authentication";

export const handler = streamifyResponse(async (event, responseStream) => {
  // ... setup code ...

  try {
    // Parse request parameters and body first
    const providerName = event.queryStringParameters?.provider;
    const model = event.queryStringParameters?.model;
    const body = JSON.parse(event.body);

    // Authenticate user BEFORE starting any expensive operations
    const [authUser] = await expectAuthenticated(event);

    // Validate user has access to the requested resource
    const rawWorkspaceId = await getWorkspace(body.notebookId, authUser.user);

    // Only after authentication succeeds, proceed with AI operations
    const provider = providerConstructor();
    // ... rest of streaming logic
  } catch (error) {
    replyWithError(responseStream, error as Error);
  }
});
```

#### Why Authentication Before Streaming Matters

1. **Prevent Abuse**: AI API calls are expensive. Without authentication, malicious users could:

   - Make unlimited requests to your AI endpoints
   - Exhaust your API quotas and budgets
   - Use your service as a proxy for their own applications

2. **Resource Protection**: Early authentication prevents:

   - Unnecessary AI provider API calls
   - Database queries for unauthorized users
   - Resource allocation for invalid requests

3. **User Context**: Authentication provides:
   - User-specific rate limiting
   - Usage tracking and billing
   - Access control to specific resources (notebooks, workspaces)

#### Authentication Flow

```typescript
// 1. Extract authentication token from headers
const authHeader = event.headers.authorization;
if (!authHeader?.startsWith("Bearer ")) {
  throw new Error("Missing or invalid authorization header");
}

// 2. Validate token and get user
const [authUser] = await expectAuthenticated(event);

// 3. Check resource access permissions
const hasAccess = await checkUserAccess(authUser.user.id, body.notebookId);
if (!hasAccess) {
  throw new Error("User does not have access to this resource");
}

// 4. Apply rate limiting
const rateLimitKey = `ai:${authUser.user.id}`;
const isRateLimited = await checkRateLimit(rateLimitKey);
if (isRateLimited) {
  throw new Error("Rate limit exceeded");
}

// 5. Only then proceed with AI operations
```

#### Error Handling for Authentication

When authentication fails, we use the AI SDK protocol to send proper error messages:

```typescript
// libs/lambdas/src/http/any-api-ai-chat_stream/index.ts
const replyWithError = (responseStream: ResponseStream, _error: Error) => {
  const err = boomify(_error);

  // Send error using AI SDK protocol (type 3 = error)
  responseStream.write(
    `3:${JSON.stringify({
      message: err.output.payload.message,
      statusCode: err.output.statusCode,
      type: "authentication_error",
    })}\n`
  );

  responseStream.end();
};
```

#### Client-Side Authentication

On the client side, we include authentication headers:

```typescript
// apps/frontend/src/notebooks/notebook/chat/chat-panel.tsx
const {
  messages,
  input,
  setInput,
  append,
  status,
  stop,
  setMessages,
  addToolResult,
} = useChat({
  api: `${apiRouteURL}?provider=openai&model=gpt-4o-mini`,
  fetch: (url, options) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${bearerToken}`, // Include auth token
      },
    });
  },
  body: { notebookId },
  // ... other options
});
```

### Tool Execution with Confirmation

One of the most interesting aspects of our implementation is how we handle tool execution with user confirmation:

```typescript
// libs/lambdas/src/http/any-api-ai-chat_stream/index.ts
const [processedMessages, processedTools] = await processToolCalls(
  {
    messages,
    dataStream,
    tools: selectedTools,
  },
  {
    // Tools that require confirmation
    confirmSaveData: async ({ varName }) =>
      `You may now safely call saveData with varName=${varName}`,
  },
  {
    // Tools that are automatically executed in the backend
    think: async () => "done",
    planNotebookSteps: async () => "done",
    getTables: async () => {
      return await queryWorkspaceTables(rawWorkspaceId);
    },
    // ... more tools
  }
);
```

This allows us to:

- Automatically execute certain tools (like `think` or `getTables`)
- Require user confirmation for sensitive operations (like `saveData`)
- Stream tool results back to the client in real-time

## 3️⃣ Local Development Environment

### 🏠 The Sandbox Server

One of the biggest challenges with streaming Lambdas is local development. We solved this by creating a custom HTTP server that mimics the Lambda Function URL behavior:

```javascript
// apps/backend/src/plugins/lambda-urls/index.js
const createStreamingLambdaServer = (lambdas) => {
  const server = http.createServer(async (req, res) => {
    // Extract lambda name from URL
    let lambdaName = req.url.slice(1);
    [lambdaName] = lambdaName.split("?");

    const lambdaDef = Object.values(lambdas).find(
      (l) => getLambdaLogicalId(l) === lambdaName
    );

    // Add CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");

    if (!lambdaDef) {
      res.statusCode = 404;
      res.end(`Lambda not found: ${lambdaName}`);
      return;
    }

    const handler = loadLambdaHandler(lambdaDef);

    // Construct fake Lambda event from HTTP request
    const lambdaEvent = {
      body: await new Promise((resolve) => {
        req.setEncoding("utf-8");
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          resolve(body);
        });
      }),
      isBase64Encoded: false,
      rawPath: req.url,
      requestContext: { http: { method: req.method } },
      headers: Object.fromEntries(
        Object.entries(req.headers).map(([key, value]) => [
          key.toLowerCase(),
          value,
        ])
      ),
      queryStringParameters: Object.fromEntries(
        new URL(req.url, "http://localhost").searchParams.entries()
      ),
    };

    // Invoke the lambda with streaming response
    try {
      const responseStream = new ResponseStream();

      // Bridge the ResponseStream to HTTP response
      responseStream.write = (data) => {
        res.write(data);
      };
      responseStream.end = (data) => {
        res.end(data);
      };
      responseStream.on("error", (error) => {
        console.error("responseStream.error", error);
        res.statusCode = 500;
        res.end("Internal Server Error");
      });

      await handler(lambdaEvent, responseStream);

      // Wait for response to complete
      await new Promise((resolve) => {
        res.once("finish", resolve);
      });
    } catch (error) {
      console.error(`Lambda ${lambdaName} error:`, error);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  return {
    start: (port) => {
      return new Promise((resolve) => {
        server.listen(port, () => {
          console.error(`Streaming lambda server listening on port ${port}`);
          resolve();
        });
      });
    },
    stop: () => {
      return new Promise((resolve) => {
        server.close(() => {
          console.log("Streaming lambda server stopped");
          resolve();
        });
      });
    },
  };
};
```

### 🔧 Sandbox Integration

The plugin integrates with Architect's sandbox:

```javascript
// apps/backend/src/plugins/lambda-urls/index.js
const sandbox = {
  async start({ arc, inventory }) {
    if (!server) {
      const lambdas = Object.values(getConfig({ arc, inventory }));
      server = createStreamingLambdaServer(lambdas);
      await server.start(getStreamingLambdaServerPort());
    }
  },
  async end() {
    if (server) {
      await server.stop();
      server = null;
    }
  },
};
```

#### 🔌 Port Management

We use a clever port management system to avoid conflicts in multi-worker environments:

```javascript
// apps/backend/src/plugins/lambda-urls/index.js
const getStreamingLambdaServerPort = once(() => {
  const portPrefix = process.env.STREAMING_LAMBDA_SERVER_PORT_PREFIX || "91";
  const portSuffix = process.env.VITEST_WORKER_ID ?? "1";
  return Number(`${portPrefix}${portSuffix.padStart(2, "0")}`);
});
```

This ensures each worker gets a unique port (e.g., 9101, 9102, etc.).

## 4️⃣ Client-Side Integration

### 🎨 Using the AI SDK

On the client side, we use the [Vercel AI SDK](https://ai-sdk.dev/docs/introduction) to handle streaming responses:

```typescript
// apps/frontend/src/notebooks/notebook/chat/chat-panel.tsx
import { useChat } from "ai/react";

const {
  messages,
  input,
  setInput,
  append,
  status,
  stop,
  setMessages,
  addToolResult,
} = useChat({
  api: `${apiRouteURL}?provider=openai&model=gpt-4o-mini`,
  fetch: (url, options) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${bearerToken}`,
      },
    });
  },
  body: { notebookId },
  initialMessages: [
    { id: "2", content: "Hi, how can I help you?", role: "assistant" },
  ],
  maxSteps: 15,
  onToolCall: handleToolCall,
});
```

### 🛠️ Tool Call Handling

We handle tool calls that require user confirmation:

```typescript
// apps/frontend/src/notebooks/notebook/chat/chat-panel.tsx
const handleToolCall = useCallback(async (toolCall) => {
  const { toolName, args } = toolCall;

  if (toolsRequiringConfirmation.includes(toolName)) {
    // Show confirmation UI to user
    const confirmed = await showConfirmationDialog(toolName, args);

    if (confirmed) {
      return { result: "yes" };
    } else {
      return { result: "no" };
    }
  }

  // Auto-execute other tools
  return await executeTool(toolName, args);
}, []);
```

### ⚡ Real-Time Updates

The [Vercel AI SDK](https://ai-sdk.dev/docs/introduction) automatically handles:

| Feature                         | Description                  |
| ------------------------------- | ---------------------------- |
| **🔄 Token-by-token streaming** | Real-time text generation    |
| **🛠️ Tool call execution**      | Automatic tool invocation    |
| **⚠️ Error handling**           | Graceful error management    |
| **🔗 Connection management**    | Reliable connection handling |

## 5️⃣ Production Deployment

### 🚀 Architect Deployment Workflow

Architect simplifies the deployment process by automatically generating CloudFormation templates and managing your AWS resources. Here's how the deployment works:

| Environment                  | Command                 | Purpose                         |
| ---------------------------- | ----------------------- | ------------------------------- |
| **🧪 Local Testing**         | `arc sandbox`           | Test your application locally   |
| **🔍 Staging Deployment**    | `arc deploy staging`    | Deploy to a staging environment |
| **🚀 Production Deployment** | `arc deploy production` | Deploy to production            |

For advanced deployment strategies with automatic PR environments, custom domains, and blue-green deployments, check out the comprehensive guide in [Deploying Pull Requests: A Complete AWS Stack for Every PR](https://metaduck.com/deploying-pull-requests-a-complete-aws-stack-for-every-pr-).

### ☁️ CloudFormation Resources

When deployed, our plugin creates the necessary CloudFormation resources:

```yaml
# Generated CloudFormation from apps/backend/src/plugins/lambda-urls/index.js
Resources:
  GetApiAiChatStreamHTTPLambdaURL:
    Type: AWS::Lambda::Url
    Properties:
      AuthType: NONE
      InvokeMode: RESPONSE_STREAM
      TargetFunctionArn: !GetAtt GetApiAiChatStreamHTTPLambda.Arn
      Cors:
        AllowCredentials: true
        AllowHeaders: ["*"]
        AllowMethods: ["*"]
        AllowOrigins: ["*"]
        MaxAge: 6000

  GetApiAiChatStreamHTTPLambdaURLPolicy:
    Type: AWS::Lambda::Permission
    Properties:
      Action: lambda:InvokeFunctionUrl
      FunctionName: !GetAtt GetApiAiChatStreamHTTPLambda.Arn
      Principal: "*"
      FunctionUrlAuthType: NONE
```

### 🔧 Environment Variables

We configure the necessary environment variables:

```yaml
# apps/backend/app.arc
@aws
region eu-west-2
timeout 60
runtime nodejs18.x
```

> **🔐 Security Note**: For production deployments, we use a secrets management system that fetches sensitive values (like API keys) at deploy time and injects them as environment variables. This keeps secrets out of our codebase while ensuring they're available to our Lambda functions at runtime.

## 6️⃣ Performance and Cost Considerations

### ⏱️ Lambda Timeout

We set a 60-second timeout, which is sufficient for most AI interactions while preventing runaway costs.

### 🚀 Cold Start Mitigation

While Lambda cold starts are inevitable, we minimize their impact by:

| Strategy                     | Description                                 |
| ---------------------------- | ------------------------------------------- |
| **🔥 Warm Pool**             | Using a warm pool of workers in development |
| **⚡ Lightweight Functions** | Keeping Lambda functions lightweight        |
| **🔗 Connection Pooling**    | Using connection pooling where possible     |

### 💰 Cost Optimization

Streaming Lambdas can be more cost-effective than long-running servers because:

| Benefit              | Description                       |
| -------------------- | --------------------------------- |
| **💳 Pay-per-use**   | You only pay for actual usage     |
| **⏰ No idle costs** | No idle time costs                |
| **📈 Auto-scaling**  | Automatic scaling based on demand |

## 7️⃣ Monitoring and Debugging

### ⚠️ Error Handling

We implement comprehensive error handling that follows the AI SDK's streaming protocol:

```typescript
// libs/lambdas/src/http/any-api-ai-chat_stream/index.ts
const replyWithError = (responseStream: ResponseStream, _error: Error) => {
  const err = boomify(_error);
  const httpResponseMetadata = err.output.payload;
  responseStream = HttpResponseStream.from(
    responseStream,
    httpResponseMetadata
  );
  responseStream.write(`3:${JSON.stringify(err.output.payload.message)}\n`);
  responseStream.end();
};
```

#### 📡 The AI SDK Streaming Protocol

The AI SDK uses a specific protocol for streaming data to clients. Each message in the stream follows this format:

```
<type>:<JSON payload>\n
```

| Component          | Description                          |
| ------------------ | ------------------------------------ |
| **`type`**         | A number indicating the message type |
| **`JSON payload`** | Contains the actual data             |
| **`\n`**           | Marks the end of each message        |

**Message Types:**

- `0` - Text chunk (partial response)
- `1` - Tool call
- `2` - Tool result
- `3` - Error message
- `4` - Final response

When an error occurs, we send a type `3` message with the error details:

```typescript
responseStream.write(`3:${JSON.stringify(err.output.payload.message)}\n`);
```

This tells the AI SDK client that an error has occurred, and the client can then:

- Display an appropriate error message to the user
- Stop the streaming process
- Handle the error gracefully in the UI

The client-side AI SDK automatically parses these protocol messages and provides appropriate error handling:

```typescript
// The AI SDK automatically handles protocol messages like:
"3:{\"message\":\"Invalid API key\"}\n";
// And converts them to proper error objects
```

### 📝 Logging

We log important events for debugging:

```typescript
// libs/lambdas/src/http/any-api-ai-chat_stream/index.ts
onFinish: (finish) => {
  console.log('Stream finished:', finish.finishReason, finish.usage);
},
onError: ({ error }) => {
  console.error('Stream error:', error);
  replyWithError(responseStream, error as Error);
},
```

These logging events end up in AWS Cloudwatch, where we can create logs and store them for later use in debugging sessions and audits.

An alternative here is to also send the logging events to services like [Sentry](https://sentry.io/) or [PostHog](https://posthog.com/).

## 8️⃣ Lessons Learned

### ✅ What Works Well

| Component                      | Assessment                                      |
| ------------------------------ | ----------------------------------------------- |
| **🔗 Lambda Function URLs**    | Surprisingly effective for streaming            |
| **🤖 AI SDK**                  | Excellent abstraction for client-side streaming |
| **🔧 Custom Architect Plugin** | Provides seamless local development             |
| **🛠️ Tool Execution**          | Flexible confirmation system works well         |

### ⚠️ Challenges and Solutions

| Challenge             | Solution                                      |
| --------------------- | --------------------------------------------- |
| **❄️ Cold Starts**    | Mitigated with worker pools in development    |
| **⚠️ Error Handling** | Requires careful stream management            |
| **🌐 CORS**           | Configured properly for cross-origin requests |

### 📋 Best Practices

| Practice                           | Description                                 |
| ---------------------------------- | ------------------------------------------- |
| **⚠️ Always handle stream errors** | Don't let unhandled errors crash the Lambda |
| **⏱️ Use appropriate timeouts**    | Balance user experience with cost           |
| **🌐 Implement proper CORS**       | Essential for web applications              |
| **🧪 Test locally**                | Our sandbox server makes this possible      |

## 🎉 Conclusion

Building streaming services with AWS Lambda is not only possible but can be quite effective when done right. Our implementation provides:

| Feature                           | Benefit                 |
| --------------------------------- | ----------------------- |
| **🔄 Real-time streaming**        | From AI providers       |
| **🏠 Seamless local development** | That mirrors production |
| **🛠️ Flexible tool execution**    | With user confirmation  |
| **💰 Cost-effective scaling**     | Based on actual usage   |
| **🛡️ Robust error handling**      | And monitoring          |

The key to success is understanding Lambda's streaming capabilities and building the right abstractions. Our custom Architect plugin bridges the gap between local development and production deployment, while the AI SDK provides an excellent client-side experience.

While this approach might not be suitable for all streaming use cases, it works exceptionally well for AI applications where you need real-time responses with tool execution capabilities. The combination of Lambda Function URLs, custom Architect plugins, and the AI SDK creates a powerful and flexible streaming platform.

## 📚 Further Reading

To take your Architect setup to the next level, I recommend exploring:

| Resource                                                                                                                                             | Description                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **[🚀 Deploying Pull Requests: A Complete AWS Stack for Every PR](https://metaduck.com/deploying-pull-requests-a-complete-aws-stack-for-every-pr-)** | A comprehensive guide to setting up advanced CI/CD with PR environments, custom domains, and automated deployments |
| **[🔧 Architect Documentation](https://arc.codes/)**                                                                                                 | Official documentation for the Architect framework                                                                 |
| **[🤖 Vercel AI SDK Documentation](https://ai-sdk.dev/docs/introduction)**                                                                           | Complete guide to the AI SDK for both backend and frontend streaming                                               |

## ⚠️ Important Note: Throttling Challenges

While our streaming service provides excellent real-time experiences, we haven't yet solved the complex challenge of **throttling streaming requests**. This remains an open problem that's highly business-dependent and requires careful consideration.

### 🤔 Why Throttling Streaming Requests is Difficult

| Challenge                   | Description                                                                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **🔄 Streaming Nature**     | Unlike traditional request-response patterns, streaming requests maintain long-lived connections, making it challenging to apply standard rate limiting techniques. |
| **💾 Resource Consumption** | Streaming requests consume resources throughout their entire duration, not just at the start. A single malicious user could maintain multiple long-running streams. |
| **👤 User Experience**      | Aggressive throttling can break the streaming experience, while lenient throttling may not provide adequate protection.                                             |
| **💼 Business Logic**       | Throttling strategies depend heavily on your business model                                                                                                         |

**Business Model Considerations:**

- **🆓 Freemium models**: Different limits for free vs paid users
- **💳 Usage-based billing**: Throttling based on remaining credits
- **🏢 Enterprise customers**: Custom limits per customer
- **🎯 Trial users**: Temporary access with strict limits

### 🔬 Potential Approaches

Several strategies can be employed to address the throttling challenge, each with their own trade-offs:

#### 🚦 Pre-Stream Throttling

The most straightforward approach is to check limits before starting the stream:

```typescript
// Example: Token bucket for streaming requests
const rateLimiter = new TokenBucket({
  tokensPerSecond: 1,
  bucketSize: 10,
  user: authUser.user.id,
});

// Check before starting stream
if (!rateLimiter.tryConsume(1)) {
  throw new Error("Rate limit exceeded");
}

// Challenge: How to handle mid-stream throttling?
// What happens when a user exceeds limits during streaming?
```

**Pros:**

- Simple to implement
- Prevents resource waste from unauthorized requests
- Clear user feedback

**Cons:**

- Doesn't prevent abuse during long-running streams
- Users can still consume significant resources before hitting limits

#### 🔄 Mid-Stream Monitoring

A more sophisticated approach involves monitoring usage during the stream:

```typescript
// Track streaming session
const session = {
  userId: authUser.user.id,
  startTime: Date.now(),
  tokensConsumed: 0,
  lastActivity: Date.now(),
};

// Periodically check limits during streaming
const checkMidStreamLimits = async (session) => {
  const timeElapsed = Date.now() - session.startTime;
  const maxTokensPerMinute = getUserLimit(session.userId);

  if (session.tokensConsumed / (timeElapsed / 60000) > maxTokensPerMinute) {
    // Gracefully terminate stream
    responseStream.write(
      `3:${JSON.stringify({
        message: "Rate limit exceeded during streaming",
        type: "rate_limit_exceeded",
      })}\n`
    );
    responseStream.end();
  }
};
```

**Pros:**

- Provides real-time protection
- Can detect abuse patterns during streaming
- Allows for graceful degradation

**Cons:**

- More complex to implement
- Requires state management
- May impact user experience if limits are hit mid-stream

#### 📊 Usage-Based Throttling

For applications with usage-based billing, throttling can be tied to remaining credits:

```typescript
// Check user's remaining credits
const userCredits = await getUserCredits(authUser.user.id);
const estimatedCost = estimateStreamCost(model, maxTokens);

if (userCredits < estimatedCost) {
  throw new Error("Insufficient credits for this request");
}

// Deduct credits as the stream progresses
const deductCredits = async (tokensUsed) => {
  const cost = calculateCost(tokensUsed);
  await deductUserCredits(authUser.user.id, cost);

  // Check if user has run out of credits
  const remainingCredits = await getUserCredits(authUser.user.id);
  if (remainingCredits <= 0) {
    // Gracefully end stream
    responseStream.write(
      `3:${JSON.stringify({
        message: "Credits exhausted",
        type: "credits_exhausted",
      })}\n`
    );
    responseStream.end();
  }
};
```

**Pros:**

- Directly tied to business model
- Prevents cost overruns
- Clear value proposition for users

**Cons:**

- Requires accurate cost estimation
- Complex credit management system
- May require real-time billing integration

#### 🎯 Dynamic Throttling

Advanced systems can adjust throttling based on user behavior and system load:

```typescript
// Dynamic throttling based on multiple factors
const getDynamicLimit = async (userId, currentLoad) => {
  const userTier = await getUserTier(userId);
  const baseLimit = getTierLimit(userTier);
  const loadMultiplier = getLoadMultiplier(currentLoad);
  const userHistory = await getUserHistory(userId);
  const trustScore = calculateTrustScore(userHistory);

  return baseLimit * loadMultiplier * trustScore;
};

// Apply different strategies based on user type
const applyThrottlingStrategy = async (userId, strategy) => {
  switch (strategy) {
    case "premium":
      return new PremiumThrottler(userId);
    case "freemium":
      return new FreemiumThrottler(userId);
    case "enterprise":
      return new EnterpriseThrottler(userId);
    default:
      return new StandardThrottler(userId);
  }
};
```

**Pros:**

- Highly flexible and adaptive
- Can optimize for different user segments
- Balances protection with user experience

**Cons:**

- Extremely complex to implement and maintain
- Requires sophisticated monitoring and analytics
- May introduce unpredictable behavior

#### 🔌 Hybrid Approaches

Most production systems combine multiple strategies:

```typescript
// Hybrid throttling system
class StreamingThrottler {
  constructor(userId) {
    this.userId = userId;
    this.preStreamLimiter = new TokenBucketLimiter();
    this.midStreamMonitor = new UsageMonitor();
    this.creditManager = new CreditManager();
  }

  async checkPreStream() {
    // Check basic rate limits
    if (!this.preStreamLimiter.allow(this.userId)) {
      throw new Error("Rate limit exceeded");
    }

    // Check credits
    if (!(await this.creditManager.hasSufficientCredits(this.userId))) {
      throw new Error("Insufficient credits");
    }
  }

  async monitorStream(session) {
    // Monitor usage during streaming
    this.midStreamMonitor.track(session);

    // Check for abuse patterns
    if (this.midStreamMonitor.detectAbuse(session)) {
      return { action: "terminate", reason: "abuse_detected" };
    }

    // Check remaining credits
    if (!(await this.creditManager.hasRemainingCredits(this.userId))) {
      return { action: "terminate", reason: "credits_exhausted" };
    }

    return { action: "continue" };
  }
}
```

**Pros:**

- Comprehensive protection
- Balances multiple concerns
- Can be tuned for specific use cases

**Cons:**

- Complex to implement and debug
- Requires careful tuning of multiple parameters
- May have performance overhead

### 💼 Business Considerations

Throttling streaming AI services isn't just a technical challenge—it's fundamentally a business decision that impacts your revenue, user experience, and operational costs. Understanding these business considerations is crucial for designing effective throttling strategies.

#### 💰 Cost per Request

AI API calls represent a significant operational expense, making cost management a primary concern:

```typescript
// Example: Cost calculation for different models
const modelCosts = {
  "gpt-4o": { input: 0.005, output: 0.015 }, // per 1K tokens
  "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
  "claude-3-opus": { input: 0.015, output: 0.075 },
  "claude-3-sonnet": { input: 0.003, output: 0.015 },
};

// A single long conversation could cost $10-50+
const estimateConversationCost = (messages, model) => {
  const totalTokens = messages.reduce((sum, msg) => sum + msg.tokenCount, 0);
  const cost = (totalTokens / 1000) * modelCosts[model].output;
  return cost;
};
```

**Key Considerations:**

- **Budget Protection**: Without proper throttling, a single malicious user could rack up thousands of dollars in API costs
- **Predictable Expenses**: Throttling helps maintain predictable monthly costs
- **Profit Margins**: Your pricing strategy must account for these costs while remaining competitive

#### 👥 User Segmentation

Different user types have different needs and value propositions, requiring tailored throttling strategies:

```typescript
// Different throttling strategies per user tier
const userTiers = {
  free: {
    requestsPerHour: 10,
    maxTokensPerRequest: 1000,
    concurrentStreams: 1,
    features: ["basic_chat"],
  },
  pro: {
    requestsPerHour: 100,
    maxTokensPerRequest: 10000,
    concurrentStreams: 3,
    features: ["basic_chat", "tool_execution", "priority_support"],
  },
  enterprise: {
    requestsPerHour: 1000,
    maxTokensPerRequest: 50000,
    concurrentStreams: 10,
    features: [
      "basic_chat",
      "tool_execution",
      "custom_integrations",
      "dedicated_support",
    ],
  },
};
```

**Business Impact:**

- **Freemium Conversion**: Free tier limits should encourage upgrades without being too restrictive
- **Enterprise Value**: High-tier users expect premium service and higher limits
- **Customer Satisfaction**: Inappropriate throttling can drive users to competitors

#### 📈 Peak Usage Patterns

AI applications often experience unpredictable traffic patterns that can strain resources:

```typescript
// Monitoring peak usage patterns
const usageAnalytics = {
  hourlyPatterns: {
    "9-11am": "morning_peak", // Business users starting their day
    "2-4pm": "afternoon_peak", // After-lunch productivity
    "7-9pm": "evening_peak", // Personal use after work
    "11pm-6am": "low_usage", // Night time
  },
  weeklyPatterns: {
    monday: "highest_usage", // Start of work week
    friday: "high_usage", // End of work week
    weekend: "moderate_usage", // Personal projects
  },
};
```

**Operational Challenges:**

- **Resource Planning**: Need to provision for peak usage while avoiding over-provisioning
- **Cost Spikes**: Sudden viral content or events can cause exponential cost increases
- **Service Degradation**: During peaks, legitimate users might experience delays or errors

#### 📊 Monitoring and Alerting

Effective throttling requires sophisticated monitoring to detect abuse and optimize performance:

```typescript
// Real-time monitoring dashboard
const monitoringMetrics = {
  userMetrics: {
    requestsPerUser: new Map(),
    tokensPerUser: new Map(),
    sessionDuration: new Map(),
    abuseScore: new Map(),
  },
  systemMetrics: {
    totalRequests: 0,
    totalTokens: 0,
    averageResponseTime: 0,
    errorRate: 0,
    costPerHour: 0,
  },
  alerts: {
    costThreshold: 100, // $100/hour
    abuseThreshold: 0.1, // 10% of requests are suspicious
    errorThreshold: 0.05, // 5% error rate
  },
};
```

**Business Intelligence:**

- **Usage Analytics**: Understanding how users interact with your AI service
- **Cost Optimization**: Identifying expensive patterns and optimizing accordingly
- **Fraud Detection**: Preventing abuse that could bankrupt your service
- **Capacity Planning**: Making informed decisions about infrastructure scaling

#### 🎯 Revenue Impact

Throttling decisions directly impact your revenue model:

```typescript
// Revenue optimization through smart throttling
const revenueOptimization = {
  freemium: {
    goal: "drive_conversions",
    strategy: "restrict_advanced_features",
    metrics: ["conversion_rate", "upgrade_funnel"],
  },
  usage_based: {
    goal: "maximize_usage",
    strategy: "encourage_high_value_usage",
    metrics: ["revenue_per_user", "usage_growth"],
  },
  enterprise: {
    goal: "ensure_reliability",
    strategy: "predictable_limits",
    metrics: ["uptime", "customer_satisfaction", "renewal_rate"],
  },
};
```

**Strategic Considerations:**

- **Pricing Strategy**: Your throttling should align with your pricing model
- **Customer Lifetime Value**: Balancing short-term costs with long-term customer relationships
- **Competitive Positioning**: Your limits should be competitive with alternatives
- **Market Expansion**: Throttling strategies should support growth into new markets

#### 🔄 Iterative Optimization

Throttling strategies should evolve based on business performance:

```typescript
// A/B testing different throttling strategies
const throttlingExperiments = {
  experiment1: {
    name: "aggressive_free_tier",
    freeLimit: 5, // requests per hour
    conversionGoal: 0.15, // 15% conversion rate
    costTarget: 50, // $50/month per free user
  },
  experiment2: {
    name: "generous_free_tier",
    freeLimit: 20, // requests per hour
    conversionGoal: 0.1, // 10% conversion rate
    costTarget: 100, // $100/month per free user
  },
};
```

**Continuous Improvement:**

- **Data-Driven Decisions**: Use analytics to optimize throttling parameters
- **User Feedback**: Monitor user satisfaction and complaints
- **Market Changes**: Adapt to new AI models, pricing changes, and competitive landscape
- **Seasonal Adjustments**: Modify limits based on usage patterns and business cycles

### 🔮 Future Work

This is an area where we're actively researching solutions. The ideal approach would combine:

| Approach                     | Description                                              |
| ---------------------------- | -------------------------------------------------------- |
| **🚦 Pre-stream throttling** | Check limits before starting expensive operations        |
| **👁️ Mid-stream monitoring** | Detect abuse patterns during streaming                   |
| **📉 Graceful degradation**  | Reduce quality or speed rather than cutting off streams  |
| **🎯 Business-aware limits** | Dynamic throttling based on user type and usage patterns |

> **💡 Consideration**: Consider your specific business requirements and user patterns when designing throttling strategies for streaming AI services.

### 💰 Cost Optimization Note: I/O Wait Time

While our Lambda-based streaming solution is cost-effective for many use cases, it's worth noting that we're still paying for time the Lambda function spends waiting for I/O operations (like AI API calls). During these wait periods, the Lambda function remains active and consuming resources, even though it's not doing computational work.

> **🔍 Alternative Solutions**: Platforms like [Vercel's Fluid Compute](https://vercel.com/fluid) address this inefficiency by offering "pay-as-you-compute" pricing that only charges for active CPU time, not idle time during I/O operations. This can be particularly beneficial for AI workloads that involve frequent external API calls and streaming responses.

> **💡 Recommendation**: For high-traffic AI applications with significant I/O wait times, consider evaluating compute platforms that optimize for this specific workload pattern.

---

_This implementation powers our AI chat service, providing users with real-time, interactive AI experiences while maintaining the cost-effectiveness and scalability of serverless architecture._
