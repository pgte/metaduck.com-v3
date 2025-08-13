---
title: "You’re Wrong About Date-Times — And Your Code is Lying to You"
description: "Why your mental model of dates is broken, how programming languages gaslight us about time, and how Decipad’s interval-based approach fixes it."
date: 2025-08-08
author: "Pedro Teixeira"
tags: ["dates", "time", "programming", "intervals"]
image: "/images/blog/astronaut-and-time.jpg"
---

![](/images/blog/astronaut-and-time.jpg)

Every date library you’ve ever used is lying to you.

They all pretend that a date is a **precise moment** — a frozen point on a timeline.

- `2023`? Must mean January 1st at 00:00:00.000 UTC.
- `March 2024`? Clearly March 1st, 00:00 UTC.
- `March 15th, 2024`? Sure, March 15th at the stroke of midnight.

But that’s not how humans think.
When you say _“2023”_, you mean the whole year. _“March 2024”_? The entire month. Even _“March 15th”_ means the full day, not some arbitrary nanosecond.

We've been forced into fake precision that doesn't match reality. And it's not harmless — it leads to broken logic, messy hacks, and subtle bugs that only show up in production.

> **Note:** This article focuses on the fundamental concept of treating dates as intervals rather than precise moments. We're intentionally not diving into timezone complexity here — that's a separate (and equally important) conversation. Our goal is to show you how a more human-like abstraction of time can simplify your code and make date logic more intuitive.

> **Another Note:** While some libraries do offer interval-based date formatting (like "March 2024" or "Q2 2024"), these are typically just display conveniences rather than fundamental abstractions. Mostly, the dates still resolve to precise moments under the hood, and you can't do meaningful interval math with them. What we're showing here is treating intervals as first-class values in your data model and logic.

---

## The Rebellion: Time as Intervals

In **Decipad**, a date isn’t a pinpoint — it’s an _interval_ with a built-in **granularity**.

- `date(2023)` = January 1st to December 31st.
- `date(2023-03)` = March 1st to March 31st.
- `date(2023-03-15)` = midnight to 23:59:59 that day.

Your code instantly understands that a **year contains a month**, a **month contains a day**, and an **hour contains 60 minutes**.

```js
Year = date(2023)
Month = date(2023-03)
Day = date(2023-03-15)

Year contains Month   // true
Month contains Day    // true
Day contains Month    // false
```

This isn’t just “nicer syntax” — it’s a different way to abstract time.

---

## The Other Half: Time Intervals

If dates are intervals, then the difference between two dates is also an interval.
We treat that as a **first-class value** too.

```js
Start = date(2020-02-23)
End = date(2020-04-05)

Duration = End - Start  // 42 days
Duration as hours       // 1008 hours
Duration as minutes     // 60,480 minutes
```

This is super useful:

- **Project management**: `ProjectEnd - Today` gives you _remaining days_, instantly.
- **Finance**: `Q2 - Q1` returns _3 months_ without you hardcoding days-per-month.
- **Events**: A week-long conference? That’s literally a `7 days` object — not a magic number in milliseconds.

---

## Why This Changes Everything

Once you start thinking about **time as nested intervals**, so many things become intuitive:

- No more picking random timestamps for “March 2024.”
- Date math that returns human-friendly units instead of weird floats.
- Containment checks that match real-world logic (“does this quarter include Feb 15th?”).
- Duration objects that are as natural to work with as integers.

The old way is a leaky abstraction. The new way just matches how your brain already works.

---

## Example: Brutally Simple Project Tracking

```js
Kickoff = date(2024 - 09 - 01);
Deadline = date(2024 - 12 - 15);
Today = date(2024 - 10 - 20);

Kickoff <= Today <= Deadline; // true
Deadline - Today; // 56 days left
```

No conversions. No timezone headaches. No milliseconds. Just _time the way you talk about it_.

---

The truth: your current date system isn’t just awkward — it’s wrong.

# Old Way vs. Interval Way

| **Scenario**                           | **Old Way (Moment-Obsessed)**                                                             | **Interval Way (Granularity-Aware)**                              |
| -------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Represent “2023”**                   | `new Date('2023-01-01T00:00:00.000Z')` — silently assumes January 1st at midnight in UTC. | `date(2023)` — represents **entire year** Jan 1 to Dec 31.        |
| **Represent “March 2024”**             | `new Date('2024-03-01T00:00:00.000Z')` — arbitrary starting moment, loses context.        | `date(2024-03)` — represents **whole month** March 1 to March 31. |
| **Check if March contains March 15th** | Manually compare timestamps: `start <= date && date <= end`.                              | `date(2024-03) contains date(2024-03-15)` → `true`.               |
| **Project days remaining**             | `(deadline.getTime() - today.getTime()) / (1000*60*60*24)` — pray no DST jumps ruin it.   | `date(2024-12-15) - date(2024-10-20)` → `56 days`.                |
| **Quarter length**                     | Write custom month math or hardcode “3 months” — break in leap years.                     | `date(2024Q2) - date(2024Q1)` → `3 months`.                       |
| **Subtract years**                     | `new Date('2023-01-01') - new Date('2020-01-01')` → milliseconds you then divide.         | `date(2023) - date(2020)` → `3 years`.                            |
| **Store “day-level” data**             | Store full timestamp but ignore time part — waste space and invite bugs.                  | Store only what’s needed: `granularity: day`.                     |
| **Human meaning**                      | Needs docs to explain what’s implied.                                                     | Is exactly what it says on the tin.                               |

---

**Key point:** The “Old Way” treats _everything_ like an instant and forces you to fake the rest. The “Interval Way” makes human meaning part of the type system.

Full details (and way more examples):
👉 [Time as Intervals – Decipad's Rethink of Dates](https://metaduck.com/time-as-intervals/)

---

## Libraries That Get It (Partly)

While the concept isn't widespread, several libraries across different languages have started implementing interval-based approaches:

**PHP:**

- **Carbon** - Has `CarbonPeriod` for date ranges and `CarbonInterval` for durations
- **Chronos** - Offers `ChronosDate` with granularity-aware operations

**Kotlin:**

- **kotlinx-datetime** - Provides `DatePeriod` and `DateTimePeriod` for intervals
- **ThreeTenABP** - Java's time library port with `Period` and `Duration`

**Java:**

- **Java Time API** - Built-in `Period` and `Duration` classes (though still moment-focused)
- **Joda-Time** - `Period` and `Interval` classes for time spans

**Python:**

- **pendulum** - `Period` class for date ranges
- **python-dateutil** - `relativedelta` for human-friendly time arithmetic

**JavaScript/TypeScript:**

- **date-fns** - `eachDayOfInterval`, `eachMonthOfInterval` functions
- **Luxon** - `Interval` class for date ranges

**Ruby:**

- **ActiveSupport** - `Date.current.beginning_of_month..Date.current.end_of_month`
- **dry-types** - `Types::Date` with granularity options

Most of these still treat intervals as secondary to moments, but they're moving in the right direction. The key insight is that intervals should be the primary abstraction, not an afterthought.
