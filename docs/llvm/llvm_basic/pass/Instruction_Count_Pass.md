---
title: "Creating an LLVM Function Instruction Count Pass"
description: "A comprehensive guide to creating an LLVM pass that counts the number of instructions in each function. Covers implementation, registration, and testing."
keywords:
  - LLVM Function Instruction Count
  - LLVM Pass Creation
  - LLVM Pass Tutorial
  - Function Analysis in LLVM
  - Compiler Pass Development
  - How to Write LLVM Pass
tags:
  - LLVM
  - Compiler Development
  - Function Pass
  - Instruction Count Pass
  - Performance Analysis
---

import LlvmSeoBooster from '@site/src/components/llvm/LlvmSeoBooster';


# LLVM Function Instruction Count Pass



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

This document provides an overview of how to write, build, and use an LLVM pass that counts the number of instructions in each function within a module. This pass is useful for performance analysis, code size estimations, and understanding the structure of functions in LLVM IR.

## Prerequisites

Before using this pass, ensure you have the following:

- A working LLVM build environment.
- Basic knowledge of LLVM passes and the LLVM pass pipeline.
- Familiarity with C++ and LLVM's API.

If you're not familiar with building LLVM, please visit the official [LLVM documentation](https://llvm.org/docs/) and [build instruction](../Build.md) for guidance on how to build LLVM from source.


## Overview

The LLVM Function Instruction Count Pass is designed to count the number of instructions in each function of an LLVM module. The pass iterates over each function and counts the instructions in its basic blocks. The total instruction count for each function is printed to the standard error output.

### Key Files

1. **FunctionCount.h** - Defines the header for the `FunctionCountPass` class, which extends the `FunctionPass` class.
2. **FunctionCount.cpp** - Implements the logic for counting the number of instructions in a function.
3. **PassRegistry.def** - Registers the new pass to make it available for use within the LLVM pass pipeline.
4. **CMakeLists.txt** - Modifies the build system to include and compile the new source files.
5. **PassBuilder.cpp** - Integrates the pass into the LLVM pass builder to ensure it can be used in the pass manager.

## Features

- **Counts Instructions**: The pass counts the number of instructions in each function.
- **Integration with LLVM**: Easily integrates with the LLVM pipeline for custom optimizations and analyses.
- **Customizable Output**: The result (number of instructions) is printed to the standard error stream for each function.

:::note
<details>
<summary>Logic Behind the Code</summary>

To fully understand the reasoning behind the code, it's important to grasp how different components (such as basic blocks, functions, and modules) interact with each other. For a deeper understanding of these concepts and their relationships, explore the:

1. [LLVM documentation](https://llvm.org/docs/)
2. [LLVM Pass Framework](https://blog.k3170makan.com/2020/04/learning-llvm-i-introdution-to-llvm.html)
3. [Getting Started With LLVM](https://www.linkedin.com/pulse/getting-started-llvm-abhinav-tiwari/?trackingId=1abCbVSBTKesyNxUHGPXOg%3D%3D)

</details>
:::



## How to Create and Build the Pass

### 1. Create the Pass Header File (`FunctionCount.h`)
 This file will be created at the location 
 **Path**: `/path/to/llvm-project/llvm/include/llvm/Transforms/Utils/FunctionName.h`


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

### 2. Implement the Pass Logic (`FunctionCount.cpp`)

 This file will be created at the location 
 **Path**: `/path/to/llvm-project/llvm/lib/Transforms/Utils/FunctionCount.cpp`

```cpp
#include "llvm/Transforms/Utils/FunctionCount.h"
#include "llvm/IR/Function.h"
#include "llvm/Support/raw_ostream.h"

using namespace llvm;

PreservedAnalyses FunctionNamePass::run(Function &F, FunctionAnalysisManager &AM) {
    static int Counter = 1; // Static counter to number the functions
    unsigned int InstructionCount = 0;
    for( auto &BB : F){
		InstructionCount+=BB.size();

}
    errs() << "Function #" << Counter++ << ": " << F.getName() << " has " << InstructionCount << " instructions"<<"\n";
    return PreservedAnalyses::all();
}
```

### 3. Register the Pass in the Pass Registry (`PassRegistry.def`)

This file will be created at the location
**PATH**: `/path/to/llvm-project/llvm/lib/Passes/PassRegistry.def`
```cpp
// Add your pass to the PassRegistry to allow it to be used in the LLVM pipeline
// Add this line to the PassRegistry.def file:
FUNCTION_PASS("countfun",FunctionNamePass())
```

### 4. Modify `PassBuilder.cpp` to Include Your Pass

This file will be created at the location
**PATH**: `/path/to/llvm-project/llvm/lib/Passes/PassBuilder.cpp`
```cpp
//just include the header
#include "llvm/Transforms/Utils/FunctionCount.h"
```

### 5. Update CMakeLists.txt

Ensure your new source files are added to the build system.
This changes should be done in the file
**PATH**: `/path/to/llvm-project/llvm/lib/Transforms/Utils/CMakeLists.txt`
```cmake
+++ b/llvm/lib/Transforms/Utils/CMakeLists.txt
@@ -88,6 +88,7 @@ add_llvm_component_library(LLVMTransformUtils
   Utils.cpp
   ValueMapper.cpp
   VNCoercion.cpp
+  FunctionCount.cpp

   ADDITIONAL_HEADER_DIRS
   ${LLVM_MAIN_INCLUDE_DIR}/llvm/Transforms
```

### 6. Build the Pass

Once the code changes are made, recompile LLVM to include the new pass.

```bash
cd build
cmake ..
ninja 
```

### 7. Running the Pass

After building LLVM with the new pass, you can run the pass using the `opt` tool. Here's how you would run the pass on a specific LLVM IR file:

```bash
 /path/to/llvm-project/build/bin/opt  -disable-output -passes=countfun hello.ll
```

### 8. Test File you can Take as
```cpp
; ModuleID = 'test_module'
source_filename = "test.ll"

define i32 @main() {
entry:
  %retval = alloca i32, align 4
  store i32 0, i32* %retval, align 4
  %0 = load i32, i32* %retval, align 4
  %add = add i32 %0, 1
  store i32 %add, i32* %retval, align 4
  %1 = load i32, i32* %retval, align 4
  ret i32 %1
}
```
***Output***
```bash
 /path/to/llvm-project/llvm/build/bin/opt  -disable-output -passes=countfun test.ll
Function #1: main has 7 instructions
```
:::note
You can test your pass with a custom C++ file by following these steps:

1. **Generate the LLVM IR** from your C++ file using `clang++`:

    ```bash
    clang++ -S -emit-llvm -o filename.ll file.cpp
    ```

2. **Run the LLVM pass** to count the instructions for each function in the generated LLVM IR file:

    ```bash
    /path/to/llvm-project/build/bin/opt -disable-output -passes=countfun filename.ll
    ```

This command will output the instruction count for each function in the provided LLVM IR file.

If you encounter any difficulties, feel free to reach out via email at [info@compilersutra.com](mailto:info@compilersutra.com).
:::



## Conclusion

This pass provides valuable insights into the instruction counts of functions within an LLVM module. It can be used as part of custom optimizations or analysis within the LLVM framework.

<LlvmSeoBooster topic="instruction-count-pass" />
