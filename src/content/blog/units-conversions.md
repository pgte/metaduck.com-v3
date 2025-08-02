---
title: "Unit Conversions in Decipad: A Deep Dive into the Language's Dimensional Analysis System"
description: "A comprehensive exploration of Decipad's unit conversion system, detailing how the language integrates dimensional analysis, enforces unit correctness at compile time, and enables precise, error-resistant calculations for scientific, engineering, and financial applications."
author: "Pedro Teixeira"
date: 2025-08-05
tags:
  [
    "Units",
    "Type System",
    "Dimensional Analysis",
    "Programming Languages",
    "Scientific Computing",
    "Engineering",
    "Financial Modeling",
    "Decipad",
    "Compile-Time Safety",
  ]
image: "/images/blog/astronaut-calculating.jpg"
---

![Astronaut calculating](/images/blog/astronaut-calculating.jpg)

One of the most powerful features of the Decipad language is its sophisticated unit conversion system. Unlike traditional programming languages that treat numbers as dimensionless quantities, Decipad embeds units directly into the type system, enabling automatic dimensional analysis and conversion. This design choice addresses a critical problem: the lack of explicit units is one of the most common sources of calculation errors in scientific, engineering, and financial applications.

Consider the infamous Mars Climate Orbiter failure, where a $125 million spacecraft was lost because one team used metric units (newtons) while another used imperial units (pound-force) for thrust calculations. Or the more recent case where a medical dosing error occurred because milliliters and cubic centimeters were treated as interchangeable without proper conversion. These are not isolated incidents—unit confusion is a pervasive issue that costs billions annually in errors, rework, and sometimes human lives.

Traditional programming languages exacerbate this problem by treating all numbers as dimensionless quantities. A variable might represent 5 meters, 5 dollars, or 5 apples, but the type system has no way to distinguish between them. This forces developers to rely on naming conventions, documentation, and manual verification—all of which are error-prone and don't scale.

Decipad's approach embeds units directly into the type system, making unit correctness a compile-time concern rather than a runtime risk. This design choice makes Decipad particularly well-suited for scientific calculations, financial modeling, and any domain where unit correctness is critical.

In this post, I'll explore how Decipad handles unit conversions, from simple scalar units to complex composed units, and how the language's arbitrary precision arithmetic ensures accuracy in these conversions.

## The Foundation: Units as First-Class Citizens

In Decipad, units are not just metadata—they're integral to the type system. Every number has an associated unit type that describes what physical quantity it represents. This is implemented through the `Unit` interface:

```typescript
interface Unit {
  unit: string; // The unit name (e.g., "meter", "dollar")
  exp: DeciNumberBase; // The exponent (e.g., 2 for square meters)
  multiplier: DeciNumberBase; // Conversion factor to base unit
  known: boolean; // Whether this is a known SI unit
  baseQuantity?: BaseQuantity; // The fundamental quantity type
}
```

Units can be simple or composed. Simple units represent a single measurement type, like `5 meters` or `$100`. Composed units combine multiple base units, such as `miles per hour` (distance/time) or `newtons per square meter` (force/area).

## Explicit Conversions: The `as` Directive

When you need to explicitly convert between units, Decipad provides the `as` directive. This is the most straightforward way to perform unit conversions:

```js
// Simple conversion
3 kilometers as miles

// Temperature conversion
25 celsius as fahrenheit

// Complex unit conversion
60 miles per hour as meters per second
```

The `as` directive works by:

1. Parsing the target unit expression
2. Checking if the conversion is possible (same base quantity)
3. Converting the value to the base unit, then to the target unit
4. Handling any precision issues that might arise

For example, when converting `3 kilometers as miles`, the system:

1. Recognizes that both units represent length
2. Converts 3 km to meters (base unit): 3000 meters
3. Converts 3000 meters to miles: approximately 1.864 miles

## Implicit Conversions: Automatic Dimensional Analysis

Where Decipad really shines is in its ability to perform implicit unit conversions during operations. When you perform calculations with different units, Decipad automatically converts them to compatible units before operating:

```js
// Automatic conversion during addition
5 meters + 3 feet
// Result: 5.914 meters (3 feet converted to meters)

// Automatic conversion during multiplication
2 hours * 60 miles per hour
// Result: 120 miles

// Complex operations with multiple units
(10 newtons * 5 meters) / 2 seconds
// Result: 25 watts (work/time = power)
```

This automatic conversion is handled by the `autoconvert` system, which:

1. Analyzes the units of all operands
2. Determines the most appropriate base unit for the operation
3. Converts all operands to that base unit
4. Performs the calculation
5. Converts the result back to a meaningful unit

## The Role of Rational Number Arithmetic

Unit conversions often involve rational numbers with exact decimal representations that can't be represented precisely in binary floating-point arithmetic. Decipad addresses this through its `DeciNumber` type, which provides exact arithmetic for rational numbers using fractions:

```typescript
interface DeciNumberBase {
  n: bigint; // Numerator
  d: bigint; // Denominator
  s: bigint; // Sign
  infinite: boolean;

  // Arithmetic operations that preserve precision
  add(n: DeciNumberBase): DeciNumberBase;
  mul(n: DeciNumberBase): DeciNumberBase;
  div(n: DeciNumberBase): DeciNumberBase;
  // ... other operations
}
```

This is crucial for unit conversions because many conversion factors are rational numbers that lose precision when converted to binary floating-point. For example, the conversion from miles to meters involves the factor 1609.344, which is exactly representable as a rational number but becomes 1609.3439999999999... in binary floating-point. With rational number arithmetic, Decipad can maintain exact precision throughout the conversion process.

The real power comes when performing multiple conversions back and forth. Consider this example:

```js
// This calculation maintains exact precision
1 mile as meters
// Result: 1609.344 meters (exact)

// Converting back maintains the original value exactly
1609.344 meters as miles
// Result: 1 mile (exact, not 0.9999999999999999...)

// Even complex chains of conversions maintain precision
(1 mile / 1 hour) as meters per second as miles per hour
// Result: 1 mile per hour (exact)
```

Without rational number arithmetic, each conversion would introduce small errors that compound over multiple operations, leading to significant precision loss in complex calculations.

## Handling Complex Units

Decipad excels at handling complex, composed units. When you have units like `miles per hour` or `newtons per square meter`, the system breaks them down into their constituent parts and applies the appropriate conversion factors:

```js
// Speed conversion
60 miles per hour as kilometers per hour
// Result: 96.5606 kilometers per hour

// Pressure conversion
1 atmosphere as pascals
// Result: 101325 pascals

// Energy conversion
1 calorie as joules
// Result: 4.1868 joules
```

The system uses a sophisticated unit combination algorithm that:

1. Expands complex units into their base unit components
2. Applies conversion factors to each component
3. Recombines the converted components into the target unit

## Known vs. Unknown Units

Decipad distinguishes between known units (those with defined conversion factors) and unknown units (user-defined units). Known units include all SI units, common imperial units, currencies, and many specialized units:

```js
// Known units - automatic conversion
5 meters as feet
// Result: 16.4042 feet

// Unknown units - treated as distinct
5 mugs as cups
// Error: Cannot convert between units
```

For unknown units, Decipad treats them as distinct types unless you explicitly define conversion relationships. This prevents accidental conversions between unrelated quantities.

## Temperature: A Special Case

Temperature units are particularly interesting because they don't follow the standard multiplicative conversion pattern. Converting between Celsius, Fahrenheit, and Kelvin involves both scaling and offset:

```js
// Temperature conversions
0 celsius as fahrenheit
// Result: 32 fahrenheit

100 celsius as kelvin
// Result: 373.15 kelvin
```

Decipad handles this through the `doesNotScaleOnConversion` flag, which indicates that a unit's conversion involves an additive offset rather than just a multiplicative factor.

## Error Handling and Precision

When conversions can't be performed exactly, Decipad provides several options:

1. **Tolerate imprecision**: For conversions that are inherently approximate (like month-to-day conversions)
2. **Throw errors**: For incompatible units
3. **Use arbitrary precision**: For conversions that can be exact but require high precision

```js
// Imprecise conversion (months to days)
1 month as days
// Result: ~30.44 days (with imprecision warning)

// Incompatible units
5 meters as dollars
// Error: Cannot convert between units
```

## Performance Considerations

The rational number arithmetic comes with a performance cost, but Decipad optimizes this through several strategies:

1. **Lazy conversion**: Units are only converted when necessary
2. **Caching**: Conversion factors are cached to avoid recalculation
3. **Simplification**: Complex units are simplified before conversion
4. **Early termination**: Incompatible units are detected early

## Real-World Applications

This unit system makes Decipad particularly powerful for:

**Scientific Computing**: Precise dimensional analysis without manual conversion
**Financial Modeling**: Currency conversions and rate calculations
**Engineering**: Complex unit combinations and conversions
**Data Analysis**: Automatic unit normalization across datasets

## Conclusion

Decipad's unit conversion system represents a significant advancement in programming language design for numerical computing. By making units first-class citizens in the type system and providing both explicit and implicit conversion capabilities, Decipad eliminates a major source of errors in scientific and financial calculations.

The combination of rational number arithmetic with sophisticated unit handling ensures that calculations remain accurate even when dealing with complex conversion factors. This is particularly important in domains where precision is critical, such as scientific research, engineering, and financial modeling.

As we continue to develop Decipad, we're exploring ways to extend this system further, including support for more complex unit relationships and enhanced error reporting for unit-related issues. One area of future exploration is currency conversion, though this comes with significant challenges - the time or rate of the conversion must be explicit, as exchange rates vary continuously and historical rates may be needed for accurate financial modeling.

The unit conversion system is just one example of how Decipad's design philosophy—making the language work the way humans think about problems—leads to more intuitive and error-resistant code. By embedding domain knowledge directly into the type system, we can catch errors at compile time that would otherwise manifest as runtime bugs or incorrect results.
