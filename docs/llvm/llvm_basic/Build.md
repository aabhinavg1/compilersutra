---
title: "LLVM Tutorial - Learn LLVM Step by Step"
description: "Comprehensive guide to understanding LLVM: From function passes to creating your own LLVM passes and developing a compiler pass. Ideal for learners and developers."
keywords:
  - LLVM Tutorial
  - LLVM Function Pass
  - LLVM Pass Creation
  - Compiler Pass Development
  - Function Analysis in LLVM
  - LLVM for Beginners
  - Advanced LLVM Techniques
  - LLVM Optimization
  - Writing Compiler Passes
  - Clang and LLVM Integration
  - LLVM Architecture and Design
tags:
  - LLVM
  - Compiler Development
  - Compiler Pass
  - LLVM Development
  - Compiler Optimization
  - Clang
  - Programming Tutorials
  - Open Source Compiler
  - LLVM IR
  - Machine Learning in LLVM
---

import LlvmSeoBooster from '@site/src/components/llvm/LlvmSeoBooster';

# LLVM with Clang Build Instructions



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

This guide explains how to set up, build, and test LLVM with Clang on your local machine.

## Prerequisites

Before you start building LLVM and Clang, make sure the following software is installed:

- **CMake** (version 3.13 or higher)
- **Ninja** (recommended for faster builds)
- **Python** (for running tests)
- **Git** (optional for version control)
 ## Installing Dependencies

    <details>
    <summary>Linux</summary>

    ```bash
    sudo apt-get install cmake ninja-build python3 git
    ```
    </details>

     <details>
    <summary>Windows</summary>

    :::note
    With [Visual Studio](https://llvm.org/docs/GettingStartedVS.html#requirements)
    :::

    ```bash
    With WSL
    sudo apt update
    sudo apt install build-essential cmake ninja-build python3

    ````

    </details>



    <details>
    <summary>MacOS</summary>

    ```bash
    brew install cmake ninja python git
    ```
    </details>


    ## Cloning the LLVM Project
    Clone the LLVM project from GitHub. This includes Clang and other subprojects
      ```bash
    git clone https://github.com/llvm/llvm-project.git
    cd llvm-project
    ```

    If you want to build a specific release, check out the corresponding tag. For example:
    ```bash
    git checkout llvmorg-16.0.0
    ```
    ## Configuring the Build
    Create a separate directory for building the project:

    ```bash
    mkdir build
    cd build
    ```
    <details>
    <summary>Linux</summary>

    ```bash
cmake -G "Ninja" -DCMAKE_BUILD_TYPE=Release \
      -DLLVM_ENABLE_PROJECTS="clang;lld" \
      -DLLVM_TARGETS_TO_BUILD="X86;AMDGPU" \
      ../llvm

    ```
    </details>

    <details>
    <summary>macOS</summary>

    ```bash
cmake -G "Ninja" -DCMAKE_BUILD_TYPE=Release \
      -DLLVM_ENABLE_PROJECTS="clang;lld" \
      -DLLVM_TARGETS_TO_BUILD="X86;AMDGPU" \
      ../llvm
    ```
    </details>

    <details>
    <summary>Windows</summary>

    ```bash
cmake -G "Ninja" -DCMAKE_BUILD_TYPE=Release \
      -DLLVM_ENABLE_PROJECTS="clang;lld" \
      -DLLVM_TARGETS_TO_BUILD="X86;AMDGPU" \
      ../llvm
    ```
  :::note
    for the [visual Studio](https://llvm.org/docs/GettingStartedVS.html#getting-started)
  :::
    </details>

## Configuring the Build

Create a separate directory for building the project:

```bash
mkdir build
cd build
```



```bash
cmake -G Ninja -DLLVM_ENABLE_PROJECTS=clang -DCMAKE_BUILD_TYPE=Release ../llvm
```

:::note

- `-DLLVM_ENABLE_PROJECTS=clang`: This enables Clang to be built alongside LLVM.
- `-DCMAKE_BUILD_TYPE=Release`: Builds LLVM in release mode with optimizations.
- `-DLLVM_TARGETS_TO_BUILD=X86`: You can specify the target architecture(s). Replace `X86` with your desired architecture (e.g., `ARM`, `AArch64`).

[For other Cmake flag please visit](https://llvm.org/docs/CMake.html#options-and-variables)
Configure the build using **CMake**. It's recommended to use **Ninja** as the build system for faster builds.

If on windows you are facing any issue with the ninja build try with the Visual studio build or use [WSL](https://learn.microsoft.com/en-us/windows/wsl/install)
:::
## Building LLVM with Clang

Once the configuration is complete, build the project:

```bash
ninja
```

If you are not using Ninja, you can use Make instead:

```bash
make
```

The build process can take some time depending on your machine's specifications.

## Running Tests

After the build is complete, you can run the tests to ensure everything is working correctly:

```bash
ninja check-all
```

This command will run all available tests for LLVM, Clang, and other enabled subprojects.

## Cleaning Up the Build

To clean the build directory, run:

```bash
ninja clean
```

Or with Make:

```bash
make clean
```


## Short Summary

1. **Prerequisites**: Install CMake, Ninja, Python, and Git.

2. **Install Dependencies**:
   - **Linux**: 
     ```bash
     sudo apt-get install cmake ninja-build python3 git
     ```
   - **Windows (WSL)**: 
     ```bash
     sudo apt update && sudo apt install build-essential cmake ninja-build python3
     ```
   - **macOS**: 
     ```bash
     brew install cmake ninja python git
     ```

3. **Clone the LLVM Project**: 
   ```bash
   git clone https://github.com/llvm/llvm-project.git
   cd llvm-project
   git checkout llvmorg-1.0.0  # Optional for specific version

4. **Configure and Build**
```bash
mkdir build
cd build
cmake -G "Ninja" -DCMAKE_BUILD_TYPE=Release -DLLVM_ENABLE_PROJECTS="clang;lld" -DLLVM_TARGETS_TO_BUILD="X86;AMDGPU" ../llvm
ninja
```


## Additional Resources

For more details, refer to the official LLVM documentation:
- [LLVM Build Instructions](https://llvm.org/docs/GettingStarted.html)
- [CMake Guide for LLVM](https://llvm.org/docs/CMake.html)

<LlvmSeoBooster topic="build-llvm" />
