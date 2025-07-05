---
title: "Bringing Data Closer to Your Code — For Real"
description: "A practical guide to implementing edge-first data strategies, from global replicas to local-first sync. Learn how to reduce latency, improve offline experiences, and build more resilient applications."
author: "Pedro Teixeira"
date: 2025-07-05
tags:
  [
    "Edge Computing",
    "Database",
    "Performance",
    "Architecture",
    "Distributed Systems",
    "CDN",
    "Local-First",
  ]
image: "/images/blog/astronaut_doing_repair.jpg"
---

![Astronaut doing repair](/images/blog/astronaut_doing_repair.jpg)

We keep saying it: **"Bring your data closer to your code."**

It sounds obvious — who wouldn't want faster response times, smoother offline experiences, and more resilient apps? But for many teams, it stays theoretical. The data sits locked away in a single region or a central database, while your code tries to serve users on the other side of the world in milliseconds.

It doesn't have to stay that way.

This is a practical look at how to _actually_ bring your data closer — not just geographically, but logically, operationally, and in your day-to-day developer workflow.

---

## Why Bring Data Closer?

When you close the distance between your data and your code, good things happen:

### 🚀 Faster User Experience

Data round-trips shrink dramatically. Instead of crossing oceans to fetch a user profile or shopping cart, you grab it from a nearby [edge replica](https://en.wikipedia.org/wiki/Database_replication) or a local cache.

### 📱 Better Offline and Edge Behavior

If your central database is unreachable or your user has spotty connectivity, [local-first patterns](https://www.inkandswitch.com/local-first/) keep things working. Think drafts that save on the client and sync later — or multiplayer apps that resolve edits when someone reconnects.

### ⚡ Quicker Developer Feedback

Data that's easy to spin up locally speeds up development. You can run production-like scenarios without needing a staging database or a full [CI pipeline](https://en.wikipedia.org/wiki/CI/CD) for every test.

### 🛡️ More Resilience

If one region goes down, not everything does. Edge replicas and smart caches add natural redundancy.

The result: snappier apps, smoother user experience, and less stress when your infrastructure hiccups.

---

## What Does 'Closer' Actually Mean?

The physical meaning is obvious — data that's geographically closer to your users. But there's more to it.

### 🌍 Physical Proximity

Your database or replicas live in data centers near your users. [CDNs](https://en.wikipedia.org/wiki/Content_delivery_network) made this normal for static assets — now, it's increasingly normal for dynamic data too.

### 🧠 Logical Proximity

Your app keeps relevant data near the logic that uses it. If your function needs the same config or user session data a thousand times, don't ping the origin — keep it cached nearby or embedded in the [edge function's](https://vercel.com/docs/functions/edge-functions) environment.

### 💻 Developer Proximity

You can run and seed real data on your laptop. Developers shouldn't be blocked because "the staging database is down." Local-first design also means your tests run faster and CI pipelines are simpler.

### 🎯 Ownership Proximity

Your data logic travels _with_ your deployable units. An edge function isn't much use if it still calls back to a single-region database for every request. Ideally, your data's distribution matches your code's distribution.

---

## Patterns That Make This Work

### Edge Databases

Modern edge databases let you spin up read replicas, deploy tiny [SQLite](https://sqlite.org/) instances, or stream writes back to a central store. For read-heavy workloads, this is a huge win — user profiles, blog content, product catalogs — all benefit from being served near the user.

**Examples:**

- **[PlanetScale](https://planetscale.com)** — MySQL-compatible, branching, global reads with automatic failover.
- **[Turso](https://turso.tech)** — Edge-deployed SQLite that's lightweight, fast to spin up, and naturally distributed.
- **[Neon](https://neon.tech)** — Serverless Postgres with built-in branching and on-demand scaling.
- **[Supabase](https://supabase.com)** — Open source Firebase alternative with real-time capabilities and edge functions.

### Local-First and Offline-First Stores

If your data is mostly user-specific — drafts, comments, ephemeral states — it can often live safely on the device and sync when possible. This is the heart of [local-first design](https://www.inkandswitch.com/local-first/).

**Examples:**

- **[PouchDB](https://pouchdb.com/) + [CouchDB](https://couchdb.apache.org/)** — The classic combo: the browser keeps a local copy that syncs with Couch when online.
- **[ElectricSQL](https://electric-sql.com/)** — Postgres you can embed in the client, with [CRDT](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type) conflict resolution under the hood.
- **[Replicache](https://replicache.dev/)** — Great for collaborative, real-time apps. Users get immediate feedback, and the sync engine handles merge logic.
- **[Automerge](https://automerge.org/)** — CRDT library for building collaborative applications.

### Pre-Rendering and Edge Caching

Sometimes the simplest path is to not hit a database at all. If your data doesn't change every second, consider pre-rendering it and caching it at the edge.

**Examples:**

- **[Next.js](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating) Incremental Static Regeneration** — Pre-render pages at build time, then update them as needed.
- **[Cloudflare Pages](https://pages.cloudflare.com/) + [KV](https://developers.cloudflare.com/kv/)** — Store JSON blobs at the edge, update them via workers.
- **[Astro](https://astro.build/) Static Site Generation** — Pre-build content at build time for maximum performance.

### Data Sync Workers

You won't get far without thinking about data freshness. Workers that sync edge writes back to your origin — or sync offline edits from client to server — are a big part of the puzzle.

Patterns like [conflict-free replicated data types (CRDTs)](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type) help make sure edits from multiple sources merge predictably. This is how collaborative editors like [Figma](https://www.figma.com/) or [Notion](https://notion.so/) handle multiple users editing the same thing.

### Durable Objects and Co-Located State

Some workloads need _sticky_ state that's close to your user and doesn't bounce between servers. [Durable Objects](https://developers.cloudflare.com/durable-objects/) (like Cloudflare's implementation) give you per-session or per-object state that runs near the client.

A good fit: chat sessions, multiplayer game state, collaborative editing, or real-time dashboards.

---

## Your New Toolkit

This ecosystem is growing fast. Here's what teams are adopting:

### Edge Compute

- **[Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)** — Lightweight serverless runtimes deployed globally
- **[Cloudflare Workers](https://workers.cloudflare.com/)** — Edge computing platform with global deployment
- **[AWS Lambda@Edge](https://aws.amazon.com/lambda/edge/)** — Lambda functions that run at CloudFront edge locations
- **[Deno Deploy](https://deno.com/deploy)** — Global edge deployment for Deno applications

### Edge Storage

- **[Cloudflare KV](https://developers.cloudflare.com/kv/)** — Key-value storage at the edge
- **[Cloudflare D1](https://developers.cloudflare.com/d1/)** — SQLite at the edge
- **[Turso](https://turso.tech)** — Distributed SQLite
- **[Upstash Redis](https://upstash.com/)** — Global Redis API
- **[PlanetScale](https://planetscale.com)** — Global MySQL-compatible database

### Sync Engines

- **[Automerge](https://automerge.org/)** — CRDT library for building collaborative applications
- **[Yjs](https://github.com/yjs/yjs)** — CRDT framework for building collaborative applications
- **[ElectricSQL](https://electric-sql.com/)** — Local-first sync for Postgres

### CDN-Backed APIs

Static or semi-static APIs served globally via [Fastly](https://www.fastly.com/), [CloudFront](https://aws.amazon.com/cloudfront/), or [Akamai](https://www.akamai.com/).

These tools play nicely with modern frameworks — and many are pay-as-you-go, so you can experiment without huge upfront cost.

---

## What Can Go Wrong?

Bringing data closer comes with trade-offs. Be aware of the common pitfalls:

### ⚖️ Consistency vs. Performance

Replication across regions means you can't always guarantee instant consistency. You'll need to decide where [strong consistency](https://en.wikipedia.org/wiki/Consistency_model#Strong_consistency) _matters_ and where [eventual consistency](https://en.wikipedia.org/wiki/Eventual_consistency) is fine.

### 🔄 Conflict Resolution

If users can edit the same record from different places, you need a strategy to merge changes predictably. This is where [CRDTs](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type), [version vectors](https://en.wikipedia.org/wiki/Vector_clock), and timestamp-based conflict resolution come in.

### 💰 Cost

More replicas, more global reads, more egress traffic — it all adds up. Keep an eye on costs, especially when your app scales globally.

### 🛠️ Tooling Maturity

Many edge-focused databases are new. Some frameworks assume single-region backends. Make sure your [ORM](https://en.wikipedia.org/wiki/Object%E2%80%93relational_mapping) or data layer supports the edge pattern you want.

---

## How to Get Started

You don't need to re-architect everything on day one. Start with a slice:

1. **Put read-heavy, low-write data on an edge replica** — user profiles, static settings, or public content
2. **Cache static JSON at the CDN edge** — use [Cloudflare KV](https://developers.cloudflare.com/kv/) or similar
3. **Try local-first for drafts, carts, or comments** — anything that makes sense offline
4. **Wrap it in a feature flag and ship incrementally** — use tools like [LaunchDarkly](https://launchdarkly.com/) or [Split](https://split.io/)

For development, keep it frictionless: run [Docker](https://www.docker.com/) containers with seeded test data, or use SQLite locally to mimic your prod schema.

---

## Bringing It All Together

Bringing data closer to your code used to mean spinning up expensive replicas and fighting complex sync pipelines. Today, edge compute, distributed databases, and local-first frameworks make it practical — and surprisingly accessible — for everyday teams.

Start small. Pick a piece of your stack. Move it closer. Your app will get faster, your infrastructure will get more resilient, and your development loops will get smoother.

---

> **If you're experimenting with this, I'd love to hear what's working for you — drop me a note [here](mailto:i@pgte.me) or ping me on [Twitter](https://x.com/pgte).**

> Happy coding,  
> Pedro
