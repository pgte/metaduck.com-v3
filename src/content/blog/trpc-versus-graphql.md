---
title: "In a World of Hype, GraphQL's Fundamental Advantages Over tRPC Still Hold True"
description: "While tRPC offers great developer experience with end-to-end type safety, GraphQL's client-side query customization provides architectural flexibility that shouldn't be overlooked. A deep dive into why GraphQL's advantages remain relevant."
author: "Pedro Teixeira"
date: 2025-08-07
tags: ["Web Development", "Development", "Architecture"]
image: "/images/blog/astronaut-playing-with-toys.jpg"
---

![Astronaut playing with toys](/images/blog/astronaut-playing-with-toys.jpg)

It seems like **tRPC** is all the rage these days, and I get it. The promise of end-to-end type safety with minimal boilerplate code is compelling, especially for teams working within a TypeScript monorepo. It solves a real problem and makes for a great developer experience. But as a software engineer who's been in the trenches, I can't help but feel that the current hype often overlooks some significant disadvantages.

For me, **GraphQL** still holds a powerful and often misunderstood advantage that goes beyond the language-agnostic nature of its APIs. While that's a huge benefit for cross-platform teams, my work is primarily web-focused, so I'm more interested in what it offers within a single application.

## The Core Advantage: Client-Side Query Customization

The core advantage, in my opinion, is the ability to customize queries on the client. With tRPC, the API is essentially a collection of predefined function calls. The server dictates what data you can fetch with each call. While you get type safety, you lose flexibility.

### The tRPC Approach: Server-Defined Queries

```typescript
// tRPC: Server defines the available data shapes.
// The client calls a specific procedure and receives the predefined data.
const user = await trpc.users.getUser.query({ id: "123" });
// You receive the full `User` object as defined by the server.
// To get a different data shape (e.g., user with posts), a new server-side procedure is often required.
```

If a new UI component needs a slightly different subset of data, you often have to modify the server-side resolver or create a new one entirely. This tight coupling between the client and server can lead to over-fetching or under-fetching and makes the frontend team dependent on the backend team for every minor data requirement change.

### The GraphQL Approach: Client-Defined Queries

```graphql
# GraphQL: Client defines exactly what it needs
query ProductDetail($id: ID!) {
  product(id: $id) {
    name
    price
    description
  }
}

query ProductCheckout($id: ID!) {
  product(id: $id) {
    name
    price
    # No description needed for checkout
  }
}
```

In contrast, GraphQL puts the power of data fetching directly in the hands of the client. With a single endpoint, I can craft the exact query I need for any given component. This is incredibly useful even on the same app. Imagine an e-commerce site where the product detail page needs the product's name, price, and description, but the checkout page only needs the name and price. With GraphQL, you simply write a different query for each component, fetching only the data you need. This not only reduces the payload size but also decouples your frontend from your backend's implementation details.

## Achieving Type Safety Without Sacrificing Flexibility

I've been using tools like **[urql](https://formidable.com/open-source/urql/)** on the client, which provides a highly customizable and flexible GraphQL experience. The ecosystem around GraphQL, including tools like **[graphql-codegen](https://www.graphql-code-generator.com/)**, allows me to achieve that same end-to-end type safety that tRPC champions.

### Type Safety with GraphQL Code Generation

```typescript
import { useQuery } from "urql";
import {
  ProductDetailDocument,
  ProductDetailQuery,
} from "../generated/graphql";

// Fully typed queries with urql
const [result] = useQuery({
  query: ProductDetailDocument,
  variables: { id: "123" },
});

// result.data is fully typed as ProductDetailQuery
const product = result.data?.product; // Fully typed!
```

**How does TypeScript know the return type?**

The type safety comes from **GraphQL code generation**. Here's how it works:

1.  **Schema Introspection**: Tools like `graphql-codegen` read your GraphQL schema and understand the exact shape of your data.
2.  **Query Analysis**: They analyze your GraphQL queries to know exactly what fields you're requesting.
3.  **Type Generation**: They generate TypeScript interfaces and document objects that match your queries exactly.

The key is that **the generated types match your queries exactly** - if you change your GraphQL query, the TypeScript types are regenerated to match.

By generating the client types directly from my GraphQL schema and operations, my application is just as robust and bug-resistant as a tRPC one, but with the added flexibility of client-side query customization.

## The Trade-off: Speed vs. Scalability

> **💡 Key Insight**: tRPC is great for fast iteration, but GraphQL provides architectural flexibility that pays dividends as your application grows.

The tRPC approach is great for fast-paced, tightly-coupled development, but it comes at the cost of flexibility and long-term scalability. For me, the ability to define my data requirements directly from the client is a fundamental architectural advantage that I'm not willing to give up.

### When to Choose Each Approach

| Aspect                | tRPC       | GraphQL    |
| :-------------------- | :--------- | :--------- |
| **Development Speed** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐     |
| **Type Safety**       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Query Flexibility** | ⭐⭐       | ⭐⭐⭐⭐⭐ |
| **Team Independence** | ⭐⭐       | ⭐⭐⭐⭐⭐ |
| **Learning Curve**    | ⭐⭐⭐⭐⭐ | ⭐⭐⭐     |

The GraphQL ecosystem has matured to the point where end-to-end type safety is a solved problem, and the flexibility it provides is a feature, not a bug.

## Real-World Example: E-commerce Product Pages

Let me show you a concrete example of how this plays out in practice:

### Product Detail Page

```graphql
query ProductDetail($id: ID!) {
  product(id: $id) {
    id
    name
    price
    description
    images {
      url
      alt
    }
    reviews {
      rating
      comment
    }
    relatedProducts {
      id
      name
      price
    }
  }
}
```

### Product List Page

```graphql
query ProductList($category: String!) {
  products(category: $category) {
    id
    name
    price
    # No description, images, or reviews needed
  }
}
```

### Shopping Cart

```graphql
query CartItems($cartId: ID!) {
  cart(id: $cartId) {
    items {
      product {
        id
        name
        price
        # Minimal data for cart display
      }
      quantity
    }
  }
}
```

With tRPC, you'd need three separate endpoints, or one endpoint that returns everything (wasting bandwidth). With GraphQL, you have one endpoint that serves all three use cases efficiently.

## Conclusion

While tRPC offers an excellent developer experience for teams working in TypeScript monorepos, GraphQL's client-side query customization provides architectural benefits that shouldn't be overlooked. The ability to craft precise queries on the client side, combined with modern tooling that provides end-to-end type safety, makes GraphQL a compelling choice for applications that value flexibility and long-term scalability.

The choice between tRPC and GraphQL isn't just about developer experience—it's about the fundamental architecture of your data layer and how much control you want to give to your frontend teams.

**For me, the flexibility of GraphQL is worth the initial setup complexity, especially as applications grow and teams become more distributed.**

---

_This video provides an overview of the urql GraphQL client, which is a key component in the client-side approach discussed in the article._

<div class="video-container">
  <iframe
    style="width: 100%; aspect-ratio: 16 / 9; height: auto;"
    src="https://www.youtube.com/embed/nhxaAEZWouA"
    title="The highly customizable and versatile GraphQL client - urql - Open Source Friday"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen>
  </iframe>
</div>
