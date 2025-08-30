---
title: "Building a Reactive Declarative Language: From Grammar to Incremental Computation"
description: "How we designed and implemented a reactive, type-safe, spreadsheet-inspired language with real-time updates, dependency tracking, and incremental computation."
author: "Pedro Teixeira"
date: 2025-07-30
tags: ["Programming Languages", "Performance", "Development"]
image: "/images/blog/astronaut-playing-chess.jpg"
---

![Astronaut playing chess](/images/blog/astronaut-playing-chess.jpg)

_How we built a spreadsheet-like language that scales from simple calculations to complex data analysis_

---

As CTO of Decipad, I spent several years building a collaborative notebook application that feels like a spreadsheet but works like a programming language. One of our biggest technical challenges was creating a reactive declarative language that could handle everything from simple arithmetic to complex data analysis while maintaining real-time performance.

Traditional spreadsheets become slow and unwieldy when you have hundreds of interdependent formulas. Users expect instant feedback when they change a value, but the computational complexity grows exponentially with the number of dependencies. We needed something better.

In this post, I'll walk you through how we built a reactive declarative language that scales from simple calculations to complex data analysis, with real-time updates and type safety.

## The Problem: Why Spreadsheets Don't Scale

Spreadsheets are great for simple calculations, but they fall apart when you have complex dependencies. Here's what happens:

1. **Performance Degradation**: Each change triggers a cascade of recalculations
2. **Circular Dependencies**: Users accidentally create infinite loops
3. **Type Errors**: Runtime errors that could be caught earlier
4. **Debugging Nightmares**: Hard to trace where values come from

We wanted something that felt as natural as a spreadsheet but was as powerful as a programming language.

## Our Solution: A Reactive Declarative Language

We built a language that combines the best of both worlds:

- **Declarative**: You describe what you want, not how to compute it
- **Reactive**: Changes automatically propagate through the dependency graph
- **Type Safe**: Errors are caught at parse time, not runtime
- **Performant**: Only recomputes what actually changed
- **No Loops**: No `for` or `while` loops—everything is expression-based

The absence of traditional control structures makes our language even more declarative. Instead of writing loops, users express their intent through higher-order functions and auto-mapping operations.

## Auto-Mapping: Expressing Intent Over Implementation

One of the most powerful features of our language is auto-mapping—the ability to apply operations across collections without explicit loops. This concept has deep roots in functional programming and data processing languages.

### Prior Art and Inspiration

Auto-mapping draws from several established paradigms:

**Array Programming Languages (APL, J, K)**

```apl
⍝ APL: Apply multiplication across arrays
A ← 1 2 3 4 5
B ← 2 2 2 2 2
C ← A × B  ⍝ Results in 2 4 6 8 10
```

**Functional Programming (Haskell, Clojure)**

```haskell
-- Haskell: Map function over list
map (*2) [1,2,3,4,5]  -- Results in [2,4,6,8,10]
```

**Data Processing (SQL, Pandas)**

```sql
-- SQL: Apply function to all rows
SELECT price * 1.1 as adjusted_price FROM products;
```

**Spreadsheet Formulas**

```
-- Excel: Apply formula to range
=A1:A10 * 1.1  -- Applies multiplication to entire range
```

### Our Implementation

In our language, auto-mapping happens automatically when you apply operations to collections:

```typescript
// Auto-mapping examples
Prices = [10, 20, 30, 40, 50];
AdjustedPrices = Prices * 1.1; // Auto-maps: [11, 22, 33, 44, 55]

Sales = [100, 200, 300, 400, 500];
Revenue = Sales * Prices; // Auto-maps element-wise: [1000, 4000, 9000, 16000, 25000]

// With functions
TotalRevenue = sum(Sales * Prices); // 34000
AveragePrice = mean(Prices); // 30
```

The key insight is that users don't need to think about iteration—they just express the mathematical relationship, and the system handles the mapping automatically.

### Higher-Order Functions

Instead of loops, we provide higher-order functions that express common patterns:

```typescript
// Filtering
HighValueSales = filter(Sales, Sales > 200); // [300, 400, 500]

// Aggregation
TotalSales = sum(Sales); // 1500
AverageSales = mean(Sales); // 300
MaxSales = max(Sales); // 500

// Transformation
SalesWithTax = Sales * 1.08; // Auto-maps tax calculation
SalesByRegion = group(Sales, Region); // Groups by region
```

This approach has several advantages:

1. **Readability**: The intent is clear from the function name
2. **Performance**: The system can optimize these operations
3. **Parallelization**: Many operations can be parallelized automatically
4. **Type Safety**: The type system can verify operations are valid

### Table Operations

For more complex data, we support table operations that feel natural:

```typescript
// Table operations with auto-mapping
Products = {
  name = ["Apple", "Banana", "Orange"],
  price = [1.00, 0.50, 0.75],
  quantity = [100, 200, 150]
}

// Auto-mapping across table columns
Revenue = Products.price * Products.quantity  // [100, 100, 112.5]

// Aggregation with grouping
SalesByProduct = group(Products, Products.name) {
  totalRevenue = sum(Products.price * Products.quantity),
  averagePrice = mean(Products.price)
}
```

### The Benefits of No Loops

By eliminating traditional control structures, we force users to think in terms of:

- **Data transformations** rather than step-by-step procedures
- **Mathematical relationships** rather than algorithms
- **Declarative intent** rather than imperative implementation

This makes the language more accessible to non-programmers while still being powerful enough for complex data analysis. Users focus on what they want to compute rather than how to compute it.

## 1. Grammar Design: Making It Feel Natural

The first challenge was designing a grammar that felt natural for data analysis. We wanted users to write expressions like:

```js
Revenue = Price * Quantity;
Profit = Revenue - Costs;
ProfitMargin = Profit / Revenue;
```

But we also needed to support more complex operations:

```js
TotalSales = sum(Sales over Region)
TopProducts = sort(Products by Revenue, desc)
```

We used [Nearley](https://nearley.js.org/) for our parser, which gave us the flexibility to build a robust grammar that could handle both simple and complex expressions.

```js
expression -> addExp
addExp -> mulExp ("+" | "-") mulExp
mulExp -> powExp ("*" | "/") powExp
powExp -> primary "^" primary
primary -> number | identifier | "(" expression ")"
```

The key insight was that our grammar needed to be extensible. As we added new features (like function calls, table operations, and data filtering), we could easily extend the grammar without breaking existing code.

## 2. Type System: Catching Errors Early

One of the biggest advantages of our approach over traditional spreadsheets is static type checking. We built a type inference system that can catch errors before any computation happens.

```js
// This would be a type error in our system
Revenue = Price * Quantity; // OK: number * number = number
Invalid = "Hello" * 5; // Error: can't multiply string by number
```

Our type system supports:

- **Basic Types**: numbers, strings, booleans, dates
- **Collection Types**: arrays, tables, ranges
- **Function Types**: with parameter and return type inference
- **Union Types**: handling multiple possible data types

The type checker runs during parsing, so users get immediate feedback about potential errors.

## 3. Dependency Tracking: The Heart of Reactivity

The magic happens in our dependency tracking system. When a user writes an expression, we automatically build a dependency graph that tracks which values depend on which other values.

```typescript
class DependencyTracker {
  trackDependencies(expression: AST.Expression): Set<string> {
    const dependencies = new Set<string>();

    // Walk the AST and extract all variable references
    this.visit(expression, (node) => {
      if (node.type === "identifier") {
        dependencies.add(node.name);
      }
    });

    return dependencies;
  }
}
```

This creates a directed acyclic graph (DAG) of dependencies. When a value changes, we can efficiently determine which other values need to be recomputed.

## 4. Incremental Computation: Only Recompute What Changed

The key to performance is incremental computation. Instead of recalculating everything when a value changes, we only recompute the expressions that actually depend on the changed value.

```typescript
class ComputationEngine {
  async computeIncrementally(changes: Change[]): Promise<Result[]> {
    // 1. Identify affected expressions
    const affected = this.findAffectedExpressions(changes);

    // 2. Invalidate cached results
    this.invalidateCache(affected);

    // 3. Recompute in dependency order
    const sorted = this.topologicalSort(affected);
    const results = [];

    for (const expr of sorted) {
      const result = await this.compute(expr);
      this.cache.set(expr.id, result);
      results.push(result);
    }

    return results;
  }
}
```

We use several optimization strategies:

- **Caching**: Store intermediate results to avoid recomputation
- **Batching**: Group multiple changes together for efficiency
- **Lazy Evaluation**: Only compute when results are actually needed
- **Parallel Processing**: Compute independent expressions simultaneously

## 5. Real-Time Updates: Keeping the UI Responsive

The user experience depends on real-time updates. When a user changes a value, they expect to see the results immediately. We built an event-driven system that propagates changes through the dependency graph.

```typescript
class ReactiveSystem {
  private changeSubject = new Subject<Change>();
  private pendingChanges = new Map<string, any>();

  constructor() {
    this.changeSubject
      .pipe(
        // Collect all changes over the debounce window
        bufferTime(100), // Collect changes for 100ms
        filter((changes) => changes.length > 0), // Only emit if we have changes
        map((changes) => this.mergeChanges(changes)), // Merge multiple changes to same expression
        switchMap((mergedChanges) => this.computeIncrementally(mergedChanges))
      )
      .subscribe((results) => {
        this.updateUI(results);
      });
  }

  onValueChange(expressionId: string, newValue: any) {
    // Store the latest value for this expression
    this.pendingChanges.set(expressionId, newValue);
    this.changeSubject.next({ expressionId, newValue });
  }

  private mergeChanges(changes: Change[]): Change[] {
    // Group changes by expressionId and keep only the latest value for each
    const merged = new Map<string, any>();

    for (const change of changes) {
      merged.set(change.expressionId, change.newValue);
    }

    // Convert back to array format
    return Array.from(merged.entries()).map(([expressionId, newValue]) => ({
      expressionId,
      newValue,
    }));
  }
}
```

The key insight here is using `bufferTime(100)` instead of `debounceTime(100)`. This collects all changes that occur within the 100ms window, rather than just waiting for a pause. This ensures we don't lose any changes while still maintaining performance by batching them together.

## 6. Error Handling: Graceful Degradation

One of the challenges with reactive systems is error handling. If one expression fails, we don't want it to break the entire computation. We built a robust error handling system that:

- **Isolates Failures**: Errors in one expression don't affect others
- **Provides Context**: Rich error messages with line numbers and suggestions
- **Recovers Gracefully**: Continue computation despite some errors
- **Shows Progress**: Indicate which expressions are being computed

```typescript
class ErrorBoundary {
  handleError(expression: AST.Expression, error: Error): ErrorResult {
    return {
      type: "error",
      message: error.message,
      location: expression.location,
      suggestions: this.generateSuggestions(error, expression),
    };
  }
}
```

## 7. Performance Optimization: Scaling to Large Datasets

As users build more complex models, performance becomes critical. We implemented several optimization strategies:

### Memory Management

```typescript
class CacheManager {
  private cache = new Map<string, CachedResult>();
  private accessCount = new Map<string, number>();

  get(key: string): CachedResult | undefined {
    const result = this.cache.get(key);
    if (result) {
      this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
    }
    return result;
  }

  evictLRU(): void {
    // Remove least recently used cached results
    const entries = Array.from(this.accessCount.entries());
    entries.sort((a, b) => a[1] - b[1]);

    for (let i = 0; i < entries.length / 2; i++) {
      const [key] = entries[i];
      this.cache.delete(key);
      this.accessCount.delete(key);
    }
  }
}
```

### Parallel Computation

For independent expressions, we can compute them in parallel using Web Workers:

```typescript
class ParallelComputer {
  async computeParallel(expressions: AST.Expression[]): Promise<Result[]> {
    const independent = this.findIndependentExpressions(expressions);
    const promises = independent.map((expr) => this.computeInWorker(expr));
    return Promise.all(promises);
  }
}
```

## 8. Integration with the Editor: Seamless User Experience

The language doesn't exist in isolation—it's integrated with a rich text editor that provides:

- **Real-time Syntax Highlighting**: Show errors and types as the user types
- **Autocomplete**: Suggest valid expressions and functions
- **Live Preview**: Show computation results immediately
- **Error Indicators**: Highlight problematic expressions
- **Debugging Tools**: Inspect intermediate values and types

## Lessons Learned

### What Worked Well

1. **Parser Combinators**: Made our grammar extensible and maintainable
2. **Type Inference**: Caught many errors early in development
3. **Incremental Computation**: Maintained performance with large datasets
4. **Reactive Architecture**: Provided excellent user experience
5. **Auto-Mapping**: Made the language feel natural for data analysis
6. **No Loops**: Forced users to think declaratively

### What Was Challenging

1. **Circular Dependencies**: Required careful detection and user guidance
2. **Performance Optimization**: Needed multiple strategies working together
3. **Error Handling**: Complex to provide helpful error messages
4. **Type System**: Balancing expressiveness with safety
5. **Auto-Mapping Performance**: Optimizing element-wise operations on large arrays

### What We'd Do Differently

1. **Earlier Performance Testing**: Should have tested with large datasets from the start
2. **Better Error Messages**: Could have invested more in error reporting
3. **More Documentation**: Language features needed better user documentation
4. **Testing Strategy**: Should have had more property-based tests

## The Result

Our reactive declarative language powered Decipad's computation engine. Users could build complex data models with hundreds of interdependent expressions and still get real-time updates. The language felt natural to use while being powerful enough for serious data analysis.

The key insight is that you don't have to choose between ease of use and performance. With careful architecture and the right abstractions, you can build a system that's both intuitive and scalable.

The auto-mapping feature, combined with the absence of loops, creates a language that feels more like mathematical notation than traditional programming. This aligns perfectly with our goal of making data analysis feel natural and intuitive.

## Conclusion

Building a reactive declarative language is a complex undertaking, but the payoff is enormous. Users can focus on what they want to compute rather than how to compute it efficiently. The result is a more productive and enjoyable experience for data analysis.

The techniques we developed—incremental computation, dependency tracking, reactive updates, and auto-mapping—are applicable to many other domains where you need to build responsive, data-driven applications.

By eliminating traditional control structures and embracing auto-mapping, we created a language that feels more like mathematical notation than programming. This makes it accessible to non-programmers while still being powerful enough for complex data analysis.

---

_If you're interested in building similar systems, I'd love to hear about your experiences. You can find me on [Twitter](https://twitter.com/pgte) or check out my other posts on [metaduck.com](https://metaduck.com)._
