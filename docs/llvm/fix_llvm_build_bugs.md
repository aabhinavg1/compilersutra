---
title: "collect2: fatal error: ld terminated with signal 9 [Killed]"
description: "Comprehensive guide to fix 'collect2: fatal error: ld terminated with signal 9 [Killed]' during large LLVM or Clang builds. Learn memory management, swap configuration, linker optimizations, and CMake flags for stable compilation."
keywords:
  - llvm build
  - clang build
  - collect2 error
  - ld terminated
  - signal 9
  - linker killed
  - out of memory
  - swap space
  - increase swap linux
  - ninja build
  - cmake flags
  - lld linker
  - parallel linking
  - memory optimization
  - large project build
  - compiler build tips
  - gcc build
  - build large projects
  - llvm cmake
  - clang cmake
  - linux memory tuning
  - vm swappiness
  - build failures
  - memory intensive linking
  - swapfile setup
  - ninja jobs
  - llvm targets
  - build optimization
  - compiler memory issues
  - release build llvm
  - assertions off llvm
  - c++ compiler build
  - llvm tutorial
  - clang tutorial
  - memory management linux
  - linux swap optimization
  - ld killed
  - large binary linking
  - gcc linker error
  - ninja parallel jobs
  - llvm lld
  - llvm linker
  - build tips
  - compiler developer guide
  - c++ large project build
  - llvm build workflow
  - clang build workflow
  - professional guide llvm
  - developer tips llvm
  - memory efficient linking
  - build troubleshooting
  - linux build optimization
  - llvm cmake tips
  - clang cmake tips
  - llvm parallel build
  - clang parallel build
  - memory profiling build
  - build system optimization
  - incremental builds
  - reduce memory usage
  - build errors fix
  - compilation failure
  - compiler optimization
  - gcc build errors
  - large executable build
  - efficient llvm build
  - efficient clang build
  - reduce ld memory
  - ninja optimization
  - swapfile configuration
  - linux developer tips
  - linux build best practices
  - c++ build optimization
  - llvm developer workflow
  - clang developer workflow
  - building compilers
  - linker optimization
  - llvm cmake build
  - clang cmake build
  - compilation memory tuning
  - large codebase build
  - professional compiler guide
  - c++ linker error
  - memory allocation linker
  - compiler crash fix
  - linux memory tuning
  - build infrastructure
  - software build tips
  - llvm best practices
  - clang best practices
  - build process optimization
  - large-scale compiler build
  - linux build environment
  - compiler engineering
  - llvm developer tips
  - clang developer tips
  - memory intensive build
  - llvm advanced build
  - clang advanced build
  - parallel build issues
  - gcc linker kill
  - memory efficient builds
  - swap tuning
  - ninja build memory
  - build process troubleshooting
  - c++ project build
  - llvm compilation tips
  - clang compilation tips
  - build workflow
  - developer-oriented guide
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import AdBanner from '@site/src/components/AdBanner';


## Introduction


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

When building large-scale projects like **LLVM** or **Clang**, developers often encounter the following error during the linking stage:

```rust
collect2: fatal error: ld terminated with signal 9 [Killed]
```

This error occurs because the **linker (`ld`) was terminated by the operating system**, typically due to **insufficient memory**. During the linking process, especially for massive binaries such as `llvm-lto` or `clang`, the linker needs to load and combine hundreds or thousands of object files into a single executable. This operation can require **tens of gigabytes of RAM**, depending on the target and build configuration.

If the system cannot provide enough memory, the kernel intervenes to prevent system instability and kills the linker process resulting in the `signal 9 [Killed]` error. This is **not a bug in LLVM or Clang**, but rather a limitation of system resources.

:::tip Why Swap Space Matters
:::caution swap space
Swap space acts as an **overflow area for RAM**. When your system runs out of physical memory, swap allows the operating system to temporarily move inactive memory pages to disk. This provides more breathing room for memory-intensive tasks like linking large binaries. Without adequate swap space, processes that require large amounts of memory can be killed unexpectedly exactly what happens with the `ld terminated with signal 9` error.
:::

>> *Even on systems with a large amount of RAM, adding swap is a **safety net** for heavy builds. It ensures that the linker has enough virtual memory to complete the operation without being terminated by the kernel.*

**Common Causes**

* **Limited RAM or swap**: linking large binaries exceeds available memory.
* **High parallel build jobs**: using too many jobs in Ninja or Make increases peak memory usage during linking.
* **Debug builds or builds with multiple targets**: enabling assertions, building all targets, or including debug symbols increases memory footprint.

:::note  developers
By understanding these causes, developers can take concrete steps to prevent the error, such as **increasing swap space**, **limiting parallel linking**, or **using more memory-efficient linkers like `lld`**.
:::


<div>
  <AdBanner />
</div>


## Table of Contents

1. [Introduction](#introduction)
2. [Understanding RAM, Swap, and Memory Usage During Linking](#understanding-ram-swap-and-memory-usage-during-linking)
3. [Step-by-Step Guide to Fix the Error](#step-by-step-guide-to-fix-the-error)
   * [Check Current Memory and Swap Usage](#check-current-memory-and-swap-usage)
   * [CMake Flags to Reduce Memory Usage](#use-lld-linker-and-optimize-build-for-memory)
   * [Other Tips and Best Practices](#other-tips-and-best-practices)
4. [Recommended Workflow Summary](#recommended-workflow-summary)
5. [Conclusion](#conclusion)
6. [FAQ](#faqs)
7. [More Article](#more-articles)

---

import LlvmSeoBooster from '@site/src/components/llvm/LlvmSeoBooster';

## Understanding RAM, Swap, and Memory Usage During Linking

Large projects like **LLVM**, **Clang**, or other modern C++ toolchains generate **tens of gigabytes of intermediate object files** (`.o`). During the **linking phase**, the system must load, process, and combine all these objects to produce the final executable or library. This process can consume much more memory than the size of the source code itself.

* **RAM (Physical Memory):** Temporarily stores object files, symbol tables, relocation entries, debugging information, and other linker metadata. The linker often needs to keep multiple copies in memory while resolving symbol references and performing optimizations.
* **Swap (Disk-backed Memory):** Acts as an overflow when RAM is exhausted. Swap is significantly slower than RAM, but it prevents the linker from being killed outright when memory demands exceed physical capacity.

Insufficient memory often triggers the **Linux Out-Of-Memory (OOM) killer**, which terminates `ld` or `collect2`, resulting in:

```
collect2: fatal error: ld terminated with signal 9 [Killed]
```

<details>
<summary>Insight: Why Linking Requires So Much Memory</summary>

The linker performs multiple memory-intensive operations simultaneously:

1. **Loading Object Files:** Every `.o` file must be read into memory. Large projects can generate thousands of `.o` files, each potentially several megabytes in size.
2. **Symbol Resolution:** The linker resolves symbols across all object files, creating a global symbol table in memory. This step grows with the number of functions, classes, and template instantiations.
3. **Relocation and Address Fixups:** Memory must hold relocation tables, virtual addresses, and offset calculations. For templates-heavy C++ codebases like LLVM, this can become extremely large.
4. **Debug Information Processing:** Even with `Release` builds, some debug information may be included, consuming additional RAM.

**Implications for developers:**

* Memory usage during linking can exceed the total RAM of your machine.
* Parallel linking (multiple simultaneous link processes) multiplies memory requirements.
* Without sufficient swap or limiting parallelism, builds will fail with signal 9.

By understanding these factors, developers can **strategically configure swap, limit linker jobs, and choose memory-efficient linkers** to reliably build large projects.

</details>

You may be already aware of RAM so not discussing much here. We will give little bit light on the understanding of the swap space.

>
**Swap space** is a dedicated portion of your **disk** that the operating system uses as **overflow memory** when 
physical RAM is fully utilized.

:::tip thinks of
> Think of RAM as **fast, primary memory** for active processes.Swap acts as **secondary memory**, slower
 because it resides on disk, but essential to prevent processes from being terminated when RAM runs out.
:::


:::caution Why Swap Space is Important

1. **Prevents Out-Of-Memory (OOM) Kills**
   When a memory-intensive process (like the LLVM linker) exceeds available RAM, Linux may invoke the **OOM killer**, terminating the process. Swap provides extra memory, reducing the chance of fatal crashes.

2. **Enables Large Builds on Modest Systems**
   Large projects generate **tens of gigabytes of object files** and require significant RAM during linking. Swap allows the system to continue linking even if physical memory is insufficient.

3. **Supports Multitasking**
   Swap allows your system to run multiple processes simultaneously by temporarily offloading inactive memory pages to disk.

4. **Improves System Stability**
   Without swap, memory spikes can cause the entire system to become unstable or freeze. Swap acts as a safety net.
:::


**How Swap Works**
        1. **Active pages in RAM** – Frequently used memory stays in RAM.
        2. **Inactive pages moved to swap** – Least recently used pages are written to swap to free RAM for active processes.
        3. **Accessing swapped pages** – If a process needs a page that’s in swap, it’s **paged back into RAM**, which is slower than accessing RAM directly.

<details>
<summary>Insight: Swap vs RAM</summary>

| Feature     | RAM                | Swap                      |
| ----------- | ------------------ | ------------------------- |
| Location    | Physical memory    | Disk (HDD/SSD)            |
| Speed       | Very fast          | Much slower than RAM      |
| Persistence | Volatile           | Volatile (only temporary) |
| Purpose     | Active computation | Overflow / memory safety  |

</details>



:::caution Practical Implications for Compiler Builds

* Linking LLVM or Clang can easily consume **30–50+ GB of memory**.
* Systems with 16–32 GB RAM often fail during linking without swap.
* Configuring **large swap files** (32–64 GB or more) ensures **linking completes successfully**.
:::tip note
While swap is slower than RAM, it is **better than having your linker killed**. Always ensure sufficient swap space for large-scale builds on systems with limited RAM.
:::



## Step-by-Step Guide to Fix the Error

**Check Current Memory and Swap Usage**

<Tabs>

<TabItem value="Bash Commands" label="Bash Commands">

###### Check current memory and swap usage

```rust
free -h
swapon --show
````

###### Create a 64 GiB swapfile

```rust
sudo fallocate -l 64G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

###### Verify swap

```rust
swapon --show
free -h
```

###### Limit linker parallelism in Ninja

```bash
export LLVM_PARALLEL_LINK_JOBS=1
ninja -j$(nproc)
```

</TabItem>

<TabItem value="CMake Commands" label="CMake Commands">

###### Use LLD linker and optimize build for memory

```bash
cmake -G Ninja ../llvm \
  -DLLVM_USE_LINKER=lld \
  -DLLVM_PARALLEL_LINK_JOBS=1 \
  -DCMAKE_BUILD_TYPE=Release \
  -DLLVM_ENABLE_ASSERTIONS=OFF \
  -DLLVM_TARGETS_TO_BUILD="X86;ARM"
```

| **Option**                          | **Explanation**                                                                                                                                                      |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-G Ninja`                          | Specifies the build system generator. In this case, **Ninja** is used, which is a fast, low-overhead build system.                                                   |
| `../llvm`                           | Path to the **LLVM source directory**. This tells CMake where the source code is located relative to the build directory.                                            |
| `-DLLVM_USE_LINKER=lld`             | Instructs LLVM to use **LLD (LLVM’s linker)** instead of the system linker. This can speed up linking and improve cross-platform consistency.                        |
| `-DLLVM_PARALLEL_LINK_JOBS=1`       | Limits the number of **parallel linker jobs** to 1. Useful on systems with limited RAM to prevent the linker from being killed due to memory exhaustion.             |
| `-DCMAKE_BUILD_TYPE=Release`        | Sets the **build type**. `Release` enables optimizations and disables debug info for faster binaries. Other options include `Debug`, `RelWithDebInfo`, `MinSizeRel`. |
| `-DLLVM_ENABLE_ASSERTIONS=OFF`      | Disables **LLVM internal assertions**. Assertions are useful for debugging but can slow down the build and runtime; turning them off is typical for release builds.  |
| `-DLLVM_TARGETS_TO_BUILD="X86;ARM"` | Specifies which **target architectures** to build support for. Here, LLVM will generate code for **X86** and **ARM** only, reducing build time and memory usage.     |


</TabItem>

<TabItem value="Explanation" label="Explanation">

* `free -h` → Shows available RAM and swap usage.
* `swapon --show` → Lists active swap partitions or files.
* Swap file creation (`/swapfile`) → Provides additional memory to prevent OOM kills.
* `LLVM_PARALLEL_LINK_JOBS=1` → Ensures only **one link process** runs at a time, reducing peak memory usage while allowing compilation to remain fully parallel.
* `-DLLVM_USE_LINKER=lld` → Uses the **LLD linker**, which is faster and more memory-efficient than GNU ld.
* `-DCMAKE_BUILD_TYPE=Release` → Reduces debug info to save memory.
* `-DLLVM_ENABLE_ASSERTIONS=OFF` → Disables runtime checks not needed in production builds.
* `-DLLVM_TARGETS_TO_BUILD="X86;ARM"` → Builds only required targets to reduce memory footprint.

</TabItem>

</Tabs>

### Other Tips and Best Practices

<details>
<summary>Practical Tips for Stable Builds</summary>

* Reduce Ninja `-j` jobs for memory-limited systems: `ninja -j4`
* Tune Linux swappiness: `sudo sysctl vm.swappiness=10`
* Monitor build memory: `htop` or `top`
* Use incremental builds: rebuild only changed files

</details>

---

## Recommended Workflow Summary

1. **Check memory and swap**:

```bash
free -h
swapon --show
```

2. **Create swap (64 GiB recommended)**:

```bash
sudo fallocate -l 64G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

3. **Configure CMake**:

```bash
cmake -G Ninja ../llvm \
  -DLLVM_USE_LINKER=lld \
  -DLLVM_PARALLEL_LINK_JOBS=1 \
  -DCMAKE_BUILD_TYPE=Release \
  -DLLVM_ENABLE_ASSERTIONS=OFF \
  -DLLVM_TARGETS_TO_BUILD="X86;ARM"
```

4. **Build using Ninja**:

```bash
export LLVM_PARALLEL_LINK_JOBS=1
ninja -j$(nproc)
```

5. **Monitor memory and swap usage**, adjust swap or linker jobs if needed.


## Conclusion

The `collect2: fatal error: ld terminated with signal 9 [Killed]` error is caused by **insufficient memory** during the linking phase of large projects.

By **configuring swap**, **limiting parallel linker jobs**, **using memory-efficient linkers like LLD**, and **optimizing CMake flags**, developers can build LLVM or Clang reliably even on systems with limited RAM. Following these best practices ensures efficient, stable, and reproducible builds.



### What’s Next / Expert Insight

* Consider **incremental builds** for frequent development cycles
* Explore **distributed builds** using tools like **Icecream (icecc)** or **BuildGrid** for very large projects
* Review **link-time optimizations (LTO)** carefully, as they also increase memory usage

---

<div>
  <AdBanner />
</div>

## FAQs

import { ComicQA } from '../mcq/interview_question/Question_comics';

<ComicQA
  question="1) What does 'collect2: fatal error: ld terminated with signal 9 [Killed]' mean?"
  answer="It means the linker process was killed by the operating system due to insufficient memory during the linking phase of a large project like LLVM or Clang."
/>

<ComicQA
  question="2) Why is swap space important during large builds?"
  answer="Swap space acts as disk-backed memory when RAM is full. It prevents the linker from being terminated and allows memory-intensive builds to complete successfully."
/>

<ComicQA
  question="3) How can I check current RAM and swap usage?"
  answer="Use `free -h` to view RAM and swap, and `swapon --show` to list active swap spaces on Linux."
  code={`free -h
swapon --show`}
/>

<ComicQA
  question="4) How do I create a large swapfile on Linux?"
  answer="You can create a swapfile with the following commands:"
  code={`sudo fallocate -l 64G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
swapon --show
free -h`}
/>

<ComicQA
  question="5) Can I limit linker memory usage during a Ninja build?"
  answer="Yes. By setting `LLVM_PARALLEL_LINK_JOBS=1`, you limit the linker to run one job at a time while compilation remains fully parallel."
  code={`export LLVM_PARALLEL_LINK_JOBS=1
ninja -j$(nproc)`}
/>

<ComicQA
  question="6) Which linker is recommended for memory-efficient builds?"
  answer="LLVM's LLD linker is faster and consumes less memory than GNU ld. It is recommended for large LLVM/Clang builds."
  code={`cmake -G Ninja ../llvm -DLLVM_USE_LINKER=lld -DCMAKE_BUILD_TYPE=Release`}
/>

<ComicQA
  question="7) What CMake flags help reduce memory usage?"
  answer="Important flags include limiting targets, disabling assertions, using LLD, and limiting parallel link jobs."
  code={`cmake -G Ninja ../llvm \\
  -DLLVM_USE_LINKER=lld \\
  -DLLVM_PARALLEL_LINK_JOBS=1 \\
  -DCMAKE_BUILD_TYPE=Release \\
  -DLLVM_ENABLE_ASSERTIONS=OFF \\
  -DLLVM_TARGETS_TO_BUILD="X86;ARM"`}
/>

<ComicQA
  question="8) How do I monitor memory usage during builds?"
  answer="Use `top` on macOS/Linux or install `htop` on Linux to monitor RAM and swap usage in real-time."
  code={`# On Linux
htop
free -h

# On macOS
top`}
/>

<ComicQA
  question="9) Can I tune swap on macOS to prevent linker kills?"
  answer="No. macOS manages swap automatically. You should focus on reducing parallel linker jobs and monitoring memory usage."
/>

<ComicQA
  question="10) What are other best practices for building large projects safely?"
  answer="Reduce Ninja `-j` jobs, use incremental builds, limit targets in CMake, and monitor memory regularly to avoid OOM kills."
  code={`# Example: limit jobs to 4
ninja -j4

# Rebuild only changed files
ninja`}
/>

## More Articles

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

  <TabItem value="social" label="📣 Social Media">

            - [🐦 Twitter - CompilerSutra](https://twitter.com/CompilerSutra)
            - [💼 LinkedIn - Abhinav](https://www.linkedin.com/in/abhinavcompilerllvm/)
            - [📺 YouTube - CompilerSutra](https://www.youtube.com/@compilersutra)

  </TabItem>
</Tabs>
> ***Will cover more in upcoming artilce***

<div>
  <AdBanner />
</div>



<LlvmSeoBooster topic="fix-build" />
