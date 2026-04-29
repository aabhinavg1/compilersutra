---
title: "Creating an LLVM Function Pass in C/C++"
description: "Step-by-step guide to creating an LLVM function pass to count and name functions in C/C++ code. Includes implementation, registration, and testing."
keywords:
  - LLVM Function Pass
  - LLVM Pass Creation
  - LLVM C++ Tutorial
  - Compiler Pass Development
  - Function Analysis in LLVM
tags:
  - LLVM
  - Compiler Development
  - Function Pass
---

import LlvmSeoBooster from '@site/src/components/llvm/LlvmSeoBooster';

# Creating an LLVM Function Pass in C/C++



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

This guide explains how to create a function pass in LLVM to count and name functions in C/C++ code. Below are the steps to set up LLVM from source, implement your function pass, and test it.

You have to keep the following things in the mind to create pass:
1. What pass you want to create (its header and Cpp file).
2. Register the Pass.
3. Test the pass.

---

## Steps to Create an LLVM Function Pass

### 1. Clone LLVM Source Code

Start by cloning the LLVM repository from GitHub:

```bash
git clone https://github.com/llvm/llvm-project.git
cd llvm-project
```

---

### 2. Create a Build Directory and Configure the Build

Create a separate directory for the build to keep the source tree clean:

```bash
mkdir build
cd build
cmake -G Ninja ../llvm -DCMAKE_BUILD_TYPE=Release -DLLVM_ENABLE_PROJECTS="clang" -DLLVM_ENABLE_RTTI=ON
```

- `-DCMAKE_BUILD_TYPE=Release`: Configures the build for a release version.
- `-DLLVM_ENABLE_PROJECTS="clang"`: Enables Clang project during build.
- `-DLLVM_ENABLE_RTTI=ON`: Enables Run-Time Type Information.

Once configured, you can build LLVM using Ninja:

```bash
ninja
```

---

### 3. Create the Pass Header File
Define the structure and interface of your pass in a header file.

**Path**: `llvm/include/llvm/Transforms/Utils/FunctionName.h`

```cpp
#ifndef LLVM_TRANSFORMS_UTILS_FUNCTIONNAME_H
#define LLVM_TRANSFORMS_UTILS_FUNCTIONNAME_H

#include "llvm/IR/PassManager.h"

namespace llvm {

class FunctionNamePass : public PassInfoMixin<FunctionNamePass> {
public:
    PreservedAnalyses run(Function &F, FunctionAnalysisManager &AM);
};

} // namespace llvm

#endif // LLVM_TRANSFORMS_UTILS_FUNCTIONNAME_H
```

---

### 4. Implement the Pass
Write the logic for your pass in the implementation file.

**Path**: `llvm/lib/Transforms/Utils/FunctionName.cpp`

```cpp
#include "llvm/Transforms/Utils/FunctionName.h"
#include "llvm/IR/Function.h"
#include "llvm/Support/raw_ostream.h"

using namespace llvm;

PreservedAnalyses FunctionNamePass::run(Function &F, FunctionAnalysisManager &AM) {
    static int Counter = 1; // Static counter to number the functions
    errs() << "Function #" << Counter++ << ": " << F.getName() << "
";
    return PreservedAnalyses::all();
}
```

---

### 5. Register the Pass
Update the **PassRegistry** and **PassBuilder** to register your new pass.

#### Update `llvm/lib/Passes/PassRegistry.def`
Add the following line:

```cpp
FUNCTION_PASS("functionname", FunctionNamePass())
```

#### Update `llvm/lib/Passes/PassBuilder.cpp`
Include your header file and register the pass:

```cpp
#include "llvm/Transforms/Utils/FunctionName.h"
```

---

### 6. Add Your Pass to the Build System
Edit the **CMakeLists.txt** file to include your new files.

**Path**: `llvm/lib/Transforms/Utils/CMakeLists.txt`

Add the new source files:

```cmake
add_llvm_library(LLVMTransformsUtils
    ...
    FunctionName.cpp
)
```

---

### 7. Build LLVM
Rebuild LLVM to include your pass.

```bash
cd /path/to/llvm/build
ninja
```

---

### 8. Test the Pass
Run your pass using the `opt` tool.

#### Example C Code:
```c
// test.c
int add(int a, int b) {
    return a + b;
}

int main() {
    return add(2, 3);
}
```

#### Commands to Run:
1. Generate LLVM IR:
    ```bash
    clang -S -emit-llvm test.c -o test.ll
    ```

:::note
In `test.ll`, you will see the following:
```llvm
attributes #0 = { noinline nounwind optnone ssp uwtable(sync) "frame-pointer"="non-leaf" }
```

To run your pass, **remove the `optnone` attribute**. You can do this manually or using `sed`:

```bash
sed -i '' 's/optnone//g' test.ll
```
:::

2. Apply the Pass:
   ```bash
   /path/to/llvm/build/bin/opt -disable-output -passes=functionname test.ll
   ```

#### Expected Output:
```bash
Function #1: add
Function #2: main
```

---

### Notes for Windows Users

#### Using WSL (Windows Subsystem for Linux)
For Windows, you can use WSL to build and test LLVM. Follow the same steps in the WSL terminal.

#### Modifying the Generated LLVM IR
If you encounter issues such as `optnone` in the attributes, you can remove the `optnone` attribute using the following sed command:

```bash
sed -i 's/optnone//g' test.ll
```

After removing `optnone`, re-run the `opt` command to observe the expected output.

---

### Reference
- [Why to Remove optnone](https://stackoverflow.com/questions/73537920/llvm-opt-unable-to-print-instructions-from-a-specific-function-but-it-does-for)
- [What is LLVM Pass](https://www.llvm.org/docs/Passes.html)

<LlvmSeoBooster topic="function-count-pass" />
