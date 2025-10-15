---
title: "Building Decipad: A Deep Dive into Our Toughest Engineering Challenges"
description: "From real-time collaboration with CRDTs to a high-performance Rust computation engine, we're pulling back the curtain on the 14 biggest technical hurdles we overcame in Decipad's evolution."
author: "Pedro Teixeira"
date: 2025-10-17
tags: ["Decipad", "Offline-first", "Serverless"]
image: "/images/blog/decipad.jpg"
---

Building a product from the ground up is a journey filled with complex puzzles and "aha\!" moments. At Decipad, our vision has always been to create a new kind of data notebook—one that is intuitive, collaborative, and powerful enough for complex modeling. But turning that vision into a reality meant tackling a series of significant engineering challenges.

This article pulls back the curtain on our evolution. We'll walk you through the toughest problems we faced, from architecting a real-time collaborative editor from scratch to building a high-performance computation engine in Rust. For each challenge, we'll detail the solution we engineered and link directly to the relevant open-source code in our repository. Whether you're a developer facing similar problems or just curious about what goes into building a modern web application, we hope our journey offers some valuable insights.

> Explore Our Code!
>
> Before we dive into the technical details, it's important to know that Decipad is a fully open-source project. Every solution, library, and component we discuss in this article is available for you to explore in our public GitHub repository.
>
> ➡️ Check it out at: [github.com/decipad/decipad](https://github.com/decipad/decipad)
>
> We encourage you to browse the code, star the project if you find it interesting, and see our engineering in action!

![Decipad](/images/blog/decipad.jpg)

### **1. The Foundation: Real-Time Collaboration**

**The Challenge**: From day one, seamless, Google Docs-style collaboration was non-negotiable. We needed to allow multiple users to edit the same document simultaneously, even with intermittent connectivity, without creating a mess of conflicting changes.

**Our Solution**: We embraced the power of Conflict-free Replicated Data Types (CRDTs) to ensure that the document would always reach a state of eventual consistency. This approach allowed us to build a robust system for both online and offline editing.

- **CRDT Core**: We implemented **Y.js**, a fantastic CRDT library, to manage document state and merge changes from different users without conflicts.
- **Editor Integration**: To connect our **Slate.js** editor with the Y.js backend, we built a custom bridge, [`libs/slate-yjs`](https://github.com/decipad/decipad/tree/main/libs/slate-yjs).
- **Real-Time Sync**: A **WebSocket** architecture, powered by AWS Lambda via [`libs/y-lambdawebsocket`](https://github.com/decipad/decipad/tree/main/libs/y-lambdawebsocket), handles the live communication between clients.
- **Offline First**: User changes are saved locally in **IndexedDB** ([`libs/y-indexeddb`](https://github.com/decipad/decipad/tree/main/libs/y-indexeddb)), allowing for offline work that syncs automatically upon reconnection.
- **Persistence & Awareness**: We use **DynamoDB** ([`libs/y-dynamodb`](https://github.com/decipad/decipad/tree/main/libs/y-dynamodb)) for server-side persistence and built an awareness system to show real-time cursors and selections for all collaborators.

**Key Files**:

- [Sync Documentation](https://github.com/decipad/decipad/blob/main/docs/SYNC.md)
- [Y.js Editor Implementation](https://github.com/decipad/decipad/blob/main/libs/slate-yjs/src/plugin/yjsEditor.ts)

### **2. Taming the Editor: Stability and Predictability**

**The Challenge**: Our initial editor, built on Slate.js, was powerful but prone to instability. We faced frequent crashes, frustrating cursor jumps, and invalid states caused by the complexity of its operations. A collaborative tool that isn't reliable is a tool no one will use.

**Our Solution**: In late 2021, we undertook a complete rewrite of the editor. The goal was to simplify operations, enforce strict data structures, and eliminate unpredictability.

- **Radical Simplification**: We stripped out complex transformations and dead code, focusing on a more straightforward architecture.
- **Strict Type Safety**: Comprehensive **TypeScript** types were implemented for all editor values, preventing entire classes of bugs.
- **Document Normalizers**: We introduced normalizers to automatically correct the document structure if it ever entered an invalid state, ensuring self-healing capabilities.
- **Conflict Prevention**: A **write lock system** ([`useWriteLock`](https://github.com/decipad/decipad/blob/main/libs/editor/src/utils/useWriteLock.ts)) was implemented to prevent race conditions during complex operations.
- **Robust Testing**: We added a suite of integration and end-to-end tests to validate plugin behavior and user flows.

**Key Files**:

- [The Editor Reform Documentation](https://github.com/decipad/decipad/blob/main/docs/FRONTEND.md#the-editor-reform)
- [Editor Component](https://github.com/decipad/decipad/blob/main/libs/editor/src/Editor.component.tsx)

### **3. Building a Language: Parsing and Grammar**

**The Challenge**: Decipad needed its own language—one that could elegantly handle mathematical expressions, units, and dimensional analysis. Building a parser that was both powerful and fault-tolerant was a significant undertaking.

**Our Solution**: We used the parser generator **Nearley** to define a formal grammar for our language. This allowed us to handle complex expressions, provide meaningful error messages, and ensure our language was well-defined.

- **Grammar System**: We defined our entire language structure using Nearley in [`libs/language/src/grammar/nearley/`](https://github.com/decipad/decipad/tree/main/libs/language/src/grammar/nearley).
- **Custom Tokenizer**: A sophisticated tokenizer uses regex to correctly identify numbers, dates, units, and other language-specific identifiers.
- **Granular Error Handling**: The parser was designed to provide detailed syntax errors, including line and column numbers, to guide users in fixing their formulas.
- **Source Map Integration**: We added source mapping for improved debugging and error reporting between the raw text and the parsed structure.

**Key Files**:

- [Decipad Language Grammar (.ne file)](https://github.com/decipad/decipad/blob/main/libs/language/src/grammar/nearley/deci-language-grammar.ne)
- [Parser and Tokenizer Implementation](https://github.com/decipad/decipad/blob/main/libs/language/src/parser/parser.ts)

### **4. The Need for Speed: The Computation Engine**

**The Challenge**: A data notebook is only as good as its performance. We needed to compute complex mathematical models, often with large datasets, in real-time without freezing the user interface. Our initial JavaScript-based engine couldn't keep up.

**Our Solution**: We made the pivotal decision to rewrite our entire computation engine in **Rust** and compile it to **WebAssembly (Wasm)**. This gave us the raw performance of a low-level language directly in the browser, combined with an intelligent incremental computation system.

- **Rust & Wasm Backend**: The core engine was rebuilt in Rust ([`apps/compute-backend`](https://github.com/decipad/decipad/tree/main/apps/compute-backend)) for near-native speed.
- **Incremental Computation**: We built a change-detection system ([`libs/computer`](https://github.com/decipad/decipad/tree/main/libs/computer)) that only recomputes the parts of the document that have changed, saving massive amounts of processing time.
- **Intelligent Caching**: The [`ComputationRealm`](https://github.com/decipad/decipad/blob/main/libs/computer/src/computer/ComputationRealm.ts) implements a smart caching layer to store and retrieve results efficiently.
- **Optimized Data Transfer**: We use efficient binary serialization to move data between the JavaScript frontend and the Rust Wasm backend.

**Key Files**:

- [Rust Backend `Cargo.toml`](https://github.com/decipad/decipad/blob/main/apps/compute-backend/Cargo.toml)
- [Computer Implementation](https://github.com/decipad/decipad/blob/main/libs/computer/src/computer/Computer.ts)

### **5. From Chaos to Cohesion: Our Design System**

**The Challenge**: In the early days, our UI was a patchwork of inconsistent components and copy-pasted styles. This made development slow, and the user experience felt disjointed. We lacked a single source of truth for our design.

**Our Solution**: In mid-2021, we created a centralized UI package and a formal design system. This brought consistency and velocity to our frontend development.

- **Centralized UI Library**: All UI components were consolidated into a single package, [`libs/ui`](https://github.com/decipad/decipad/tree/main/libs/ui).
- **Design Primitives**: We established design tokens for colors, typography, spacing, and animations, ensuring a consistent look and feel everywhere.
- **Component Documentation**: Using **Storybook**, we created comprehensive documentation for each component, making them easy to discover and use.
- **Type-Safe Styling**: We used **Emotion** with our design tokens to write type-safe, predictable styles.

**Key Files**:

- [Design System Documentation](https://github.com/decipad/decipad/blob/main/docs/FRONTEND.md#the-conception-of-the-ui)
- [Storybook Configuration](https://github.com/decipad/decipad/blob/main/storybook)

### **6. Connecting the Dots: Secure Data Integration**

**The Challenge**: To be a true data tool, Decipad needed to connect securely to external sources like databases, APIs, and spreadsheets. This required a robust architecture that could handle data isolation, security, and credentials management.

**Our Solution**: We architected a Data Lake system using Google BigQuery, where each user workspace is given its own isolated dataset and a dedicated service account.

- **Isolated Data Architecture**: We use **BigQuery** to create sandboxed datasets for each workspace, ensuring strict data isolation.
- **Secure Credential Management**: API keys and database credentials are fully encrypted at rest.
- **EL Pipeline**: We integrated **Airbyte** to handle the Extract-Load (EL) processes, allowing us to easily add new data sources.
- **Connection Validation**: The system includes comprehensive testing and error handling to ensure data connections are valid and reliable.

**Key Files**:

- [Data Lake Architecture Documentation](https://github.com/decipad/decipad/blob/main/docs/DATALAKE.md)
- [Connection Management Service](https://github.com/decipad/decipad/blob/main/libs/backend-data-lake/src/services/createConnection.ts)

### **7. Smarter Notebooks: Reliable AI Integration**

**The Challenge**: Integrating AI for code generation and assistance is powerful but comes with its own set of problems: API failures, rate limiting, and managing the right context to get useful results.

**Our Solution**: We built a resilient AI layer that is provider-agnostic and designed to handle real-world unreliability.

- **Multi-Provider Fallbacks**: Our system can switch between **OpenAI** and other providers if one service is down or performing poorly.
- **Sophisticated Context Management**: We developed logic to intelligently extract the relevant context from a notebook to provide the most accurate AI assistance.
- **Rate Limiting & Error Handling**: The system includes workspace-level usage tracking and robust retry mechanisms to gracefully handle API errors and rate limits.
- **Fine-Tuning**: We created custom, fine-tuned models specifically trained for Decipad's language and common use cases.

**Key Files**:

- [Notebook Assistant Logic](https://github.com/decipad/decipad/blob/main/libs/backend-notebook-assistant/src/notebookAssistant/engageAssistant.ts)
- [Code Assistant Logic](https://github.com/decipad/decipad/blob/main/libs/backend-code-assistant/src/codeAssistant/codeAssistant.ts)

### **8. Optimizing the Frontend: Performance and Bundle Size**

**The Challenge**: As Decipad grew, so did our bundle size. The application was becoming slow to load, with First Contentful Paint (FCP) times creeping up to 8 seconds—unacceptable for a modern web app.

**Our Solution**: A full frontend rewrite in mid-2022 focused entirely on performance, code splitting, and a better loading experience. The results were dramatic.

- **Aggressive Code Splitting**: We implemented route-based and component-based code splitting to only load the code needed for the current view.
- **Lazy Loading**: Heavy components, like our plotting libraries, are now lazy-loaded on demand.
- **GraphQL Caching**: We leveraged normalized caching with **urql** to minimize network requests.
- **Performance Gains**: These changes slashed our First Contentful Paint from \~8 seconds to under \~1 second.

**Key Files**:

- [The Client Rewrite Documentation](https://github.com/decipad/decipad/blob/main/docs/FRONTEND.md#the-client-re-write)
- [Vite Configuration for Bundling](https://github.com/decipad/decipad/blob/main/vite.config.ts)

### **9. Taming Complexity: Engineering and Operations**

Beyond user-facing features, a significant amount of work went into our engineering practices to ensure we could build, test, and deploy reliably. Here are a few highlights:

- **Monorepo Management**: We use **Nx** to manage our complex monorepo, which gives us intelligent caching, build optimization, and clear dependency management. ([`nx.json`](https://github.com/decipad/decipad/blob/main/nx.json))
- **State Management**: We use a combination of **Zustand** for lightweight global state, React contexts for localized state, and **RxJS** for handling complex event-driven streams. ([`libs/notebook-state`](https://github.com/decipad/decipad/tree/main/libs/notebook-state))
- **End-to-End Type Safety**: A strict **TypeScript** configuration is enforced across all packages, with generated types from our GraphQL API to prevent integration errors. ([`tsconfig.json`](https://github.com/decipad/decipad/blob/main/tsconfig.json))
- **Infrastructure as Code**: Our entire serverless AWS architecture is defined as code using the **Architect** framework, enabling reproducible and predictable deployments. ([`app.arc`](https://github.com/decipad/decipad/blob/main/apps/backend/app.arc))
- **Multi-Layered Testing**: Our quality assurance strategy includes **Vitest** for unit tests, and **Playwright** for comprehensive end-to-end browser testing. ([E2E Tests](https://github.com/decipad/decipad/tree/main/apps/e2e))
- **Documentation**: We believe great documentation is key to a healthy open-source project. We maintain detailed architecture guides, setup instructions, and contribution guidelines. ([`/docs`](https://github.com/decipad/decipad/tree/main/docs))

### **Conclusion: A Platform Forged by Challenges**

Looking back, the evolution of Decipad has been a story of relentless problem-solving and architectural refinement. Each challenge, from real-time sync to bundle size, forced us to learn, adapt, and build better systems. The solutions outlined here—a Rust-powered backend, a CRDT-based editor, a robust design system, and a comprehensive testing strategy—are the pillars that support Decipad today.

By sharing this technical deep dive, we hope to not only showcase the work that has gone into our platform but also to contribute to the broader developer community. Our entire codebase is open source, and we invite you to explore the files linked above, learn from our approach, and even contribute to the future of Decipad.
