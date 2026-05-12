---
title: "VELOX v1 Language Spec"
description: "A concrete v1 specification for VELOX covering syntax, grammar shape, file layout, and the C++ execution engine boundary."
displayed_sidebar: veloxSidebar
keywords:
  - VELOX v1
  - VELOX language spec
  - compiler project
  - LLVM IR
  - execution engine
  - C++ runtime
  - compute language
---

# VELOX v1 Language Spec

VELOX v1 is a small compute-oriented DSL for compiler work.
It is designed to lower cleanly into LLVM IR and to run through a C++ execution engine.

Keep VELOX small, compiler-oriented, LLVM-friendly, and educational.
Do NOT turn it into a general-purpose language.

## Purpose

VELOX v1 is for:

* compute kernels
* compiler frontend construction
* LLVM IR lowering
* optimization experiments
* execution-engine integration

## Non-Goals

VELOX v1 is not intended to compete with:

* C++
* Rust
* Python

It is also not intended to become:

* a scripting language
* an object-oriented language
* a systems programming language with a full standard library
* a runtime-heavy platform

## Core Model

The main unit of code is `pulse`.

A `pulse` is a function-like compute block that the compiler parses, lowers, and executes through the runtime.

Example:

```c
pulse sum(i32 n) -> i32 {
  let total = 0;
  for i in 0..n {
    total = total + i;
  }
  return total;
}
```

## Type System

VELOX v1 has a small type system.

Supported primitive types:

* `i32`
* `bool`

`i32` is the arithmetic type used by VELOX kernels.
`bool` is used for comparison results and loop predicates.

No implicit casts exist between `i32` and `bool`.
There is no implicit conversion between numeric and boolean expressions.
Pulse parameters are explicitly typed, and the frontend should not infer them.
Pulse return types are also explicit and mandatory in v1.
The frontend should not infer the return type.
Local variables may use type inference in v1 when the initializer makes the type unambiguous.
For function signatures, inference stays forbidden.
Integer literals infer to `i32`.
Boolean literals infer to `bool`.
Integer overflow in v1 wraps using two's-complement `i32` arithmetic.

## Syntax

VELOX v1 uses a lightweight C-like syntax.

## Lexical Rules

* Keywords are reserved: `pulse`, `let`, `return`, `if`, `else`, `for`, `in`, `i32`, `bool`, `true`, `false`, `@entry`
* Identifiers match `[A-Za-z_][A-Za-z0-9_]*`
* Identifiers may start with `_`, so `_total` is valid
* A keyword cannot be used as an identifier
* Whitespace separates tokens and is otherwise ignored
* Line comments begin with `//` and run to the end of the line

Lightweight EBNF:

```ebnf
program     = pulse_def { pulse_def } ;
pulse_def   = [ "@entry" ] "pulse" ident "(" [ param_list ] ")" "->" type block ;
param_list  = param { "," param } ;
param       = type ident ;
type        = "i32" | "bool" ;
block       = "{" { stmt } "}" ;
stmt        = let_stmt | assign_stmt | if_stmt | for_stmt | return_stmt ;
let_stmt    = "let" ident "=" expr ";" ;
assign_stmt = ident "=" expr ";" ;
if_stmt     = "if" expr block [ "else" block ] ;
for_stmt    = "for" ident "in" range block ;
return_stmt = "return" expr ";" ;
range       = expr ".." expr [ ".." step_expr ] ;
step_expr   = expr ;
expr        = logic_and ;
logic_and   = unary { "&&" unary } ;
unary       = { "!" } comparison ;
comparison  = additive [ comp_op additive ] ;
comp_op     = "==" | "!=" | "<" | "<=" | ">" | ">=" ;
additive    = term { ("+" | "-") term } ;
term        = factor { ("*" | "/") factor } ;
factor      = ident | number | bool_literal | call | "(" expr ")" | "-" factor ;
number      = digit { digit } ;
digit       = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" ;
bool_literal = "true" | "false" ;
call        = ident "(" [ arg_list ] ")" ;
arg_list    = expr { "," expr } ;
```

This is intentionally small.
The exact parser can evolve, but the core structure should stay close to this shape.
Typed parameters remove ambiguity from semantic analysis and make function signatures straightforward to lower into LLVM IR.
Multiple `!` operators are allowed and apply from right to left.
See the Entry Model section for `@entry` behavior.
The third range term is the step expression, so `0..n..2` parses as lower bound `0`, upper bound `n`, and step `2`.
The step expression must still be a positive compile-time constant.
`program` requires at least one `pulse_def`, so empty files are invalid.

## Scope

Variables declared with `let` are scoped to the innermost enclosing block `{ ... }`.
A variable name may not be redeclared in the same scope.

## Boolean Expressions

VELOX v1 supports comparison expressions and a minimal boolean layer.

Supported boolean operators:

* `&&`
* `!`

Not part of v1:

* `||`

Conditions in `if` statements and loop-related predicates must type-check to `bool`.
The `&&` operator short-circuits: the right operand is evaluated only if the left operand evaluates to `true`.
This keeps the boolean model small while still being usable for control flow.
The frontend should keep boolean lowering simple and preserve the explicit control flow structure for LLVM.
The EBNF grammar does not include `||`; it is not part of VELOX v1.

## Constants

VELOX v1 uses a simple integer constant model.

* integer literals are signed decimal `i32` values
* a leading `-` is unary negation, not part of the literal token
* leading zeros are allowed in v1
* literals outside the `i32` range should be rejected by the frontend
* boolean constants are `true` and `false`
* there are no implicit conversions between numeric and boolean literals

Arithmetic on `i32` values uses two's-complement wraparound semantics in v1.
Overflow is defined, not undefined, for the v1 spec.
Division by zero is a runtime trap in the C++ execution engine.

## Loop Semantics

VELOX v1 uses a range-style `for` loop.

Semantics:

* the lower bound is inclusive
* the upper bound is exclusive
* the default step is `+1`
* an explicit step may be provided as the third range term
* the step expression must be a positive compile-time constant in v1
* runtime-variable steps are not supported
* descending ranges are not part of v1
* the compiler should reject statically known descending ranges
* `0..n` means `0, 1, 2, ... n-1`

Example:

```c
for i in 0..n {
  total = total + i;
}
```

## Runtime Boundary

The following are intentionally implementation-defined in v1 and may evolve during implementation:

* runtime ABI
* memory ownership
* JIT integration
* backend dispatch

VELOX v1 intentionally excludes explicit memory management and advanced runtime features.

The C++ execution engine owns host-side concerns such as:

* program launch
* runtime setup
* backend selection
* logging
* profiling
* error handling

## Undefined Behavior

VELOX v1 does not fully specify undefined behavior.

Areas that may remain implementation-defined during early implementation include:

* invalid loop ranges
* use of unsupported syntax
* unreachable states introduced by lowering

When possible, the frontend should diagnose these cases early.
If a case cannot be diagnosed statically, the C++ runtime should raise a trap.

## Mutable Locals and SSA

VELOX source allows mutable locals through assignment.

That means a variable can be introduced with `let` and updated later in the same scope.

Example:

```c
pulse accumulate(i32 n) -> i32 {
  let total = 0;
  for i in 0..n {
    total = total + i;
  }
  return total;
}
```

The source language can stay mutable while the LLVM IR stays in SSA form.
The frontend should lower assignments into SSA-friendly code generation, using standard compiler techniques such as load/store placement and phi nodes where needed.

Accumulator pattern:

```llvm
define i32 @accumulate(i32 %n) {
entry:
  br label %loop

loop:
  %i = phi i32 [ 0, %entry ], [ %i.next, %loop ]
  %total = phi i32 [ 0, %entry ], [ %total.next, %loop ]
  %total.next = add i32 %total, %i
  %i.next = add i32 %i, 1
  %done = icmp slt i32 %i.next, %n
  br i1 %done, label %loop, label %exit

exit:
  ret i32 %total.next
}
```

## Lowering Sketch

The lowering contract should stay small and visible.

Example source:

```c
pulse add(i32 a, i32 b) -> i32 {
  return a + b;
}
```

Sketch of the LLVM IR shape:

```llvm
define i32 @add(i32 %a, i32 %b) {
entry:
  %sum = add i32 %a, %b
  ret i32 %sum
}
```

This is schematic, but it shows the intended direction of lowering.

## Call Semantics

Calls are allowed between pulses.

Basic rules:

* arguments are passed by value
* arity must match the declared parameter list
* argument types must match the parameter types
* overloading is not part of v1
* a pulse may call only pulses that appear textually earlier in the file
* mutual recursion and self recursion are not part of v1

This keeps resolution simple and avoids the need for forward declarations in v1.

## Entry Model

The entry pulse is explicit and minimal in v1.

Rules:

* a pulse may be prefixed with `@entry`
* if no pulse is marked, the first pulse in the file is the entry point
* at most one `@entry` marker may appear in a file
* the entry marker does not change call resolution

## Empty Programs

An empty VELOX file is invalid in v1.
The compiler should report a missing `pulse` definition.

## Diagnostics

VELOX diagnostics should be clear, local, and source-aware.

Preferred behavior:

* report the source location
* explain what went wrong in one short sentence
* avoid noisy recovery logic in v1
* keep type and syntax errors easy to understand
The exact span format, error codes, and recovery policy are implementation-defined in v1 and should stay minimal.

Non-normative example:

```text
file.vx:3:5: error: unknown identifier 'total'
```

Examples of errors the frontend should reject:

* unknown identifiers
* malformed `for` ranges
* mismatched braces or parentheses
* invalid assignments
* type mismatches
* unsupported syntax

## Compiler Pipeline

The v1 pipeline is:

1. Read VELOX source.
2. Lex the source into tokens.
3. Parse tokens into an AST.
4. Run semantic checks.
5. Lower the AST into LLVM IR.
6. Hand execution to the C++ runtime or backend.
7. Run or dispatch the compiled result.

## Roadmap

VELOX v1 does not define these yet, but they are reasonable future directions:

* arrays and buffers
* vector types
* parallel constructs
* GPU-oriented execution
* richer optimization-oriented runtime support

These are future additions, not part of v1.

## Success Criteria

VELOX v1 is successful if you can:

* write a small VELOX program
* parse it without ambiguity
* build an AST
* lower it into LLVM IR
* execute it through the C++ engine
* inspect optimization effects

## Next Step

Use the project pages in this order:

1. [VELOX Project Home](./index)
1. [Creating Your First LLVM-Based Compiler](./creating-your-first-llvm-based-compiler)
1. This v1 spec as the implementation contract
