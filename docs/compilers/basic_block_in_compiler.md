---
title: Understanding Basic Blocks(LLVM)
description: A hands-on, SEO-optimized tutorial comparing how LLVM/Clang and GCC represent, visualize, and count basic blocks. Includes concept overview, commands, code samples, pass/plugin examples, and tips for reliable analysis.
keywords:

- Basic block
- Basic block in compiler
- LLVM basic block
- GCC basic block
- Compiler CFG
- Compiler IR
- Clang IR
- Compiler in C++
- CFG visualization
- LLVM pass
- GCC dumps
- Intermediate representation (IR)
- Control flow graph (CFG)
- SSA form
- Dominator tree
- Data flow analysis
- Loop optimization
- Instruction scheduling
- Dead code elimination
- Register allocation
- LLVM IR visualization
- CFG in GCC
- LLVM optimization passes
- Backend code generation
- Frontend parsing
- Abstract syntax tree (AST)
- Compiler pipeline
- Machine code generation
- Compiler optimization levels
- Clang AST
- GCC IR dumps
- LLVM CFG dump
- IR analysis
- Static single assignment
- Code motion
- Peephole optimization
- Compiler backend
- LLVM opt tool
- CFG graphviz
- IR transformations
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import { ComicQA } from '../mcq/interview_question/Question_comics' ;





📩 Interested in deep dives like pipelines, cache, and compiler optimizations?

<div
  style={{
    width: '100%',
    maxWidth: '900px',
    margin: '1rem auto',
  }}
>
  <iframe
    src="https://docs.google.com/forms/d/e/1FAIpQLSebP1JfLFDp0ckTxOhODKPNVeI1e21rUqMJ0fbBwJoaa-i4Yw/viewform?embedded=true"
    style={{
      width: '100%',
      minHeight: '620px',
      border: '0',
      borderRadius: '12px',
      background: '#fff',
    }}
    loading="lazy"
  >
    Loading…
  </iframe>
</div>

In ***compiler design***, ***basic blocks*** are like the sentences of a program’s story  `short, continuous sequences of instructions` with no ***interruptions***x.

If you want to understand optimizations, performance, or correctness in any C++ compiler toolchain (LLVM/Clang or GCC), you need to be comfortable with:

- What a basic block is – a straight-line piece of code with one entry and one exit.
- Why it exists – making it easier for compilers to analyze and optimize.
- How to detect and count them – the starting point of control flow analysis.

:::tip Remember it as
Just as sentences structure a story, basic blocks structure programs.

✨“The ***compiler reads programs*** *the way we read stories*  ***one sentence (basic block) at a time*** .”
:::

<div>
  <AdBanner/>
</div>

## Table of Contents

- [What is a Basic Block?](#what-is-a-basic-block)
  - [Why Basic Blocks Matter](#why-basic-blocks-matter)
- [How Compilers Build CFGs](#how-compilers-build-cfgs)
- [LLVM/Clang: Inspect, Visualize, and Count Basic Blocks](#llvmclang-inspect-visualize-and-count-basic-blocks)
  - [Quick CLI Methods (no coding)](#quick-cli-methods-no-coding)
  - [Programmatic Method (C++ tool using LLVM APIs)](#programmatic-method-c-tool-using-llvm-apis)
- [What Next](#what-next)
- [FAQ](#faq)

<div>
    <AdBanner />
</div>



## What is a Basic Block?

A **basic block** is a maximal straight-line sequence of instructions that has:

1. **One entry point** – control always begins at the first instruction of the block.
2. **One exit point** – control leaves only at the last instruction.
3. **No internal jumps** – there are no branches into or out of the middle of the block.

:::caution In simpler terms:
 once execution enters a basic block, every instruction inside it will run in order, until the block finishes.
:::

> ***Lets Understand it By and Example***

<Tabs>
<TabItem value="Snippet to understand basic block" label="basic cpp code to understand basic block" default>

```cpp
#include <iostream>
using namespace std;

int main() {
    int x = 5;
    if (x > 0) {
        cout << "Positive" << endl;
    }
    cout << "Done" << endl;
    return 0;
}

```
</TabItem>
<TabItem value="basic block digram and explanation" label="Breaking the snippet in to the Basic Blocks " default>
**Breaking the snippet in to the Basic Blocks**

<img
  src="/img/basic_block.svg"
  alt="Digram for showng the basic block of digram and how it work"
  style={{
    width: '100%',
    maxWidth: '400px',
    height: 'auto',
    display: 'block',
    margin: '0 auto'
  }}
/>
<details>
<summary><strong> Digram Explanation </strong></summary>

This diagram shows:
- `Block 1` initializes x and checks the condition.
- If the condition is `true` → `go` to `Block 2` (print "Positive"), then flow continues to `Block 3`.
- If the condition is `false` → `jump` directly to `Block 3`.

`Block 3` is the final block that always `executes before exit`.
</details>
1. **Block 1 (Entry + Condition)**

   * `int x = 5;`
   * `if (x > 0)` → This introduces a possible branch.
   * Control can either go to **Block 2** (if true) or **Block 3** (if false).

2. **Block 2 (True branch)**

   * `cout << "Positive" << endl;`
   * Control flows to **Block 3**.

3. **Block 3 (Join + Exit)**

   * `cout << "Done" << endl;`
   * `return 0;`



:::important Why These Are Basic Blocks

* In **Block 1**, you must execute `x = 5;` and then check the condition before deciding where to go. You cannot jump into the middle.
* **Block 2** is straight-line (only one statement, then fall through).
* **Block 3** is also straight-line and ends the program.
:::

:::tip In the code
the program’s control flow graph (CFG) has **3 nodes (basic blocks)** connected by edges based on the branch.
:::

</TabItem>
</Tabs>



### Why Basic Blocks Matter

So far, we have understood **what a basic block is**:

In simple terms, a **basic block is a straight-line sequence of instructions with no branches**. 

 > *Once execution enters a basic block, it will execute all instructions in order until the end.*


Whenever a **branch or jump** occurs, the instructions following the branch start a **new basic block**. 
> *This division of code into blocks allows the compiler to* **reason about control flow in a structured way**.
<details>
<summary><strong>1. **Foundation for Optimizations**</strong></summary>
   * Many optimizations, such as **constant folding**, **dead code elimination (DCE)**, and              
                   **common subexpression elimination**, rely on the linearity of basic blocks.

   * Within a block, the order of execution is guaranteed, making it simpler for the compiler to detect and apply safe transformations.

  
</details>

<details>
<summary><strong> 2. **Core of the Control-Flow Graph (CFG)**</strong></summary>

   * Basic blocks form the **nodes** of a CFG, while edges represent possible 
   **control transfers**: 
   branches, jumps, and fallthroughs.
   * This representation is essential for analyses like **loop detection**, 
               **branch prediction**, and **interprocedural optimization**.
</details>

<details>
<summary><strong> 3. **Basis for Advanced Analyses**</strong></summary>

   * Techniques like **dominators**, **liveness analysis**, **dataflow analysis**, 
   **SSA form**,and **instruction scheduling** operate at the block level.
   * Without basic blocks, these analyses would be much more complex or inefficient.
</details>

<details>
<summary><strong> 4. **Performance and Code Layout Implications** </strong></summary>

   * The **number, size, and structure** of blocks affect **branch prediction, instruction cache behavior, and pipeline efficiency**.
   * Compilers often reorder, split, or merge blocks to improve execution speed and optimize memory usage.
</details>

<details>
<summary><strong> 5. **Simplifies Reasoning About Code**</strong></summary>

*By grouping sequential instructions into blocks*, the compiler can focus 
on **meaningful sequences of instructions**, making optimizations safer and 
analysis more precise.

</details>

## How Compilers Build CFGs

Before jumping in to *how compilers build CFGs* ***let's understand first what cfg is***
:::tip Defination
:::
> A **Control Flow Graph (CFG)** is a **graphical representation of all paths that might be traversed through a program during its execution**.
> -  **Nodes** in a CFG represent **basic blocks** which is a  ***straight-line sequences*** of
instructions with no branches except at the end.
> -  **Edges** represent **possible transfers of control** from one block to another.

:::important In simple words:
> A CFG shows ***how the program can*** `flow` from ***one block of code to another*** depending on conditions, loops, and jumps.
:::

<details>
 <summary> **Why CFG is Useful** </summary>

:::tip **Why CFG is Useful** 

1. **Understanding Program Flow:** 
          - Helps visualize how a ***program executes***, ***including loops***, ***branches***, and ***conditional statements***.
2. **Compiler Optimizations:** 
          - Enables transformations like ***dead code elimination***, ***loop optimization***, and ***constant propagation***.
3. **Error Detection & Analysis:** 
          - Identifies unreachable ***code***, ***infinite loops***, and ***potential logical errors***.
:::


</details>
---

> ***Let's understand it with the example what cfg is*** :-
>> - To make the concept of a ***Control Flow Graph (CFG)*** concrete, ***let’s walk through a simple*** example `with snippet`.


---

<Tabs>
<TabItem value="Snippet to understand the cpp" label="Code Snippet" default>

```cpp
if (x > 0)
    y = 1;
else
    y = 2;
z = y + 3;
```
This code has a simple **conditional statement** and a continuation after the branch.

 **Step 1: Identify Basic Blocks**

A **basic block** is a sequence of statements that **execute sequentially**, with **no jumps or branches except at the end**.

For this example, we can divide the code into **four basic blocks**:
<details>
<summary><strong>1. **Block 1 – Condition Check**</strong></summary>

```c
if (x > 0)
```

> ***This block decides which path the program will follow.***
</details>

<details>
<summary><strong> 2. **Block 2 – True Branch**</strong></summary>

```c
y = 1;
```

- ***Executed only if the condition in Block 1 is true***.
</details>

<details>
<summary><strong>3. **Block 3 – False Branch**</strong></summary>

```c
y = 2;
```

* Executed only if the condition in Block 1 is **false**.
</details>

<details>
<summary><strong>4. **Block 4 – Merge / Continuation**</strong></summary>

```c
z = y + 3;
```

- ***Executed after either Block 2 or Block 3, where both paths converge.***
</details>

* **Basic Blocks:**

  1. Condition check: `if (x > 0)`
  2. True branch: `y = 1`
  3. False branch: `y = 2`
  4. Merge/continuation: `z = y + 3`

</TabItem>

<TabItem value="CFG of the code to understand" label="CFG to understand" default>

The edges between blocks represent **possible paths the program can take**:

<img
  src="/img/cfg_block.png"
  alt="Control Flow Graph diagram illustrating basic blocks and how program execution flows between them"
  style={{
    width: '100%',
    maxWidth: '400px',
    height: 'auto',
    display: 'block',
    margin: '0 auto'
  }}
/>

| From    | To      | Condition            |
| ------- | ------- | -------------------- |
| Block 1 | Block 2 | if `x > 0` (true)    |
| Block 1 | Block 3 | if `x <= 0` (false)  |
| Block 2 | Block 4 | sequential execution |
| Block 3 | Block 4 | sequential execution |


```cpp
      [Block 1]
      if (x > 0)
       /    \
      /      \
[Block 2]  [Block 3]
  y = 1      y = 2
      \      /
       \    /
      [Block 4]
     z = y + 3
```


</TabItem>
</Tabs>


<div>
    <AdBanner />
</div>


## LLVM/Clang: Inspect, Visualize, and Count Basic Blocks


Understanding basic blocks in **LLVM/Clang** is crucial for anyone working on compiler optimizations, code analysis, or performance tuning. Once we know what a basic block is and why it matters, the next step is to **inspect, visualize, and count them** in real programs.

###### Quick CLI Methods (no coding)

<Tabs>
  <TabItem value="Prerequisite" label="Things need to be installed">

<Tabs>
  <TabItem value="mac" label="">
  ***For MAC:***
    <ul>
      <li><strong>Clang / Clang++:</strong> <code>xcode-select --install</code></li>
      <li><strong>LLVM (for opt and passes):</strong> <code>brew install llvm</code></li>
      <li><strong>Graphviz (for .dot → image):</strong> <code>brew install graphviz</code></li>
      <li><strong>Terminal / Shell:</strong> Terminal app (pre-installed)</li>
    </ul>
  </TabItem>

  <TabItem value="linux" label="🐧">
    ***For linux:***
    <ul>
      <li><strong>Clang / Clang++:</strong> <code>sudo apt install clang</code></li>
      <li><strong>LLVM (for opt and passes):</strong> <code>sudo apt install llvm</code></li>
      <li><strong>Graphviz (for .dot → image):</strong> <code>sudo apt install graphviz</code></li>
      <li><strong>Terminal / Shell:</strong> Any terminal (gnome-terminal, konsole, etc.)</li>
    </ul>
  </TabItem>

  <TabItem value="windows" label="🪟">
  ***For Windows:***
    <ul>
      <li><strong>Clang / Clang++:</strong> Install LLVM from <a href="https://llvm.org/builds/" target="_blank">LLVM official site</a> and add to PATH</li>
      <li><strong>LLVM (for opt and passes):</strong> Included in LLVM installer</li>
      <li><strong>Graphviz (for .dot → image):</strong> Install from <a href="https://graphviz.org/download/" target="_blank">Graphviz official site</a> and add to PATH</li>
      <li><strong>Terminal / Shell:</strong> PowerShell, CMD, or Windows Terminal</li>
    </ul>
  </TabItem>
</Tabs>

</TabItem>
<TabItem value="source code to check" label="source code">

```cpp
//This simple program has branches, which will create multiple basic blocks
//  in LLVM IR.
// Just logic is simple we are checking if x is +ve or not
#include <iostream>
using namespace std;

int main() {
    int x = 5;
    if (x > 0) {
        cout << "Positive" << endl;
    } else {
        cout << "Non-positive" << endl;
    }
    cout << "Done" << endl;
    return 0;
}
```
:::caution code logic
This C++ program checks if a number x is positive or not. 
  - It first sets x = 5, then uses an if-else statement to print "Positive" if x > 0 or "Non-positive" otherwise. 
  - After that, it prints "Done" and exits. 
  - In LLVM IR terms, each part the condition check, the true branch, the false branch, and the final print forms a separate basic block.
:::

</TabItem>
<TabItem value="ir" label="Emit LLVM IR and generate cfg">

***Generate LLVM IR:***

```rust
clang++ -O0 -S -emit-llvm cfg.cpp -o cfg.ll
opt -passes="view-cfg,dot-cfg" cfg.ll  # This should create a hidden .main.dot file

# List all files including hidden ones to see the generated file
ls -a

# Rename the hidden dot file
mv .main.dot main_cfg.dot

# Convert to image
dot -Tpng main_cfg.dot -o main_cfg.png
```
import ZoomableImage from '@site/src/components/ZoomableImage';

:::tip This is how CFG will look like


<ZoomableImage
  src="/img/cfg_block.png"
  alt="Control Flow Graph diagram illustrating eg how ir cfg will look like"
/>

you can also use the other flag to experiment with the cfg as

```rust
$ opt --help | grep cfg
      --flattencfg                                                         - Flatten the CFG
      --simplifycfg                                                        - Simplify the CFG
      --structurizecfg                                                     - Structurize the CFG
      --wasm-cfg-sort                                                      - Reorders blocks in topological order
      --wasm-cfg-stackify                                                  - Insert BLOCK/LOOP/TRY/TRY_TABLE markers for WebAssembly scopes
  --cfg-hide-cold-paths=<number>                                        - Hide blocks with relative frequency below the given value
  --cfg-hide-deoptimize-paths                                           -
  --cfg-hide-unreachable-paths                                          -
  --dot-cfg-mssa=<file name for generated dot file>                     - file name for generated dot file
  --enable-loop-simplifycfg-term-folding                                -
  --hash-based-counter-split                                            - Rename counter variable of a comdat function based on cfg hash
```
:::tip To know all the passes opt have use
```rust
$ opt --print-passes
 opt --print-passes | grep cfg

  dot-cfg
  dot-cfg-only
  flatten-cfg
  print-cfg-sccs
  view-cfg
  view-cfg-only
  cfguard<check;dispatch>
  simplifycfg<no-forward-switch-cond;forward-switch-cond;no-switch-range-to-icmp;switch-range-to-icmp;no-switch-to-lookup;switch-to-lookup;no-keep-loops;keep-loops;no-hoist-common-insts;hoist-common-insts;no-sink-common-insts;sink-common-insts;bonus-inst-threshold=N>
  sroa<preserve-cfg;modify-cfg>
  structurizecfg<skip-uniform-regions>
  loop-simplifycfg
```
:::

:::



</TabItem>

</Tabs>

### Programmatic Method (C++ tool using LLVM APIs)

Here's how to create a ***C++ tool*** using ***LLVM APIs*** to programmatically count basic blocks:

<Tabs>
<TabItem value="Understand how LLVM work " label="llvm understanding" default>
LLVM represents code using a **well-defined hierarchical structure** that allows sophisticated analysis, transformation, and optimization. When you compile C++ code, LLVM first translates it into an **Intermediate Representation (IR)**, which preserves the operations and control flow in a structured format.

*The hierarchy works like this:*
<img
  src="/img/llvm_infra.svg"
  alt="WHat is llvm how to write llvm pass"
  style={{
    width: '100%',
    maxWidth: '400px',
    height: 'auto',
    display: 'block',
    margin: '0 auto'
  }}
/>
<details>
<summary><strong> LLVM INFRA </strong></summary>

Let's get an ***abstract level idea** of the components in an LLVM program:

- A Module in LLVM corresponds, approximately, to a single source file or more precisely, to a translation unit. 
> ***All other constructs live inside a Module.***

- Within a Module, the most important entities are Functions. These represent callable pieces of code, and in C++ both free functions and class methods map to LLVM Functions.

- A Function primarily consists of BasicBlocks. A basic block, well-known in compiler design, is simply a linear sequence of instructions with no internal branches control only enters at the beginning and exits at the end.

- Each Instruction represents a single low-level operation. The granularity is similar to machine instructions in a RISC architecture, such as integer addition, floating-point division, or writing a value to memory.

- In LLVM’s hierarchy, almost everything including Functions, BasicBlocks, and Instructions is derived from a common superclass named Value. 

- A Value denotes any computable entity: a literal constant (like 5), a global variable, or even the address of a piece of code.


<details>
<summary><strong> 1. **Module** – The top-level container for an entire translation unit (typically a C++ file).</strong> </summary>

   * Contains all **Functions**, global variables, and type definitions.
   * Think of it as a “project folder” containing everything needed for compilation.
</details>

<details>
<summary><strong> 2. **Function** – Represents a callable routine, like `main()` or helper functions. </strong></summary>

   * Each function is independent and has its own **control flow**.
   * Functions are made up of one or more **Basic Blocks**.
</details>
<details>
<summary><strong> 3. **Basic Block** – A straight-line sequence of instructions that **executes sequentially without branching** (except at the end).</strong></summary>

   * Ends with a **terminator instruction**, such as `ret` (return), `br` (branch), or `switch`.
   * Think of it as a single “paragraph” of instructions where control flows linearly.
</details>

<details>
<summary><strong> 4. **Instruction** – The smallest unit in LLVM IR.</strong></summary>

   * Performs specific operations such as arithmetic, memory access, or control flow changes.
   * Consists of:

     * **Opcode** – The operation being performed (e.g., `add`, `sub`, `load`, `store`, `br`, `ret`).
     * **Operands** – The inputs or data the instruction acts on (variables, constants, or results from other instructions).
   * Instructions are the building blocks that actually do the computation.
</details>
</details>
</TabItem>
<TabItem value="Algorithm to use " label="Algo and logic" default>
:::tip What We are Trying to Achieve

> :::caution **Q:**  
> We want to **analyze the control-flow structure** of a C++ program by counting how many **Basic Blocks** exist inside each **Function**.

:::important note
Since LLVM works on **LLVM IR**, not directly on C++, we first compile the C++ code into LLVM IR. Then, using the LLVM API, we load that IR and inspect its structure.
:::

:::note So the overall goal is:
* Take a C++ program
* Convert it into LLVM IR (because that’s the representation LLVM understands)
* Traverse the IR hierarchy:
  **Module → Function → Basic Block → Instruction**
* Count the **Basic Blocks** per Function and report them
:::


:::important **Here will  be the input and output**

- **Input:** Path to an LLVM IR file (`.ll` or `.bc`).
- **Output:** For each function in the IR, print its name and number of basic blocks.
:::
<Tabs>
<TabItem value="Algorithm: Count Basic Blocks using LLVM API" label="Algorithm: Count Basic Blocks using LLVM API" default>

<details>
<summary><strong> 1. **Start Program** </strong></summary>

   * Begin execution with `main(argc, argv)`.
</details>

<details>
<summary><strong> 2. **Check Command-Line Arguments** </strong></summary>

   * If no filename is provided (`argc < 2`):

     * Print usage message (`Usage: program <IR file>`).
     * Exit with error code.

</details>

<details>
<summary> <strong> 3. **Initialize LLVM Context** </strong></summary>

   * Create an `LLVMContext` (stores LLVM global state like types and constants).
   * Create an `SMDiagnostic` (used for error reporting during IR parsing).
</details>

<details>
<summary> <strong> 4. **Parse the IR File** </strong></summary>

   * Call `parseIRFile(argv[1], Err, Context)` to read the IR file into a `Module`.
   * If parsing fails:

     * Print the error using `Err.print()`.
     * Exit program.
</details>

<details>
<summary><strong> 5. **Traverse Functions**</strong></summary>

   * For each `Function` **F** inside the `Module`:

     * If the function is a **declaration only** (no body, e.g., `printf`), skip it.
</details>


<details>
<summary><strong> 6. **Count Basic Blocks** </strong></summary>

   * Initialize `bb_count = 0`.
   * For each `BasicBlock` **BB** inside function **F**:

     * Increment `bb_count`.

</details>

<details>
<summary><strong> 7. **Print Results** </strong></summary>

   * Print function name (`F.getName()`).
   * Print number of basic blocks (`bb_count`).
   * Print a separator line (`----------------------------------------`).
</details>

<details>
<summary><strong> 8. **End Program** </strong></summary>

   * Return success (0).
</details>

</TabItem>
<TabItem value="Pseudocode Representation" label="Pseudocode Representation" default>

```rust
Algorithm CountBasicBlocks
Input: LLVM IR file
Output: Number of Basic Blocks in each function

1. If no file is given:
       Print "Usage: program <IR file>"
       Exit

2. Initialize LLVMContext
3. Initialize error handler (SMDiagnostic)

4. Parse IR file into Module
   If failed:
       Print error
       Exit

5. For each Function F in Module:
       If F is declaration only:
           Continue to next function

       bb_count ← 0
       For each BasicBlock BB in F:
           bb_count ← bb_count + 1

       Print "Function: F.name"
       Print "Basic Blocks: bb_count"
       Print "----------------------------------------"

6. Exit successfully
```

</TabItem>

</Tabs>
</TabItem>
<TabItem value="LLVM API and function" label="API header" default>
<Tabs>

<TabItem value="Key LLVM Headers" label="Key LLVM Headers" default>


| **Header File**                         | **Represents**   | **Description**                                                                           |
| --------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------- |
| `#include "llvm/IR/Module.h"`           | **Module**       | Represents the whole program IR (translation unit).                                       |
| `#include "llvm/IR/Function.h"`         | **Function**     | Each function definition inside the module.                                               |
| `#include "llvm/IR/BasicBlock.h"`       | **Basic Block**  | A straight-line sequence of code with single entry and exit.                              |
| `#include "llvm/IR/Instruction.h"`      | **Instruction**  | Provides access to individual operations (like add, store, load).                         |
| `#include "llvm/Support/raw_ostream.h"` | **raw\_ostream** | LLVM’s output stream for printing/debugging (similar to `std::cout`, but LLVM-optimized). |
  

</TabItem>

<TabItem value="Example APIs to Use" label="Example APIs to Use" default>
<details>
<summary><strong> **1. Load IR** </strong></summary>

APIs:  
- `llvm::parseIRFile()` → Parse textual `.ll` file into a `Module`.  
- `llvm::parseBitcodeFile()` → Parse binary `.bc` file.  

```cpp
llvm::LLVMContext Context;
llvm::SMDiagnostic Err;
std::unique_ptr<llvm::Module> M = llvm::parseIRFile("input.ll", Err, Context);
```
</details>


<details>
<summary><strong> **2. Traverse Functions**</strong></summary>

APIs:
* `Module::getFunctionList()` → Get list of all functions in the module.
* Iteration style: range-based `for`.
```cpp
for (llvm::Function &F : *M) {
    if (!F.isDeclaration()) {  // Skip external declarations
        // Process function here
    }
}
```
</details>

<details>
<summary><strong> **3. Traverse Basic Blocks**</strong></summary>

APIs:
* `Function::getBasicBlockList()` → Get list of all basic blocks inside a function.

```cpp
for (llvm::BasicBlock &BB : F) {
    // Process each basic block
}
```
</details>

<details>
<summary><strong> **4. Traverse Instructions**</strong></summary>

APIs:
* `BasicBlock::getInstList()` → Get list of instructions inside a block.
* Each element is an `Instruction`.

```cpp
for (llvm::Instruction &I : BB) {
    // Process each instruction
}
```
</details>

<details>
<summary><strong> **5. Apply Analysis / Transformation**</strong></summary>

Useful APIs:

* `I.getOpcode()` → Numeric ID of the instruction’s operation.
* `I.getOpcodeName()` → String name of the instruction (e.g., "add", "mul").
* `I.getOperand(i)` → Access operands of an instruction.
* `llvm::IRBuilder<>` → Utility for creating new IR instructions.
* `I.eraseFromParent()` → Remove an instruction.

```cpp
if (llvm::isa<llvm::BinaryOperator>(&I)) {
    llvm::outs() << "Binary op: " << I.getOpcodeName() << "\n";
}
```
</details>
</TabItem>
</Tabs>

</TabItem>
<TabItem value="Implementation of the Function" label="Code" default>
Here is the complete implementation of the LLVM Function

```cpp
#include "llvm/IR/LLVMContext.h"      // Core LLVM context for IR objects
#include "llvm/IR/Module.h"           // Represents the whole IR module (translation unit)
#include "llvm/IRReader/IRReader.h"   // For reading LLVM IR from a file
#include "llvm/Support/SourceMgr.h"   // Error handling while parsing IR
#include "llvm/Support/raw_ostream.h" // LLVM's own output stream (like std::cout)

using namespace llvm;

int main(int argc, char **argv) {
    // Check if an input IR file is provided
    if (argc < 2) {
        errs() << "Usage: " << argv[0] << " <IR file>\n";
        return 1;
    }

    LLVMContext Context;   // Stores LLVM's global data (types, constants, etc.)
    SMDiagnostic Err;      // For capturing parsing errors

    // Parse the given IR file into a Module
    std::unique_ptr<Module> Mod = parseIRFile(argv[1], Err, Context);
    if (!Mod) {
        // Print error if parsing fails
        Err.print(argv[0], errs());
        return 1;
    }

    // Iterate through all functions in the module
    for (Function &F : *Mod) {
        if (F.isDeclaration()) continue; // Skip functions without a body (like external declarations)

        int bb_count = 0;

        // Count all basic blocks inside this function
        for (BasicBlock &BB : F) {
            bb_count++;
        }

        // Print function name and number of basic blocks
        errs() << "Function: " << F.getName() << "\n";
        errs() << "Basic Blocks: " << bb_count << "\n";
        errs() << "----------------------------------------\n";
    }

    return 0;
}
```

</TabItem>
<TabItem value="How To run " label="how to Build and Run" default>
To build and run the `bb_counter` tool:

1. **Compile the code with LLVM libraries**

   * You must tell the compiler where to find LLVM headers and which LLVM libraries to link against.
   * The `llvm-config` utility makes this easier by providing the correct include paths, linker flags, and libraries.

   Generic form:

   ```rust
   clang++ -I `llvm-config --includedir` bb_counter.cpp -o bb_counter \
       `llvm-config --ldflags --libs core irreader support`
   ```
<details>
<summary>clang++</summary>

`clang++` is the LLVM-based C++ compiler.  
We use it instead of `g++` here since it aligns naturally with LLVM libraries.
</details>
 <details>
<summary> -I `llvm-config --includedir`</summary>

- `-I` adds an **include directory** to the compiler search path.  
- `` `llvm-config --includedir` `` executes `llvm-config`, which prints the path to LLVM's **header files** (like `llvm/IR/...`).  
👉 This ensures the compiler finds LLVM’s header files during compilation.
</details>

<details>
<summary> bb_counter.cpp</summary>

This is the **source file** you are compiling.  
It contains your code (e.g., LLVM pass or IR analysis tool).
</details>

<details>
<summary> -o bb_counter</summary>

Specifies the **output binary name**.  
The compiled program will be created as `bb_counter`.
</details>

<details>
<summary> `llvm-config --ldflags`</summary>

Provides the **linker flags** needed for LLVM.  
For example: rpath settings, `-L` paths where LLVM libraries are installed.  
👉 Ensures the linker can find LLVM libraries at link time.
</details>

<details>
<summary> `llvm-config --libs core irreader support`</summary>

- Tells the linker **which LLVM libraries to link against**.  
- `core` → Core LLVM IR classes & utilities.  
- `irreader` → Support for parsing `.ll` or `.bc` files into LLVM IR.  
- `support` → Common utility functions (command-line handling, error mgmt, etc.).  
👉 Without these, the compiler would complain about undefined references.
</details>

2. **Run the tool**

   * The tool expects an LLVM IR file (`.ll` or `.bc`) as input.
   * If you run it without arguments, it shows usage instructions.

   Example:

   ```rust
   ./bb_counter test.ll
   ```

3. **Alternative: Build with CMake**

   * Instead of a raw compile command, you can integrate with CMake using `find_package(LLVM)`.
   * This makes your project portable across systems.

<Tabs>

<TabItem value="on the mac " label="" default>

  **On macOS**

  ```rust
  clang++ -I `llvm-config --includedir` bb_counter.cpp -o bb_counter \
      `llvm-config --ldflags --libs core irreader support`
  ./bb_counter test.ll
```

</TabItem>
<TabItem value="on the linux " label="🐧" default>

**on the linux**

```rust
clang++ -I `llvm-config --includedir` bb_counter.cpp -o bb_counter \
    `llvm-config --ldflags --libs core irreader support`
./bb_counter test.ll
```


</TabItem>
<TabItem value="on the window " label="🪟" default>

**on the window**

```rust
clang++ bb_counter.cpp -o bb_counter.exe ^
    -I "%LLVM_DIR%\include" ^
    -L "%LLVM_DIR%\lib" -lLLVMCore -lLLVMSupport -lLLVMIRReader
.\bb_counter.exe test.ll
```


</TabItem>
  <TabItem value="cmake " label="⚙️ CMake">

```rust
cmake_minimum_required(VERSION 3.13)
project(bb_counter LANGUAGES C CXX)

# ---------------------------------
# 1. Find LLVM
# ---------------------------------
find_package(LLVM REQUIRED CONFIG)

# Print LLVM version and LLVM_DIR for debugging
message(STATUS "Found LLVM ${LLVM_PACKAGE_VERSION}")
message(STATUS "Using LLVMConfig.cmake in: ${LLVM_DIR}")

# Include LLVM headers
include_directories(${LLVM_INCLUDE_DIRS})
add_definitions(${LLVM_DEFINITIONS})

# Require C++17 (LLVM >= 15 generally expects this)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ---------------------------------
# 2. Define Target
# ---------------------------------
add_executable(bb_counter bb_counter.cpp)

# Link required LLVM components
target_link_libraries(bb_counter
    LLVMCore
    LLVMIRReader
    LLVMSupport
)

# ---------------------------------
# 3. OS-Specific Handling
# ---------------------------------
if(WIN32)
    # ---------------- Windows ----------------
    add_definitions(-D_CRT_SECURE_NO_WARNINGS)

    # Some LLVM builds on Windows need extra system libraries
    target_link_libraries(bb_counter
        shlwapi
        version
    )

elseif(APPLE)
    # ---------------- macOS ----------------
    # If installed via Homebrew, libraries are in /opt/homebrew/opt/llvm/lib
    set_target_properties(bb_counter PROPERTIES
        BUILD_RPATH "${LLVM_LIBRARY_DIRS}"
        INSTALL_RPATH "${LLVM_LIBRARY_DIRS}"
    )

elseif(UNIX)
    # ---------------- Linux ----------------
    # Add runtime path so the binary can find LLVM .so files
    set_target_properties(bb_counter PROPERTIES
        BUILD_RPATH "${LLVM_LIBRARY_DIRS}"
        INSTALL_RPATH "${LLVM_LIBRARY_DIRS}"
    )

    # On some Linux distros, you may also need zlib, pthread, tinfo, dl, m
    target_link_libraries(bb_counter
        z
        pthread
        tinfo
        dl
        m
    )
endif()

```
Build and run:

```rust
mkdir build && cd build
cmake ..
make
./bb_counter ../test.ll
```
</TabItem>
</Tabs>
</TabItem>
</Tabs>


<div>
  <AdBanner/>
</div>

## What Next
In this article, we understood what basic blocks are, why they matter, and how to inspect and visualize them using LLVM/Clang.

👉 In the next article, we’ll take this one step further   you’ll learn how to add your own Basic Block analysis as an LLVM plugin.
We’ll cover:
- How LLVM’s pass/plugin system works
- Writing a simple analysis pass for counting basic blocks
- Registering it as a plugin
Running it with opt

So stay tuned   this is where theory meets practice!

## FAQ
<ComicQA
  question="1) What is a Basic Block in LLVM?"
  answer="A Basic Block is a straight-line sequence of instructions with no branches in except to the entry and no branches out except at the exit."
  code={`; Example LLVM IR
entry:
  %a = add i32 %x, %y
  br label %next`}
  example="// Think of it as one uninterrupted path of code."
  whenToUse="When analyzing control flow or optimization passes."
/>

<ComicQA
  question="2) Why are Basic Blocks important?"
  answer="They are the fundamental units of control flow in a program and form the nodes of a Control Flow Graph (CFG)."
  code={`// C++ if-statement splits into 3 blocks
if (x > 0) { ... } else { ... }`}
  example="// Each branch creates a new basic block."
  whenToUse="When you want to understand branching and program flow."
/>

<ComicQA
  question="3) How does LLVM represent Basic Blocks?"
  answer="LLVM IR represents Basic Blocks with labels followed by instructions, ending with a terminator (like br or ret)."
  code={`bb1:
  %1 = add i32 %a, %b
  br label %bb2`}
  example="// Labels mark block boundaries."
  whenToUse="When traversing LLVM IR programmatically."
/>


<ComicQA
  question="4) What’s the difference between a Basic Block and a Function?"
  answer="A Function contains multiple Basic Blocks, but a Basic Block cannot contain another Function."
  code={`define i32 @foo(i32 %x) {
entry: 
  %y = add i32 %x, 1
  ret i32 %y
}`}
  example="// Function is the container, blocks are the building units."
  whenToUse="When explaining program structure hierarchy."
/>

<ComicQA
  question="5) Can one instruction belong to two Basic Blocks?"
  answer="No. An instruction belongs to exactly one Basic Block."
  code={`// Each block owns its instructions
bb1: %1 = add i32 %a, %b`}
  example="// Ownership is strict."
  whenToUse="When iterating over instructions in LLVM APIs."
/>

<ComicQA
  question="6) How do branches affect Basic Blocks?"
  answer="Conditional and unconditional branches terminate a block and create successors."
  code={`br i1 %cond, label %iftrue, label %iffalse`}
  example="// Each branch target becomes a new block."
  whenToUse="When constructing or analyzing CFGs."
/>

<ComicQA
  question="7) Can a Basic Block exist without a terminator?"
  answer="No. Every Basic Block must end with a terminator instruction (ret, br, switch)."
  code={`ret i32 0`}
  example="// Terminator defines exit of the block."
  whenToUse="When validating correctness of LLVM IR."
/>

<ComicQA
  question="8) How can I programmatically count Basic Blocks in LLVM C++ API?"
  answer="By iterating over each Function and then over each BasicBlock inside it."
  code={`for (auto &F : M)
  for (auto &BB : F)
    count++;`}
  example="// Double loop: Functions → Blocks."
  whenToUse="When building analysis tools or research projects."
/>


<Tabs>
  <TabItem value="docs" label="📚 Documentation">
             - [CompilerSutra Home](https://compilersutra.com)
                - [CompilerSutra Homepage (Alt)](https://compilersutra.com/)
                - [Getting Started Guide](https://compilersutra.com/get-started)
                - [Newsletter Signup](https://compilersutra.com/newsletter)
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

  <TabItem value="Courses" label="📣 Explore Cirriculum">
            - [GPU Programming from non CS to Expert](https://www.compilersutra.com/docs/gpu/gpu_programming/gpu_programming_toc/)
            - [C++ Tutorial](https://www.compilersutra.com/docs/c++/cpp-learning-roadmap)
  </TabItem>
  <TabItem value="social" label="📣 Social Media">

    - [🐦 Twitter - CompilerSutra](https://twitter.com/CompilerSutra)  
    - [💼 LinkedIn - Abhinav](https://www.linkedin.com/in/abhinavcompilerllvm/)  
    - [📺 YouTube - CompilerSutra](https://www.youtube.com/@compilersutra)  
    - [📘 Facebook - CompilerSutra](https://www.facebook.com/profile.php?id=61577245012547)  
    - [📝 Quora - CompilerSutra](https://compilersutra.quora.com/)  


  </TabItem>
</Tabs>
