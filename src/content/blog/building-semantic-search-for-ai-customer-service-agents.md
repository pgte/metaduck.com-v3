---
title: "Building Semantic Search for AI Customer Service Agents"
description: "How I built a fast, fully client-side semantic search system for AI customer service agents, using vector embeddings, Web Workers, and real-time doc updates — all without dedicated search infrastructure."
author: "Pedro Teixeira"
date: 2025-11-18
tags: ["AI & ML", "Development", "Architecture"]
image: "/images/blog/astronaut-reading.jpg"
---

At **TimeClout**, I recently added a powerful capability to my AI customer service agent: the ability to search through the knowledge base using **semantic vector search**. This wasn't just about adding another tool to the stack—it was about solving a genuine problem where the AI assistant needed to answer product questions accurately without hallucinating or making things up. 🧠

![Giant astronaut](/images/blog/astronaut-reading.jpg)

## The Problem

My AI customer service agent is built on top of **Google's Gemini** model. It’s great at interacting with the application UI—clicking buttons, filling forms, and helping users navigate the product. However, when users asked conceptual questions like _"How does auto-fill work?"_ or _"What are the different leave types?"_, the agent hit a wall. It had no way to access the product documentation.

I looked at two main options:

1.  **Fine-tune the model** with my documentation (expensive and slow to update).
2.  **Give the agent a search tool** that can query the docs in real-time (flexible and always up-to-date).

I chose option 2. I decided to build a semantic search system that runs entirely in the browser using [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API).

## The Architecture

The solution consists of three main components:

1.  **Backend embedding API** – Generates vector embeddings using Google's `text-embedding-004` model.
2.  **Web Worker** – Handles document indexing and search computation off the main thread.
3.  **AI Tool Integration** – Exposes search as a tool the agent can call.

### Backend: Embedding Generation

I created a new Lambda endpoint at `/api/ai/embedding` that takes text and returns a vector embedding. I stuck to a simple setup here:

```typescript
// apps/backend/src/http/post-api-ai-embedding/index.ts
const EMBEDDING_MODEL = "text-embedding-004";

export const handler = async (event: APIGatewayProxyEventV2) => {
  const { text } = JSON.parse(event.body);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      content: { parts: [{ text: text.trim() }] },
    }),
  });

  const data = await response.json();
  return { embedding: data.embedding.values };
};
```

I included exponential backoff retry logic for rate limiting, authentication checks, and proper error handling. Crucially, the API key stays server-side—I never expose it to the browser.

### Frontend: Web Worker for Search ⚡

The heavy lifting happens in a Web Worker to keep the main thread responsive. This worker is responsible for:

1.  **Indexing documents:** Splitting markdown docs into \~2000 character chunks.
2.  **Generating embeddings:** Calling the backend API for each chunk.
3.  **Caching everything:** Storing embeddings in memory for fast subsequent searches.
4.  **Performing similarity search:** Using cosine similarity to find relevant snippets.

Here is a simplified look at the search logic:

```typescript
// Simplified version of the search logic
async function performSearch(
  query: string,
  queryEmbedding: number[],
  topN: number
): Promise<SearchResult[]> {
  // Ensure documents are indexed
  await ensureIndexed();

  // Calculate cosine similarity for all document snippets
  const results = snippetEmbeddings.map(({ snippet, embedding }) => {
    const similarity = cosineSimilarity(queryEmbedding, embedding);
    return { snippet, similarity };
  });

  // Sort by similarity and return top N
  return results.sort((a, b) => b.similarity - a.similarity).slice(0, topN);
}
```

I used a promise-based locking mechanism to prevent concurrent indexing and cached both document content and embeddings to avoid redundant API calls.

### Document Chunking Strategy

I split documents at paragraph boundaries, combining multiple paragraphs into chunks up to **2000 characters**. This balances context preservation with granularity:

- **Small chunks** = more precise matches but less context.
- **Large chunks** = more context but potentially less relevant.
- **2000 characters** = the sweet spot I found for the embedding models I'm using.

If a single paragraph exceeds 2000 characters, I split it at sentence boundaries to ensure I never break the text mid-sentence.

### AI Tool Integration

Finally, I exposed the search capability to the AI agent as a tool defined in [Zod](https://zod.dev/):

```typescript
search_documents: {
  description: "Search documentation using semantic vector search...",
  inputSchema: z.object({
    query: z.string().min(1),
    topN: z.number().optional().default(5),
  }),
  execute: async ({ query, topN = 5 }) => {
    const results = await searchDocuments(query, topN, apiUrl);
    return formatResults(results);
  },
}
```

The agent's system prompt instructs it to use this tool when users ask about product features, workflows, or generally "how things work" in TimeClout.

## Why This Approach?

### Client-Side Computation

Running search in a Web Worker has some massive benefits for a startup like mine:

- **No server load:** Embeddings are computed once and cached in the browser.
- **Fast searches:** Cosine similarity is just vector math; it runs instantly locally.
- **Privacy:** User queries never leave the browser (except for the initial embedding generation).
- **Scalability:** Each user's browser handles their own search index.

### Semantic vs. Keyword Search

Traditional keyword search fails when users ask questions like:

> "How do I give someone time off?" (User says "time off", docs say "leave request")

Or:

> "What's the smart scheduling feature?" (User says "smart", docs say "auto-fill")

**Semantic search** understands intent and meaning, not just exact word matches. The embedding model captures semantic relationships, so "time off" matches "leave request" even though they're different words.

### Always Up-to-Date 🔄

Since I import documentation as raw markdown files at build time, any updates to the docs automatically flow through to the search index. I don't have to worry about manual re-indexing or serving stale data.

## Performance Considerations

### Initial Indexing

The first search triggers indexing. It splits \~13 markdown documents into chunks and generates embeddings for each chunk via parallel API calls. This takes a few seconds on first use, but subsequent searches are instant since everything is cached.

### Memory Usage

I cache document content (text) and embeddings (768-dimensional vectors per chunk). For my \~13 documents, this amounts to just a few MB of memory—totally reasonable for any modern browser.

### API Rate Limiting

The embedding API has rate limits, so I implemented aggressive caching and throttle the parallel generation calls to keep the backend happy.

## Results

Since deploying this feature, the AI agent can now:

- Answer product questions accurately with citations from the docs.
- Explain features using TimeClout's exact terminology.
- Provide step-by-step workflows.
- **Avoid hallucinating information it doesn't know.**

Users get better answers, and I don't have to worry about the agent inventing features we don't have.

## What's Next?

There are a few improvements I'm considering for the roadmap:

- **Hybrid search:** Combining semantic search with keyword matching for better recall.
- **Reranking:** Using a cross-encoder model to rerank results for higher precision.
- **Incremental updates:** Only re-indexing changed documents instead of a full rebuild.

## Takeaways

Building semantic search for an AI agent doesn't mean you have to spin up a vector database or manage complex infrastructure. By leveraging Web Workers, client-side caching, and modern embedding models, I built a fully functional semantic search system that runs entirely in the browser.

The code is open and the approach is straightforward—sometimes the best solution is the simplest one that works. 🚀

---

_If you're interested in how we handle AI agents at [TimeClout](https://timeclout.com), feel free to reach out\!_
