const site = {
  llvmProjectsSidebar: [
    {
      type: 'category',
      label: 'LLVM Projects',
      collapsed: false,
      items: ['project/llvm/index'],
    },
  ],

  veloxSidebar: [
    {
      type: 'category',
      label: 'VELOX',
      collapsed: false,
      items: [
        'project/llvm/VELOX/index',
        'project/llvm/VELOX/v1-language-spec',
        'project/llvm/VELOX/creating-your-first-llvm-based-compiler',
      ],
    },
  ],

  csperfSidebar: [
    {
      type: 'category',
      label: 'CompilerSutraPerf',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'project/compilersutra-perf/index',
      },
      items: [
        {
          type: 'category',
          label: 'Releases',
          collapsed: false,
          link: {
            type: 'doc',
            id: 'project/compilersutra-perf/releases/index',
          },
          items: [
            'project/compilersutra-perf/releases/0.2.0',
            'project/compilersutra-perf/releases/0.1.2',
            'project/compilersutra-perf/releases/0.1.1',
            'project/compilersutra-perf/releases/0.1.0',
          ],
        },
        'project/compilersutra-perf/tutorial',
        'project/compilersutra-perf/getting-started',
        'project/compilersutra-perf/usage',
        'project/compilersutra-perf/methodology',
        'project/compilersutra-perf/observatory',
        'project/compilersutra-perf/architecture',
        'project/compilersutra-perf/energy-and-reports',
        'project/compilersutra-perf/troubleshooting',
      ],
    },
  ],

  projectSidebar: [
    {
      type: 'category',
      label: 'Projects',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'project/index',
      },
      items: [
        {
          type: 'category',
          label: 'CompilerSutraPerf',
          collapsed: false,
          link: {
            type: 'doc',
            id: 'project/compilersutra-perf/index',
          },
          items: [
            {
              type: 'category',
              label: 'Releases',
              collapsed: false,
              link: {
                type: 'doc',
                id: 'project/compilersutra-perf/releases/index',
              },
              items: [
                'project/compilersutra-perf/releases/0.2.0',
                'project/compilersutra-perf/releases/0.1.2',
                'project/compilersutra-perf/releases/0.1.1',
                'project/compilersutra-perf/releases/0.1.0',
              ],
            },
            'project/compilersutra-perf/tutorial',
            'project/compilersutra-perf/getting-started',
            'project/compilersutra-perf/usage',
            'project/compilersutra-perf/methodology',
            'project/compilersutra-perf/observatory',
            'project/compilersutra-perf/architecture',
            'project/compilersutra-perf/energy-and-reports',
            'project/compilersutra-perf/troubleshooting',
          ],
        },
        {
          type: 'category',
          label: 'LLVM Projects',
          collapsed: true,
          link: {
            type: 'doc',
            id: 'project/llvm/index',
          },
          items: [
            'project/llvm/VELOX/index',
            'project/llvm/VELOX/v1-language-spec',
            'project/llvm/VELOX/creating-your-first-llvm-based-compiler',
          ],
        },
        'project/cpp-project-ideas',
        {
          type: 'category',
          label: 'Python Automation',
          collapsed: true,
          link: {
            type: 'doc',
            id: 'project/python_automation/python_automation',
          },
          items: [
            'project/python_automation/automate_boring_stuff/system-specs-collector/system_spec_collector',
          ],
        },
      ],
    },
  ],

  howToSidebar: [
    {
      type: 'category',
      label: 'How to Guides',
      collapsed: false,
      items: [
        'how_to/how_to_do',
        'how_to/run-multiple-cpp-files',
        'how_to/how_to_build_cpp_with_make',
        'how_to/how_to_use_cmake',
        'how_to/library_part1',
        'how_to/static_library',
        'how_to/dynamic_library',
      ],
    },
    {
      type: 'category',
      label: 'Bit Manipulation',
      collapsed: false,
      items: [
        'how_to/two_compliment',
      ],
    },
  ],

  techblogSidebar: [
    {
      type: 'category',
      label: 'Tech Blog',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Tech Blog on AI',
          collapsed: false,
          items: [
            'AI',
            'AI/is_gpt_is_opensource',
          ],
        },
      ],
    },
  ],

  compilerTechblogSidebar: [
    {
      type: 'category',
      label: 'Compiler Blog',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'compilers/techblog/index',
      },
      items: [
        {
          type: 'category',
          label: 'GPU Register Pressure',
          collapsed: false,
          items: [
            'compilers/techblog/register-pressure-on-gpu-why-kernels-fail',
            'compilers/techblog/register-pressure-on-gpu-how-to-calculate-it',
            'compilers/techblog/register-pressure-on-gpu-how-to-reduce-it',
          ],
        },
        {
          type: 'category',
          label: 'Compiler Decisions and Hardware Performance',
          collapsed: true,
          items: [
            'compilers/techblog/how-compiler-decisions-affect-hardware-performance',
            'compilers/techblog/how-compiler-decisions-affect-hardware-performance-how-developers-influence-compiler-decisions',
            'compilers/techblog/how-compiler-decisions-affect-hardware-performance-practical-compiler-control',
          ],
        },
      ],
    },
  ],

  LLVMPassSidebar: [
    {
      type: 'category',
      label: 'LLVM_Pass_Tracker',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'LLVM_Pass_Tracker',
          collapsed: true,
          items: [
            'llvm/llvm_pass_tracker/llvm_pass',
          ],
        },
      ],
    },
  ],

  InliLLVMPassSidebarnerPass: [
    {
      type: 'category',
      label: 'Inliner Pass',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Inliner Pass Verson',
          collapsed: true,
          items: [
            'llvm/llvm_pass_tracker/transformpass/inliner_llvm_v1',
          ],
        },
      ],
    },
  ],

  youtubeliveSidebar: [
    {
      type: 'category',
      label: 'Live Sessions',
      collapsed: false,
      items: [
        'live/live',
      ],
    },
  ],

  coasidebar: [
    {
      type: 'category',
      label: 'COA',
      collapsed: false,
      items: [
        'coa',
        'coa/intro_to_coa',
        'coa/basic_terminology_in_coa',
        'coa/cpu_execution',
        'coa/instruction_flow_modern_cpu',
        'coa/types_of_execution',
        'coa/superscalar_execution',
        'coa/memory-hierarchy',
        'coa/measuring_throughput_cache_misses_cpu_behavior_cpp',
        'coa/means-and-amdahl',
        'coa/what-is-an-isa',
        'coa/risc-vs-cisc',
      ],
    },
  ],

  mlCompilersSidebar: [
    {
      type: 'category',
      label: 'ML Compilers',
      collapsed: false,
      items: [
        'tracks/ml-compilers',
        'ml-compilers/index',
        {
          type: 'category',
          label: 'Course',
          collapsed: false,
          className: 'ml-course',
          items: [
            {type: 'link', label: 'Programs as Rules', href: '/docs/ml-compilers/programs-as-rules/', className: 'ml-course-link'},
            {type: 'link', label: 'What AI Is', href: '/docs/ml-compilers/what-ai-is/', className: 'ml-course-link'},
            {type: 'link', label: 'Learning Types', href: '/docs/ml-compilers/learning-types/', className: 'ml-course-link'},
            {type: 'link', label: 'From Score to Action', href: '/docs/ml-compilers/from-score-to-action/', className: 'ml-course-link'},
            {type: 'link', label: 'Training Writes the Weights', href: '/docs/ml-compilers/training-writes-the-weights/', className: 'ml-course-link'},
            {type: 'link', label: 'Inference Is the Computation', href: '/docs/ml-compilers/inference-is-the-computation/', className: 'ml-course-link'},
            {type: 'link', label: 'Tensors for Compilers', href: '/docs/ml-compilers/tensors-for-compilers/', className: 'ml-course-link'},
            {type: 'link', label: 'What an Operator Means', href: '/docs/ml-compilers/what-an-operator-means/', className: 'ml-course-link'},
            {type: 'link', label: 'The Computation Graph', href: '/docs/ml-compilers/the-computation-graph/', className: 'ml-course-link'},
            {type: 'link', label: 'Shapes, Types, and Dynamic Dimensions', href: '/docs/ml-compilers/shapes-types-and-dynamic-dimensions/', className: 'ml-course-link'},
            {type: 'link', label: 'What an AI Compiler Is', href: '/docs/ml-compilers/what-an-ai-compiler-is/', className: 'ml-course-link'},
            {type: 'link', label: 'ONNX and the Operator Graph', href: '/docs/ml-compilers/onnx-and-the-operator-graph/', className: 'ml-course-link'},
            {type: 'link', label: 'MLIR and Three Exits', href: '/docs/ml-compilers/mlir-and-three-exits/', className: 'ml-course-link'},
            {type: 'link', label: 'One MatMul, Many Implementations', href: '/docs/ml-compilers/one-matmul-many-implementations/', className: 'ml-course-link'},
            {type: 'link', label: 'The Stack Map', href: '/docs/ml-compilers/the-stack-map/', className: 'ml-course-link ml-course-n28'},
            {type: 'link', label: 'ONNX Runtime', href: '/docs/ml-compilers/onnx-runtime/', className: 'ml-course-link ml-course-n29'},
            {type: 'link', label: 'IREE', href: '/docs/ml-compilers/iree/', className: 'ml-course-link ml-course-n30'},
            {type: 'link', label: 'Edge and the NPU', href: '/docs/ml-compilers/edge-and-the-npu/', className: 'ml-course-link ml-course-n31'},
            {type: 'link', label: 'Attention and the Shipped Model', href: '/docs/ml-compilers/attention-and-the-shipped-model/', className: 'ml-course-link ml-course-n32'},
          ],
        },
        {
          type: 'category',
          label: 'More articles',
          collapsed: false,
          items: [
            'ml-compilers/what-problem-ml-compilers-solve-beyond-llvm',
            'ml-compilers/end-to-end-ml-compiler-pipeline',
            'ml-compilers/introduction-roadmap',
            'ml-compilers/inside-torch-compile-dynamo-aotautograd-inductor-triton-explained',
            'ml-compilers/seeing-the-ml-compiler-stack-live-on-amd-gpu',
          ],
        },
      ],
    },
  ],

  articlesidebar: [
    {
      type: 'category',
      label: 'Articles',
      collapsed: false,
      items: [
        'articles',
        'articles/compiler_directive',
        'articles/gcc_vs_clang_real_benchmarks_2026_reporter',
        'articles/std-byte-vs-unsigned-char',
        'articles/gcc_vs_clang_assembly_part2a',
        'articles/gcc_vs_clang_stencil_ir_passes_part2b',
        'articles/where_gcc_and_clang_diverge_stencil_pass_trace',
        'articles/when-o2-layout-hurts-machineblockplacement',
        'articles/machineblockplacement-wrong-bet-static-probabilities-pgo',
        'articles/machineblockplacement-329-benchmark-prevalence-and-fix',
        'articles/vulkan-radv-perf-query-mesa-icd-gfx12-csrun-linux',
        'articles/hft_stdlib_restrictions',
        'articles/language_energy_efficiency_validation',
        {
          type: 'category',
          label: 'Compiler Comparisons',
          collapsed: false,
          items: [
            'articles/rust-vs-modern-cpp-memory-safety-beyond-the-hype',
            'articles/rust-claims-a-reality-check',
            'articles/rustc-pipeline-vs-cpp-compilation-pipeline',
            'articles/rust-arrayref-supply-chain-attack',
          ],
        },
        {
          type: 'category',
          label: 'Tech Blog',
          collapsed: false,
          items: [
            'AI',
            'AI/is_gpt_is_opensource',
          ],
        },
      ],
    },
  ],
};

function mlChapterSidebar(chapterNumber, label, id, lessons) {
  const href = `/docs/${id}/`;
  return [
    {
      type: 'link',
      label: 'ML Compilers Track',
      href: '/docs/tracks/ml-compilers/',
      className: 'ml-tutorial-back',
    },
    {
      type: 'category',
      label,
      collapsed: false,
      className: `ml-tutorial-chapter ml-tutorial-ch-${chapterNumber}`,
      link: {type: 'doc', id},
      items: lessons.map(([lessonLabel, hash]) => ({
        type: 'link',
        label: lessonLabel,
        href: `${href}#${hash}`,
        className: 'ml-tutorial-lesson',
      })),
    },
  ];
}

site.mlChapter1Sidebar = mlChapterSidebar(1, 'Programs as Rules', 'ml-compilers/programs-as-rules', [
  ['Input, steps, output', 'input-steps-output'],
  ['A choice in code', 'a-choice-in-code'],
  ['Situation and action', 'situation-and-action'],
  ['Rules, trees, and tables', 'rules-trees-and-tables'],
  ['A list that covers the cases', 'a-list-that-covers-the-cases'],
  ['Too many interacting cases', 'too-many-interacting-cases'],
  ['Behavior from examples', 'behavior-from-examples'],
]);

site.mlChapter2Sidebar = mlChapterSidebar(2, 'What AI Is', 'ml-compilers/what-ai-is', [
  ['An aim, and the ways under it', 'an-aim-and-the-ways-under-it'],
  ['Examples, a procedure, a model', 'examples-a-procedure-a-model'],
  ['Features and labels', 'features-and-labels'],
  ['Architecture plus parameters', 'architecture-plus-parameters'],
  ['Prediction and generalization', 'prediction-and-generalization'],
  ['Neuron, layer, a deep stack', 'neuron-layer-a-deep-stack'],
  ['The compiler reads the inference math', 'the-compiler-reads-the-inference-math'],
]);

site.mlChapter3Sidebar = mlChapterSidebar(3, 'Learning Types', 'ml-compilers/learning-types', [
  ['Supervised learning', 'supervised-learning'],
  ['Classification and regression', 'classification-and-regression'],
  ['Unsupervised learning', 'unsupervised-learning'],
  ['Self-supervised learning', 'self-supervised-learning'],
  ['Reinforcement learning', 'reinforcement-learning'],
  ['The frozen forward model', 'the-frozen-forward-model'],
]);

site.mlChapter4Sidebar = mlChapterSidebar(4, 'From Score to Action', 'ml-compilers/from-score-to-action', [
  ['The model returns numbers', 'the-model-returns-numbers'],
  ['A threshold turns a score into an action', 'a-threshold-turns-a-score-into-an-action'],
  ['The cost of a wrong action', 'the-cost-of-a-wrong-action'],
  ['The decision sits outside the graph', 'the-decision-sits-outside-the-graph'],
  ['The same ending in Chapter 26', 'the-same-ending-in-chapter-26'],
]);

site.mlChapter5Sidebar = mlChapterSidebar(5, 'Training Writes the Weights', 'ml-compilers/training-writes-the-weights', [
  ['Data and labels', 'data-and-labels'],
  ['Loss', 'loss'],
  ['Gradient descent', 'gradient-descent'],
  ['Training writes the weights', 'training-writes-the-weights'],
  ['Forward and backward', 'forward-and-backward'],
  ['A batch', 'a-batch'],
]);

site.mlChapter6Sidebar = mlChapterSidebar(6, 'Inference Is the Computation', 'ml-compilers/inference-is-the-computation', [
  ['Weights are frozen', 'weights-are-frozen'],
  ['The forward pass is the computation', 'the-forward-pass-is-the-computation'],
  ['Two workloads', 'two-workloads'],
  ['A fixed graph and fixed weights', 'a-fixed-graph-and-fixed-weights'],
  ['A dimension can still be a symbol', 'a-dimension-can-still-be-a-symbol'],
]);

site.mlChapter7Sidebar = mlChapterSidebar(7, 'Tensors for Compilers', 'ml-compilers/tensors-for-compilers', [
  ['Scalar, vector, matrix, tensor', 'scalar-vector-matrix-tensor'],
  ['Shape and rank', 'shape-and-rank'],
  ['Memory layout', 'memory-layout'],
  ['Strides and contiguity', 'strides-and-contiguity'],
  ['dtypes as storage', 'dtypes-as-storage'],
  ['Where dtype and layout are consumed', 'where-dtype-and-layout-are-consumed'],
]);

site.mlChapter8Sidebar = mlChapterSidebar(8, 'What an Operator Means', 'ml-compilers/what-an-operator-means', [
  ['Weighted sum and dense layer', 'weighted-sum-and-a-dense-layer'],
  ['Activations', 'activations'],
  ['Softmax', 'softmax'],
  ['Convolution and pooling', 'convolution-and-pooling'],
  ['Normalization', 'normalization'],
  ['Attention and the transformer', 'attention-and-the-transformer'],
  ['Embeddings', 'embeddings'],
  ['Elementwise, reshape, transpose, reduce', 'elementwise-reshape-transpose-reduce'],
  ['MatMul as a contract', 'matmul-as-a-contract'],
  ['The triple loop', 'the-triple-loop'],
]);

site.mlChapter9Sidebar = mlChapterSidebar(9, 'The Computation Graph', 'ml-compilers/the-computation-graph', [
  ['Nodes and edges', 'nodes-and-edges'],
  ['Inputs, weights, and outputs', 'inputs-weights-and-outputs'],
  ['Attributes', 'attributes'],
  ['Producers and consumers', 'producers-and-consumers'],
  ['A legal execution order', 'a-legal-execution-order'],
  ['The graph is the program', 'the-graph-is-the-program'],
  ['An export produces the graph', 'an-export-produces-the-graph'],
]);

site.mlChapter10Sidebar = mlChapterSidebar(10, 'Shapes, Types, and Dynamic Dimensions', 'ml-compilers/shapes-types-and-dynamic-dimensions', [
  ['A MatMul shape rule', 'a-matmul-shape-rule'],
  ['Shape inference', 'shape-inference'],
  ['Type inference', 'type-inference'],
  ['Broadcasting', 'broadcasting'],
  ['Static shapes', 'static-shapes'],
  ['Symbolic shapes', 'symbolic-shapes'],
  ['Constraints', 'constraints'],
  ['Compile time', 'compile-time'],
  ['Guards', 'guards'],
  ['Variants', 'variants'],
]);

site.mlChapter11Sidebar = mlChapterSidebar(11, 'What an AI Compiler Is', 'ml-compilers/what-an-ai-compiler-is', [
  ['Traditional pipeline', 'traditional-pipeline'],
  ['The AI pipeline', 'the-ai-pipeline'],
  ['Frontend, middle end, backend', 'frontend-middle-end-backend'],
  ['Facts a tensor compiler carries', 'facts-a-tensor-compiler-carries'],
  ['Goals', 'goals'],
  ['The six questions', 'the-six-questions'],
  ['Compiler emits, runtime launches', 'compiler-emits-runtime-launches'],
]);

site.mlChapter12Sidebar = mlChapterSidebar(12, 'ONNX and the Operator Graph', 'ml-compilers/onnx-and-the-operator-graph', [
  ['A versioned operator graph', 'a-versioned-operator-graph'],
  ['Opsets and versions', 'opsets-and-versions'],
  ['Graph passes', 'graph-passes'],
  ['Execution providers', 'execution-providers'],
  ['The generic fallback', 'the-generic-fallback'],
  ['A new device is a new provider', 'a-new-device-is-a-new-provider'],
  ['The operator contract', 'the-operator-contract'],
]);

site.mlChapter13Sidebar = mlChapterSidebar(13, 'MLIR and Three Exits', 'ml-compilers/mlir-and-three-exits', [
  ['Why dialects exist', 'why-dialects-exist'],
  ['The dialect ladder', 'the-dialect-ladder'],
  ['SSA, blocks, regions', 'ssa-blocks-regions'],
  ['Shape and layout kept', 'shape-and-layout-kept'],
  ['Exit 1: LLVM', 'exit-1-llvm'],
  ['Exit 2: SPIR-V', 'exit-2-spir-v'],
  ['Exit 3: vendor API', 'exit-3-vendor-api'],
  ['Each exit is a finished compilation', 'each-exit-is-a-finished-compilation'],
]);

site.mlChapter28Sidebar = mlChapterSidebar(28, 'The Stack Map', 'ml-compilers/the-stack-map', [
  ['Two layers', 'two-layers'],
  ['Three front doors', 'three-front-doors'],
  ['Who compiles the graph', 'who-compiles-the-graph'],
  ['Who writes the kernel', 'who-writes-the-kernel'],
  ['Dialects by name', 'dialects-by-name'],
  ['The file you ship', 'the-file-you-ship'],
  ['Cases the toy graph hides', 'cases-the-toy-graph-hides'],
  ['Where training compilers live', 'where-training-compilers-live'],
]);

site.mlChapter29Sidebar = mlChapterSidebar(29, 'ONNX Runtime', 'ml-compilers/onnx-runtime', [
  ['The session', 'the-session'],
  ['Graph optimization levels', 'graph-optimization-levels'],
  ['The partition', 'the-partition'],
  ['The fallback copy', 'the-fallback-copy'],
  ['Binding the buffers', 'binding-the-buffers'],
  ['Mobile and the web', 'mobile-and-the-web'],
  ['A fusion stays inside one provider', 'a-fusion-stays-inside-one-provider'],
]);

site.mlChapter30Sidebar = mlChapterSidebar(30, 'IREE', 'ml-compilers/iree', [
  ['What it imports', 'what-it-imports'],
  ['Flow', 'flow'],
  ['Stream', 'stream'],
  ['HAL', 'hal'],
  ['The VM and the vmfb', 'the-vm-and-the-vmfb'],
  ['The backends', 'the-backends'],
  ['Where the chapters land', 'where-the-chapters-land'],
]);

site.mlChapter31Sidebar = mlChapterSidebar(31, 'Edge and the NPU', 'ml-compilers/edge-and-the-npu', [
  ['Compile before you ship', 'compile-before-you-ship'],
  ['TOSA', 'tosa'],
  ['Two program files', 'two-program-files'],
  ['The mobile CPU', 'the-mobile-cpu'],
  ['The NPU delegates', 'the-npu-delegates'],
  ['Integer is the common dtype', 'integer-is-the-common-dtype'],
]);

site.mlChapter32Sidebar = mlChapterSidebar(32, 'Attention and the Shipped Model', 'ml-compilers/attention-and-the-shipped-model', [
  ['The score matrix', 'the-score-matrix'],
  ['Fusion keeps the tile', 'fusion-keeps-the-tile'],
  ['The KV cache', 'the-kv-cache'],
  ['Paging is a runtime', 'paging-is-a-runtime'],
  ['GGUF on the machine in front of you', 'gguf-on-the-machine-in-front-of-you'],
  ['The forward graph is still the program', 'the-forward-graph-is-still-the-program'],
]);

site.mlChapter14Sidebar = mlChapterSidebar(14, 'One MatMul, Many Implementations', 'ml-compilers/one-matmul-many-implementations', [
  ['The ONNX contract', 'the-onnx-contract'],
  ['Structured MatMul', 'structured-matmul'],
  ['A tiled form', 'a-tiled-form'],
  ['A loop nest', 'a-loop-nest'],
  ['A vectorized CPU kernel', 'a-vectorized-cpu-kernel'],
  ['The GPU path', 'the-gpu-path'],
  ['The library path', 'the-library-path'],
  ['The fused path', 'the-fused-path'],
  ['When the library call is the result', 'when-the-library-call-is-the-result'],
  ['When the generated kernel is the result', 'when-the-generated-kernel-is-the-result'],
]);

module.exports = site;
