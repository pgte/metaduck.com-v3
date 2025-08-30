---
title: 'The Fallacy of "Best Practices" in Software Architecture'
description: "Why over-engineering early is a trap, and how to build software with just enough architecture to get real results. Embrace the 'minimum viable architecture' mindset and learn practical, low-friction alternatives to heavyweight solutions."
author: "Pedro Teixeira"
date: 2025-08-09
tags: ["Architecture", "Development"]
image: "/images/blog/astronaut-building-spaceship.jpg"
---

> _Sometimes the only thing holding your architecture together is duct tape, spit, and a prayer._

![Astronaut building a spaceship](/images/blog/astronaut-building-spaceship.jpg)

---

## **Why “Best Practices” Can Be a Trap**

We all love to brag about our shiny new microservices, Kubernetes clusters humming in the cloud, and Kafka streaming events like a pro.

But here’s a secret: on day one, your system is probably held together by duct tape, spit, and a few hopeful prayers. And that’s totally okay.

The real trick isn’t to build the most elegant, bulletproof system _today_ — it’s to build something that _actually works_ without collapsing under its own weight before you get traction.

## **Early Optimization: The Overkill Symphony**

I’ve seen teams rig up entire Kubernetes fleets for a weekend hackathon app. Microservices spun up like fidget spinners, Kafka pipelines humming for an app with five users.

The result? Months of duct-taping services together, debugging orchestration nightmares, and forgetting the actual product.

If your team is spending more time managing YAML than writing code, that’s a clear sign you’ve got duct tape on your brain instead of a laser focus on shipping.

## **Minimally Viable Architecture (MVA): The “Spit and Duct Tape” Philosophy**

MVA is about embracing the spit-and-duct-tape approach _intentionally._

- Don’t build a spaceship when you need a skateboard.
- Choose solutions that solve the problem _right now_ — not the “future-proof” problem you hope to have someday.
- Make it so simple your mom could understand it (and maybe fix it).

## **Poor Man’s X: When Duct Tape Beats Titanium**

Before you bring in Kafka, RabbitMQ, or a fancy event store, try:

- **Poor Man’s Queue:** A database table + a simple cron job to process tasks. Reliable, low-friction, and duct-tape ready.
- **Poor Man’s Event Sourcing:** Just keep an append-only JSON log in your SQL DB before building a complex CQRS pipeline.
- **Poor Man’s Document Store:** Postgres `jsonb` columns let you dodge MongoDB and keep it all in one place.
- **Poor Man’s Search:** Postgres full-text search before you bring in Elasticsearch.
- **Poor Man’s Analytics:** Ship logs to CSV and use spreadsheets before building a data lake.

These may feel like hacks, but in reality, they’re battle-tested glue holding your app together in its scrappy early days.

## **The Scalability Sweet Spot: Don’t Shoot Yourself in the Foot**

Now, all this spit-and-duct-tape magic doesn’t mean you can ignore your future growth.

Take **multi-tenancy** vs **one database per customer**:

- Spinning up a new database per customer is tempting—it’s easy, isolated, and feels scalable. But it’s a one-way ticket to operational hell as your customer count grows.
- Multi-tenancy requires more upfront thought but pays off massively. It lets you:

  - **Scale customer service automatically** by managing all users through one platform.
  - **Enable self-service**, so customers onboard and troubleshoot themselves instead of calling support.
  - **Avoid bottlenecks** where the ops team spends half their time juggling databases instead of shipping features.

In short: build the minimum that’s _good enough_ for now, but don’t paint yourself into a corner that chokes your business when it grows.

## **Outsource the Glue That’s Not Your Core**

You don’t have to duct-tape everything yourself. Some plumbing is best rented, not built:

- Use Auth0 or Clerk for authentication instead of rolling your own login duct tape.
- Ship payments through Stripe rather than wrestling with PCI compliance.
- Offload search to Algolia or Typesense Cloud instead of DIY Elasticsearch nightmares.
- Use Sentry or Honeybadger for error tracking, so you can focus on features, not firefighting.

## **When Should You Upgrade from Duct Tape?**

When your system’s “spit and duct tape” slows down feature delivery or causes outages, it’s time to refactor.

Until then, don’t let the mythical “best practice” paralyze you. Your job is to **move fast, learn fast, and ship value**.

## **The Real “Best Practice”**

Ship early. Ship often. Use just enough tech to get the job done. Embrace the duct tape.

Because in the end, the best architecture is the one that keeps your business growing without drowning your small team in complexity.

---

**Your move:**
Got a funny or painful “early over-architecture” story with duct tape at the center? I’d love to hear it for my next post!
