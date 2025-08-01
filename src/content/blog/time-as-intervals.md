---
title: "Time as Intervals: How Decipad's Date System Mimics Human Thinking"
description: "Discover how Decipad's date system models time as intervals with built-in granularity, enabling intuitive operations like 'contains' and natural date arithmetic that matches human reasoning."
author: "Pedro Teixeira"
date: 2025-08-03
tags:
  [
    "dates",
    "intervals",
    "granularity",
    "type system",
    "programming languages",
    "human-centered design",
    "data modeling",
    "Decipad",
  ]
image: "/images/blog/astronaut-plays-with-time.jpg"
---

![Astronaut plays with time](/images/blog/astronaut-plays-with-time.jpg)

One of my favorite features in Decipad is our date system. It's not just another date implementation - it's a fundamental rethinking of how we represent time in programming languages. We've designed it to work the way humans actually think about time: as intervals, not as precise moments.

## The Problem with Traditional Date Systems

Most programming languages treat dates as precise moments in time - a specific instant on the timeline. But that's not how humans naturally think about dates. When you say "2023", you're not thinking about January 1st at 00:00:00.000 UTC. You're thinking about the entire year of 2023 - a span of time that includes all 365 (or 366) days.

Similarly, when you say "March 2024", you're not referring to a specific moment. You're talking about the entire month - all 31 days from March 1st to March 31st. Even "March 15th, 2024" represents the entire day, not a specific second.

Traditional date systems force us to make arbitrary decisions about precision. Should "2023" be represented as January 1st at midnight? What timezone? What about "March" - should that be March 1st at 00:00:00? These decisions don't reflect how we actually use dates in real-world scenarios.

## Enter Granularity: Time as Intervals

In Decipad, we solve this by introducing the concept of **granularity**. Every date has a granularity that defines what kind of time interval it represents:

- **Year**: `date(2023)` represents the entire year 2023
- **Month**: `date(2023-03)` represents the entire month of March 2023
- **Day**: `date(2023-03-15)` represents the entire day of March 15th, 2023
- **Hour**: `date(2023-03-15 14)` represents the hour from 14:00 to 14:59
- **Minute**: `date(2023-03-15 14:30)` represents the minute from 14:30:00 to 14:30:59
- **Second**: `date(2023-03-15 14:30:45)` represents the second from 14:30:45.000 to 14:30:45.999

This granularity is baked into the type system. When you create a date, Decipad automatically infers the appropriate granularity based on the format you provide:

```js
Year = date(2023)           // granularity: year
Month = date(2023-03)       // granularity: month
Day = date(2023-03-15)      // granularity: day
Time = date(2023-03-15 14:30) // granularity: minute
```

## The Magic of Contains

This interval-based approach enables one of my favorite features: the `contains` operator. You can ask whether one time interval contains another, which is incredibly intuitive:

```js
Year = date(2023)
Month = date(2023-03)
Day = date(2023-03-15)
Minute = date(2023-03-15 14:30)

Year contains Month    // true - 2023 contains March 2023
Month contains Day     // true - March 2023 contains March 15th
Day contains Minute    // true - March 15th contains 14:30
Minute contains Day    // false - a minute doesn't contain a day
```

This is exactly how humans think about time! When you say "I'll finish this project in March", you're not committing to a specific day or time - you're saying it will happen somewhere within that month-long interval.

## Date Arithmetic That Makes Sense

The granularity system also makes date arithmetic much more intuitive. When you add or subtract time intervals, the result maintains the appropriate granularity:

```js
Start = date(2021-01-01)  // granularity: day
End = Start + 1 year + 6 months + 5 days
// Result: 2022-07-06 (granularity: day)

Year2020 = date(2020)     // granularity: year
Year2023 = date(2023)     // granularity: year
Difference = Year2023 - Year2020
// Result: 3 years (not 3.0 years - it's a whole number of years)
```

Notice how the arithmetic respects the granularity. When you subtract two years, you get a whole number of years, not a fractional result. This matches human intuition - we don't think in terms of "3.0 years" when talking about the difference between 2020 and 2023.

## Time Intervals: The Other Half of the Story

Complementing our date system, we also have **time intervals** - durations that represent spans of time. These are what you get when you subtract two dates:

```js
Start = date(2020-02-23)
End = date(2020-01-12)
Duration = End - Start
// Result: 42 days

// You can convert time intervals to different units
Duration as hours
// Result: 1008 hours

Duration as minutes
// Result: 60480 minutes
```

Time intervals are first-class citizens in Decipad. They have their own type system and can be converted between different units just like any other quantity. This makes it easy to work with durations in whatever unit makes sense for your use case.

## Real-World Examples

Let me show you some practical examples of how this system works in practice:

### Financial Planning

```js
// Quarterly planning
Q1 = date(2024-01)  // January 2024
Q2 = date(2024-04)  // April 2024
Q3 = date(2024-07)  // July 2024
Q4 = date(2024-10)  // October 2024

// Calculate the duration of each quarter
QuarterDuration = Q2 - Q1  // 3 months

// Check if a specific date falls within a quarter
Q1 contains date(2024-02-15)  // true
Q1 contains date(2024-04-01)  // false
```

### Project Management

```js
ProjectStart = date(2024 - 01 - 15);
ProjectEnd = date(2024 - 06 - 30);
ProjectDuration = ProjectEnd - ProjectStart; // 167 days

// Check if today is within the project timeline
Today = date(2024 - 03 - 20);
ProjectStart <= Today <= ProjectEnd; // true

// Calculate remaining time
RemainingDays = ProjectEnd - Today; // 102 days
```

### Data Analysis

```js
// Monthly sales data
SalesData = {
  Month = [date(2024-01), date(2024-02), date(2024-03)],
  Revenue = [100000, 120000, 110000]
}

// Calculate month-over-month growth
Growth = (SalesData.Revenue[1] - SalesData.Revenue[0]) / SalesData.Revenue[0]
// Result: 20% growth from January to February

// Find the month with highest revenue
MaxRevenue = max(SalesData.Revenue)  // 120000
MaxMonth = SalesData.Month[1]        // February 2024
```

## The Technical Implementation

Under the hood, our date system is built on several key abstractions:

### Granularity Types

We define granularity as a union type that captures all possible time intervals:

```typescript
export type DateGranularity =
  | "millisecond"
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "month"
  | "year";
```

### Date Parsing with Granularity Inference

Our date parser automatically infers the appropriate granularity based on the input format:

```typescript
it.each([
  ["2020", { kind: "date", date: "year" }, "2020-01-01T00:00Z"],
  ["2020-10", { kind: "date", date: "month" }, "2020-10-01T00:00Z"],
  ["2020-10-13", { kind: "date", date: "day" }, "2020-10-13T00:00Z"],
  ["2020-10-13 10:30", { kind: "date", date: "minute" }, "2020-10-13T10:30Z"],
])("%s is a good %s", (format, type, result) => {
  const d = parseDate(format, type.date as DateGranularity);
  expect(d).toBeDefined();
  expect(d?.date).toEqual(BigInt(new Date(result).getTime()));
});
```

### Arithmetic Operations

Date arithmetic respects granularity throughout the computation:

```typescript
// When subtracting dates, we maintain the granularity of the result
expect(await runCode(`date(2020) - date(2010)`)).toMatchObject({
  type: {
    type: "number",
    unit: U("year", { known: true }),
  },
  value: N(10),
});

// Adding time quantities to dates preserves the date's granularity
expect(await runCode(`1 year + date(2020)`)).toMatchObject({
  type: {
    date: "year",
  },
  value: 1609459200000n,
});
```

### The Contains Operator

The contains operator is implemented by checking if one interval completely encompasses another:

```typescript
// A higher granularity (larger interval) can contain a lower granularity (smaller interval)
Day = date(2022-06-30)
Minute = date(2022-06-30 11:59)

Day contains Minute  // true - the day contains that specific minute
```

## Why This Matters

This approach to dates solves several fundamental problems:

### 1. Intuitive Semantics

The system behaves exactly as humans expect. When you say "March 2024", you mean the entire month, not a specific moment. Our system reflects this natural thinking.

### 2. Type Safety

The granularity is part of the type system, which means the compiler can catch errors like trying to add a year to a minute-level date when that doesn't make sense.

### 3. Flexible Arithmetic

Date arithmetic works naturally with different granularities. You can add months to years, days to months, etc., and the system handles the conversions appropriately.

### 4. Efficient Storage

Since dates represent intervals rather than precise moments, we can store them more efficiently. A year-level date doesn't need to store timezone information or precise time components.

## Looking Forward

This date system is just one example of how we're rethinking fundamental programming concepts in Decipad. By aligning our abstractions with how humans naturally think about problems, we can create systems that are both more powerful and more intuitive.

The granularity concept could extend to other domains as well. We could imagine similar interval-based systems for:

- **Geographic regions**: Countries containing states containing cities
- **Organizational hierarchies**: Companies containing departments containing teams
- **Data structures**: Tables containing columns containing cells

The key insight is that humans think in terms of containment and hierarchy, not just precise equality. By building systems that reflect this natural thinking, we can create tools that feel more natural and intuitive to use.

In the end, this is what makes Decipad special - we're not just building another programming language or spreadsheet tool. We're building a system that thinks the way humans do, starting with something as fundamental as how we represent time.

---

_Pedro Teixeira is the CTO of Decipad, where he leads the technical vision for making data analysis accessible to everyone. When he's not designing intuitive date systems, you can find him exploring the intersection of programming languages and human cognition._
