import React from 'react';
import Link from '@docusaurus/Link';
import track from './track.module.css';
import styles from './curriculum.module.css';

const LESSON = '/docs/ml-compilers';

function topic(id, title, covers, href) {
  return {kind: 'topic', id, title, covers, href};
}

function chapter(id, title, href) {
  return {kind: 'chapter', id, title, href};
}

function part(label) {
  return {kind: 'part', label};
}

const lesson = (slug, hash) =>
  hash ? `${LESSON}/${slug}/#${hash}` : `${LESSON}/${slug}/`;

const ROWS = [
  part('Part I. Programs to AI'),
  chapter('1', 'A normal program', lesson('programs-as-rules')),
  topic('1.1', 'Input, steps, output', 'The shape of every program', lesson('programs-as-rules', 'input-steps-output')),
  topic('1.2', 'A choice in code', 'A condition picks a branch', lesson('programs-as-rules', 'a-choice-in-code')),
  topic('1.3', 'Situation and action', 'The situation is the input. The action is the output.', lesson('programs-as-rules', 'situation-and-action')),
  topic('1.4', 'Rules, trees, and tables', 'Humans write the cases down', lesson('programs-as-rules', 'rules-trees-and-tables')),
  topic('1.5', 'A list that covers the cases', 'Fixed rules are a good program when the cases are known', lesson('programs-as-rules', 'a-list-that-covers-the-cases')),
  topic('1.6', 'Too many interacting cases', 'The list stops being something a person can finish', lesson('programs-as-rules', 'too-many-interacting-cases')),
  topic('1.7', 'Behavior from examples', 'The next chapter’s starting point', lesson('programs-as-rules', 'behavior-from-examples')),

  chapter('2', 'What AI is', lesson('what-ai-is')),
  topic('2.1', 'An aim, and the ways under it', 'Rules, machine learning, and deep networks sit under one aim', lesson('what-ai-is', 'an-aim-and-the-ways-under-it')),
  topic('2.2', 'Examples, a procedure, a model', 'The model is the result of learning', lesson('what-ai-is', 'examples-a-procedure-a-model')),
  topic('2.3', 'Features and labels', 'Numbers in, and the answer the example carried', lesson('what-ai-is', 'features-and-labels')),
  topic('2.4', 'Architecture plus parameters', 'The shape of the math, and the values training writes', lesson('what-ai-is', 'architecture-plus-parameters')),
  topic('2.5', 'Prediction and generalization', 'A new input, and behavior that holds on it', lesson('what-ai-is', 'prediction-and-generalization')),
  topic('2.6', 'Neuron, layer, a deep stack', 'A shallow network is a neural network. Deep means many layers.', lesson('what-ai-is', 'neuron-layer-a-deep-stack')),
  topic('2.7', 'The compiler reads the inference math', 'The training recipe stays outside the compiler', lesson('what-ai-is', 'the-compiler-reads-the-inference-math')),

  chapter('3', 'Learning types', lesson('learning-types')),
  topic('3.1', 'Supervised learning', 'Input paired with the intended output', lesson('learning-types', 'supervised-learning')),
  topic('3.2', 'Classification and regression', 'A category, or a number', lesson('learning-types', 'classification-and-regression')),
  topic('3.3', 'Unsupervised learning', 'Structure with no label', lesson('learning-types', 'unsupervised-learning')),
  topic('3.4', 'Self-supervised learning', 'The data supplies the target, as in next-token prediction', lesson('learning-types', 'self-supervised-learning')),
  topic('3.5', 'Reinforcement learning', 'A reward from interaction', lesson('learning-types', 'reinforcement-learning')),
  topic('3.6', 'The frozen forward model', 'The artifact this book compiles', lesson('learning-types', 'the-frozen-forward-model')),

  part('Part II. Decisions and runs'),
  chapter('4', 'From score to action', lesson('from-score-to-action')),
  topic('4.1', 'The model returns numbers', 'A score or a vector of scores', lesson('from-score-to-action', 'the-model-returns-numbers')),
  topic('4.2', 'A threshold turns a score into an action', 'The rule after the model', lesson('from-score-to-action', 'a-threshold-turns-a-score-into-an-action')),
  topic('4.3', 'The cost of a wrong action', 'That cost is what moves the threshold', lesson('from-score-to-action', 'the-cost-of-a-wrong-action')),
  topic('4.4', 'The decision sits outside the graph', 'The compiled program ends at the score', lesson('from-score-to-action', 'the-decision-sits-outside-the-graph')),
  topic('4.5', 'The same ending in Chapter 26', 'Score, then the Chapter 4 decision', lesson('from-score-to-action', 'the-same-ending-in-chapter-26')),

  chapter('5', 'Training', lesson('training-writes-the-weights')),
  topic('5.1', 'Data and labels', 'What the update reads', lesson('training-writes-the-weights', 'data-and-labels')),
  topic('5.2', 'Loss', 'How far the prediction is from the label', lesson('training-writes-the-weights', 'loss')),
  topic('5.3', 'Gradient descent', 'One picture of a weight update', lesson('training-writes-the-weights', 'gradient-descent')),
  topic('5.4', 'Training writes the weights', 'The artifact inference keeps', lesson('training-writes-the-weights', 'training-writes-the-weights')),
  topic('5.5', 'Forward and backward', 'Two programs. This book compiles the forward one.', lesson('training-writes-the-weights', 'forward-and-backward')),
  topic('5.6', 'A batch', 'Many examples in one tensor. The batch symbol returns in Chapter 10.', lesson('training-writes-the-weights', 'a-batch')),

  chapter('6', 'Inference', lesson('inference-is-the-computation')),
  topic('6.1', 'Weights are frozen', 'The run does not update them', lesson('inference-is-the-computation', 'weights-are-frozen')),
  topic('6.2', 'The forward pass is the computation', 'The operators that execute', lesson('inference-is-the-computation', 'the-forward-pass-is-the-computation')),
  topic('6.3', 'Two workloads', 'Training updates weights. Inference serves a result.', lesson('inference-is-the-computation', 'two-workloads')),
  topic('6.4', 'A fixed graph and fixed weights', 'What the compiler is given', lesson('inference-is-the-computation', 'a-fixed-graph-and-fixed-weights')),
  topic('6.5', 'A dimension can still be a symbol', 'Chapter 10', lesson('inference-is-the-computation', 'a-dimension-can-still-be-a-symbol')),

  part('Part III. Representation'),
  chapter('7', 'Tensors', lesson('tensors-for-compilers')),
  topic('7.1', 'Scalar, vector, matrix, tensor', 'The ladder of dimensions', lesson('tensors-for-compilers', 'scalar-vector-matrix-tensor')),
  topic('7.2', 'Shape and rank', 'Describing a tensor', lesson('tensors-for-compilers', 'shape-and-rank')),
  topic('7.3', 'Memory layout', 'Row-major, NHWC, and NCHW', lesson('tensors-for-compilers', 'memory-layout')),
  topic('7.4', 'Strides and contiguity', 'Layout as the compiler sees it: where the next element sits', lesson('tensors-for-compilers', 'strides-and-contiguity')),
  topic('7.5', 'dtypes as storage', 'FP32, FP16, BF16, and INT8. Quantization is Chapter 20.', lesson('tensors-for-compilers', 'dtypes-as-storage')),
  topic('7.6', 'Where dtype and layout are consumed', 'Chapters 13, 16, 20, and 21', lesson('tensors-for-compilers', 'where-dtype-and-layout-are-consumed')),

  chapter('8', 'What an operator means', lesson('what-an-operator-means')),
  topic('8.1', 'Weighted sum and dense layer', 'The core building block', lesson('what-an-operator-means', 'weighted-sum-and-a-dense-layer')),
  topic('8.2', 'Activations', 'ReLU, sigmoid, tanh', lesson('what-an-operator-means', 'activations')),
  topic('8.3', 'Softmax', 'A reduction, then a normalize. The reduction is why the bits move in Chapter 18.', lesson('what-an-operator-means', 'softmax')),
  topic('8.4', 'Convolution and pooling', 'Spatial operators', lesson('what-an-operator-means', 'convolution-and-pooling')),
  topic('8.5', 'Normalization', 'Mean, variance, then scale. At inference, BatchNorm’s scale and shift fold into the previous MatMul or convolution.', lesson('what-an-operator-means', 'normalization')),
  topic('8.6', 'Attention and the transformer', 'One altitude', lesson('what-an-operator-means', 'attention-and-the-transformer')),
  topic('8.7', 'Embeddings', 'IDs to vectors', lesson('what-an-operator-means', 'embeddings')),
  topic('8.8', 'Elementwise, reshape, transpose, reduce', 'The other contracts. Reshape and transpose keep the values and change the layout.', lesson('what-an-operator-means', 'elementwise-reshape-transpose-reduce')),
  topic('8.9', 'MatMul as a contract', 'Two inputs, one output, a result shape', lesson('what-an-operator-means', 'matmul-as-a-contract')),
  topic('8.10', 'The triple loop', 'One implementation', lesson('what-an-operator-means', 'the-triple-loop')),

  chapter('9', 'The computation graph', lesson('the-computation-graph')),
  topic('9.1', 'Nodes and edges', 'Operators and the values between them', lesson('the-computation-graph', 'nodes-and-edges')),
  topic('9.2', 'Inputs, weights, and outputs', 'Weights are constants. Inputs arrive at runtime.', lesson('the-computation-graph', 'inputs-weights-and-outputs')),
  topic('9.3', 'Attributes', 'Kernel size, stride, and axis are part of the operator, and they are not tensors.', lesson('the-computation-graph', 'attributes')),
  topic('9.4', 'Producers and consumers', 'Who makes and uses each value', lesson('the-computation-graph', 'producers-and-consumers')),
  topic('9.5', 'A legal execution order', 'Topological ordering', lesson('the-computation-graph', 'a-legal-execution-order')),
  topic('9.6', 'The graph is the program', 'What compilers read', lesson('the-computation-graph', 'the-graph-is-the-program')),
  topic('9.7', 'An export produces the graph', 'Chapter 12 is one such export', lesson('the-computation-graph', 'an-export-produces-the-graph')),

  chapter('10', 'Shapes, types, unknown dimensions', lesson('shapes-types-and-dynamic-dimensions')),
  topic('10.1', 'A MatMul shape rule', '[M,K] by [K,N] produces [M,N]', lesson('shapes-types-and-dynamic-dimensions', 'a-matmul-shape-rule')),
  topic('10.2', 'Shape inference', 'Each operator writes its output shape', lesson('shapes-types-and-dynamic-dimensions', 'shape-inference')),
  topic('10.3', 'Type inference', 'Element type travels with the value', lesson('shapes-types-and-dynamic-dimensions', 'type-inference')),
  topic('10.4', 'Broadcasting', 'A bias [N] added to [M,N] under a stated rule', lesson('shapes-types-and-dynamic-dimensions', 'broadcasting')),
  topic('10.5', 'Static shapes', '[1,224,224,3] fully known at compile time', lesson('shapes-types-and-dynamic-dimensions', 'static-shapes')),
  topic('10.6', 'Symbolic shapes', 'batch stays a symbol', lesson('shapes-types-and-dynamic-dimensions', 'symbolic-shapes')),
  topic('10.7', 'Constraints', 'K must match on both sides, or the graph is illegal', lesson('shapes-types-and-dynamic-dimensions', 'constraints')),
  topic('10.8', 'Compile time', 'Tiling, memory planning, and codegen use what is known', lesson('shapes-types-and-dynamic-dimensions', 'compile-time')),
  topic('10.9', 'Guards', 'Runtime checks the symbol before a specialized kernel', lesson('shapes-types-and-dynamic-dimensions', 'guards')),
  topic('10.10', 'Variants', 'One meaning, several compiled programs', lesson('shapes-types-and-dynamic-dimensions', 'variants')),

  part('Part IV. The compiler'),
  chapter('11', 'What an AI compiler is', lesson('what-an-ai-compiler-is')),
  topic('11.1', 'Traditional pipeline', 'Source to machine code', lesson('what-an-ai-compiler-is', 'traditional-pipeline')),
  topic('11.2', 'The AI pipeline', 'Model to kernels', lesson('what-an-ai-compiler-is', 'the-ai-pipeline')),
  topic('11.3', 'Frontend, middle end, backend', 'Three stages', lesson('what-an-ai-compiler-is', 'frontend-middle-end-backend')),
  topic('11.4', 'Facts a tensor compiler carries', 'Shape, layout, operator, parallel axes', lesson('what-an-ai-compiler-is', 'facts-a-tensor-compiler-carries')),
  topic('11.5', 'Goals', 'Same prediction, less time, less memory, another device', lesson('what-an-ai-compiler-is', 'goals')),
  topic('11.6', 'The six questions', 'The book’s map', lesson('what-an-ai-compiler-is', 'the-six-questions')),
  topic('11.7', 'Compiler emits, runtime launches', 'Full version in Chapter 23', lesson('what-an-ai-compiler-is', 'compiler-emits-runtime-launches')),

  chapter('12', 'ONNX', lesson('onnx-and-the-operator-graph')),
  topic('12.1', 'A versioned operator graph', 'The interchange format', lesson('onnx-and-the-operator-graph', 'a-versioned-operator-graph')),
  topic('12.2', 'Opsets and versions', 'Operator meaning is versioned', lesson('onnx-and-the-operator-graph', 'opsets-and-versions')),
  topic('12.3', 'Graph passes', 'Edits to the graph', lesson('onnx-and-the-operator-graph', 'graph-passes')),
  topic('12.4', 'Execution providers', 'Run the subgraphs they implement', lesson('onnx-and-the-operator-graph', 'execution-providers')),
  topic('12.5', 'The generic fallback', 'A missing kernel takes the generic path', lesson('onnx-and-the-operator-graph', 'the-generic-fallback')),
  topic('12.6', 'A new device is a new provider', 'How hardware plugs in', lesson('onnx-and-the-operator-graph', 'a-new-device-is-a-new-provider')),
  topic('12.7', 'The operator contract', 'ONNX names the operation and the tensor edges', lesson('onnx-and-the-operator-graph', 'the-operator-contract')),

  chapter('13', 'MLIR and three exits', lesson('mlir-and-three-exits')),
  topic('13.1', 'Why dialects exist', 'Keep facts until a pass consumes them', lesson('mlir-and-three-exits', 'why-dialects-exist')),
  topic('13.2', 'The dialect ladder', 'ONNX or tensor ops, then structured ops, then loops, then a GPU dialect or the LLVM dialect', lesson('mlir-and-three-exits', 'the-dialect-ladder')),
  topic('13.3', 'SSA, blocks, regions', 'IR structure', lesson('mlir-and-three-exits', 'ssa-blocks-regions')),
  topic('13.4', 'Shape and layout kept', 'Until the right pass', lesson('mlir-and-three-exits', 'shape-and-layout-kept')),
  topic('13.5', 'Exit 1: LLVM', 'CPU and LLVM-backed GPU', lesson('mlir-and-three-exits', 'exit-1-llvm')),
  topic('13.6', 'Exit 2: SPIR-V', 'GPU path', lesson('mlir-and-three-exits', 'exit-2-spir-v')),
  topic('13.7', 'Exit 3: vendor API', 'Library or engine call for an accelerator', lesson('mlir-and-three-exits', 'exit-3-vendor-api')),
  topic('13.8', 'Each exit is a finished compilation', 'Each exit stands on its own', lesson('mlir-and-three-exits', 'each-exit-is-a-finished-compilation')),

  chapter('14', 'One MatMul, many implementations', lesson('one-matmul-many-implementations')),
  topic('14.1', 'The ONNX contract', 'MatMul, still an operator', lesson('one-matmul-many-implementations', 'the-onnx-contract')),
  topic('14.2', 'Structured MatMul', 'The contraction, with shapes still attached', lesson('one-matmul-many-implementations', 'structured-matmul')),
  topic('14.3', 'A tiled form', 'One legal blocking', lesson('one-matmul-many-implementations', 'a-tiled-form')),
  topic('14.4', 'A loop nest', 'The operator name is gone', lesson('one-matmul-many-implementations', 'a-loop-nest')),
  topic('14.5', 'A vectorized CPU kernel', 'The CPU exit', lesson('one-matmul-many-implementations', 'a-vectorized-cpu-kernel')),
  topic('14.6', 'The GPU path', 'GPU dialect, thread and block map, kernel', lesson('one-matmul-many-implementations', 'the-gpu-path')),
  topic('14.7', 'The library path', 'A BLAS or vendor call', lesson('one-matmul-many-implementations', 'the-library-path')),
  topic('14.8', 'The fused path', 'Chapter 15', lesson('one-matmul-many-implementations', 'the-fused-path')),
  topic('14.9', 'When the library call is the result', 'The shape, layout, and operator are ones that library runs', lesson('one-matmul-many-implementations', 'when-the-library-call-is-the-result')),
  topic('14.10', 'When the generated kernel is the result', 'An unusual shape, a specialized layout, a special instruction, a small workload, or a result shared with the next operators', lesson('one-matmul-many-implementations', 'when-the-generated-kernel-is-the-result')),

  chapter('15', 'Fusion: MatMul, Add, ReLU'),
  topic('15.1', 'Three operators, three writes', 'The unfused baseline'),
  topic('15.2', 'One kernel, one write', 'Result stays in registers'),
  topic('15.3', 'Fewer launches, less traffic', 'A launch is one start of a kernel. Three operators start three times and write three results.'),
  topic('15.4', 'Register spills', 'Risk when the tile is too wide'),
  topic('15.5', 'Accepting a fusion', 'Matches the Chapter 18 reference, then shows a gain in Chapter 24'),

  chapter('16', 'Other transformations'),
  topic('16.1', 'Constant folding', 'Compute known values early'),
  topic('16.2', 'Dead code elimination', 'Remove unused results'),
  topic('16.3', 'Algebraic rewrites', 'Simplify using math identities'),
  topic('16.4', 'Common subexpressions', 'Compute once, reuse'),
  topic('16.5', 'Layout rewrites', 'A transpose sinks into the layout the next kernel expects'),
  topic('16.6', 'Shape rewrites', 'Reshape and transpose cleanup'),
  topic('16.7', 'A pipeline is ordered passes', 'Order matters'),
  topic('16.8', 'The rule', 'A pass keeps the prediction'),
  topic('16.9', 'BatchNorm folding', 'The inference scale and shift become part of the previous MatMul or convolution'),
  topic('16.10', 'Legalization', 'An operator with no form on this target becomes operators the target has'),

  chapter('17', 'Lowering'),
  topic('17.1', 'Progressive lowering', 'Why dialects exist'),
  topic('17.2', 'Tensor MatMul to loops', 'The operator name is gone'),
  topic('17.3', 'Loops are the next representation', 'The nest is one schedule. Chapter 19 is the choice among schedules.'),
  topic('17.4', 'Tiles to parallel work', 'Mapping to threads or cores'),
  topic('17.5', 'Parallel work to kernel', 'A launchable unit'),
  topic('17.6', 'Kernel to target operations', 'Instructions for the device'),
  topic('17.7', 'Each step consumes one fact', 'The lowering rule'),

  chapter('18', 'Correctness across lowering'),
  topic('18.1', 'A reference', 'The unoptimized graph or a trusted implementation'),
  topic('18.2', 'Numerical equivalence', 'Agree within a stated tolerance'),
  topic('18.3', 'Floating point', 'A different association changes the bits'),
  topic('18.4', 'Exact and approximate', 'Exact on reals can be approximate on floats. Quantization is approximate by design.'),
  topic('18.5', 'Shape, type, layout', 'A wrong shape is a wrong program'),
  topic('18.6', 'Each lowering', 'Re-run the check after each dialect change'),
  topic('18.7', 'Golden outputs', 'Saved inputs and results'),
  topic('18.8', 'Differential testing', 'Same input, two pipelines'),
  topic('18.9', 'A fast, wrong pass', 'Performance work starts after the check passes'),

  chapter('19', 'Choosing a schedule'),
  topic('19.1', 'Same loop, different strategy', 'The compiler picks how to run it'),
  topic('19.2', 'Loop order', 'Affects reuse'),
  topic('19.3', 'Tile size', '16, 32, 64'),
  topic('19.4', 'Parallel split', 'Dividing work across units'),
  topic('19.5', 'Vector width and unrolling', 'Using SIMD and hiding latency'),
  topic('19.6', 'Reuse patterns', 'Keep data close'),
  topic('19.7', 'Cost models', 'Arithmetic, bytes, cache, registers, parallelism, launch overhead'),
  topic('19.8', 'Autotuning', 'Compile survivors, measure, keep the winner'),
  topic('19.9', 'Specialization', 'M=1, N=4096, K=4096 as its own kernel'),
  topic('19.10', 'Dispatch on the guard', 'Runtime picks the variant'),

  chapter('20', 'Quantization'),
  topic('20.1', 'Why quantize', 'Less memory, faster integer math'),
  topic('20.2', 'Calibration', 'Measure value ranges'),
  topic('20.3', 'Scale and zero point', 'The mapping to integers'),
  topic('20.4', 'Lowering to integer arithmetic', 'The compiler decision'),
  topic('20.5', 'INT8 kernels and accelerator paths', 'Who consumes the representation'),
  topic('20.6', 'Dequantization', 'Return to float where a consumer expects it'),
  topic('20.7', 'Accuracy check', 'Part of accepting the rewrite (Chapter 18)'),

  part('Part V. Hardware'),
  chapter('21', 'Memory'),
  topic('21.1', 'The memory hierarchy', 'Registers to DRAM'),
  topic('21.2', 'Latency and bandwidth', 'Two different limits'),
  topic('21.3', 'Layout and reuse', 'Arrangement decides traffic'),
  topic('21.4', 'Tiling and locality', 'Keep working sets small'),
  topic('21.5', 'Compute-bound and memory-bound', 'Which limit you hit'),
  topic('21.6', 'Why fusion and tiling exist', 'Ties back to Chapters 15 and 19'),
  topic('21.7', 'Live ranges and buffer reuse', 'Two tensors that are never live together can occupy the same memory'),

  chapter('22', 'Devices and mapping'),
  topic('22.1', 'CPU cores, SIMD, cache', 'The CPU model'),
  topic('22.2', 'GPU threads, workgroups, SIMT', 'The GPU model'),
  topic('22.3', 'GPU memory', 'Global, shared, registers'),
  topic('22.4', 'Matrix engines', 'Dedicated MatMul hardware'),
  topic('22.5', 'Binding the schedule', 'Threads, registers, shared memory, synchronization'),
  topic('22.6', 'One MatMul on a CPU and on a GPU', 'Same meaning, two mappings'),
  topic('22.7', 'Host, device, and the copy', 'A whole graph is compiled so the intermediate tensors stay on the device'),

  part('Part VI. Shipping'),
  chapter('23', 'Runtime'),
  topic('23.1', 'Compiler and runtime', 'Full diagram'),
  topic('23.2', 'Load and allocate', 'Setup'),
  topic('23.3', 'Check guards', 'From Chapter 10'),
  topic('23.4', 'Pick a variant', 'From Chapter 19'),
  topic('23.5', 'Dispatch through the driver', 'Launch on the device'),
  topic('23.6', 'Synchronize', 'Wait for results'),
  topic('23.7', 'One request and a batch', 'Two usage modes'),
  topic('23.8', 'Latency and throughput', 'Two different goals'),

  chapter('24', 'Measuring'),
  topic('24.1', 'Correctness first', 'Chapter 18 check before timing'),
  topic('24.2', 'Warm-up', 'Avoid cold-start noise'),
  topic('24.3', 'Latency and throughput', 'What to report'),
  topic('24.4', 'Hardware counters', 'Why it is fast or slow'),
  topic('24.5', 'Bandwidth and kernel time', 'Per-kernel view'),
  topic('24.6', 'Before and after', 'Same input, same setup'),
  topic('24.7', 'Earning its place', 'A fusion, tile, or quantized kernel must show a gain'),
  topic('24.8', 'One change at a time', 'The before-and-after differs by the pass you claim credit for'),
  topic('24.9', 'A regression locks the check', 'The Chapter 18 comparison and the timing both have a saved baseline'),

  part('Part VII. The job'),
  chapter('25', 'When the result is wrong'),
  topic('25.1', 'Walk the stack', 'Model, ONNX, IR, lowering, kernel'),
  topic('25.2', 'Dump the IR', 'See what the compiler sees'),
  topic('25.3', 'Read shapes and layouts', 'Spot the mismatch'),
  topic('25.4', 'Compare intermediates', 'Against the reference'),
  topic('25.5', 'Bisect the pass pipeline', 'Find the pass that breaks it'),
  topic('25.6', 'Shrink the graph', 'Down to one failing operator'),
  topic('25.7', 'Find the broken level', 'Matches on the input side, differs on the output side'),
  topic('25.8', 'A shape bug and a rounding gap', 'Equality fails on the first. The tolerance from 18.2 fails on the second.'),

  chapter('26', 'One model, end to end'),
  topic('26.1', 'The model', 'Input, MatMul, Add, ReLU, MatMul, score'),
  topic('26.2', 'Graph and shapes', 'Chapters 9 and 10 applied'),
  topic('26.3', 'IR and fusion', 'Chapters 13 and 15 applied'),
  topic('26.4', 'Lowering and schedule', 'Chapters 17 and 19 applied'),
  topic('26.5', 'Kernel, runtime, device', 'Chapters 22 and 23 applied'),
  topic('26.6', 'The same score', 'Correctness holds'),
  topic('26.7', 'The decision', 'Back to Chapter 4'),
  topic('26.8', 'Six questions on every arrow', 'The series signature'),

  chapter('27', 'Build a tiny compiler'),
  topic('27.1', 'A three-line language', 'The input'),
  topic('27.2', 'Parser', 'Text to structure'),
  topic('27.3', 'Graph and shapes', 'Reuse Chapters 9 and 10'),
  topic('27.4', 'Folding and dead code', 'Chapter 16 passes'),
  topic('27.5', 'The Chapter 15 fusion', 'MatMul + Add + ReLU'),
  topic('27.6', 'MatMul to loops', 'Chapter 17 lowering'),
  topic('27.7', 'CPU backend', 'Generated code'),
  topic('27.8', 'Library-call backend', 'Emit a call'),
  topic('27.9', 'Tests', 'Score test and a regression test'),
  topic('27.10', 'Find and reproduce', 'A workload that shows the behavior, small enough to rerun'),
  topic('27.11', 'Read the graph and the bottleneck', 'The operator, the shape, and the kernel that dominate'),
  topic('27.12', 'The pass, the check, the measurement', 'Chapter 16 or 19, then 18, then 24'),
  topic('27.13', 'The regression, then upstream', 'The baseline from 24.9 stays in the test suite'),

  part('Part VIII. The stacks'),
  chapter('28', 'The stack map', lesson('the-stack-map')),
  topic('28.1', 'Two layers', 'A graph compiler decides fusion and placement. A kernel compiler or a library implements one piece.', lesson('the-stack-map', 'two-layers')),
  topic('28.2', 'Three front doors', 'torch.export, StableHLO, and an ONNX file', lesson('the-stack-map', 'three-front-doors')),
  topic('28.3', 'Who compiles the graph', 'ONNX Runtime, IREE, XLA, TVM Relax, TensorRT', lesson('the-stack-map', 'who-compiles-the-graph')),
  topic('28.4', 'Who writes the kernel', 'Triton, Inductor, CUTLASS, cuDNN, oneDNN, MIOpen', lesson('the-stack-map', 'who-writes-the-kernel')),
  topic('28.5', 'Dialects by name', 'TOSA, StableHLO, linalg, vector, gpu, spirv, llvm', lesson('the-stack-map', 'dialects-by-name')),
  topic('28.6', 'The file you ship', 'ONNX, vmfb, a TensorRT engine, LiteRT, ExecuTorch, TVM, GGUF', lesson('the-stack-map', 'the-file-you-ship')),
  topic('28.7', 'Cases the toy graph hides', 'If, Loop, Scan, custom ops, Q/DQ, a dynamic rank', lesson('the-stack-map', 'cases-the-toy-graph-hides')),
  topic('28.8', 'Where training compilers live', 'XLA and torch.compile also compile the backward pass', lesson('the-stack-map', 'where-training-compilers-live')),

  chapter('29', 'ONNX Runtime', lesson('onnx-runtime')),
  topic('29.1', 'The session', 'Loading the session is the compile step', lesson('onnx-runtime', 'the-session')),
  topic('29.2', 'Graph optimization levels', 'Disabled, basic, extended, and all', lesson('onnx-runtime', 'graph-optimization-levels')),
  topic('29.3', 'The partition', 'CPU, CUDA, TensorRT, OpenVINO, CoreML, QNN, XNNPACK', lesson('onnx-runtime', 'the-partition')),
  topic('29.4', 'The fallback copy', 'One unsupported node splits a device subgraph', lesson('onnx-runtime', 'the-fallback-copy')),
  topic('29.5', 'Binding the buffers', 'IO binding keeps the ends of the graph on the device', lesson('onnx-runtime', 'binding-the-buffers')),
  topic('29.6', 'Mobile and the web', 'A smaller binary, WebAssembly, and WebGPU', lesson('onnx-runtime', 'mobile-and-the-web')),
  topic('29.7', 'A fusion stays inside one provider', 'A new chip is a new provider and a new set of kernels', lesson('onnx-runtime', 'a-fusion-stays-inside-one-provider')),

  chapter('30', 'IREE', lesson('iree')),
  topic('30.1', 'What it imports', 'Torch, StableHLO, and TOSA become one graph', lesson('iree', 'what-it-imports')),
  topic('30.2', 'Flow', 'Dispatch regions are the fused kernels', lesson('iree', 'flow')),
  topic('30.3', 'Stream', 'Copies, order, and overlap', lesson('iree', 'stream')),
  topic('30.4', 'HAL', 'Command buffers and executables, one backend at a time', lesson('iree', 'hal')),
  topic('30.5', 'The VM and the vmfb', 'The file you ship', lesson('iree', 'the-vm-and-the-vmfb')),
  topic('30.6', 'The backends', 'llvm-cpu, vulkan-spirv, cuda, rocm', lesson('iree', 'the-backends')),
  topic('30.7', 'Where the chapters land', 'Import, flow, stream, HAL, VM', lesson('iree', 'where-the-chapters-land')),

  chapter('31', 'Edge and the NPU', lesson('edge-and-the-npu')),
  topic('31.1', 'Compile before you ship', 'The device loads a finished program', lesson('edge-and-the-npu', 'compile-before-you-ship')),
  topic('31.2', 'TOSA', 'A short legal operator set', lesson('edge-and-the-npu', 'tosa')),
  topic('31.3', 'Two program files', 'A LiteRT flatbuffer and an ExecuTorch .pte', lesson('edge-and-the-npu', 'two-program-files')),
  topic('31.4', 'The mobile CPU', 'XNNPACK runs the nodes a delegate leaves behind', lesson('edge-and-the-npu', 'the-mobile-cpu')),
  topic('31.5', 'The NPU delegates', 'NNAPI, Core ML, QNN, OpenVINO', lesson('edge-and-the-npu', 'the-npu-delegates')),
  topic('31.6', 'Integer is the common dtype', 'Quantize and dequantize fold into an integer kernel', lesson('edge-and-the-npu', 'integer-is-the-common-dtype')),

  chapter('32', 'Attention and the shipped model', lesson('attention-and-the-shipped-model')),
  topic('32.1', 'The score matrix', 'Scores grow with the square of the sequence', lesson('attention-and-the-shipped-model', 'the-score-matrix')),
  topic('32.2', 'Fusion keeps the tile', 'The full score matrix is never stored', lesson('attention-and-the-shipped-model', 'fusion-keeps-the-tile')),
  topic('32.3', 'The KV cache', 'Keys and values stay between tokens', lesson('attention-and-the-shipped-model', 'the-kv-cache')),
  topic('32.4', 'Paging is a runtime', 'Pages and the batch sit above the kernel', lesson('attention-and-the-shipped-model', 'paging-is-a-runtime')),
  topic('32.5', 'GGUF on the machine in front of you', 'A quantized file for a laptop or a phone', lesson('attention-and-the-shipped-model', 'gguf-on-the-machine-in-front-of-you')),
  topic('32.6', 'The forward graph is still the program', 'One frozen run per token, then the Chapter 4 decision', lesson('attention-and-the-shipped-model', 'the-forward-graph-is-still-the-program')),
];

const OWNERS = [
  ['Tile choice', '19', '14.3, 17, 21'],
  ['A launch', '15.3', '19, 22, 23'],
  ['Buffer reuse', '21.7', '23, 27'],
  ['The tolerance', '18.2', '20, 24, 25'],
  ['The batch symbol', '5.6 names it, 10.6 compiles it', '19.9, 23.3'],
];

const MORE = [
  ['Introduction to ML Compilers + Roadmap', 'Field map and study order', '/docs/ml-compilers/introduction-roadmap/'],
  ['What Problem ML Compilers Solve Beyond LLVM', 'Why classic IR alone is not enough', '/docs/ml-compilers/what-problem-ml-compilers-solve-beyond-llvm/'],
  ['The End-to-End ML Compiler Pipeline', 'Graph, optimize, kernels, hardware', '/docs/ml-compilers/end-to-end-pipeline/'],
  ['Seeing the ML Compiler Stack Live on AMD GPU', 'Triton, LLVM IR, AMD ISA, HSACO', '/docs/ml-compilers/mlcompilerstack/'],
  ['Inside torch.compile', 'Dynamo, AOTAutograd, Inductor, Triton', '/docs/ml-compilers/inside-torch-compile/'],
  ['MLIR Hub', 'Section home for multi-level IR', '/docs/MLIR/'],
  ['Introduction to MLIR', 'Dialects, lowering, why multi-level IR', '/docs/MLIR/intro/'],
  ['TVM Hub', 'Section home for Apache TVM', '/docs/tvm/'],
  ['TVM for Beginners', 'What TVM does and why it matters', '/docs/tvm-for-beginners/'],
  ['TVM Installation', 'Get a working TVM environment', '/docs/tvm/basics/installation/'],
  ['First Model with TVM', 'Compile and run a small model path', '/docs/tvm/basics/first-model/'],
  ['TVM Autotuning', 'Search schedules for better kernels', '/docs/tvm/basics/autotuning/'],
  ['TVM Relay', 'Graph-level IR in TVM', '/docs/tvm/intermediate/relay/'],
  ['Graph Optimizations', 'TVM graph passes', '/docs/tvm/intermediate/graph-optimizations/'],
  ['Schedule Tuning', 'TVM schedules', '/docs/tvm/intermediate/schedule-tuning/'],
  ['TVM Runtime', 'How a compiled model is launched', '/docs/tvm/deployment/runtime/'],
  ['Meta Scheduler', 'TVM search', '/docs/tvm/advanced/meta-scheduler/'],
  ['LLVM and IR Track', 'The infra ML stacks often lower into', '/docs/tracks/llvm-and-ir/'],
  ['GPU Compilers Track', 'Device execution model for generated kernels', '/docs/tracks/gpu-compilers/'],
  ['AI Systems', 'Broader math, models, and hardware map', '/docs/AI/'],
  ['ML Compilers hub', 'Article index for this topic', '/docs/ml-compilers/'],
];

const MATERIALS = [
  {name: 'PPT', path: 'M5 4h10a1 1 0 0 1 1 1v12H4V5a1 1 0 0 1 1-1zm0 11h10M8 7h4'},
  {name: 'Video', path: 'M7 6.5v11l9-5.5-9-5.5z'},
  {name: 'Examples', path: 'M9 8 5 12l4 4M15 8l4 4-4 4'},
  {name: 'MCQ', path: 'M6 7h12M6 12h12M6 17h8'},
];

function groupParts(rows) {
  const parts = [];
  let part = null;
  let chapter = null;
  rows.forEach((row) => {
    if (row.kind === 'part') {
      part = {label: row.label, chapters: []};
      chapter = null;
      parts.push(part);
      return;
    }
    if (row.kind === 'chapter') {
      chapter = {chapter: row, topics: []};
      part.chapters.push(chapter);
      return;
    }
    chapter.topics.push(row);
  });
  return parts;
}

function Icon({d}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.glyph}>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Materials() {
  return (
    <ul className={styles.materials}>
      {MATERIALS.map((item) => (
        <li key={item.name}>
          <span className={styles.material} title={`${item.name}, coming soon`}>
            <Icon d={item.path} />
            <span className={styles.srOnly}>
              {item.name}, coming soon
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function LessonTitle({href, children}) {
  if (!href) {
    return <span className={styles.lessonTitle}>{children}</span>;
  }
  return (
    <Link className={styles.lessonLink} to={href}>
      <span className={styles.lessonTitle}>{children}</span>
      <span className={styles.go} aria-hidden="true">
        Start
      </span>
    </Link>
  );
}

function LessonRow({id, title, covers, href, chapter}) {
  return (
    <div className={chapter ? styles.chapterRow : styles.lessonRow}>
      <span className={styles.id}>{id}</span>
      <div className={styles.copy}>
        <LessonTitle href={href}>{title}</LessonTitle>
        {covers ? <p className={styles.desc}>{covers}</p> : null}
      </div>
      <Materials />
    </div>
  );
}

export default function MlCompilerCurriculum() {
  const parts = groupParts(ROWS);
  return (
    <>
      <section className={track.section} id="syllabus" aria-labelledby="syllabus-title">
        <div className={track.sectionHead}>
          <span className={track.sectionStep}>Syllabus</span>
          <h2 id="syllabus-title" className={styles.syllabusTitle}>
            Follow the parts in order
          </h2>
          <p className={track.sectionDesc}>
            Chapters 1–14 and 28–32 are lessons. A title opens that section. Chapters 15–27 are the rest of the path.
          </p>
        </div>
        <div className={styles.syllabus}>
          {parts.map((part, index) => (
            <details key={part.label} className={styles.part} open={index === 0}>
              <summary>
                <span>{part.label}</span>
                <span className={styles.chevron} aria-hidden="true" />
              </summary>
              <div className={styles.partBody}>
                {part.chapters.map(({chapter, topics}) => (
                  <div key={chapter.id} className={styles.chapterBlock}>
                    <LessonRow id={chapter.id} title={chapter.title} href={chapter.href} chapter />
                    {topics.map((topic) => (
                      <LessonRow
                        key={topic.id}
                        id={topic.id}
                        title={topic.title}
                        covers={topic.covers}
                        href={topic.href}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
        <div className={styles.resume}>
          <Link className={styles.resumeLink} to="/docs/ml-compilers/programs-as-rules/">
            Start chapter 1
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <details className={styles.fold}>
        <summary>One chapter teaches each word</summary>
        <div className={styles.owners} role="table" aria-label="Where each term is taught">
          <div className={styles.ownerHead} role="row">
            <span>Word</span>
            <span>The chapter that teaches it</span>
            <span>Later chapters only apply it</span>
          </div>
          {OWNERS.map(([word, owner, later]) => (
            <div className={styles.ownerRow} role="row" key={word}>
              <span className={styles.lessonTitle}>{word}</span>
              <span className={styles.desc}>{owner}</span>
              <span className={styles.desc}>{later}</span>
            </div>
          ))}
        </div>
      </details>

      <section className={track.section} id="more-articles">
        <div className={track.sectionHead}>
          <span className={track.sectionStep}>More articles</span>
          <h2 className={track.sectionTitle}>Longer reads already on the site</h2>
          <p className={track.sectionDesc}>
            These pages stay linked here. The syllabus above is the order. These are the deep dives.
          </p>
        </div>
        <div className={styles.syllabus}>
          {MORE.map(([title, blurb, href], index) => (
            <LessonRow
              key={href}
              id={String(index + 1).padStart(2, '0')}
              title={title}
              covers={blurb}
              href={href}
            />
          ))}
        </div>
      </section>
    </>
  );
}
