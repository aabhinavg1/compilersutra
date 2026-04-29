---
title: "Dominator Trees, Dominance Frontiers, and PHI Nodes"
description: "Learn how modern compilers build SSA using dominators, dominator trees, dominance frontiers, and PHI-node placement. A practical LLVM-oriented guide connecting CFGs, SSA construction, and optimization reasoning."
keywords:
- dominator tree
- dominance frontier
- phi nodes
- phi functions
- SSA construction
- LLVM dominators
- LLVM SSA
- control flow graph
- CFG
- compiler design
- compiler optimization
- LLVM IR
- static single assignment
- mem2reg
- immediate dominator
- compiler analysis
- data flow analysis
- control flow analysis
- compiler internals
- LLVM tutorial
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import LlvmSeoBooster from '@site/src/components/llvm/LlvmSeoBooster';



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

<div>
    <AdBanner />
</div>

# Dominator Trees, Dominance Frontiers, and PHI Nodes

###### Before we begin

If you are hearing the word `dominance` for the first time, do not start with the formal definition.
Start with a very simple question:

> Before the program reaches one ***block*** (In compiler theory, a basic block is a straight-line sequence of instructions with no jumps in or out except at the start and end.), is there some other block it must pass through first?

That is the entire idea.

**A very small example**

```cpp
int value = 0;

if (flag) {
    value = 10;
}

return value;
```

Here is the simplified control-flow graph:

```text
     entry
       |
       v
    if(flag)
    /      \
   v        v
 then     merge
    \      /
     v    v
     return
```

Now look at the graph slowly:

- every path starts from `entry`
- before the program can go to `then`, it must first pass through `if(flag)`
- before the program can reach `merge`, it must also pass through `if(flag)`
- but the program can reach `merge` without going through `then`

So:

- `entry` dominates `if(flag)`, `then`, `merge`, and `return`
- `if(flag)` dominates `then`, `merge`, and `return`
- `then` does **not** dominate `merge`

:::tip What is dominance?

We have discussed that ***In compiler theory, a basic block is a straight-line sequence of instructions with no jumps in or out except at the start and end.***

Now dominance becomes simple:

- if the program must go through block `A` before it can reach block `B`
- then block `A` dominates block `B`

**Simple snippet**

```cpp
if (x > 0) {
    y = 1;
} else {
    y = 2;
}
print(y);
```

Let say we have:

- `A` = the block that checks `if (x > 0)`
- `B` = the `then` block where `y = 1`
- `C` = the `else` block where `y = 2`
- `D` = the block after the `if-else` where `print(y)` happens

The control-flow graph looks like this:

```text
        A
      /   \
     v     v
     B     C
      \   /
       v v
        D
```

Now we can explain dominance very easily:

- `A` dominates `B`, because to enter `B` the program must go through `A`
- `A` dominates `C`, because to enter `C` the program must go through `A`
- `A` dominates `D`, because whether the program goes to `B` or `C`, it still must pass through `A` first

Now let us see what is **not** dominance:

- `B` does **not** dominate `D`, because the program can reach `D` through `C`
- `C` does **not** dominate `D`, because the program can reach `D` through `B`

So even though both `B` and `C` can reach `D`, neither of them dominates `D`.

Or in one line:

> `A` dominates `B` when `A` always comes before `B` on every possible path.
:::

Why is this useful?

Because compilers do not just care about the order of lines in the source file.
They care about **all possible paths** the program may take at runtime.

That is why dominance becomes one of the core ideas behind:

- control-flow reasoning
- SSA construction
- PHI-node placement
- many compiler optimizations

:::tip A good mental shortcut
Dominance means: "this block is guaranteed to happen before that block on every possible path."
:::

In the previous CompilerSutra LLVM articles, we already built the right foundation:

- [Basic Blocks](https://www.compilersutra.com/docs/compilers/basic_block_in_compiler/)
- [LLVM IR](https://www.compilersutra.com/docs/llvm/llvm_ir/intro_to_llvm_ir/)
- [SSA Part 1](https://www.compilersutra.com/docs/llvm/llvm_Curriculum/level0/Static_Single_Assignment/)
- [SSA Part 2](https://www.compilersutra.com/docs/llvm/llvm_Curriculum/level0/Static_Single_Assignment_part2/)

Those articles explain **what SSA is** and **why compilers want it**.

This article answers the next question:

:::caution The real compiler question
If SSA needs `PHI` nodes at merge points, how does the compiler know exactly **where** those merge points are?
:::

The answer is not guesswork.
It comes from three connected ideas:

- **dominance**
- **dominator trees**
- **dominance frontiers**

Together, they tell the compiler where values remain guaranteed, where control-flow paths merge, and where SSA must introduce `PHI` nodes to preserve correctness.

<Tabs>
  <TabItem value="social" label="📣 Social Media">
    - [🐦 Twitter - CompilerSutra](https://twitter.com/CompilerSutra)
    - [💼 LinkedIn - Abhinav](https://www.linkedin.com/in/abhinavcompilerllvm/)
    - [📺 YouTube - CompilerSutra](https://www.youtube.com/@compilersutra)
    - [💬 Join the CompilerSutra Discord for discussions](https://discord.gg/DXJFhvzz3K)
  </TabItem>

  <TabItem value="contact" label="✉️ Contact Us">
    - Email: [osc@compilersutra.com](mailto:osc@compilersutra.com)
    - Feedback / Queries: Use our mail us for suggestions or issues.
  </TabItem>
</Tabs>

<LlvmSeoBooster topic="dominator-tree" />


<div>
    <AdBanner />
</div>

## Table of Contents

1. [Why Dominance Exists](#why-dominance-exists)
2. [Control-Flow Graph Refresher](#control-flow-graph-refresher)
3. [What It Means for One Block to Dominate Another](#what-it-means-for-one-block-to-dominate-another)
4. [Immediate Dominators and the Dominator Tree](#immediate-dominators-and-the-dominator-tree)
5. [Where Dominance Stops Being Enough](#where-dominance-stops-being-enough)
6. [Dominance Frontier: The Boundary of Merging Control Flow](#dominance-frontier-the-boundary-of-merging-control-flow)
7. [Why PHI Nodes Appear There](#why-phi-nodes-appear-there)
8. [Worked Example: From CFG to SSA](#worked-example-from-cfg-to-ssa)
9. [LLVM Connection: `mem2reg`, `opt`, and Real Passes](#llvm-connection-mem2reg-opt-and-real-passes)
10. [Mental Model to Remember](#mental-model-to-remember)
11. [What Next](#what-next)

## Why Dominance Exists

Compilers do not optimize raw source code directly.
They reason over a **control-flow graph (CFG)**, where:

- nodes are basic blocks
- edges represent possible transfer of control

Once a program becomes a CFG, the compiler needs precise answers to questions like:

- Does block `A` always execute before block `B`?
- Which definitions can reach this use?
- Where do two different definitions meet again?
- At which merge point must SSA create a `PHI` node?

Dominance was invented to answer exactly these questions.

:::tip Intuition
If every possible path to a block must pass through another block first, then that first block has structural authority over the second one.
:::

## Control-Flow Graph Refresher

<Tabs>
  <TabItem value="concept" label="Concept" default>

Consider this program:

```cpp
int foo(int x, int y, bool cond) {
    int z;

    if (cond) {
        z = x + 1;
    } else {
        z = y + 1;
    }

    return z * 2;
}
```

Its simplified CFG looks like this:

```text
        entry
          |
          v
        cond?
       /     \
      v       v
   then      else
      \       /
       v     v
        merge
          |
          v
         exit
```

This graph already tells us something important:

- `then` and `else` are different paths
- `merge` is where control flow becomes one path again

That merge is exactly where SSA starts asking whether a `PHI` node is required.
  </TabItem>

  <TabItem value="llvm" label="See CFG in LLVM">

You can inspect the CFG using LLVM tools.

###### Step 1: Write the source file

```cpp
int foo(int x, int y, bool cond) {
    int z;

    if (cond) {
        z = x + 1;
    } else {
        z = y + 1;
    }

    return z * 2;
}
```

###### Step 2: Generate LLVM IR

```bash
clang -O0 -S -emit-llvm foo.cpp -o foo.ll
```

###### Step 3: Ask LLVM to dump CFG graphs

```bash
opt -passes=dot-cfg -disable-output foo.ll
```

For this example, LLVM generated this dot file:

```bash
._Z3fooiib.dot
```

###### Step 4: Open the graph with Graphviz

```bash
dot -Tpng ._Z3fooiib.dot -o foo-cfg.png
```

Now you can visually inspect:

- entry block
- branch blocks
- merge block
- outgoing edges between blocks

Here is the generated CFG image:

<img
  src="/img/foo-cfg.png"
  alt="LLVM generated control flow graph for the foo example"
  style={{
    width: '100%',
    maxWidth: '700px',
    height: 'auto',
    display: 'block',
    margin: '1rem auto'
  }}
/>

:::tip Quick note
If `opt -passes=dot-cfg` does not work in your LLVM version, older builds may use legacy flags such as `opt -dot-cfg foo.ll`.
:::
  </TabItem>
</Tabs>

## What It Means for One Block to Dominate Another

A simple way to think about dominance is this:

> If you want to reach block `B`, and there is no way to do that without first passing through block `A`, then `A` dominates `B`.

Let us use the CFG above and check it slowly.

To reach `then`, the program must first go through `cond?`.
So:

- `cond?` dominates `then`

To reach `else`, the program must also first go through `cond?`.
So:

- `cond?` dominates `else`

Now look at `merge`.
There are two ways to reach it:

- `entry -> cond? -> then -> merge`
- `entry -> cond? -> else -> merge`

In both paths, the program passes through `cond?`.
So:

- `cond?` dominates `merge`

But `then` does **not** dominate `merge`.
Why?

Because there is another valid path to `merge`:

- `entry -> cond? -> else -> merge`

This path reaches `merge` without touching `then`.
So `then` cannot dominate `merge`.

The same logic applies to `else`:

- `else` does **not** dominate `merge`

because the program can reach `merge` through `then`.

So for this CFG:

- `entry` dominates every block
- `cond?` dominates `then`, `else`, and `merge`
- `then` does not dominate `merge`
- `else` does not dominate `merge`

The easiest test is:

- if even **one path** can skip `A` and still reach `B`, then `A` does **not** dominate `B`

:::important Practical meaning
Dominance tells the compiler where a value or decision is guaranteed to have happened before some later point in the program.
:::

## Immediate Dominators and the Dominator Tree

If several blocks dominate a block, the compiler cares most about the **closest** such block.
That closest strict dominator is called the **immediate dominator**.

For a block `B`, the immediate dominator `idom(B)` is:

- a dominator of `B`
- not equal to `B`
- the nearest dominator on all paths from entry to `B`

Using the same CFG:

- `idom(cond?) = entry`
- `idom(then) = cond?`
- `idom(else) = cond?`
- `idom(merge) = cond?`
- `idom(exit) = merge`

From immediate dominators we can build the **dominator tree**:

```text
entry
└── cond?
    ├── then
    ├── else
    └── merge
        └── exit
```

You can read this tree in a simple way:

- `entry` is at the top because every path starts there
- `cond?` comes next because it is the next guaranteed block
- `then` and `else` sit under `cond?` because both branches happen only after the condition
- `merge` also sits under `cond?` because every path to `merge` still passes through `cond?`

The dominator tree is valuable because it compresses a global property of the CFG into a tree structure that many compiler analyses can traverse efficiently.

:::caution Why compilers like this
Once the compiler has the dominator tree, many questions about SSA construction, loop detection, dataflow reasoning, and optimization order become much easier to answer.
:::

And soon we will see how LLVM uses this structure while building SSA-friendly IR.


<div>
    <AdBanner />
</div>

## Where Dominance Stops Being Enough

Dominance alone tells us what is guaranteed.
But SSA also needs to know where **multiple definitions meet**.

Suppose:

```cpp
int z;
if (cond) {
    z = x + 1;
} else {
    z = y + 1;
}
return z * 2;
```

There are two assignments:

- one in `then`
- one in `else`

At the `return`, which definition of `z` should be used?

The answer is: it depends on the path taken.

So dominance is not enough by itself.
The compiler needs the **boundary where a definition stops dominating all future uses unambiguously**.

That boundary is the **dominance frontier**.

## Dominance Frontier: The Boundary of Merging Control Flow

The **dominance frontier** of a block `A` is the set of blocks `B` such that:

- `A` dominates at least one predecessor of `B`
- but `A` does not strictly dominate `B`

This sounds abstract, but the intuition is clean:

:::tip Mental picture
The dominance frontier of a block is where its influence reaches a merge point, but no longer fully controls what happens after that merge.
:::

Think about this shape:

```text
        cond?
       /     \
      v       v
   then      else
      \       /
       v     v
        merge
```

For the earlier example:

- `then` contributes one definition of `z`
- `else` contributes another definition of `z`
- both flow into `merge`

So `merge` lies in the dominance frontier of both `then` and `else`.

Why is `merge` special?

- it is reachable from `then`
- it is also reachable from `else`
- but neither `then` nor `else` fully controls it
- it is the first place where both values can meet

So the dominance frontier is easier to think of as:

> the first meeting point where different paths bring different definitions together

And that is exactly where SSA needs:

```llvm
%z3 = phi i32 [ %z1, %then ], [ %z2, %else ]
```

Soon we will see how LLVM detects exactly this kind of situation and inserts the right SSA value merge.

## Why PHI Nodes Appear There

A `PHI` node means:

> “Choose the value based on which predecessor block control came from.”

That is why `PHI` nodes belong at merge points, not at arbitrary places.

The compiler places a `PHI` node when:

- the same variable has multiple reaching definitions
- those definitions can meet at a block
- that block is in the relevant dominance frontier

In other words:

- **dominators** tell us what definitely came before
- **dominance frontiers** tell us where different definitions start competing
- **PHI nodes** make that competition explicit in SSA

## Worked Example: From CFG to SSA

Let us make the full progression explicit with a standard `if-else` assignment.

### 1. The source code

```cpp
int foo(int a, int b, bool cond) {
    int x = 0;

    if (cond) {
        x = a + 1;
    } else {
        x = b + 1;
    }

    return x * 2;
}
```

### 2. What is the problem?

The variable `x` is assigned:

- once before the branch
- once in the `then` block
- once in the `else` block

At the `return`, the compiler must know which assignment reaches that use.

### 3. Look at the CFG

```text
entry
  |
  v
cond?
/   \
v   v
T   E
\   /
 v v
merge
  |
  v
exit
```

### 4. What matters structurally?

- `entry` dominates everything
- `cond?` dominates `T`, `E`, and `merge`
- neither `T` nor `E` dominates `merge`

### 5. Where do the values meet?

`merge` is in the dominance frontier of both `T` and `E`.

That is the signal that a `PHI` node is needed there.

You can think of `merge` as the first block where the compiler must stop and ask:

> Which value of `x` should be used now?

### 6. The resulting SSA form

```python
entry:
  br i1 %cond, label %then, label %else

then:
  %x1 = add i32 %a, 1
  br label %merge

else:
  %x2 = add i32 %b, 1
  br label %merge

merge:
  %x3 = phi i32 [ %x1, %then ], [ %x2, %else ]
  %x4 = mul i32 %x3, 2
  ret i32 %x4
```

### 7. Read the result

Now the dataflow is explicit:

- `%x1` belongs to `then`
- `%x2` belongs to `else`
- `%x3` merges them
- `%x4` uses the merged value

There is no ambiguity left for the optimizer.

This is the exact point where the theory becomes practical.
Soon we will connect this directly to how LLVM handles it in passes such as `mem2reg`.

## LLVM Connection: `mem2reg`, `opt`, and Real Passes

In LLVM, a classic example of SSA construction is the `mem2reg` transformation.

When frontend-generated IR uses stack slots through `alloca`, `load`, and `store`, LLVM can often promote those stack variables into SSA registers.

That promotion requires:

- finding definitions
- computing dominance relationships
- placing `PHI` nodes correctly
- renaming uses to the right SSA values

Conceptually, this is the same transformation we just walked through by hand.

So the hand-worked example above is not just for learning.
It is a small version of what LLVM really does internally.

### Before promotion

```llvm
%x = alloca i32
store i32 0, ptr %x
br i1 %cond, label %then, label %else
```

### After SSA promotion

The variable stops living in memory and starts living as SSA values with `PHI` nodes where needed.

That is why understanding dominators is not theory for theory’s sake.
It directly explains how LLVM turns memory-like variable usage into analyzable IR.

:::important Real compiler payoff
Once values are in SSA form, passes like constant propagation, dead code elimination, GVN, SCCP, and loop optimizations become much simpler and more precise.
:::

## Mental Model to Remember

If you want one compact mental model, keep this:

- **Basic blocks** divide straight-line execution
- **CFG** captures possible paths between blocks
- **Dominance** tells which blocks must happen before others
- **Dominator tree** organizes that guarantee structurally
- **Dominance frontier** marks merge boundaries of competing definitions
- **PHI nodes** resolve those competing definitions in SSA

Or even shorter:

> Dominators explain certainty. Dominance frontiers explain ambiguity. PHI nodes resolve that ambiguity.

## What Next

This article sits in the exact bridge between introductory compiler structure and real optimization engineering.

From here, the most natural next CompilerSutra articles are:

- `Control Flow Graphs (CFG)` as a dedicated standalone article
- `mem2reg` and stack-to-register promotion in LLVM
- `Data Flow Analysis in LLVM`
- `Liveness Analysis`
- `Loop Optimizations using Dominator Information`

If you understand this article well, you are now ready to read LLVM passes with much less confusion.

<div>
    <AdBanner />
</div>



# More



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
        - [From Source Code to Binary](https://compilersutra.com/docs/compilers/sourcecode_to_executable)
        - [Basic Blocks in Compiler](https://compilersutra.com/docs/compilers/basic_block_in_compiler)
        - [IR in Compiler](https://compilersutra.com/docs/compilers/ir_in_compiler)
        - [OpenCL for GPU Programming](https://compilersutra.com/docs/gpu/opencl)
        - [LLVM Introduction](https://compilersutra.com/docs/llvm/intro-to-llvm)
        - [LLVM IR Explained](https://compilersutra.com/docs/llvm/llvm_ir/intro_to_llvm_ir)
        - [SSA Part 1](https://compilersutra.com/docs/llvm/llvm_Curriculum/level0/Static_Single_Assignment)
        - [SSA Part 2](https://compilersutra.com/docs/llvm/llvm_Curriculum/level0/Static_Single_Assignment_part2)
        - [LLVM Architecture](https://compilersutra.com/docs/llvm/llvm_basic/LLVM_Architecture)
        - [What Is LLVM](https://compilersutra.com/docs/llvm/llvm_basic/What_is_LLVM)
        - [Why LLVM](https://compilersutra.com/docs/llvm/llvm_basic/Why_LLVM)
        - [LLVM Passes Introduction](https://compilersutra.com/docs/llvm/Intermediate/What_Is_LLVM_Passes)
        - [LLVM Tools](https://compilersutra.com/docs/llvm/llvm_tools/llvm_tools)
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
