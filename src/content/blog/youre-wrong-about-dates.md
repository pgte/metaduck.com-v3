---
title: "You’re Wrong About Dates — And Your Code is Lying to You"
description: "Why your mental model of dates is broken, how programming languages gaslight us about time, and how Decipad’s interval-based approach fixes it."
date: 2025-08-08
author: "Pedro Teixeira"
tags: [
    dates,
    time
    programming
    intervals
    decipad,
  ]
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

We’ve been forced into fake precision that doesn’t match reality. And it’s not harmless — it leads to broken logic, messy hacks, and subtle bugs that only show up in production.

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

This isn’t just “nicer syntax” — it’s a fundamental shift in how your software _thinks_.

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

This is insanely useful:

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
We fixed it. And if that feels unsettling… maybe it’s time your code grew up.

Full details (and way more examples):
👉 [Time as Intervals – Decipad’s Rethink of Dates](https://metaduck.com/time-as-intervals/)
