---
title: "Building Helpmaton: An Infrastructure Layer for AI Agents"
description: "How building Helpmaton — a robust infrastructure layer for AI agents—helped transform one-off scripts into reliable, context-aware, and continuously evaluated AI workflows for projects like TimeClout."
author: "Pedro Teixeira"
date: 2026-02-06
tags: ["AI & ML", "Architecture", "Development", "TimeClout", "Productivity"]
image: "/images/blog/robots.jpg"
---

![Robots](/images/blog/robots.jpg)


## Moving from scripts to managed, stateful agent workflows.

I’ve spent the last year building **AI agents** to automate internal workflows. Like many developers, I started with simple Python scripts wrapping the [OpenAI API](https://platform.openai.com/docs). While effective for *one-off tasks*, I found that scaling these scripts into reliable, long-running processes introduced significant **infrastructure overhead**.

I built [Helpmaton](https://helpmaton.com) to solve these specific challenges. It is a **workspace-based platform** designed to manage, deploy, and evaluate AI agents, providing the **state and reliability layers** that raw scripts often lack.

### The Use Case: Automating TimeClout

The motivation for building this platform came from my work on [TimeClout](https://timeclout.com) (my shift scheduling SaaS). I needed to automate several **growth engineering** tasks:

- **Social Listening:** Monitoring platforms for specific keywords (e.g., "scheduling nightmare") to identify users seeking solutions.
- **Lead Triage:** Distinguishing between relevant leads (managers looking for tools) and general noise (employees venting).
- **Content Generation:** Drafting marketing copy based on changelogs that adhered to strict brand guidelines.

My initial scripts struggled with **context retention** and **consistency**. To address this, I focused on three core engineering problems: **memory**, **reliability**, and **integration**.

### 1. Solving State with Hybrid Memory

Standard **LLM** interactions are *stateless*. Passing full conversation logs into the context window is inefficient and costly. To allow agents to retain business logic over time, I architected Helpmaton around a **hybrid memory pipeline**:

- **GraphDB:** We use this to map *structured relationships*. It allows the agent to definitively link entities, such as associating a specific User with a Company or a project.
- **Vector Search:** This handles [semantic retrieval](/building-semantic-search-for-ai-customer-service-agents), allowing the agent to recall relevant past conversations or documents based on *meaning* rather than exact keywords.
- **Reranking:** Before feeding data to the LLM, we use a reranking step to score the retrieved context, ensuring only the most relevant information is passed to the model.

For TimeClout, this means the agents can retain **long-term context** about brand voice and disqualification criteria without requiring massive context windows.

### 2. Ensuring Reliability with Continuous Evaluation

One of the hardest parts of deploying AI agents is knowing if they are *actually doing their job correctly* once they leave the testing phase. A prompt might work on your test set but fail on messy, **real-world data**.

Helpmaton solves this through **Continuous Evaluation**. Instead of just running pre-deployment checks, the system allows you to define **"Judge" evaluators** that monitor your agents as they perform real tasks over time.

For example, every time my TimeClout **"Triage Agent"** classifies a lead, a separate Judge model evaluates that specific decision against my criteria (e.g., *"Did the agent correctly identify that this user is asking for an Excel template, not software?"*).

This generates a **rolling accuracy score** based on live production data. It provides a *real-time health metric* for my digital workforce, allowing me to spot **drift or degradation** instantly rather than waiting for a user complaint.

### 3. Integrations and Model Access

Finally, managing **authentication** and **provider keys** is often repetitive boilerplate. Helpmaton abstracts this layer:

- **Managed Auth:** The platform handles OAuth flows for a wide range of services, including [Google Workspace](https://workspace.google.com) and [Notion](https://notion.so), so you don't have to build custom connectors for every tool.
- **Deployment:** Agents can be deployed as [Slack](https://slack.com) or [Discord](https://discord.com) bots with a *single click*.
- **OpenRouter Integration:** We integrated [OpenRouter](https://openrouter.ai) to handle model connectivity. This allows you to **bring your own keys** and access a unified interface for OpenAI, Anthropic, Google, and Llama models. You pay OpenRouter directly for inference, using Helpmaton purely for **orchestration and state management**.

---

**Helpmaton** is the tool I built to manage my own AI operations. It's open-source ([GitHub](https://github.com/djinilabs/helpmaton)). If you're looking for a platform to handle the infrastructure of agent development, you can check it out at [helpmaton.com](https://helpmaton.com).