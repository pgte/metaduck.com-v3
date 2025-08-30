---
title: "Embedding an All-Seeing AI Agent"
description: "How we built an AI agent that can see and understand visual content, opening new possibilities for intelligent automation and assistance."
author: "Pedro Teixeira"
date: 2025-07-18
tags: ["AI & ML", "Development"]
image: "/images/blog/astronaut-talking-to-robot.jpg"
---

> ## TLDR;
>
> Instead of building a complex API surface for your AI agent, make it interact with your app like a human user would. Use the Accessibility Object Model (AOM) to give your agent "eyes" to see the UI and "hands" to interact with it. This approach is simpler, more maintainable, and has the bonus of making your app more accessible for screen readers.

![AI Agent](/images/blog/astronaut-talking-to-robot.jpg)

# Embedding an All-Seeing AI Agent

> These days, having an AI agent embedded in your app is becoming **less of a "nice-to-have" and more of a basic expectation**—especially if your app is non-trivial. Whether it's answering questions about how the app works, surfacing user-specific data, or even performing tasks on the user's behalf, the bar has been raised.

Let's break this down a bit.

## What a Good Agent Needs to Do

At a high level, the embedded agent needs to cover **three main responsibilities**:

1. **Guide the user**: "How do I invite a teammate?"
2. **Answer user-specific questions**: "What documents did I upload last week?"
3. **Perform actions**: "Remove that document."

The first is usually handled by having the LLM digest your docs or help guides. For the second and third, people tend to lean on tools—small functions or API endpoints that the LLM can call to either fetch data or trigger an action.

> But here's the catch: **the more tools you hand over to the LLM, the slower and more confused it gets**. And with a sufficiently complex app, you'll need a lot of tools.

Imagine a CRM. Fetching a list of accounts? One tool. Fetching a contact's activity history? Another. Updating a lead status? Yet another. Pretty soon, the LLM is juggling dozens of APIs, each with its own semantics and edge cases.

And it gets worse when it comes to actions: creating a note, sending an invite, tagging a user, exporting a report—all of these are side-effects, and each needs its own entry point. **This toolset bloats fast**.

I believe there can be a better way.

## Make the Agent a Power User

Instead of trying to give the LLM a neatly packaged API to every corner of your app, **what if we made it act like a human user?**

That sounds slower, but it's more aligned with how your app actually works. Plus, there are some side benefits:

- You don't have to build out a sprawling tool API surface area
- You can lean on something your app already has (or should have): **accessibility metadata**

That's the core of the idea—make your agent rely on the [**Accessibility Object Model (AOM)**](https://wicg.github.io/aom/explainer.html) instead of the raw DOM or a giant toolbox of custom tools.

Let's unpack that.

## Why the DOM Isn't Enough

![Partial DOM snapshot](/images/blog/big_dom.png)

If you try giving the agent the full DOM, you're going to drown it in noise: layout info, styling quirks, placeholder elements, things that aren't relevant to behavior or semantics. **Worse, none of it gives a clear signal on what the "important" parts of the UI are**.

The AOM, on the other hand, is designed to make things clear for screen readers. It tells you:

- This is a button
- This is a form field with the label "Team name"
- This is a link that goes to Settings

It's **structured, semantically relevant, and relatively compact**.

![Accessibility Object Model snapshot](/images/blog/accessibility_object_model.png)

To use the AOM effectively, your app will need to expose accessibility metadata: `aria-label`, `role`, `aria-description`, etc. This takes effort, yes—but it's the kind of effort that also improves the app for human users with screen readers.

And now, that effort also improves the experience for users with AI agents.

## Eyes and Hands

To be useful, the agent needs:

- **Eyes**: The ability to observe and understand the current state of the UI
- **Hands**: The ability to interact with that UI

For the eyes, the agent needs just one tool that renders the current UI state by walking the AOM. This lets the LLM know, for instance, that there's a button with label "Create Team" and a text input with label "Team Name".

```typescript
describe_app_ui();
```

For the hands, we expose just two tools:

```typescript
click_element(role, description); // Finds an interactive element based on its role and description, and clicks it
fill_form_element(role, description, value); // Fills a field with a given value
```

> Check out [a very simplified example of the implementation of these tools here](https://gist.github.com/pgte/a1cc1565659736cac81a7955f6686774).

That's it. **No special `invite_user`, `delete_document`, or `archive_note` tools**.

If you're thinking "But won't that make things brittle?"—fair concern. The truth is, yes, it depends on the quality of your accessibility metadata. But assuming your app already has meaningful labels, this approach gets you far without ballooning the toolset.

## A Quick Example

Let's say the user asks: "Can you create a team called 'Designers'?"

The LLM:

1. Calls `describe_app_ui`, gets back a summary of the AOM
2. Looks for a button with label "Create Team" and clicks it
3. Sees a form with an input labeled "Team Name"
4. Fills it with "Designers"
5. Finds the "Submit" button and clicks that

**No need to tell the LLM how to create a team, just what's in front of it**.

## The Bonus: Users Learn Too

A hidden advantage of this model: **the user sees everything the agent sees and does**.

- They see what data the agent reads
- They see the forms the agent fills
- They watch the agent navigate the UI

For beginners, this becomes a learning experience. It's like pairing with someone more experienced who just happens to be an LLM. Instead of black-box magic, users can follow along and build trust.

And when the agent fails? The user is better equipped to spot why, because they're not staring at a blank result—they're watching the steps unfold.

# Wrapping Up

You don't need to hand your LLM every API endpoint under the sun. Instead, give it:

- **Structure**
- **Context**
- **The ability to interact with your app the way a person would**

The Accessibility Object Model is already optimized to expose the important parts of your UI. **Use it**.

Give the agent eyes that see what users see, and hands that click and type where users do. It's **simpler, easier to reason about, and more aligned with how your app behaves in the real world**.

And hey, if you make your app more accessible in the process, that's just good engineering.
