---
title: "How to Create an LLVM Pass as a Plugin"
sidebar_position: 2
description: "Learn how to write, register, build, and run your first LLVM pass plugin with the new pass manager using opt and a minimal function pass."
keywords:  
  - LLVM
  - LLVM pass
  - LLVM pass tutorial
  - LLVM new pass manager
  - LLVM legacy pass manager
  - create LLVM pass
  - write LLVM pass
  - write custom LLVM pass
  - custom LLVM optimization pass
  - LLVM pass plugin
  - LLVM pass plugin tutorial
  - LLVM pass registration
  - LLVM pass pipeline
  - LLVM pass development
  - LLVM pass example
  - LLVM pass architecture
  - LLVM opt tutorial
  - LLVM opt command
  - LLVM opt load pass plugin
  - opt load-pass-plugin
  - LLVM opt passes
  - LLVM PassInfoMixin
  - LLVM PreservedAnalyses
  - LLVM AnalysisManager
  - LLVM FunctionPass
  - LLVM function pass
  - LLVM ModulePass
  - LLVM LoopPass
  - LLVM CGSCC pass
  - LLVM IR pass
  - LLVM IR transformation
  - LLVM IR analysis
  - LLVM compiler pass
  - LLVM optimization pass
  - LLVM static analysis pass
  - LLVM pass manager tutorial
  - LLVM new PM tutorial
  - LLVM pass instrumentation
  - LLVM plugin development
  - out of tree LLVM pass
  - LLVM pass CMake
  - LLVM pass build example
  - LLVM pass testing
  - LLVM lit test pass
  - LLVM FileCheck pass
  - LLVM pass debugging
  - debug LLVM pass
  - run custom pass with opt
  - LLVM source to source transform
  - LLVM compiler internals
  - learn LLVM passes
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import LlvmSeoBooster from '@site/src/components/llvm/LlvmSeoBooster';

# How to Create an LLVM Pass as a Plugin

> Estimated time: ~45 minutes
> Difficulty: Beginner
> Requires: basic C++ and basic terminal usage
> No prior LLVM pass experience needed

In LLVM, many important things happen through passes. Analysis, transformation, cleanup, simplification, and optimization logic all move through pass infrastructure.

In the previous article, [Understanding LLVM Passes](./Understanding_LLVM_Pass.md), we built an understanding of **what LLVM passes are** and **why LLVM needs passes**. The next step is obvious: **creating your own pass**.

A pass plugin has two jobs:

- expose itself to LLVM
- implement logic over a chosen IR unit

So this article is not only about writing a C++ class. It is about choosing the right IR scope, registering the pass name, building the plugin, and proving that `opt` can run it on real IR.

:::info Plugin-Based Workflow
In this article, we are using the pass as a **plugin**. That means we are building the pass as a shared library and loading it into `opt`. We are **not** rebuilding the LLVM source tree in this workflow.

Here, **plugin** means a shared library that contains the code for your custom LLVM pass along with the registration entry LLVM uses to discover and run it.
:::

There are multiple ways to build and register an LLVM pass. Different teams use different workflows depending on whether the pass lives inside the LLVM source tree or outside it.

In this article, we are choosing only one path: the **plugin path**.

| Approach | Where pass lives | Need to rebuild LLVM? | Best for |
| --- | --- | --- | --- |
| Plugin | Outside LLVM tree | No | Learning, experimentation, out-of-tree development |
| In-tree | Inside LLVM source tree | Yes | Upstream work, internal LLVM development |

:::info Version Note
This plugin structure works with modern LLVM versions that support the new pass manager plugin interface. Minor API details can vary across LLVM releases.
:::

:::caution Build Prerequisite
This article does not rebuild the LLVM source tree, but it still needs an LLVM installation or build that exports `LLVMConfig.cmake`.

That usually means one of these:

- a local LLVM build tree created with CMake
- an LLVM install that ships CMake package files

Many system packages installed through `apt` or Homebrew provide `clang` and `opt` but do not always provide the CMake export files needed by:

```cmake
find_package(LLVM REQUIRED CONFIG)
```

If CMake says it cannot find LLVM, you likely need an LLVM build or install that includes those package files.
:::

If you are landing here directly, read this first:

- [Understanding LLVM Passes](./Understanding_LLVM_Pass.md)

## What You Need Before You Start

Before reading code, confirm these 5 things:

- `opt` exists and runs: `which opt`
- `clang` exists and runs: `which clang`
- CMake is installed: `cmake --version`
- your LLVM build or install contains `LLVMConfig.cmake`
- you can create and build a small CMake project on your machine

If any one of those is missing, stop there and fix the environment first. That is faster than debugging plugin code in a half-configured setup.

<Tabs>
<TabItem value="social" label="📣 Social Media">

  - [🐦 Twitter - CompilerSutra](https://twitter.com/CompilerSutra)
  - [💼 LinkedIn - Abhinav](https://www.linkedin.com/in/abhinavcompilerllvm/)
  - [📺 YouTube - CompilerSutra](https://www.youtube.com/@compilersutra)
  - [💬 Join the CompilerSutra Discord for discussions](https://discord.gg/d7jpHrhTap)

</TabItem>
</Tabs>

<AdBanner />

## Table of Contents

1. [What you are actually building](#what-you-are-actually-building)
2. [Prerequisites](#prerequisites)
3. [Why the new pass manager matters](#why-the-new-pass-manager-matters)
4. [What we will build](#what-we-will-build)
5. [Directory Layout](#directory-layout)
6. [Minimal LLVM pass plugin code](#minimal-llvm-pass-plugin-code)
7. [CMake build setup](#cmake-build-setup)
8. [Runnable example repo](#runnable-example-repo)
9. [Build and run the pass with opt](#build-and-run-the-pass-with-opt)
10. [Real terminal output](#real-terminal-output)
11. [Troubleshooting workflow we actually used](#troubleshooting-workflow-we-actually-used)
12. [Test input IR](#test-input-ir)
13. [Expected output and behavior](#expected-output-and-behavior)
14. [What if you need cross-function info](#what-if-you-need-cross-function-info)
15. [Common mistakes](#common-mistakes)
16. [Troubleshooting table](#troubleshooting-table)
17. [Next Exercises](#next-exercises)
18. [Where to go after your first pass](#where-to-go-after-your-first-pass)
19. [Which Article Should You Read Next?](#which-article-should-you-read-next)
20. [FAQ](#faq)
21. [MCQ Quiz](#mcq-quiz)
22. [More Articles](#more-articles)

## What You Are Actually Building

For a first pass, keep the idea simple:

- LLVM gives you IR.
- A pass walks over some unit of that IR.
- The pass either analyzes it, transforms it, or both.
- The pass manager decides when and how your pass runs.

In this article, we will build a **function pass plugin**. That means LLVM will invoke your pass once per function, and our code will inspect each function and print its name.

```text
Frontend -> LLVM IR -> Module -> Function -> FunctionNamePass -> opt output
```

This is a good first target because:

- the scope is small enough to understand
- the pass API is clean
- you can test it quickly with `opt`
- it teaches the exact registration pattern used by the new pass manager

## Prerequisites

Before building a pass plugin, make sure you already have:

- an LLVM build or install that provides `opt`
- an LLVM build or install that exports `LLVMConfig.cmake`
- a C++ compiler and CMake

This article does **not** rebuild the LLVM source tree, but it still depends on an LLVM setup that CMake can discover.

If you do not already have that, first read:

- [Build LLVM](../Build.md)

That guide explains how to build LLVM and get the files needed by:

```cmake
find_package(LLVM REQUIRED CONFIG)
```

If CMake cannot find LLVM, do not continue with the plugin code yet. Fix the LLVM build/install first.

## Why the New Pass Manager Matters

A lot of older LLVM pass tutorials still teach legacy registration macros and old `FunctionPass` inheritance patterns. You will still see them in old blog posts, old Stack Overflow answers, and old internal codebases.

If you are starting fresh, that should not be your default approach.

The **new pass manager** is the modern pass infrastructure used by current LLVM tooling for IR passes. Instead of deriving from the older pass base classes, many custom passes now use `PassInfoMixin<T>` and return `PreservedAnalyses`.

That changes the way you should think:

- your pass explicitly reports what analyses remain valid
- registration is done through pass plugin callbacks
- `opt -passes=...` becomes the normal way to run your pass

:::important
If your goal is to learn current LLVM pass development, build around the new pass manager first. Learn the legacy pass manager only when you must deal with older code.
:::

## What We Will Build

This article keeps the first pass deliberately small. Here is the full plan in plain language:

1. The pass goal:
   print the name of each function that has a body.
2. The pass kind:
   read-only. It observes IR and does not modify it.
3. The pass scope:
   function scope. LLVM will run it once per function.
4. How we will run it:
   build a shared-library plugin, load it into `opt`, and invoke it with `-passes=func-name`.
5. How we will verify success:
   `opt` loads the plugin, recognizes `func-name`, and prints function names.

For example, take this small C code:

```c
int add(int a, int b) {
  return a + b;
}

int mul(int a, int b) {
  return a * b;
}

int main() {
  int x = add(2, 3);
  int y = mul(x, 4);
  return y;
}
```

When Clang lowers this into LLVM IR, LLVM will see functions corresponding to `add`, `mul`, and `main`.

Our pass does not change any instruction here. It simply walks function by function and prints the names it sees.

So the expected output is conceptually like this:

```text
add
mul
main
```

That makes this a good first pass because:

- the output is easy to verify
- it proves the plugin is loaded correctly
- it proves the pass is running on real LLVM IR
- it keeps the first example simple before we move to real IR analysis or transformation

## Directory Layout

Use a minimal plugin directory like this:

```text
functionname/
├── CMakeLists.txt
├── FunctionName.cpp
└── build/
```

The source files we care about are:

- `CMakeLists.txt`
- `FunctionName.cpp`

## Minimal LLVM Pass Plugin Code

LLVM does not automatically understand `-passes=func-name`. Your plugin must register a pipeline parsing callback so `PassBuilder` can map the textual name `func-name` to a real pass object.

This article stays on the plugin path only. In-tree registration through `PassRegistry.def` and `PassBuilder.cpp` is a different workflow and is out of scope here.

Choose a pass name that reflects the pass behavior clearly and make sure it does not collide with an existing name.

### Step 1: Register the Pass Name

Let us register the pass name first.

For this article, we will use the pipeline name `func-name`.

:::tip Registration 
means telling LLVM:

- this pass name exists
- it should be attached to a function pipeline
- when LLVM sees `func-name`, it should create our pass
:::
This article uses **plugin registration**.

The important thing at this stage is simple: LLVM must be able to discover the pass name before we talk about pass logic.

So before writing the pass body, check the behavior from the `opt` side step by step.

<Tabs>
<TabItem value="before-reg" label="Before Register">

If LLVM does not know your pass name yet, running `opt` with that name should fail.

Conceptually, it looks like this:

```bash
<llvm-build>/bin/opt \
  -load-pass-plugin <plugin-build>/FunctionNamePass.so \
  -passes=func-name \
  /tmp/functionname-test.ll \
  -disable-output
```

Expected result before proper registration:

```text
opt: unknown pass name 'func-name'
```

That failure is useful. It tells you LLVM still cannot resolve the pipeline name.

</TabItem>
<TabItem value="register-pass" label="Register Pass">

Now let us register the pass so LLVM can see `func-name` in the pipeline.

For plugin registration, this is the hookup code that lives in `FunctionName.cpp`:

```cpp
// Registration section:
// This is the plugin entry LLVM looks for when the shared library is loaded.
extern "C" LLVM_ATTRIBUTE_WEAK PassPluginLibraryInfo llvmGetPassPluginInfo() {
  return {
      LLVM_PLUGIN_API_VERSION,
      "FunctionNamePass",
      LLVM_VERSION_STRING,
      // Register the textual pass name with PassBuilder.
      [](PassBuilder &PB) {
        PB.registerPipelineParsingCallback(
            [](StringRef Name, FunctionPassManager &FPM,
               ArrayRef<PassBuilder::PipelineElement>) {
              if (Name == "func-name") {
                // If the pipeline says func-name, add our function pass.
                FPM.addPass(FunctionNamePass());
                return true;
              }
              return false;
            });
      }};
}
```

This is the step that removes the `unknown pass name` failure.

</TabItem>
<TabItem value="after-reg" label="After Register">

After the registration path is wired correctly, run the same command again:

```bash
<llvm-build>/bin/opt \
  -load-pass-plugin <plugin-build>/FunctionNamePass.so \
  -passes=func-name \
  /tmp/functionname-test.ll \
  -disable-output
```

Expected result after registration:

```text
foo
bar
```

At that point, LLVM can already see the pass in the pipeline and run the pass body. That is the first proof that registration is working.

</TabItem>
</Tabs>

Only after this should we move to the pass implementation.

### Step 2: Add the Pass Implementation

After registration is clear, we can look at the pass body itself.

### Full Example File

Now put both pieces together in `FunctionName.cpp`:

```cpp
#include "llvm/IR/Function.h"
#include "llvm/Passes/PassBuilder.h"
#include "llvm/Passes/PassPlugin.h"
#include "llvm/Support/raw_ostream.h"

using namespace llvm;

namespace {

// Pass implementation section:
// This class contains the actual logic that runs on each Function.
class FunctionNamePass : public PassInfoMixin<FunctionNamePass> {
public:
  PreservedAnalyses run(Function &F, FunctionAnalysisManager &) {
    if (!F.isDeclaration()) {
      // Print only defined functions, not external declarations.
      errs() << F.getName() << "\n";
    }
    // This pass does not modify IR, so all analyses stay valid.
    return PreservedAnalyses::all();
  }
};

} // namespace

// Registration section:
// This is the plugin entry LLVM looks for when loading the shared library.
extern "C" LLVM_ATTRIBUTE_WEAK PassPluginLibraryInfo llvmGetPassPluginInfo() {
  return {
      LLVM_PLUGIN_API_VERSION,
      "FunctionNamePass",
      LLVM_VERSION_STRING,
      // Tell PassBuilder how to translate the pipeline name into a pass.
      [](PassBuilder &PB) {
        PB.registerPipelineParsingCallback(
            [](StringRef Name, FunctionPassManager &FPM,
               ArrayRef<PassBuilder::PipelineElement>) {
              if (Name == "func-name") {
                // func-name -> FunctionNamePass at function scope
                FPM.addPass(FunctionNamePass());
                return true;
              }
              return false;
            });
      }};
}
```

### Understanding `FunctionName.cpp`

The easiest way to understand this file is to start from how LLVM sees your program.

When the frontend finishes, it produces LLVM IR. That IR is not a flat text blob. LLVM stores it in a structure:

- **Module**: the top-level container for one IR file
- **Function**: each function in the module
- **BasicBlock**: each straight-line region inside a function
- **Instruction**: each IR operation inside a basic block

This plugin is a **function pass**. So LLVM does not give our `run()` method the whole module. Instead, the pass manager walks the module and calls the pass once for each function.

At a high level, the plugin does two things:

- **execution**: `FunctionNamePass` runs once per function and prints its name
- **registration**: `llvmGetPassPluginInfo()` tells LLVM that `func-name` should create `FunctionNamePass`

#### 1. The pass body

```cpp
class FunctionNamePass : public PassInfoMixin<FunctionNamePass> {
public:
  PreservedAnalyses run(Function &F, FunctionAnalysisManager &) {
    if (!F.isDeclaration()) {
      errs() << F.getName() << "\n";
    }
    return PreservedAnalyses::all();
  }
};
```

This is the actual compiler logic.

Why it is written this way:

- `PassInfoMixin<FunctionNamePass>` puts the class into the new pass manager style
- `run(Function &F, ...)` means this is a **function-level pass**
- `F` is the current function LLVM is visiting
- `!F.isDeclaration()` skips functions that have no body
- `F.getName()` prints the current function name
- `PreservedAnalyses::all()` tells LLVM that this pass only observes IR and does not modify it

So if the module contains `foo`, `bar`, and `main`, LLVM will call `run()` three times and the pass will print those names one by one.

#### 2. The registration section

```cpp
extern "C" LLVM_ATTRIBUTE_WEAK PassPluginLibraryInfo llvmGetPassPluginInfo()
```

This is not pass logic. This is the **registration side** of the file.

LLVM looks for this function when it loads the shared library.

The important idea is:

- without this function, the plugin is just another shared library
- with this function, LLVM can ask the plugin what passes it provides

`LLVM_ATTRIBUTE_WEAK` is part of LLVM's plugin convention for exporting that entry safely. You do not need to overthink it for a first pass. Just remember that this is the function LLVM expects to find.

#### 3. The registration callback

```cpp
[](PassBuilder &PB) {
  PB.registerPipelineParsingCallback(
      [](StringRef Name, FunctionPassManager &FPM,
         ArrayRef<PassBuilder::PipelineElement>) {
        if (Name == "func-name") {
          FPM.addPass(FunctionNamePass());
          return true;
        }
        return false;
      });
}
```

This is the bridge between the textual pipeline and the real pass object.

When you run:

```bash
opt -passes=func-name ...
```

LLVM still needs to answer:

- what does `func-name` mean?
- which pass object should be created?
- should it go into a function pipeline, module pipeline, or something else?

This callback answers that question.

It tells LLVM:

- if the pipeline text is `func-name`
- create `FunctionNamePass()`
- add it to the `FunctionPassManager`

That is why registration matters before implementation details. Without this mapping, the pass body may exist in your code, but `opt` still cannot resolve the pass name.

<AdBanner />

## CMake Build Setup

Create `CMakeLists.txt`:

```cmake
cmake_minimum_required(VERSION 3.13)
project(FunctionNamePass LANGUAGES CXX)

find_package(LLVM REQUIRED CONFIG)

list(APPEND CMAKE_MODULE_PATH "${LLVM_CMAKE_DIR}")
include(AddLLVM)
include_directories(${LLVM_INCLUDE_DIRS})
add_definitions(${LLVM_DEFINITIONS})

add_llvm_pass_plugin(FunctionNamePass
  FunctionName.cpp
)
```

### Understanding `CMakeLists.txt`

This file is not LLVM pass logic. Its job is simpler:

- find your LLVM build or install
- inherit the right compiler flags and include paths
- build your source as a **pass plugin shared library**

Read it in small pieces.

#### 1. Project setup

```cmake
cmake_minimum_required(VERSION 3.13)
project(FunctionNamePass LANGUAGES CXX)
```

This is normal CMake boilerplate.

- `cmake_minimum_required(...)` sets the minimum supported CMake version
- `project(...)` names the build and says we are compiling C++

#### 2. Find LLVM

```cmake
find_package(LLVM REQUIRED CONFIG)
```

This is the most important line in the file.

It tells CMake:

- find an LLVM installation or build tree
- load LLVM's exported CMake configuration
- stop immediately if LLVM cannot be found

That is why the earlier prerequisite section matters. Without `LLVMConfig.cmake`, this line fails and the plugin cannot be configured.

#### 3. Load LLVM's CMake helpers

```cmake
list(APPEND CMAKE_MODULE_PATH "${LLVM_CMAKE_DIR}")
include(AddLLVM)
```

LLVM ships helper CMake modules. `AddLLVM` gives us LLVM-specific build helpers such as `add_llvm_pass_plugin(...)`.

Without this, CMake would not know the LLVM-specific plugin macro we use later.

#### 4. Use LLVM's include paths and definitions

```cmake
include_directories(${LLVM_INCLUDE_DIRS})
add_definitions(${LLVM_DEFINITIONS})
```

These lines make sure your plugin is compiled against the same headers and important preprocessor definitions that LLVM expects.

Conceptually:

- `LLVM_INCLUDE_DIRS` tells the compiler where LLVM headers live
- `LLVM_DEFINITIONS` passes LLVM-related compile definitions into your build

If these are missing, your file may fail to compile even if LLVM was found.

#### 5. Build the pass as a plugin

```cmake
add_llvm_pass_plugin(FunctionNamePass
  FunctionName.cpp
)
```

This is the key build step.

It tells LLVM's CMake helpers:

- create a pass plugin named `FunctionNamePass`
- compile `FunctionName.cpp`
- produce a shared library that tools like `opt` can load

This is why the output is a plugin file like:

```text
FunctionNamePass.so
```

### Why this setup matters

If your local LLVM build is not in a default CMake search path, point CMake at it explicitly:

```bash
cmake -S <plugin-source-dir> \
  -B <plugin-build-dir> \
  -DLLVM_DIR=<llvm-build>/lib/cmake/llvm
```

## Runnable Example Repo

If you want the exact source tree used in this article, use the runnable example in this repository:

- [GitHub: `examples/llvm_pass_plugin/functionname`](https://github.com/aabhinavg1/FixIt/tree/main/examples/llvm_pass_plugin/functionname)
- [GitHub: `run.sh`](https://github.com/aabhinavg1/FixIt/blob/main/examples/llvm_pass_plugin/functionname/run.sh)

That example contains:

- `CMakeLists.txt`
- `FunctionName.cpp`
- `test.c`
- `test.ll`
- `run.sh`

The script configures the plugin, builds it, emits IR from `test.c`, and runs `opt`.

## Build and Run the Pass with opt

Build the plugin:

```bash
cmake -S <plugin-source-dir> \
  -B <plugin-build-dir> \
  -DLLVM_DIR=<llvm-build>/lib/cmake/llvm

cmake --build <plugin-build-dir>
```

What just happened?

- CMake found your LLVM installation and generated build files for the plugin.
- The compiler turned `FunctionName.cpp` into a shared library that `opt` can load.

On Linux, this usually produces a shared library like:

```text
<plugin-build-dir>/FunctionNamePass.so
```

Now run it:

```bash
<llvm-build>/bin/opt \
  -load-pass-plugin <plugin-build-dir>/FunctionNamePass.so \
  -passes=func-name \
  /tmp/functionname-test.ll \
  -disable-output
```

What just happened?

- `opt` loaded your shared library into the LLVM tool process.
- The pipeline parser matched `func-name` to your registration callback and ran the pass.

### A useful debugging habit

First confirm the plugin loads and the pass name is valid. Only then make the pass more complicated.

If you jump straight into IR mutation, analysis dependencies, or custom pipeline nesting, you will not know whether the failure is in your logic, your registration, or your build.

## Real Terminal Output

The blocks below are real command output from the runnable example in this repository, not cleaned-up "expected output" snippets.

### 1. Real configure and build output

```console
$ examples/llvm_pass_plugin/functionname/run.sh /home/aitr/riscv_implementation/llvm/llvm-project/build
-- Registering FunctionNamePass as a pass plugin (static build: OFF)
-- Configuring done (0.0s)
-- Generating done (0.0s)
-- Build files have been written to: /home/aitr/compilersutra/FixIt_Compilersutra/examples/llvm_pass_plugin/functionname/build
[ 50%] Building CXX object CMakeFiles/FunctionNamePass.dir/FunctionName.cpp.o
[100%] Linking CXX shared module FunctionNamePass.so
[100%] Built target FunctionNamePass
```

### 2. Real `opt` output when nothing prints

This is a very common beginner case. If you generate IR from `clang -O0`, Clang often adds the `optnone` attribute, and `opt` skips many optimization-style passes.

```console
$ /home/aitr/riscv_implementation/llvm/llvm-project/build/bin/opt -debug-pass-manager -load-pass-plugin /home/aitr/compilersutra/FixIt_Compilersutra/examples/llvm_pass_plugin/functionname/build/FunctionNamePass.so -passes=func-name /home/aitr/compilersutra/FixIt_Compilersutra/examples/llvm_pass_plugin/functionname/build/test.ll -disable-output
Running analysis: InnerAnalysisManagerProxy<AnalysisManager<Function>, Module> on [module]
Skipping pass {anonymous}::FunctionNamePass on add due to optnone attribute
Skipping pass: {anonymous}::FunctionNamePass on add
Skipping pass {anonymous}::FunctionNamePass on mul due to optnone attribute
Skipping pass: {anonymous}::FunctionNamePass on mul
Skipping pass {anonymous}::FunctionNamePass on main due to optnone attribute
Skipping pass: {anonymous}::FunctionNamePass on main
Running pass: VerifierPass on [module]
Running analysis: VerifierAnalysis on [module]
```

If your output looks like that, your plugin is probably fine. Your test IR is the problem.

### 3. Real `opt` output after fixing `optnone`

Re-generate the IR without `optnone`:

```bash
clang -S -emit-llvm -Xclang -disable-O0-optnone test.c -o /tmp/functionname-no-optnone.ll
```

Then run the plugin again:

```console
$ /home/aitr/riscv_implementation/llvm/llvm-project/build/bin/opt -debug-pass-manager -load-pass-plugin /home/aitr/compilersutra/FixIt_Compilersutra/examples/llvm_pass_plugin/functionname/build/FunctionNamePass.so -passes=func-name /tmp/functionname-no-optnone.ll -disable-output
Running analysis: InnerAnalysisManagerProxy<AnalysisManager<Function>, Module> on [module]
Running pass: {anonymous}::FunctionNamePass on add (8 instructions)
add
Running pass: {anonymous}::FunctionNamePass on mul (8 instructions)
mul
Running pass: {anonymous}::FunctionNamePass on main (11 instructions)
main
Running pass: VerifierPass on [module]
Running analysis: VerifierAnalysis on [module]
```

## Troubleshooting Workflow We Actually Used

Below is the exact troubleshooting sequence used while validating the runnable example for this article.

### 1. Confirm the toolchain paths first

```console
$ which opt
/home/aitr/riscv_implementation/llvm/llvm-project/build/bin/opt

$ which clang
/usr/bin/clang
```

This matters because many plugin load problems are really "wrong `opt` binary" problems.

### 2. First build attempt failed because LLVM's CMake helpers rejected extra files

The first version of the example directory contained `test.c` next to the plugin source. LLVM's CMake helpers complained because only `FunctionName.cpp` was part of the target.

```console
$ examples/llvm_pass_plugin/functionname/run.sh /home/aitr/riscv_implementation/llvm/llvm-project/build
-- The CXX compiler identification is GNU 13.3.0
-- Detecting CXX compiler ABI info
-- Detecting CXX compiler ABI info - done
-- Check for working CXX compiler: /usr/bin/c++ - skipped
-- Detecting CXX compile features
-- Detecting CXX compile features - done
-- Found ZLIB: /usr/lib/x86_64-linux-gnu/libz.so (found version "1.3")
-- Found zstd: /usr/lib/x86_64-linux-gnu/libzstd.so
-- Found LibXml2: /usr/lib/x86_64-linux-gnu/libxml2.so (found version "2.9.14")
-- Linker detection: unknown
CMake Error at /home/aitr/riscv_implementation/llvm/llvm-project/build/lib/cmake/llvm/LLVMProcessSources.cmake:113 (message):
  Found erroneous configuration for source file test.c

  LLVM's build system enforces that all source files are added to a build
  target, that exactly one build target exists in each directory, and that
  this target lists all files in that directory.  If you want multiple
  targets in the same directory, add PARTIAL_SOURCES_INTENDED to the target
  specification, though it is discouraged.

  Please update
  /home/aitr/compilersutra/FixIt_Compilersutra/examples/llvm_pass_plugin/functionname/CMakeLists.txt
```

### 3. Fix for that CMake error

The exact fix was:

```cmake
add_llvm_pass_plugin(FunctionNamePass
  PARTIAL_SOURCES_INTENDED
  FunctionName.cpp
)
```

If you keep extra test files in the same directory as the plugin target, this flag is the simplest fix.

### 4. Re-run the build after the CMake fix

```console
$ examples/llvm_pass_plugin/functionname/run.sh /home/aitr/riscv_implementation/llvm/llvm-project/build
-- Registering FunctionNamePass as a pass plugin (static build: OFF)
-- Configuring done (0.0s)
-- Generating done (0.0s)
-- Build files have been written to: /home/aitr/compilersutra/FixIt_Compilersutra/examples/llvm_pass_plugin/functionname/build
[ 50%] Building CXX object CMakeFiles/FunctionNamePass.dir/FunctionName.cpp.o
[100%] Linking CXX shared module FunctionNamePass.so
[100%] Built target FunctionNamePass
```

### 5. Run `opt` directly when the script output is not enough

When the script completed successfully but still showed no function names, the next debugging step was to run `opt` directly:

```console
$ /home/aitr/riscv_implementation/llvm/llvm-project/build/bin/opt -load-pass-plugin /home/aitr/compilersutra/FixIt_Compilersutra/examples/llvm_pass_plugin/functionname/build/FunctionNamePass.so -passes=func-name /home/aitr/compilersutra/FixIt_Compilersutra/examples/llvm_pass_plugin/functionname/build/test.ll -disable-output
```

That produced no visible output. At that point the question becomes: "Did the plugin fail, or was the pass skipped?"

### 6. Use `-debug-pass-manager` before changing code

Instead of guessing, run the same command with `-debug-pass-manager`:

```console
$ /home/aitr/riscv_implementation/llvm/llvm-project/build/bin/opt -debug-pass-manager -load-pass-plugin /home/aitr/compilersutra/FixIt_Compilersutra/examples/llvm_pass_plugin/functionname/build/FunctionNamePass.so -passes=func-name /home/aitr/compilersutra/FixIt_Compilersutra/examples/llvm_pass_plugin/functionname/build/test.ll -disable-output
Running analysis: InnerAnalysisManagerProxy<AnalysisManager<Function>, Module> on [module]
Skipping pass {anonymous}::FunctionNamePass on add due to optnone attribute
Skipping pass: {anonymous}::FunctionNamePass on add
Skipping pass {anonymous}::FunctionNamePass on mul due to optnone attribute
Skipping pass: {anonymous}::FunctionNamePass on mul
Skipping pass {anonymous}::FunctionNamePass on main due to optnone attribute
Skipping pass: {anonymous}::FunctionNamePass on main
Running pass: VerifierPass on [module]
Running analysis: VerifierAnalysis on [module]
```

That output proved the plugin was loading correctly and the pass name was correct. The real issue was the `optnone` attribute in the IR.

### 7. Re-generate the IR without `optnone`

```console
$ clang -S -emit-llvm -Xclang -disable-O0-optnone examples/llvm_pass_plugin/functionname/test.c -o /tmp/functionname-no-optnone.ll
```

### 8. Re-run `opt` on the new IR

```console
$ /home/aitr/riscv_implementation/llvm/llvm-project/build/bin/opt -debug-pass-manager -load-pass-plugin /home/aitr/compilersutra/FixIt_Compilersutra/examples/llvm_pass_plugin/functionname/build/FunctionNamePass.so -passes=func-name /tmp/functionname-no-optnone.ll -disable-output
Running analysis: InnerAnalysisManagerProxy<AnalysisManager<Function>, Module> on [module]
Running pass: {anonymous}::FunctionNamePass on add (8 instructions)
add
Running pass: {anonymous}::FunctionNamePass on mul (8 instructions)
mul
Running pass: {anonymous}::FunctionNamePass on main (11 instructions)
main
Running pass: VerifierPass on [module]
Running analysis: VerifierAnalysis on [module]
```

That is the full debugging path:

1. verify the toolchain path
2. fix the CMake target layout
3. run `opt` directly
4. use `-debug-pass-manager`
5. notice `optnone`
6. regenerate IR without it
7. rerun and confirm the pass executes

## Test Input IR

You can compile a tiny C file into LLVM IR:

```c
int add(int a, int b) {
  return a + b;
}

int main() {
  return add(2, 3);
}
```

Generate IR:

```bash
clang -S -emit-llvm test.c -o /tmp/functionname-test.ll
```

Or write a tiny IR file directly, for example `/tmp/functionname-test.ll`:

```llvm
define i32 @add(i32 %a, i32 %b) {
entry:
  %sum = add i32 %a, %b
  ret i32 %sum
}

define i32 @main() {
entry:
  %call = call i32 @add(i32 2, i32 3)
  ret i32 %call
}
```

### Annotated IR: What Each Line Means

If LLVM IR looks intimidating, read this once slowly. Nothing here is "magic". It is just a structured, lower-level version of the original C.

#### C source

```c
int add(int a, int b) {
  return a + b;
}

int main() {
  return add(2, 3);
}
```

#### LLVM IR with plain-English annotations

```llvm
define i32 @add(i32 %a, i32 %b) {
; define = start a function definition
; i32 = the return type is 32-bit integer
; @add = the function name
; (i32 %a, i32 %b) = two 32-bit integer parameters named %a and %b

entry:
; a basic block label
; execution starts here

  %sum = add i32 %a, %b
; create a new SSA value named %sum
; add the two input parameters

  ret i32 %sum
; return %sum from the function
}

define i32 @main() {
; define another function named main

entry:
; main also starts at an entry block

  %call = call i32 @add(i32 2, i32 3)
; call the function @add with constants 2 and 3
; store the result in %call

  ret i32 %call
; return the result from main
}
```

The important beginner idea is this:

- `@name` usually means a global symbol like a function
- `%name` usually means a temporary SSA value
- `define` starts a function body
- `ret` returns from a function
- labels like `entry:` mark basic blocks

## Expected Output and Behavior

When the pass runs, you should see output like:

```text
add
main
```

In one test run, using a tiny IR file, the pass produced:

```text
foo
bar
```

That confirms:

- your plugin was loaded
- the pass name was parsed
- LLVM ran your pass over each function

What just happened?

- LLVM walked through the functions in the IR one by one.
- Your pass printed each non-declaration function name to `errs()`.

## What If You Need Cross-Function Info?

A function pass only sees one `Function` at a time. If your logic needs to compare multiple functions, aggregate module-wide statistics, or make decisions using whole-module context, a plain function pass is the wrong starting point.

Use one of these instead:

- a **module pass** when you need to scan or transform the whole IR module
- a **module analysis** when you want to compute shared information once and reuse it

For a first cross-function design, prefer a module pass. It is the simplest whole-program mental model:

```cpp
class ModuleFunctionListerPass : public PassInfoMixin<ModuleFunctionListerPass> {
public:
  PreservedAnalyses run(Module &M, ModuleAnalysisManager &) {
    for (Function &F : M) {
      if (!F.isDeclaration()) {
        errs() << F.getName() << "\n";
      }
    }
    return PreservedAnalyses::all();
  }
};
```

The practical rule is simple:

- if the pass decision depends only on the current function, use a function pass
- if the pass decision depends on other functions too, move up to module scope

## Common Mistakes

### 1. Following a legacy pass tutorial by accident

If you see inheritance from old pass base classes and registration macros that do not match `PassInfoMixin`, you are likely reading a legacy tutorial.

### 2. Using the wrong pass manager scope

If your callback registers into a `FunctionPassManager`, then the pass itself must be valid at function scope. Do not mix module-level design with function-level registration.

### 3. Assuming plugin load means pass registration worked

A plugin can load correctly while your pass name still fails to parse. Those are separate parts of the system.

### 4. Forgetting that declarations are not function bodies

External declarations exist in IR, but they do not contain instructions to walk.

## Troubleshooting Table

| Symptom | What it usually means | Exact fix |
| --- | --- | --- |
| `opt: unknown pass name 'func-name'` | The plugin loaded, but your registration callback did not map `func-name` into a pass. | Re-check the callback and then run:<br /><br />```bash\n<llvm-build>/bin/opt \\\n  -load-pass-plugin <plugin-build-dir>/FunctionNamePass.so \\\n  -passes=func-name \\\n  /tmp/functionname-test.ll \\\n  -disable-output\n``` |
| The plugin builds, but `opt` prints nothing | Your IR likely has `optnone`, so the pass is being skipped. | Re-generate IR without `optnone`:<br /><br />```bash\nclang -S -emit-llvm -Xclang -disable-O0-optnone test.c -o /tmp/functionname-no-optnone.ll\n<llvm-build>/bin/opt -debug-pass-manager \\\n  -load-pass-plugin <plugin-build-dir>/FunctionNamePass.so \\\n  -passes=func-name \\\n  /tmp/functionname-no-optnone.ll \\\n  -disable-output\n``` |
| `Could not load library` or `Plugin fails to load` | Wrong `.so` path, stale build, or plugin built against a different LLVM than the `opt` you are running. | Rebuild against the same LLVM tree you use for `opt`:<br /><br />```bash\ncmake -S <plugin-source-dir> \\\n  -B <plugin-build-dir> \\\n  -DLLVM_DIR=<llvm-build>/lib/cmake/llvm\ncmake --build <plugin-build-dir>\n<llvm-build>/bin/opt \\\n  -load-pass-plugin <plugin-build-dir>/FunctionNamePass.so \\\n  -passes=func-name \\\n  /tmp/functionname-test.ll \\\n  -disable-output\n``` |
| `find_package(LLVM REQUIRED CONFIG)` fails | CMake cannot find `LLVMConfig.cmake`. | Point CMake at the LLVM build or install explicitly:<br /><br />```bash\ncmake -S <plugin-source-dir> \\\n  -B <plugin-build-dir> \\\n  -DLLVM_DIR=<llvm-build>/lib/cmake/llvm\n``` |
| CMake says `Found erroneous configuration for source file test.c` | LLVM's CMake helpers found extra files in the plugin directory that are not part of the target. | Either move test files out of that directory, or mark the target with `PARTIAL_SOURCES_INTENDED`:<br /><br />```cmake\nadd_llvm_pass_plugin(FunctionNamePass\n  PARTIAL_SOURCES_INTENDED\n  FunctionName.cpp\n)\n``` |
| Output goes to stderr instead of stdout | The pass uses `errs()`, which is normal for LLVM debugging and tutorial output. | Redirect stderr if needed:<br /><br />```bash\n<llvm-build>/bin/opt \\\n  -load-pass-plugin <plugin-build-dir>/FunctionNamePass.so \\\n  -passes=func-name \\\n  /tmp/functionname-test.ll \\\n  -disable-output 2>pass.log\ncat pass.log\n``` |

:::tip Why use `errs()`?
We use `errs()` because LLVM tools often use it for diagnostics and pass debug-style output. Since we are running with `-disable-output`, printing to `errs()` still lets us observe the pass behavior clearly.
:::

## Next Exercises

After this first plugin works, useful next exercises are:

- count instructions in each function
- print the number of basic blocks in each function
- detect whether a function contains any `call` instruction
- detect loops using LLVM analyses
- rewrite one simple IR pattern instead of only printing information

## Best Practices for Your First Real Pass

- Start with a read-only analysis-style pass before writing a transformation.
- Keep the pass scope narrow: function scope is easier than module scope.
- Print something observable early so you know the pipeline wiring is correct.
- Test on tiny IR first, then move to Clang-generated IR.
- Learn `opt` usage alongside pass development, not afterward.

:::tip
After your first pass works, the next productive step is usually one of these:

- count instructions by opcode
- detect calls to a specific function
- inspect loads, stores, and branches
- reject patterns you want to optimize later
:::

## Where to Go After Your First Pass

Your first pass should not end at "it compiles."

The next level is understanding how to make it useful:

- use analyses instead of raw scanning when appropriate
- move from printing to decision-making
- learn when a function pass is not enough and a module pass is the right abstraction

If you want to build optimizations seriously, the bigger path looks like this:

1. understand LLVM IR structure
2. understand SSA and dominance
3. build small passes
4. inspect real optimization pipelines

## Which Article Should You Read Next?

Use this section as the "where do I go now?" map.

- If you still do not feel clear on what a pass is at all, read [Understanding LLVM Passes](./Understanding_LLVM_Pass.md).
  This is the right follow-up if words like analysis pass, transformation pass, or pass manager still feel fuzzy.
- If the IR itself still looks scary, read [Introduction to LLVM IR](../../llvm_ir/intro_to_llvm_ir.md).
  This is the best next article if `%sum`, `ret`, `define`, and basic blocks still feel unfamiliar.
- If you want one more simple pass before writing something harder, read [Creating an LLVM Function Pass in C/C++](./Function_Count_Pass.md).
  This is a good next step if you want another beginner-sized example with a slightly different behavior.
- If you want to inspect instructions instead of just function names, read [Creating an LLVM Function Instruction Count Pass](./Instruction_Count_Pass.md).
  This is the next article if you want to move from "the pass runs" to "the pass measures something real".
- If you want the theory behind SSA and dominance later, read [Dominator Tree and Dominance Frontier](../../llvm_Curriculum/level0/Dominator_Tree_And_Dominance_Frontier.md).
  Do this after your first pass works, not before.

## FAQ

### Is this article using the legacy pass manager or the new one?

This article uses the **new pass manager** style based on `PassInfoMixin`, pass plugins, and `-passes=...`.

### Should my first LLVM pass be analysis or transformation?

Analysis-style is usually better for a first pass because it lets you validate registration, traversal, and output before you risk breaking IR.

### Do I need to rebuild all of LLVM to write a custom pass?

No. In this plugin workflow, you do **not** rebuild LLVM itself. You only build the plugin as a shared library, as long as CMake can find an LLVM build or install that exports the required configuration.

### Why run the pass with opt instead of clang first?

`opt` is the cleaner place to test IR passes because it reduces noise. You isolate pass behavior before involving the full frontend pipeline.

### What if I need information from more than one function?

Move up a level. A function pass is the wrong abstraction if correctness depends on more than one function. Start with a module pass or module analysis.

### What should I learn after this?

Learn LLVM IR well, then study pass pipelines and the difference between function, module, and loop-oriented work.

## Success Or Failure Checklist

Use this quick end-state check before you leave the article:

- If you saw `add`, `mul`, and `main` printed, you are done.
- If `opt` said `unknown pass name 'func-name'`, go to the troubleshooting table row for pass registration.
- If the plugin built but nothing printed, go to the troubleshooting workflow section and check the `optnone` step.
- If CMake failed before compiling anything, go to the troubleshooting table row for `find_package(LLVM REQUIRED CONFIG)` or the source-file layout error.
- If the plugin failed to load, rebuild it against the same LLVM tree as the `opt` binary you are running.

## MCQ Quiz

Practice the dedicated quiz here:

- [LLVM Pass Plugin MCQ Quiz](/docs/mcq/questions/domain/compilers/llvm/pass-plugin-quiz)
- [LLVM MCQ Track Home](/docs/mcq/questions/domain/compilers/llvm)

## More Articles

- [Understanding LLVM Passes](./Understanding_LLVM_Pass.md)
- [Creating an LLVM Function Pass in C/C++](./Function_Count_Pass.md)
- [Creating an LLVM Function Instruction Count Pass](./Instruction_Count_Pass.md)
- [Introduction to LLVM IR](../../llvm_ir/intro_to_llvm_ir.md)
- [Dominator Tree and Dominance Frontier](../../llvm_Curriculum/level0/Dominator_Tree_And_Dominance_Frontier.md)

## Final Takeaway

Writing your first LLVM pass is mostly about learning the boundaries of the system correctly.

The real milestone is not "I wrote some C++." It is this: you understand how LLVM names, registers, scopes, loads, and executes custom compiler logic. Once that clicks, custom analysis and optimization work stops feeling mysterious and starts feeling inspectable.



<Tabs>
  <TabItem value="docs" label="📚 Documentation">
             - [CompilerSutra Home](https://compilersutra.com)
                - [CompilerSutra Homepage (Alt)](https://compilersutra.com/)
                - [Getting Started Guide](https://compilersutra.com/get-started)
                - [Skip to Content (Accessibility)](https://compilersutra.com#__docusaurus_skipToContent_fallback)


  </TabItem>

  <TabItem value="tutorials" label="📖 Tutorials & Guides">

        - [AI Documentation](https://compilersutra.com/docs/Ai)
        - [DSA Overview](https://compilersutra.com/docs/DSA/)
        - [DSA Detailed Guide](https://compilersutra.com/docs/DSA/DSA)
        - [MLIR Introduction](https://compilersutra.com/docs/MLIR/intro)
        - [TVM for Beginners](https://compilersutra.com/docs/tvm-for-beginners)
        - [Python Tutorial](https://compilersutra.com/docs/python/python_tutorial)
        - [C++ Tutorial](https://compilersutra.com/docs/c++/CppTutorial)
        - [C++ Main File Explained](https://compilersutra.com/docs/c++/c++_main_file)
        - [Compiler Design Basics](https://compilersutra.com/docs/compilers/compiler)
        - [OpenCL for GPU Programming](https://compilersutra.com/docs/gpu/opencl)
        - [LLVM Introduction](https://compilersutra.com/docs/llvm/intro-to-llvm)
        - [Introduction to Linux](https://compilersutra.com/docs/linux/intro_to_linux)

  </TabItem>

  <TabItem value="assessments" label="📝 Assessments">

        - [C++ MCQs](https://compilersutra.com/docs/mcq/cpp_mcqs)
        - [C++ Interview MCQs](https://compilersutra.com/docs/mcq/interview_question/cpp_interview_mcqs)

  </TabItem>

  <TabItem value="projects" label="🛠️ Projects">

            - [Project Documentation](https://compilersutra.com/docs/Project)
            - [Project Index](https://compilersutra.com/docs/project/)
            - [Graphics Pipeline Overview](https://compilersutra.com/docs/The_Graphic_Rendering_Pipeline)
            - [Graphic Rendering Pipeline (Alt)](https://compilersutra.com/docs/the_graphic_rendering_pipeline/)

  </TabItem>

  <TabItem value="resources" label="🌍 External Resources">

            - [LLVM Official Docs](https://llvm.org/docs/)
            - [Ask Any Question On Quora](https://compilersutra.quora.com)
            - [GitHub: FixIt Project](https://github.com/aabhinavg1/FixIt)
            - [GitHub Sponsors Page](https://github.com/sponsors/aabhinavg1)

  </TabItem>

  <TabItem value="social" label="📣 Social Media">

            - [🐦 Twitter - CompilerSutra](https://twitter.com/CompilerSutra)
            - [💼 LinkedIn - Abhinav](https://www.linkedin.com/in/abhinavcompilerllvm/)
            - [📺 YouTube - CompilerSutra](https://www.youtube.com/@compilersutra)
            - [💬 Join the CompilerSutra Discord for discussions](https://discord.gg/DXJFhvzz3K)

  </TabItem>
</Tabs>

<LlvmSeoBooster topic="create-pass-plugin" />
