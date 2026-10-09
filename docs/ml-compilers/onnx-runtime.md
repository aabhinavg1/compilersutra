---
title: "ONNX Runtime"
description: "The ONNX Runtime session, graph optimization levels, execution providers, device fallback, and the mobile and web builds."
slug: /ml-compilers/onnx-runtime/
hide_table_of_contents: true
displayed_sidebar: mlChapter29Sidebar
sidebar_position: 17
keywords:
  - ONNX Runtime
  - execution provider
  - ORT graph optimization
  - XNNPACK
  - ONNX Runtime Web
  - ONNX Runtime mobile
---

import AdBanner from '@site/src/components/AdBanner';

# ONNX Runtime

[ONNX and the Operator Graph](/docs/ml-compilers/onnx-and-the-operator-graph/) is the file. ONNX Runtime is the program that loads that file, rewrites the graph, and runs it.


## The session {#the-session}

An inference session holds the model, the providers you asked for, and the graph after optimization. Creating the session is the compile step. Each later call is a run against weights that stay frozen.

## Graph optimization levels {#graph-optimization-levels}

The session takes one of four levels.

- Disabled. Nodes run as the exporter wrote them.
- Basic. Constant folding and small local rewrites.
- Extended. Fusions that still leave an ONNX operator behind.
- All. Layout transforms included. A transpose can disappear because the next kernel reads the other layout.

These are the passes in Chapter 16, stopped before a schedule. The node that remains still needs an implementation.

## The partition {#the-partition}

Each execution provider reports the nodes it can run. The runtime assigns a subgraph to a provider, in the order the providers were registered. The CPU provider can take whatever remains.

The providers you will meet by name:

- CPU, which is always available.
- CUDA, for NVIDIA GPUs.
- TensorRT, which may build an engine for the subgraph it claims.
- OpenVINO, for Intel CPUs, GPUs, and NPUs.
- CoreML, for Apple devices.
- QNN, for Qualcomm NPUs.
- XNNPACK, for mobile-style CPU kernels.

A new device, in this design, is a new provider. That is the rule from Chapter 12, with the names filled in.

## The fallback copy {#the-fallback-copy}

One unsupported node in the middle of a device subgraph splits that subgraph. The tensor moves to the provider that can run the node, then moves back. The score can still match. The time now includes those copies. Chapter 22.7 is the same fact stated for a whole graph that stays on one device.

## Binding the buffers {#binding-the-buffers}

IO binding tells the session to read and write tensors that already live on the device. Without that binding, a run can copy the input from the host and the output back. Intermediates can stay on the device, and the ends of the graph still pay for a copy every call.

## Mobile and the web {#mobile-and-the-web}

ONNX Runtime Mobile ships a smaller binary and can load a converted flatbuffer in place of the protobuf ONNX file. ONNX Runtime Web runs in the browser: WebAssembly for the CPU path, and WebGPU when that provider is present. The session and the provider list are the same idea. The binary is smaller, and the device list is shorter.

## A fusion stays inside one provider {#a-fusion-stays-inside-one-provider}

A fusion written for the TensorRT provider is not a fusion for the CUDA provider. Each provider brings its own kernels. [IREE](/docs/ml-compilers/iree/) is the other shape: one lowering, then a choice of exit.

## What To Read Next

- [The Stack Map](/docs/ml-compilers/the-stack-map/)
- [IREE](/docs/ml-compilers/iree/)
- [Edge and the NPU](/docs/ml-compilers/edge-and-the-npu/)

<div>
  <AdBanner />
</div>
