---
title: "Building Decipad: A 5-Year Technical Retrospective"
description: "A retrospective look at the five-year technical journey of Decipad, exploring architectural decisions, key challenges, and product pivots that shaped its evolution from a modeling tool to a collaborative data notebook platform."
author: "Pedro Teixeira"
date: 2025-10-15
tags: ["Decipad"]
image: "/images/blog/decipad.jpg"
---

After five years of dedicated work, we've made the difficult decision to [shut down Decipad](https://www.decipad.com/decipad-is-shutting-down). While this marks the end of a significant chapter, it also presents an opportunity to reflect on the journey. In this post, I want to take you through the technological evolution of the Decipad product, sharing the key decisions, challenges, and innovations that shaped our path. From our initial vision of making data analysis as intuitive as storytelling to the final iteration of our collaborative notebooks, this is a look back at the technical timeline of Decipad.

> In the spirit of transparency and with the hope that our work can benefit others, we have decided to open-source the entire Decipad platform. Our journey was filled with countless technical challenges, breakthroughs, and valuable lessons. By making our codebase publicly available at https://github.com/decipad/decipad, we invite the community to explore, learn from, and build upon the technology that we poured our hearts into for the last five years. We hope it serves as a useful resource for others tackling similar problems.

![Decipad](/images/blog/decipad.jpg)

# Decipad Product Evolution Timeline

## **Phase 1: Language for Modeling (2022 Early)**

**Core Focus**: Human-like expressions, units, time, columns, tables

- **Foundation**: Built the core Decipad language with mathematical expressions
- **Key Features**:
  - Units and dimensional analysis with built-in unit conversion
  - Human-readable mathematical expressions
  - Time handling and date operations
  - Column and table data structures
  - Custom functions and parameters
- **Architecture**: Nearley-based parser for the Decipad language grammar
- **Target**: Quantitative modeling and calculations

## **Phase 2: Notebook Inception with Language Integration (2022 Mid)**

**Core Focus**: Rich text editor with embedded calculations

- **Notebook Editor**: Built on Slate.js for rich text editing
- **Language Integration**: Seamless embedding of Decipad language within text
- **Key Features**:
  - Calculation blocks within notebooks
  - Variable bubbles for tracing calculations
  - Input widgets for interactive models
  - Block-based architecture (paragraphs, calculations, widgets)
- **UI/UX**: Focus on making mathematical expressions readable and editable

## **Phase 3: UI-Driven Computation (2022-2023)**

**Core Focus**: Tables, charts, data views, textual inline computations, smart references, IDE-like features

- **Data Views** (Jan 2023): Pivot tables and data summarization
- **Enhanced Tables**:
  - Improved variable representation
  - Column operations and data types
  - Drag-and-drop functionality
- **IDE-like Features**:
  - Auto-complete for functions
  - Smart suggestions and help system
  - Inline result inspection
  - Formula highlighting and tracing
- **Real-time Collaboration** (Mar 2023): Multi-user editing with conflict-free synchronization
- **Workspace Organization**: Better notebook management and sharing

## **Phase 4: External Data Integration (2023 Mid)**

**Core Focus**: APIs, databases, spreadsheets

- **Code Integrations** (Jun 2023): JavaScript code execution for data fetching
- **SQL Integrations** (Jul 2023): Database connections and custom SQL queries
- **API Key Secrets**: Secure credential management
- **Supported Integrations**:
  - MySQL, PostgreSQL, BigQuery
  - Google Sheets, Notion
  - CSV, JSON files
  - REST API integrations
- **Pro Workspaces**: Team collaboration and advanced features

## **Phase 5: AI Assistant (2023 Mid-Late)**

**Core Focus**: AI-powered assistance and code generation

- **AI Assistant** (Jun 2023): Content rewriting and paragraph improvement
- **Enhanced AI Features** (Jul 2023):
  - Code generation for data extraction
  - Table column population assistance
- **Notebook Chat Assistant** (Dec 2023): Interactive AI chat for brainstorming and guidance
- **AI Components**:
  - Code generation and suggestions
  - Content improvement
  - Data generation for tables
  - Smart recommendations

## **Phase 6: Data Lake for Customers (2024)**

**Core Focus**: Standard product stacks with isolated data environments

- **Data Lake Architecture**:
  - Isolated BigQuery datasets per workspace
  - Airbyte integration for EL (Extract-Load) processes
  - Google Cloud service account management
- **Enterprise Features**:
  - Workspace-level data isolation
  - Automated data pipeline management
  - RESTful API for data access
- **Advanced Integrations** (Sep 2024):
  - Google Sheets integration
  - BigQuery direct imports
  - Real-time data synchronization

## **Phase 7: AI Assistant Improvements (2024)**

**Core Focus**: Enhanced AI capabilities and user experience

- **Advanced AI Features**:
  - Context-aware code generation
  - Improved notebook understanding
  - Better integration with data sources
- **Performance Optimizations**:
  - Faster AI responses
  - Better error handling
  - Enhanced user feedback

## **Phase 8: Pivot to Analysis and Reporting (2024)**

**Core Focus**: Business intelligence and reporting capabilities

- **Data Analysis Focus**:
  - Live dashboards with real-time data
  - Business intelligence workflows
  - Advanced data visualization
- **Reporting Features**:
  - Automated report generation
  - Data storytelling capabilities
  - Professional presentation tools
- **Enterprise Readiness**:
  - Scalable data processing
  - Advanced security and permissions
  - Integration with business tools

## **Phase 9: Computational Backend Redo (2024)**

**Core Focus**: Performance improvements and scalability

- **Rust WebAssembly Engine**:
  - High-performance computation backend
  - WebAssembly compilation for browser execution
  - Optimized mathematical operations
- **Performance Improvements**:
  - Faster calculation execution
  - Better memory management
  - Improved large dataset handling
- **Architecture Enhancements**:
  - Modular computation engine
  - Better error handling and validation
  - Enhanced type system

## **Key Architectural Decisions**

1. **Monorepo Structure**: Nx-based monorepo for better code organization
2. **Real-time Collaboration**: Y.js-based CRDT for conflict-free editing
3. **Serverless Backend**: AWS Lambda with DynamoDB for scalability
4. **Modern Frontend**: React 18, TypeScript, and modern web standards
5. **Computation Engine**: Rust compiled to WebAssembly for performance
6. **AI Integration**: Multiple AI providers with fallback mechanisms
7. **Data Architecture**: Isolated data lakes with enterprise-grade security

## **Current State (2025)**

Decipad has evolved from a simple mathematical modeling tool into a comprehensive data notebook platform that combines:

- Advanced mathematical computation
- Real-time collaboration
- AI-powered assistance
- Enterprise data integration
- Business intelligence capabilities
- High-performance computation engine

---

Reflecting on this five-year chapter, I can only describe it as a huge privilege. To be part of this wonderful technological endeavour, to build something from nothing alongside such a talented team, has been an unforgettable experience. The path wasn't always easy, but every challenge pushed us to be better engineers and collaborators. I will carry the lessons from this journey with me always, and I am immensely proud of the product we built and the team we became.
