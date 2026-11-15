# Script Deck — Parallel Programming Course Launch

**PDF:** `scripts/live-pdf-bot/out/2026-11-14-parallel-course-launch.pdf`  
**Duration:** ~40–45 min + Q&A  
**Tone:** clear, practical, no hype — one problem, several machines

---

## Slide 1 / 12 — Title

**On screen:** Parallel Programming: One Problem, Several Machines.

**Say (~60s):**

> Welcome to CompilerSutra Weekly Live.
>
> Today we launch a free Parallel Computing course. The idea is simple: take **one computation**, and move it across machines — single-thread CPU, OpenMP, SIMD, GPU, then MPI.
>
> Same problem. Different execution model. Correctness and measurement stay in the picture the whole way.
>
> Fifty-two lessons. Basic C or C++ is enough. Free.

**Link to drop in chat:** https://www.compilersutra.com/docs/parallel-computing/

**Do not say:** clock / “Saturday 19:00 IST” — stay on the idea.

---

## Slide 2 / 12 — Three Pillars

**On screen:** Keep It Correct · Adapt the Machine · Measure What Changed  
**Footer chips:** Mutex + Atomics + Barriers · CPU + Vector + GPU + Cluster · Speedup + Efficiency + Profiling

**Goal of this slide:** plant the course philosophy before any chapter names. People should leave this slide thinking “correct → machine → measure,” not “I need CUDA day one.”

**Say (~5–6 min):**

> Before we open chapters — three rules. These are not slogans. They are how every lesson in this course is built.
>
> ---
>
> **Pillar one — keep it correct.**
>
> Parallel programming fails quietly. Your program can finish, print a number, and still be wrong — because two threads wrote the same memory without agreeing on order.
>
> That is a **race**. Shared memory is powerful and dangerous. So we treat mutexes, atomics, and barriers as first-class tools — not “advanced topics you’ll meet later.”
>
> Rule of thumb for the whole course: **if the answer is wrong, speed does not matter.** A faster wrong sum is still wrong. We will print serial totals and parallel totals side by side until they match. That habit alone will save you weeks of fake “optimizations.”
>
> ---
>
> **Pillar two — adapt the machine.**
>
> OpenMP, SIMD, CUDA, ROCm, OpenCL, MPI — beginners often think these are five different careers. In this course they are **five engines for the same idea**.
>
> The idea: take a list of numbers, transform it, reduce it, move that work across more workers.
>
> - On a **CPU**, workers are threads on shared memory.
> - With **OpenMP**, you describe the parallel region and let the runtime place the threads.
> - With **SIMD**, one instruction rides several lanes at once.
> - On a **GPU**, thousands of lightweight workers run a kernel.
> - With **MPI**, workers do not share memory — they send messages.
>
> Same problem. Different machine. You are not switching subjects — you are switching the hardware story under one algorithm.
>
> ---
>
> **Pillar three — measure what changed.**
>
> “It feels faster” is not a result. We measure.
>
> - **Speedup** — how many times faster than the serial baseline?
> - **Efficiency** — are we using the extra cores / workers well, or just burning them?
> - **Amdahl’s law** — how much of the work is still stuck in serial, capping the win?
>
> You will see timings, medians, and honest baselines. One lucky run on a warm cache does not count. If parallel did not help, we say so — and we learn *why*.
>
> ---
>
> So remember the three words on screen: **Correct. Machine. Measure.**  
> Every chapter you open later is just applying these three again on a new machine.

**Ask chat (bridge into hardware reality):**

> Quick show of hands in chat — type one word:
>
> - `GPU` — if you have a desktop / laptop discrete GPU you can develop on
> - `CPU` — if you only have a CPU laptop right now
> - `PHONE` — if your best parallel device tonight is your Android phone
>
> There is no wrong answer. This course is designed so **CPU-only and phone-only people are not locked out**. Later today we cover a full phone-GPU path — Adreno / Mali, OpenCL when available, Vulkan when you need portable compute. You do not need an NVIDIA workstation to start building parallel intuition.

**If chat is quiet — prompt once:**

> Even one letter helps: G / C / P. I want to know who we’re teaching for in this room.

**If many `PHONE` / `CPU`:**

> Perfect — stay with us through the phone-GPU slides. Your homework will not be “buy a 4090.” It will be “run one kernel on hardware you already own.”

**If many `GPU`:**

> Great — you still start the same way: correctness first, then OpenMP/SIMD, then your GPU chapter. Do not skip measurement just because you have silicon.

**Transition to next slide:**

> With those three pillars fixed — here’s exactly what we cover in this live.

---

## Slide 3 / 12 — Session Overview

**On screen:** 01–04 agenda

**Say (~90s):**

> Four things today.
>
> Why the course exists — one compute story across hardware.
> Curriculum — eight chapters, fifty-two lessons.
> Zero-hardware barrier — phone GPU if you have no desktop GPU.
> Ecosystem — tools on CompilerSutra you can use after the live.
>
> Then you leave with a clear next action.

---

## Slide 4 / 12 — Course at a Glance

**On screen:** 8 · 52 · 100%

**Say (~2 min):**

> Eight chapters. Fifty-two hands-on lessons. Fully free.
>
> The course reuses one example — a list of numbers — while the machine under it changes.
>
> Goal: keep the result correct, understand the execution model, measure what actually changed.

**Link:** https://www.compilersutra.com/docs/parallel-computing/

---

## Slide 5 / 12 — Chapters 1–4

**On screen:** Parallel Thinking · CPU · OpenMP · Algorithms

**Say (~5–6 min):**

> **Part 1 — foundations. CPU and shared memory.**
>
> **Chapter 1 — Parallel Thinking.** What does “at the same time” even mean? Sequential vs concurrent vs parallel. Where races come from.
>
> **Chapter 2 — CPU.** Threads, cores, shared memory, mutex, atomics, barriers. This is the ground truth before any framework.
>
> **Chapter 3 — OpenMP.** Parallelize loops without hand-managing every thread. Regions, reductions, scheduling.
>
> **Chapter 4 — Algorithms.** Map, reduce, histogram, stencil, scan, sort — which patterns are naturally parallel.

**Optional demo cue:** show Course Hub → Chapter 1 page for 10 seconds.

**Links:**
- https://www.compilersutra.com/docs/parallel-computing/chapter-1/
- https://www.compilersutra.com/docs/parallel-computing/chapter-3/

---

## Slide 6 / 12 — Chapters 5–8

**On screen:** SIMD · GPU · Distributed · Measuring

**Say (~5–6 min):**

> **Part 2 — hardware and scale.**
>
> **Chapter 5 — SIMD.** One instruction, several values. Lanes, alignment, vectorization.
>
> **Chapter 6 — GPU.** Thousands of workers. Memory hierarchy, kernels. CUDA, ROCm, OpenCL, Vulkan — same ideas, different APIs.
>
> **Chapter 7 — Distributed.** No shared memory. MPI, ranks, collectives.
>
> **Chapter 8 — Measuring.** Timing, speedup, efficiency, Amdahl, bandwidth, cache. This chapter closes the loop with pillar three.

**Links:**
- https://www.compilersutra.com/docs/parallel-computing/chapter-6/
- https://www.compilersutra.com/docs/parallel-computing/chapter-7/

---

## Slide 7 / 12 — How to Study

**On screen:** Read Page → Run Exercise → Verify Metric

**Say (~3 min):**

> Do not binge-read the whole course.
>
> Loop: read one page → do that page’s exercise → check a metric on your machine.
>
> Same list-of-numbers example across models. Take the chapter quiz before jumping ahead. Ship the chapter project so serial and parallel totals match.

**Link:** https://www.compilersutra.com/docs/parallel-computing/start-here/how-to-use-this-course/

---

## Slide 8 / 12 — No Desktop GPU?

**On screen:** Phone still has a GPU · OpenCL · Vulkan · NDK

**Say (~4 min):**

> Common blocker: “I don’t have a GPU.”
>
> You do — your phone. Adreno / Mali. Same data-parallel ideas as CUDA courses: kernels, workgroups, memory, speedup — on-device.
>
> You do **not** need an NVIDIA workstation to start.
>
> Path: detect OpenCL when the phone exposes it; practice portable compute with Vulkan; use NDK when you go native.

**Pin in chat:**
- https://www.compilersutra.com/docs/gpu/platforms/android/learn-parallel-on-phone/
- https://www.compilersutra.com/docs/gpu/platforms/android/

---

## Slide 9 / 12 — Phone GPU Roadmap

**On screen:** Steps 1–5

**Say (~4 min):**

> Five steps if phone is your GPU.
>
> **1** Fundamentals on CPU first — threads, shared memory, Amdahl.
> **2** Query OpenCL / Vulkan on the device.
> **3** Run a small data-parallel kernel — matrix-style work across workgroups.
> **4** Respect host↔device buffer copies — that cost is real on mobile.
> **5** Benchmark honestly — latency, bandwidth, thermal throttling. Median timings, not one lucky run.

**Links:**
- https://www.compilersutra.com/docs/gpu/what_is_gpu/
- https://www.compilersutra.com/docs/gpu/opencl/basic/what_is_opencl/
- https://www.compilersutra.com/docs/gpu/opencl/basic/detecting_opencl_gpu_on_android/

---

## Slide 10 / 12 — Ecosystem

**On screen:** GPU tracks · Site tools

**Say (~3 min):**

> After the live, two doors.
>
> **Tracks:** CUDA, ROCm, OpenCL, Vulkan, and the Parallel Computing course hub.
>
> **Tools:** Clang Flags Explorer, ABI Explorer, Weekly Problems, MCQ Hub — use them while you study.

**Quick hits (optional):**
- Clang flags: https://www.compilersutra.com/tools/clang-flags/
- ABI: https://www.compilersutra.com/abi/

---

## Slide 11 / 12 — Next Action

**On screen:** After this live

**Say (~2 min):**

> Concrete homework — not “explore someday.”
>
> 1. Open the course hub. Read **Start Here**.
> 2. Finish **Chapter 1** before the next live.
> 3. No desktop GPU → start the **phone GPU** path.
> 4. Subscribe to Weekly Compiler Notes for follow-ups.
>
> Bring one question or one timing number next time.

**Links to paste:**
- Course: https://www.compilersutra.com/docs/parallel-computing/
- Phone: https://www.compilersutra.com/docs/gpu/platforms/android/learn-parallel-on-phone/
- Subscribe: https://docs.google.com/forms/d/e/1FAIpQLSebP1JfLFDp0ckTxOhODKPNVeI1e21rUqMJ0fbBwJoaa-i4Yw/viewform

---

## Slide 12 / 12 — Close

**On screen:** Let’s build parallel intuition — for real.

**Say (~45s):**

> That’s the launch. One problem. Several machines. Free path from source to hardware.
>
> Open the course. Do Chapter 1. See you in the next live — bring questions.

**End screen hold:** https://www.compilersutra.com

---

## Timing cheat sheet

| Slides | Block | Target |
| ---: | :--- | ---: |
| 1–3 | Open + pillars + agenda | 9–10 min |
| 4–6 | Course + curriculum tour | 14 min |
| 7 | How to study | 3 min |
| 8–9 | Phone GPU path | 8 min |
| 10–11 | Ecosystem + CTA | 5 min |
| 12 + Q&A | Close | rest |

## Chat paste pack (copy once at start)

```
Course hub: https://www.compilersutra.com/docs/parallel-computing/
Start here: https://www.compilersutra.com/docs/parallel-computing/start-here/how-to-use-this-course/
Phone GPU: https://www.compilersutra.com/docs/gpu/platforms/android/learn-parallel-on-phone/
Subscribe: https://docs.google.com/forms/d/e/1FAIpQLSebP1JfLFDp0ckTxOhODKPNVeI1e21rUqMJ0fbBwJoaa-i4Yw/viewform
```

## Host checklist (5 min before go-live)

- [ ] PDF open in presentation / fullscreen mode
- [ ] Course hub tab ready
- [ ] Phone GPU page ready
- [ ] Subscribe form ready
- [ ] Chat paste pack ready
- [ ] Mic / screen share checked
