---
title: "Finding the First Point of Divergence: A Pass-Level Trace of a 2D Stencil Loop"
description: "A pass-by-pass investigation of a 2D stencil loop to find the first compiler dump where GCC and Clang visibly diverge in loop representation."
keywords:
  - gcc vs clang stencil loop
  - gcc clang loop representation
  - first pass divergence gcc clang
  - tree-ssa-loop-ivopts analysis
  - gcc ivopts vs clang gep
  - gcc vs clang benchmark 2026
  - gcc vs clang performance comparison linux
  - gcc vs clang o3 performance benchmark
  - gcc vs clang which is faster c++
  - real world c++ compiler benchmark gcc vs clang
  - g++ vs clang++ performance comparison
  - clang vs gcc performance on amd cpu
  - c++ compiler optimization benchmark o3
  - compiler performance comparison c++ linux
  - gcc vs clang branch prediction performance
  - gcc vs clang cache performance benchmark
  - ipc and instruction count compiler analysis
  - hardware performance counters perf linux c++
  - linux perf benchmark gcc vs clang
  - compiler optimization impact on ipc and cache
  - csperf compiler benchmark tool gcc vs clang
  - compilersutra perf tool benchmark
  - compiler_diff_batch gcc vs clang workflow
  - stencil vs branch workload compiler performance
  - memory bound vs compute bound compiler benchmark
  - gcc vs clang stencil benchmark assembly analysis
  - branch heavy loop optimization gcc vs clang
  - why clang faster than gcc in some cases
  - gcc vs clang real world performance difference
  - compiler optimization case study c++
  - assembly comparison gcc vs clang hot loops
  - instruction count comparison gcc vs clang
  - gcc vs clang instruction scheduling differences
  - register allocation gcc vs clang comparison
  - loop unrolling gcc vs clang assembly
  - cache behavior stencil computation compiler optimization
  - memory access pattern gcc vs clang
  - branch misprediction optimization gcc vs clang
  - redundant sign extension gcc assembly issue
  - compiler backend optimization differences llvm vs gcc11
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import AdBanner from '@site/src/components/AdBanner';

# Finding the First Point of Divergence: A Pass-Level Trace of a 2D Stencil Loop

GCC stops treating this stencil loop as an index-based computation at `ivopts`, while Clang does not.
That is the first structural divergence, and the pass dumps prove it.

This article is about that proof:

- dump the pipelines
- compare the hot loop pass by pass
- stop at the first point where the loop stops having the same shape

This article depends on the earlier pieces that established the runtime gap and the later-stage code differences:

- [**GCC vs Clang: A 10-Case Compiler Benchmark Report (2026)**](/docs/articles/gcc_vs_clang_real_benchmarks_2026_reporter)
- [**GCC vs Clang, Part 2A: Assembly Deep-Dive on 3 Key Benchmark Cases**](/docs/articles/gcc_vs_clang_assembly_part2a)
- [**GCC vs Clang (2026): Why GCC is 24% Faster on a 2D Stencil (IR + Pass-Level Proof)**](/docs/articles/gcc_vs_clang_stencil_ir_passes_part2b)

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

## 1. Setting the Problem

The kernel is the `2D stencil` loop from:

- <a href="/files/articles/gcc_vs_clang_cases/stencil_2d.cpp" target="_blank">stencil_2d.cpp</a>

```cpp
for (std::size_t i = 1; i + 1 < n; ++i) {
    for (std::size_t j = 1; j + 1 < n; ++j) {
        const std::size_t idx = i * n + j;
        b[idx] = 0.5f * a[idx]
               + 0.125f * (a[idx - 1] + a[idx + 1] + a[idx - n] + a[idx + n]);
        checksum += b[idx];
    }
}
```

At source level, everything is index-based:

```text
idx
idx - 1
idx + 1
idx - n
idx + n
```

That gives a simple test for the dumps.
If the compiler keeps the same representation, the hot loop should still look like:

```text
idx -> idx+offset -> address -> load/store
```

If the compiler rewrites the loop around pointer induction variables, the hot loop should instead look like:

```text
pointer -> MEM[offset]
pointer += 4
```

That is the mental model for the whole article.

Put that mental model in one small table:

| Compiler view | Loop shape |
| --- | --- |
| Clang-style scalar loop | `idx -> idx+offset -> GEP -> load/store` |
| GCC after `ivopts` | `pointer IV -> MEM[offset]`, `pointer += 4` |

Rendered comparison diagram:

![GCC vs Clang stencil loop representation](/files/articles/gcc_vs_clang_cases/graphs/gcc_vs_clang_stencil_representation.svg)

<div>
  <AdBanner />
</div>

## 2. Dump Everything First

To find the first structural change, I need every pass dump in order.

<Tabs>
  <TabItem value="clang" label="Clang">

```bash
clang++ -O3 -S -emit-llvm -fno-discard-value-names \
  -mllvm -print-after-all \
  -fsave-optimization-record \
  docs/articles/gcc_vs_clang_cases/stencil_2d.cpp \
  -o /tmp/stencil_pass_trace/clang_real_O3.ll \
  > /tmp/stencil_pass_trace/clang_real_print_after_all.log 2>&1
```

  </TabItem>
  <TabItem value="gcc" label="GCC">

```bash
g++ -O3 -fdump-tree-all -fdump-rtl-all \
  docs/articles/gcc_vs_clang_cases/stencil_2d.cpp \
  -o /tmp/stencil_pass_trace/stencil_gcc
```

  </TabItem>
</Tabs>

Local toolchain used for the commands below:

- `clang++ 18.1.3`
- `g++ 13.3.0`

I am treating those versions as the scope of this article.
If you run a different toolchain, you should expect dump numbering and pass names to move around.

## 3. What Counts as Proof

Before looking at any pass, define what qualifies as a real change in loop representation.

Count these as structural changes:

- `getelementptr` count changes in the hot loop
- explicit index math disappears or shrinks materially
- new `PHI` nodes appear for pointer-like induction variables
- memory accesses move to pointer-plus-offset form like `MEM[offset]`

Ignore these:

- instruction renaming
- operand reordering
- metadata changes
- vectorizer remarks without a visible loop rewrite

So the core question becomes:

| Compiler | What I am looking for |
| --- | --- |
| Clang | does `idx -> GEP` disappear? |
| GCC | when does `idx * 4 + base` become `MEM[offset]`? |

## 4. Clang Investigation

Start with the real `clang++ -O3` dump stream.

The goal on the Clang side is simple:

> find the first pass where the loop stops looking index-driven

Run:

```pythonn
rg -n "IR Dump After|LoopVectorize|SLP|LoopDistribute|LoopUnroll" \
  /tmp/stencil_pass_trace/clang_real_print_after_all.log | head -n 40
  
1:; *** IR Dump After Annotation2MetadataPass on [module] ***
1406:; *** IR Dump After ForceFunctionAttrsPass on [module] ***
2811:; *** IR Dump After AssignmentTrackingPass on [module] ***
4216:; *** IR Dump After InferFunctionAttrsPass on [module] ***
5621:; *** IR Dump After CoroEarlyPass on [module] ***
7026:; *** IR Dump After LowerExpectIntrinsicPass on main ***
7263:; *** IR Dump After SimplifyCFGPass on main ***
7479:; *** IR Dump After SROAPass on main ***
7639:; *** IR Dump After EarlyCSEPass on main ***
7797:; *** IR Dump After CallSiteSplittingPass on main ***
7955:; *** IR Dump After LowerExpectIntrinsicPass on _ZNSaIfEC2Ev ***
7965:; *** IR Dump After SimplifyCFGPass on _ZNSaIfEC2Ev ***
7975:; *** IR Dump After SROAPass on _ZNSaIfEC2Ev ***
7982:; *** IR Dump After EarlyCSEPass on _ZNSaIfEC2Ev ***
7989:; *** IR Dump After CallSiteSplittingPass on _ZNSaIfEC2Ev ***
7996:; *** IR Dump After LowerExpectIntrinsicPass on _ZNSt6vectorIfSaIfEEC2EmRKfRKS0_ ***
8041:; *** IR Dump After SimplifyCFGPass on _ZNSt6vectorIfSaIfEEC2EmRKfRKS0_ ***
8083:; *** IR Dump After SROAPass on _ZNSt6vectorIfSaIfEEC2EmRKfRKS0_ ***
8105:; *** IR Dump After EarlyCSEPass on _ZNSt6vectorIfSaIfEEC2EmRKfRKS0_ ***
8125:; *** IR Dump After CallSiteSplittingPass on _ZNSt6vectorIfSaIfEEC2EmRKfRKS0_ ***
8145:; *** IR Dump After LowerExpectIntrinsicPass on _ZNSt6vectorIfSaIfEEixEm ***
8161:; *** IR Dump After SimplifyCFGPass on _ZNSt6vectorIfSaIfEEixEm ***
8177:; *** IR Dump After SROAPass on _ZNSt6vectorIfSaIfEEixEm ***
8187:; *** IR Dump After EarlyCSEPass on _ZNSt6vectorIfSaIfEEixEm ***
8195:; *** IR Dump After CallSiteSplittingPass on _ZNSt6vectorIfSaIfEEixEm ***
8203:; *** IR Dump After LowerExpectIntrinsicPass on _ZNSt6vectorIfSaIfEE4swapERS1_ ***
8241:; *** IR Dump After SimplifyCFGPass on _ZNSt6vectorIfSaIfEE4swapERS1_ ***
8270:; *** IR Dump After SROAPass on _ZNSt6vectorIfSaIfEE4swapERS1_ ***
8292:; *** IR Dump After EarlyCSEPass on _ZNSt6vectorIfSaIfEE4swapERS1_ ***
8312:; *** IR Dump After CallSiteSplittingPass on _ZNSt6vectorIfSaIfEE4swapERS1_ ***
8332:; *** IR Dump After LowerExpectIntrinsicPass on _ZStlsISt11char_traitsIcEERSt13basic_ostreamIcT_ES5_c ***
8368:; *** IR Dump After SimplifyCFGPass on _ZStlsISt11char_traitsIcEERSt13basic_ostreamIcT_ES5_c ***
8404:; *** IR Dump After SROAPass on _ZStlsISt11char_traitsIcEERSt13basic_ostreamIcT_ES5_c ***
8431:; *** IR Dump After EarlyCSEPass on _ZStlsISt11char_traitsIcEERSt13basic_ostreamIcT_ES5_c ***
8458:; *** IR Dump After CallSiteSplittingPass on _ZStlsISt11char_traitsIcEERSt13basic_ostreamIcT_ES5_c ***
8485:; *** IR Dump After LowerExpectIntrinsicPass on _ZNSolsEd ***
8498:; *** IR Dump After SimplifyCFGPass on _ZNSolsEd ***
8511:; *** IR Dump After SROAPass on _ZNSolsEd ***
8518:; *** IR Dump After EarlyCSEPass on _ZNSolsEd ***
8525:; *** IR Dump After CallSiteSplittingPass on _ZNSolsEd ***
```

Observe:


- `LoopDistributePass`
- `LoopVectorizePass`
- `SLPVectorizerPass`
- `LoopUnrollPass`

These are the obvious candidates because they are late loop-shaping passes.
If the structure changes, it should be visible here.

Examining the hot loop after `LoopDistributePass` gives:

```llvm
%add11110 = phi i64 [ 2, %for.cond10.preheader ], [ %add11, %for.body14 ]
%j.0109 = phi i64 [ 1, %for.cond10.preheader ], [ %add11110, %for.body14 ]
%checksum.2108 = phi double [ %checksum.1111, %for.cond10.preheader ], [ %add30, %for.body14 ]
%add15 = add nuw nsw i64 %j.0109, %mul
%add.ptr.i = getelementptr inbounds float, ptr %a.sroa.0.0115, i64 %add15
%sub = add nsw i64 %add15, -1
%add.ptr.i73 = getelementptr inbounds float, ptr %a.sroa.0.0115, i64 %sub
%add18 = add nuw nsw i64 %add15, 1
%add.ptr.i74 = getelementptr inbounds float, ptr %a.sroa.0.0115, i64 %add18
%sub21 = add nsw i64 %add15, -1024
%add.ptr.i75 = getelementptr inbounds float, ptr %a.sroa.0.0115, i64 %sub21
%add24 = add nuw nsw i64 %add15, 1024
%add.ptr.i76 = getelementptr inbounds float, ptr %a.sroa.0.0115, i64 %add24
%add.ptr.i77 = getelementptr inbounds float, ptr %b.sroa.0.0114, i64 %add15
```

What matters in this dump:

- one logical index
- neighbor math as `idx +/- const`
- one `getelementptr` per access

Count the hot block:

| Clang pass | GEP count | PHI count | Pointer-style `MEM[offset]` form |
| --- | ---: | ---: | --- |
| `LoopDistributePass` | `6` | `3` | no |
| `LoopVectorizePass` | `6` | `3` | no |
| `SLPVectorizerPass` | `6` | `3` | no |
| `LoopUnrollPass` | `6` | `3` | no |

The important part is not the exact SSA names.
The important part is that the loop shape does not move.

Run:

```bash
rg -n "CantReorderFPOps|NotPossible|loop not vectorized|vectorization was impossible" \
  /tmp/stencil_pass_trace/stencil_clang_O3.opt.yaml
```

Observe:

```yaml
Name:            CantReorderFPOps
  - String:          'loop not vectorized: cannot prove it is safe to reorder floating-point operations'
```

```yaml
Name:            NotPossible
  - String:          'Cannot SLP vectorize list: vectorization was impossible'
```

That matches the pass dumps.

Conclusion on the Clang side:

- Clang stays in `idx -> GEP` form in the checked loop passes
- `GEP count = 6`
- `PHI count = 3`
- no pointer-style `MEM[offset]` form appears
- vectorization is not the first structural change here

## 5. GCC Investigation

Walk the GCC tree dumps in order.

The GCC side needs a different test because GIMPLE does not use LLVM `getelementptr`.
Here the signature of the old form is explicit scaled index arithmetic.
The signature of the new form is `MEM[offset]` driven by pointer IVs.

Run:

```bash
for f in /tmp/stencil_pass_trace/stencil_gcc-stencil_2d.cpp.*t.*; do
  if rg -q 'MEM\[\(value_type &\)|ivtmp\.86|ivtmp\.87' "$f"; then
    basename "$f"
  fi
done | head -n 20
```

Observe:

```text
stencil_gcc-stencil_2d.cpp.180t.ivopts
stencil_gcc-stencil_2d.cpp.181t.lim4
stencil_gcc-stencil_2d.cpp.182t.loopdone
...
```

This already narrows the search.
The pointer-style form does not appear before `180t.ivopts`.

Run:

```bash
for f in /tmp/stencil_pass_trace/stencil_gcc-stencil_2d.cpp.*t.*; do
  if rg -q 'idx_50|j_104|i_103|\* 1024|\* 4' "$f"; then
    basename "$f"
  fi
done | tail -n 20
```

Observe:

```text
stencil_gcc-stencil_2d.cpp.172t.vect
stencil_gcc-stencil_2d.cpp.173t.dce6
stencil_gcc-stencil_2d.cpp.174t.pcom
stencil_gcc-stencil_2d.cpp.175t.cunroll
stencil_gcc-stencil_2d.cpp.178t.slp1
```

So the comparison point is now clear:

- last clearly index-driven dump: `172t.vect`
- first dump with pointer-style markers: `180t.ivopts`

Examining the loop body in `172t.vect` reveals:

Observe:

```python
# _139 = PHI <_18(27), 2(9)>
# checksum_145 = PHI <checksum_54(27), checksum_148(9)>
# j_104 = PHI <_139(27), 1(9)>
# ivtmp_277 = PHI <ivtmp_276(27), 1022(9)>
idx_50 = _1 + j_104;
_66 = idx_50 * 4;
_67 = a__lsm.67_152 + _66;
_2 = *_67;
_4 = idx_50 + 18446744073709551615;
_63 = _4 * 4;
_64 = a__lsm.67_152 + _63;
...
_12 = idx_50 + 1024;
_37 = _12 * 4;
_32 = a__lsm.67_152 + _37;
...
_51 = b__lsm.68_126 + _66;
*_51 = _16;
```

What matters here:

- the logical index `idx_50`
- the `* 4` scaling
- the base-plus-scaled-offset address formation

This is still the source-level loop shape, just lowered into GIMPLE.

Examining the loop body in `180t.ivopts` reveals:

Observe:

```python
# checksum_145 = PHI <checksum_54(27), checksum_148(9)>
# ivtmp.86_147 = PHI <ivtmp.86_146(27), ivtmp.86_97(9)>
# ivtmp.87_90 = PHI <ivtmp.87_48(27), ivtmp.87_279(9)>
_264 = (void *) ivtmp.86_147;
_2 = MEM[(value_type &)_264 + 4];
_265 = (void *) ivtmp.86_147;
_5 = MEM[(value_type &)_265];
_263 = (void *) ivtmp.86_147;
_7 = MEM[(value_type &)_263 + 8];
_261 = (void *) ivtmp.86_147;
_10 = MEM[(value_type &)_261 + 18446744073709547524];
_262 = (void *) ivtmp.86_147;
_13 = MEM[(value_type &)_262 + 4100];
_260 = (void *) ivtmp.87_90;
MEM[(value_type &)_260] = _16;
ivtmp.86_146 = ivtmp.86_147 + 4;
ivtmp.87_48 = ivtmp.87_90 + 4;
```

What changes here:

```python
idx -> idx*4 -> base+offset
```

After `180t.ivopts`:

```python
ptr -> MEM[offset]
ptr += 4
```

That is the structural break.

- the logical `idx` is gone from the hot block
- neighbor accesses are now fixed displacements
- loop progress is expressed as pointer increments

Count the hot block before and after:

```bash
# 172t.vect hot block
# PHI=4 MEM[offset]=0 scale*4=5 base+offset=6

# 180t.ivopts hot block
# PHI=3 MEM[offset]=6 scale*4=0 base+offset=0
```

The counts say the same thing as the snippets:

- the inner loop stops being anchored on a named logical index like `idx_50`
- pointer-like induction variables appear as loop-carried `PHI` nodes
- neighbor accesses become fixed offsets from one advancing pointer
- the inner-loop progress is now `+4` bytes per iteration

Conclusion on the GCC side:

> `180t.ivopts` is the first GCC tree dump where the stencil loop visibly leaves the explicit index-and-scale form and becomes pointer-plus-offset.

## 6. The Divergence, Visually

Put the two sides next to each other.

Clang keeps this shape in the loop passes I checked:

```text
idx
  -> idx-1, idx+1, idx-1024, idx+1024
  -> GEP
  -> load/store
```

GCC crosses into this shape at `180t.ivopts`:

```text
pointer IV
  -> MEM[0], MEM[+4], MEM[+8], MEM[-4092], MEM[+4100]
  -> pointer += 4
```

Or even shorter:

```text
Clang: idx -> GEP -> GEP -> GEP
GCC:   idx -> ivopts -> pointer -> MEM[offset]
```

This is the shortest accurate summary of the pass trace:

```text
Clang: idx -> GEP -> GEP -> GEP
GCC:   idx -> ivopts -> pointer -> MEM[offset]
```

Rendered GCC vs Clang pass diagram:

![GCC vs Clang stencil pass divergence at ivopts](/files/articles/gcc_vs_clang_cases/graphs/gcc_vs_clang_stencil_pass_divergence.svg)

This is the first pass-level divergence proven by the dumps.

<div>
  <AdBanner />
</div>

## 7. Quantitative Proof

The snippets show the change.
The counts remove ambiguity.

### Clang: No Structural Change Across the Checked Loop Passes

| Before pass | GEP count | PHI count |
| --- | ---: | ---: |
| `LoopDistributePass` hot block | `6` | `3` |

| After pass | GEP count | PHI count |
| --- | ---: | ---: |
| `LoopVectorizePass` hot block | `6` | `3` |

Observed in `LoopDistributePass`, `LoopVectorizePass`, `SLPVectorizerPass`, and `LoopUnrollPass`.

### GCC: The Rewrite Happens at `ivopts`

Use GCC-native signals:

- explicit scaled-address steps like `idx * 4`
- pointer-style memory references like `MEM[offset]`

| GCC dump | PHI count | Explicit `* 4` scale ops | Base+offset address ops | `MEM[offset]` accesses |
| --- | ---: | ---: | ---: | ---: |
| `172t.vect` | `4` | `5` | `6` | `0` |
| `180t.ivopts` | `3` | `0` | `0` | `6` |

Conclusion:

- before `ivopts`: explicit index math
- after `ivopts`: pointer-plus-offset memory references

## 8. What Is Proven, and What Is Not

Proven:

> The first proven pass where loop representation visibly diverges is GCC `180t.ivopts`.

Not proven:

- that `ivopts` alone explains the full runtime gap
- that LLVM has no earlier transformation of any kind
- that backend codegen is irrelevant
- that this exact pass number will be identical on every compiler version

Also proven by the same dumps:

- this is not a backend-only story, because the loop representation has already diverged in the middle-end
- this is not a vectorization story at plain `-O3`, because both vectorizers reported failure here
- the most visible proven split is about loop representation, not just final instruction scheduling

## 9. Final Takeaway

Final result:

- Clang stays in an index-centered `idx -> GEP` loop shape through the loop passes I checked
- GCC first switches to pointer-plus-offset form at `180t.ivopts`

Next question:

> If I perturb the source or disable the responsible transformation, does the runtime gap move with the loop representation?

## Bonus: How I Would Automate This Detection

Automate the same proof steps:

1. dump every pass in order
2. isolate the hot loop block
3. count `GEP`, `PHI`, scaled index ops, and pointer-offset memory refs
4. diff consecutive snapshots
5. stop at the first pass where the metric family changes shape

## What Should We Test Next?

I think the next experiments should be:

- disable or perturb GCC induction-variable optimization and see whether the scalar loop falls back toward the Clang shape
- rewrite the source to make pointer progression more explicit and see whether Clang closes the gap
- run the same pass-trace method on another index-heavy kernel and check whether `ivopts` is a one-off or a pattern

## 10. Loop Form After ivopts: A Transformation, Not an Algorithm

This is not an algorithm change, but a change in loop representation produced by the compiler.

The relevant GCC pass is `tree-ssa-loop-ivopts`.
Its role is induction-variable optimization.
In this case, the observed effect is a shift from explicit index-based addressing to pointer-based induction in the loop body.

This section is derived directly from IR/GIMPLE dumps, not from source-level equivalence.

How this was identified:

Using the same grep-based scan shown earlier:

- the first dump with pointer-IV / `MEM[offset]` markers is `180t.ivopts`
- the last clearly index-based dump is `172t.vect`

This identifies the boundary directly from the dump stream:

- last clearly index-based dump: `172t.vect`
- first dump with pointer-IV / `MEM[offset]` markers: `180t.ivopts`

The established dump evidence at that boundary is:

- `idx * 4` disappears from the hot loop after `180t.ivopts`
- `MEM[offset]` accesses appear
- pointer `PHI` nodes appear as `ivtmp.xx`
- loop progress appears as pointer increments such as `+ 4`

The transformation pattern visible in the dumps is:

Before, index-based form:

```text
base + (idx * element_size)
```

After `ivopts`, induction-based form:

```text
ptr
MEM[ptr + offset]
ptr += element_size
```

The specific dump signatures are:

Before `180t.ivopts`:

```text
idx_50 = _1 + j_104;
_66 = idx_50 * 4;
_67 = a__lsm.67_152 + _66;
_2 = *_67;
```

After `180t.ivopts`:

```text
# ivtmp.86_147 = PHI <ivtmp.86_146(27), ivtmp.86_97(9)>
_264 = (void *) ivtmp.86_147;
_2 = MEM[(value_type &)_264 + 4];
ivtmp.86_146 = ivtmp.86_147 + 4;
```

What changes is the loop form:

- explicit scaled index arithmetic is removed from the hot block
- one advancing pointer becomes the anchor for neighbor accesses
- neighbors are expressed as fixed displacements from that pointer
- loop progress is expressed as pointer recurrence instead of index recurrence

This transformation removes index arithmetic from the loop body and replaces it with a single induction pointer.

Why this transformation exists:

- it reduces arithmetic inside the loop body
- it exposes linear memory access more directly
- it matches hardware addressing modes more closely

Minimal comparison:

```text
Clang:
  idx -> compute -> GEP -> load

GCC after ivopts:
  pointer IV -> MEM[offset] -> pointer increment
```

This is a representation transformation performed by `tree-ssa-loop-ivopts`, not a new algorithm introduced by GCC.






### More Article


- Part 1 measured the runtime gap:

> [**GCC vs Clang: A 10-Case Compiler Benchmark Report (2026)**](/docs/articles/gcc_vs_clang_real_benchmarks_2026_reporter)

- Part 2A compared final assembly:

> [**GCC vs Clang, Part 2A: Assembly Deep-Dive on 3 Key Benchmark Cases**](/docs/articles/gcc_vs_clang_assembly_part2a)

- What GCC and Clang Diverge
  > [Where GCC and Clang Diverge](/docs/articles/where_gcc_and_clang_diverge_stencil_pass_trace)



- [how LLVM solve MXN Problem](https://www.compilersutra.com/docs/llvm/llvm_basic/Why_What_Is_LLVM)
- [How to  Understand LLVM IR](https://www.compilersutra.com/docs/llvm/llvm_basic/markdown-features)
- [LLVM Tools](https://www.compilersutra.com/docs/llvm/llvm_extras/manage_llvm_version)
- [learn LLVM Step By Step](https://www.compilersutra.com/docs/llvm/llvm_extras/translate-your-site)
- [Power of the LLVM](https://www.compilersutra.com/docs/llvm/llvm_extras/llvm-guide)
- [How to disable LLVM Pass](https://www.compilersutra.com/docs/llvm/llvm_extras/disable_pass)
- [see time of each pass LLVM](https://www.compilersutra.com/docs/llvm/llvm_extras/llvm_pass_timing)
- [Learn LLVM step by Step](https://www.compilersutra.com/docs/llvm/intro-to-llvm)
- [Create LLVM Pass](https://www.compilersutra.com/docs/llvm/llvm_basic/pass/Function_Count_Pass)

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



<div>
  <AdBanner />
</div>
