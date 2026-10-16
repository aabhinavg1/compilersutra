---
title: "Edge and the NPU"
description: "Offline compilation, TOSA, LiteRT, ExecuTorch, XNNPACK, and the NPU delegates that take a subgraph."
slug: /ml-compilers/edge-and-the-npu/
hide_table_of_contents: true
displayed_sidebar: mlChapter31Sidebar
sidebar_position: 19
keywords:
  - edge AI compiler
  - TOSA
  - LiteRT
  - ExecuTorch
  - XNNPACK
  - NPU
  - QNN
  - OpenVINO
---

import AdBanner from '@site/src/components/AdBanner';

# Edge and the NPU

Chapter 22 maps one MatMul onto a CPU and onto a GPU. A phone, a camera, and a laptop NPU add limits those two pictures leave out. The compile finishes before the device is in someone's hand. The binary has to be small. The arithmetic is often integer. The fast memory is a small on-chip SRAM.


## Compile before you ship {#compile-before-you-ship}

The device does not run Python, and it usually cannot spend a launch searching tile sizes. The compiler runs on a workstation. The artifact is a flatbuffer or a program file. The device runtime loads that file and launches it. The shapes you compiled are the shapes the device will accept. A guard from Chapter 10 still checks the symbol at the start of the run.

## TOSA {#tosa}

TOSA is a short list of operators with a defined numeric result. An edge compiler legalizes the imported graph onto that list. An operator the list does not contain becomes operators the list does contain. That rewrite is legalization, Chapter 16.10. After it, every backend of that compiler sees the same operators.

[IREE](/docs/ml-compilers/iree/) can import TOSA and then leave through `llvm-cpu` or `vulkan-spirv`. The legal set is the point of the import. The exit is still one of the three from Chapter 13.

## Two program files {#two-program-files}

LiteRT, the runtime continued from TensorFlow Lite, stores the model as a flatbuffer. An interpreter walks the operators, or a delegate takes a subgraph to an accelerator.

ExecuTorch stores a PyTorch export as a `.pte` program. A partition, the same idea as an execution provider, sends pieces to XNNPACK, Core ML, Vulkan, or a vendor NPU delegate.

## The mobile CPU {#the-mobile-cpu}

XNNPACK is a library of floating-point and integer kernels for ARM and x86. LiteRT and ExecuTorch call it when a delegate leaves a node behind. On a phone, XNNPACK is the CPU provider.

## The NPU delegates {#the-npu-delegates}

A delegate claims the subgraph the accelerator implements.

- NNAPI is the Android entry. The driver behind it may be a GPU or an NPU.
- Core ML runs the subgraph Apple's compiler accepted, including work for the Apple Neural Engine.
- Qualcomm QNN targets the Hexagon NPU.
- OpenVINO targets Intel CPUs, GPUs, and NPUs.

[ONNX Runtime](/docs/ml-compilers/onnx-runtime/) reaches the same chips through its QNN, CoreML, and OpenVINO providers. The file is ONNX. The silicon is the delegate's silicon.

A delegate that refuses one operator splits the graph. The refused node runs on the CPU, and the tensors cross. That is the fallback copy from the ONNX Runtime chapter, on a smaller memory budget.

## Integer is the common dtype {#integer-is-the-common-dtype}

The graph often arrives as a float operator wrapped in quantize and dequantize. Calibration has already chosen the scale and the zero-point. The edge compiler folds that pair into an integer kernel when XNNPACK or the NPU has one, and it leaves the float operator where they do not. Chapter 20 is that rewrite. Chapter 18 is the check that decides whether the integer result is close enough.

## What To Read Next

- [ONNX Runtime](/docs/ml-compilers/onnx-runtime/)
- [IREE](/docs/ml-compilers/iree/)
- [Attention and the Shipped Model](/docs/ml-compilers/attention-and-the-shipped-model/)

<div>
  <AdBanner />
</div>
