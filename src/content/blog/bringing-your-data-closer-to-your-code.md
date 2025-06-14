---
title: "The Distributed Dream: Bringing Data Closer to Your Code"
description: "Exploring the challenges and possibilities of bringing data closer to edge compute, and imagining a future of non-uniform data access for distributed systems."
author: "Pedro Teixeira"
date: 2025-06-14
tags:
  [
    "distributed systems",
    "edge computing",
    "data architecture",
    "serverless",
    "consistency",
  ]
---

Infrastructure, as we know, can be a challenging subject. We've seen a lot of movement towards serverless architectures, and for good reason. They promise to abstract away the operational burden, letting us focus more on the code that delivers value. Add Content Delivery Networks (CDNs) into the mix, especially those that let you run functions at the edge, and things start to feel pretty good. You can get your code running incredibly close to your users, reducing latency and making for a snappier experience.

But here's where we often hit a snag: data access.

# The Data Dilemma at the Edge

When your serverless function is humming along on a CDN node in, say, Lisbon, and it needs to fetch some data, where does it go? Often, that data lives in a centralized database, perhaps in Ireland or even further afield. That distance introduces latency, and suddenly, the benefit of running your code close to the user starts to diminish.
Another option is using eventually-consistent, heavily cached data services, like Cloudflare's Worker KV. These can be useful for certain types of data, but they often come with trade-offs. Throughput can be limited, and changes to data can take a noticeable amount of time – sometimes up to a minute – to propagate across the system. This can be fine for some use cases, but it's not ideal when you need fresh, accurate data right away.

So, how do we get the best of both worlds: edge compute with efficient data access?

# Imagining the Ideal Data Setup: Non-Uniform Data Access (NUDA)

My thoughts often drift to an ideal scenario for how data could work in this distributed world. It's a bit like Non-Uniform Memory Access (NUMA) in computer architecture, where memory access times vary depending on the processor's proximity to the memory. I call this concept Non-Uniform Data Access, or NUDA.

Here's how I picture it:

## Partitioning Data Where it Makes Sense

First, imagine your data is partitioned. This could be by organization, by user, or by some other logical boundary that fits your business. This partitioning isn't just about distribution; it can also reflect the privacy and security needs of your customers. If data for one customer lives in its own partition, it becomes simpler to manage access and ensure their data stays separate.

Ideally, the data layer itself would manage and enforce access and write permissions. This means your application code doesn't have to worry as much about who can see or change what; the data store handles it directly.

## Data Right Next to Your Worker

The core of NUDA is bringing the customer's data as close as possible to the service worker. In the best case, the data would reside on the same physical computer as the worker, or even embedded within the same process. Think of it: your function needs some data, and it's right there, locally accessible. No network hops to a distant data center, just immediate access. This would make reads incredibly fast for read-heavy applications that don't require strong consistency across the entire dataset.

## Fine-Tuning Consistency for Reads and Writes

Now, not all data needs the same level of consistency. Some data needs to be absolutely up-to-the-minute, while other data can tolerate a slight delay. The ideal system would let you choose.

For reads, some could be strongly consistent, meaning you're guaranteed to get the very latest version of the data. Other reads could be eventually consistent, giving you a potentially slightly older version but with lower latency. This is similar to how you can configure reads in databases like DynamoDB.

Writes would have similar flexibility. An eventually-consistent write would return quickly to the user, with the system handling background synchronization to replicate the change across other nodes. This is great for things like analytics events or user preferences where immediate, global consistency isn't critical.

For writes that demand strong consistency, the system would need to coordinate with other nodes that hold that data. A majority of those nodes would have to acknowledge the update before the write operation returns as successful. This ensures that the data is consistent across the necessary replicas.

## Conflict-Free Data for Eventual Consistency

For eventually consistent data, a key feature would be support for conflict-free data types. This means that even if multiple people write to the same piece of data at roughly the same time, no data is lost. These could be simple things, like a counter that just increments regardless of the order of operations, or a "last-writer wins" record where the most recent write takes precedence. They could also be more complex, nested data structures that intelligently merge updates so that all changes are preserved.

# The Path Forward

This might sound like a future dream, but I believe we have much of the technology to support this kind of architecture today. What's holding us back from realizing this truly distributed, data-proximate computing model? It feels like we're on the cusp of some exciting developments in this area.
