---
title: "Vulkan compute and SPIR-V"
description: "How high-level compute shaders compile to SPIR-V intermediate representation, and how Vulkan runtime layouts lower bytecode into GPU machine code."
keywords:
  - Vulkan compute
  - SPIR-V
  - compute pipeline
  - pipeline layout
  - VkShaderModule
  - VkComputePipelineCreateInfo
  - GLSL compute shader
  - HLSL compute
  - glslangValidator
  - DXC
  - descriptor sets
  - push constants
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/vulkan-compute
---

In Vulkan, compute kernels do not compile directly to GPU hardware instructions at source level, nor are they parsed from raw text strings by the driver at runtime. Instead, source code compiles offline into Standard Portable Intermediate Representation (SPIR-V), which the Vulkan runtime pairs with a pipeline layout to form an immutable compute pipeline.

For a compiler or runtime engineer, understanding Vulkan compute requires treating SPIR-V as a target IR for frontends and an input contract for hardware drivers. The host application manages explicit memory layouts, descriptor bindings, and dispatch calls, while the vendor driver converts SPIR-V bytecode into native device instructions.

:::tip Read these first
- [/docs/parallel-computing/opencl-next-to-cuda](/docs/parallel-computing/opencl-next-to-cuda) — OpenCL platforms, contexts, and portable intermediate code.
- [/docs/gpu/what_is_gpu](/docs/gpu/what_is_gpu) — SIMT execution hardware and execution lanes.
:::

:::important What you should leave with
A Vulkan compute pipeline is created by binding an offline-compiled SPIR-V binary module to an explicit pipeline layout that describes resource memory bindings.
:::

## Why you should care

When writing high-performance compute software across multiple vendor GPUs, using source-string driver compilation (like traditional OpenCL 1.2) creates unpredictable application startup overhead and inconsistent parser behavior. proprietary APIs like CUDA or HIP restrict execution to specific runtime stacks.

Vulkan provides an explicit, cross-vendor compute interface. You write GLSL or HLSL, compile it offline into a SPIR-V binary file, and hand that binary to the driver. The code below shows a simple vector addition GLSL compute shader and the minimal C Host API calls required to hand that SPIR-V module to Vulkan.

```glsl
// vector_add.comp - GLSL source
#version 450

layout(local_size_x = 256, local_size_y = 1, local_size_z = 1) in;

layout(set = 0, binding = 0) buffer BufferA { float a[]; };
layout(set = 0, binding = 1) buffer BufferB { float b[]; };
layout(set = 0, binding = 2) buffer BufferC { float c[]; };

void main() {
    uint idx = gl_GlobalInvocationID.x;
    c[idx] = a[idx] + b[idx];
}
```

```c
// Host-side Vulkan pipeline instantiation (C API fragment)
VkShaderModuleCreateInfo moduleCreateInfo = {
    .sType = VK_STRUCTURE_TYPE_SHADER_MODULE_CREATE_INFO,
    .codeSize = spirvByteCount,
    .pCode = spirvWords // uint32_t pointer to loaded SPIR-V file
};

VkShaderModule shaderModule;
vkCreateShaderModule(device, &moduleCreateInfo, NULL, &shaderModule);

VkComputePipelineCreateInfo pipelineCreateInfo = {
    .sType = VK_STRUCTURE_TYPE_COMPUTE_PIPELINE_CREATE_INFO,
    .stage = {
        .sType = VK_STRUCTURE_TYPE_PIPELINE_SHADER_STAGE_CREATE_INFO,
        .stage = VK_SHADER_STAGE_COMPUTE_BIT,
        .module = shaderModule,
        .pName = "main" // Entry point defined in SPIR-V
    },
    .layout = pipelineLayout // Memory descriptor interface definition
};

VkPipeline computePipeline;
vkCreateComputePipelines(device, VK_NULL_HANDLE, 1, &pipelineCreateInfo, NULL, &computePipeline);
```

If the pipeline layout defined on the host does not match the set and binding indices declared inside the SPIR-V module, the Vulkan driver will access invalid memory or crash during execution.

## The mechanism

Vulkan decouples language frontends from hardware backends using a two-stage compilation model.

1. **Offline Frontend Compilation:** Tools like `glslangValidator` or `dxc` translate GLSL or HLSL source text into a SPIR-V binary (`.spv`). SPIR-V is a strongly typed, SSA-form intermediate representation stored as a sequence of 32-bit words.
2. **Runtime Driver Lowering:** The host application calls `vkCreateShaderModule` to pass SPIR-V words to the vendor driver. When `vkCreateComputePipelines` runs, the driver's JIT compiler consumes the SPIR-V module alongside the `VkPipelineLayout`, optimizes execution for the specific GPU architecture, and emits hardware binary machine code (ISA).



### The SPIR-V Intermediate Representation

SPIR-V is structured to minimize driver parsing effort. A SPIR-V binary starts with a 5-word header followed by instruction streams:

1. **Magic Number:** `0x07230203` (identifies valid SPIR-V).
2. **Version:** Target SPIR-V specification level.
3. **Generator Magic:** Identifies the compiler toolchain (e.g., glslang, LLVM).
4. **Bound:** Upper bound of SSA IDs allocated in the module.
5. **Reserved:** Must be zero.

Subsequent instructions consist of an opcode and operands. Key opcodes for compute modules include:
- `OpEntryPoint`: Specifies the stage (`GLCompute`), entry point function ID, name, and interface variables.
- `OpExecutionMode`: Configures workgroup layout (`LocalSize x y z`).
- `OpMemoryModel`: Sets memory address structures (e.g., `Logical` address model with `GLSL450` memory rules).
- `OpDecorate`: Maps SSA variables to Vulkan host interface locations using decorations like `DescriptorSet` and `Binding`.

### Descriptor Layout Matching

Unlike CUDA host pointers, Vulkan compute memory resources (buffers and textures) are bound via descriptor sets defined in the `VkPipelineLayout`. The driver requires an exact match between SPIR-V `OpDecorate` annotations and host API creation structs.

| Vulkan API Concept | SPIR-V IR Representation | GLSL Source Declaration |
| :--- | :--- | :--- |
| **Pipeline Layout** | Aggregation of set/binding layout attributes | Global variable interface block |
| **Descriptor Set** | `OpDecorate %var DescriptorSet S` | `layout(set = S) ...` |
| **Binding Slot** | `OpDecorate %var Binding B` | `layout(binding = B) ...` |
| **Storage Buffer** | `OpTypePointer Uniform` + `BufferBlock` | `layout(buffer_reference)` / `buffer BlockName` |
| **Push Constants** | `OpDecorate %var Block` + `PushConstant` | `layout(push_constant) uniform` |

## A worked example

To demonstrate how the frontend compiler targets SPIR-V and how the driver consumes it, consider a compute kernel performing a parallel reduction step using shared workgroup memory.

### Step 1: GLSL Source Code

```glsl
// reduction.comp
#version 450

layout(local_size_x = 256, local_size_y = 1, local_size_z = 1) in;

layout(set = 0, binding = 0) readonly buffer InputBuffer {
    float inData[];
};

layout(set = 0, binding = 1) writeonly buffer OutputBuffer {
    float outData[];
};

shared float sdata[256];

void main() {
    uint tid = gl_LocalInvocationID.x;
    uint gid = gl_GlobalInvocationID.x;

    sdata[tid] = inData[gid];
    barrier();

    for (uint s = gl_WorkGroupSize.x / 2; s > 0; s >>= 1) {
        if (tid < s) {
            sdata[tid] += sdata[tid + s];
        }
        barrier();
    }

    if (tid == 0) {
        outData[gl_WorkGroupID.x] = sdata[0];
    }
}
```

### Step 2: Disassembled SPIR-V Representation

Compiling this using `glslangValidator -V reduction.comp -o reduction.spv` and disassembling via `spirv-dis` yields the underlying SPIR-V structure:

```spirv
; SPIR-V
; Version: 1.5
; Bound: 48
; Schema: 0
               OpCapability Shader
          %1 = OpExtInstImport "GLSL.std.450"
               OpMemoryModel Logical GLSL450
               OpEntryPoint GLCompute %main "main" %gl_LocalInvocationID %gl_GlobalInvocation.ID %gl_WorkGroupID
               OpExecutionMode %main LocalSize 256 1 1

; Decorate Storage Buffers and Bindings
               OpDecorate %inData ArrayStride 4
               OpDecorate %InputBuffer Block
               OpDecorate %0 DescriptorSet 0
               OpDecorate %0 Binding 0
               OpDecorate %outData ArrayStride 4
               OpDecorate %OutputBuffer Block
               OpDecorate %1 DescriptorSet 0
               OpDecorate %1 Binding 1

; Types, Constants, and Variables
       %void = OpTypeVoid
          %3 = OpTypeFunction %void
      %float = OpTypeFloat 32
       %uint = OpTypeInt 32 0
   %uint_256 = OpConstant %uint 256
%_ptr_Workgroup_float = OpTypePointer Workgroup %float
     %sdata = OpVariable %_ptr_Workgroup_float Workgroup

; Main Entry Point Implementation
       %main = OpFunction %void None %3
      %label = OpLabel
               ; Kernel logic lowered to SSA blocks
               OpReturn
               OpFunctionEnd
```

### Line-by-Line Breakdown of the Assembly Mechanics

1. `OpCapability Shader`: Declares that this module targets standard graphics/compute shader execution environments rather than OpenCL kernel execution modes.
2. `OpMemoryModel Logical GLSL450`: Specifies logical addressing (pointers cannot be cast to arbitrary raw integers unless extended physical storage buffer extensions are used).
3. `OpExecutionMode %main LocalSize 256 1 1`: Hardcodes workgroup block dimensions into the binary header, driving thread dispatch behavior inside hardware warps/wavefronts.
4. `OpDecorate %0 DescriptorSet 0` & `OpDecorate %0 Binding 0`: Establishes the exact runtime memory contract host code must define when allocating descriptor tables.
5. `OpVariable %_ptr_Workgroup_float Workgroup`: Allocates shared workgroup memory (local memory in OpenCL terms).

## What the compiler and runtime can and cannot do

Understanding the division of responsibilities prevents validation errors and runtime driver crashes.

### What the Offline Compiler Does
- Parses high-level shader syntax (GLSL/HLSL), performs static type checking, type propagation, and dead code elimination.
- Generates target-agnostic SSA intermediate representation formatted as legal SPIR-V words.
- Embeds layout binding meta-information directly into the binary.

### What the Runtime Driver Does
- Verifies SPIR-V bytecode structure during `vkCreateShaderModule`.
- Translates target-agnostic SPIR-V into device machine code (ISA) during `vkCreateComputePipelines`.
- Maps local workgroup allocations to physical GPU shared memory/register files.
- Analyzes [register pressure](/docs/compilers/techblog/register-pressure-on-gpu/) to select warp execution widths and determine maximum occupancy.

### What the Compiler and Runtime Cannot Do
- **Dynamic Structural Layout Changes:** The driver cannot alter pipeline layout descriptor count after `VkPipeline` creation. Compute pipeline objects are immutable.
- **Implicit Pointer Type Conversion:** Unless the host enables specific physical pointer extensions (`VK_KHR_buffer_device_address`), the SPIR-V model prevents converting generic memory addresses into compute types.
- **Cross-Boundary Host Synchronization:** The driver JIT cannot guess host submission sequence. The application engineer must manage memory barriers and execution dependencies using host commands (`vkCmdPipelineBarrier`).

## Common misconceptions

### MISCONCEPTION: SPIR-V is hardware machine code
**CORRECTION:** SPIR-V is a vendor-neutral intermediate bytecode format. It contains abstract SSA instructions. The Vulkan driver's internal compiler must still compile SPIR-V into native hardware instructions (such as AMD RDNA or NVIDIA SASS) at runtime.

### MISCONCEPTION: Any valid SPIR-V file runs on any Vulkan hardware driver
**CORRECTION:** Vulkan devices declare capabilities via features and extensions. SPIR-V files utilizing specific capabilities (such as 16-bit floating-point math, 64-bit integers, or subgroup operations) will fail pipeline creation if the underlying hardware driver does not support those SPIR-V capabilities.

### MISCONCEPTION: Recreating VkShaderModule is required for every dispatch
**CORRECTION:** `VkShaderModule` is purely an intermediate container holding SPIR-V words. Once `VkPipeline` creation is complete, the driver has compiled the module into target device code. The host application can safely destroy the `VkShaderModule` while retaining the compiled `VkPipeline`.

## Where this leaves you

When building or targeting a Vulkan compute pipeline:

1. Compile shader source code offline using `glslangValidator -V` or `dxc -T cs_6_0` to catch syntax errors early and generate SPIR-V.
2. Ensure every `set` and `binding` index declared in SPIR-V matches the `VkDescriptorSetLayoutBinding` array used to build the `VkPipelineLayout`.
3. Destroy `VkShaderModule` after creating `VkPipeline` to free host system memory.

## What To Read Next

- [/docs/gpu/what_is_gpu](/docs/gpu/what_is_gpu) — SIMT execution model and physical core layouts.
- [/docs/parallel-computing/opencl-next-to-cuda](/docs/parallel-computing/opencl-next-to-cuda) — Comparing platform host structures and cross-vendor device models.
- [/docs/compilers/techblog/register-pressure-on-gpu/](/docs/compilers/techblog/register-pressure-on-gpu/) — Understanding how register allocations impact GPU occupancy.

![Diagram](/img/parallel/vulkan-compute.svg)

## References

- Khronos Group. *Vulkan Architecture & API Specification*.
- Khronos Group. *SPIR-V Specification (Version 1.6)*.
- David Kirk and Wen-mei Hwu. *Programming Massively Parallel Processors*.
