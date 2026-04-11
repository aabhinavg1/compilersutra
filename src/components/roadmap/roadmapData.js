export const PREREQUISITES = [
  {
    id: 'cpp',
    label: 'Comfortable with C++ (pointers, memory management, classes)',
  },
  {
    id: 'memory',
    label: 'Understands stack vs heap memory',
  },
  {
    id: 'assembly',
    label: 'Can read and write basic assembly',
  },
  {
    id: 'git',
    label: 'Familiar with Git and command line',
  },
  {
    id: 'multifile',
    label: 'Has built a multi-file program',
  },
];

export const ROLES = [
  'Compiler Engineer',
  'LLVM Toolchain Engineer',
  'GPU Software Engineer',
  'Performance Engineer',
  'Systems Software Engineer',
];

export const PHASES = [
  {
    id: 'phase-1',
    step: 'Phase 1',
    title: 'Foundations',
    difficulty: 'Foundation',
    accent: '#3b82f6',
    quickWin:
      'Compile one tiny C++ function with `-S`, open the assembly, and identify the stack frame setup in under five minutes.',
    learn:
      'Build the base required to understand how programs execute, how memory behaves, and how low-level systems are structured.',
    why:
      'Most people try to learn LLVM before they can explain stack frames, object lifetime, data layout, or machine-level execution. This phase removes that weakness.',
    topics: [
      'Modern C++ for systems work',
      'Pointers, references, memory layout, and object lifetime',
      'Stack, heap, and runtime behavior',
      'Core data structures and control flow',
      'Assembly basics and source-to-machine mapping',
      'Toolchains, debugging, and build workflows',
    ],
    projects: [
      {
        title: 'Build a tiny expression evaluator',
        portfolio: true,
        tooltip:
          'This shows parsing instincts, execution flow awareness, and the ability to turn syntax into working semantics.',
      },
      {
        title: 'Write a tokenizer for a toy language',
        portfolio: true,
        tooltip:
          'A tokenizer is small enough to finish but concrete enough to discuss in interviews as a compiler-adjacent artifact.',
      },
      {
        title: 'Inspect generated assembly from simple C++ functions',
      },
      {
        title: 'Debug memory issues with low-level tools',
      },
      {
        title: 'Build a small command-line utility with clean C++ structure',
      },
    ],
    corePages: [
      { label: 'C++ Basics', to: '/docs/c++/basic/' },
      { label: 'C++ Intermediate', to: '/docs/c++/intermediate/' },
      { label: 'C++ Advanced', to: '/docs/c++/advanced/' },
      { label: 'DSA Foundations', to: '/docs/DSA/introduction-to-dsa/' },
      { label: 'Computer Architecture', to: '/docs/coa/' },
      { label: 'From Source Code to Executable', to: '/docs/compilers/sourcecode_to_executable/' },
    ],
    progressMarker: 'You stop seeing code as syntax and start seeing execution.',
    proTip:
      'Compiler engineers get faster when they can move fluently between source, assembly, memory layout, and debugger state. Treat that translation loop like a muscle.',
    interviewQuestions: [
      'What actually lives on the stack frame for a normal C++ function call, and what can change under optimization?',
      'How would you explain object lifetime, RAII, and memory ownership to someone debugging a crash in production?',
      'When would generated assembly tell you something the source code alone does not?',
    ],
  },
  {
    id: 'phase-2',
    step: 'Phase 2',
    title: 'Compiler Basics',
    difficulty: 'Intermediate',
    accent: '#22c55e',
    quickWin:
      'Take a simple grammar, hand-tokenize one line of input, and sketch the resulting AST without touching a parser generator.',
    learn:
      'Understand the core compiler pipeline from tokens and ASTs to semantic analysis, intermediate forms, and early optimizations.',
    why:
      'This is the difference between reading compiler theory and actually understanding how a compiler is built.',
    topics: [
      'Lexing and parsing',
      'AST construction',
      'Semantic analysis',
      'Symbol tables and scope',
      'Type checking',
      'Intermediate representation',
      'Control flow and data flow basics',
      'Introductory optimizations',
    ],
    projects: [
      {
        title: 'Build a lexer for a toy language',
        portfolio: true,
        tooltip:
          'A finished lexer proves you can convert theory into executable infrastructure, not just explain compiler terms.',
      },
      {
        title: 'Build a parser that emits an AST',
        portfolio: true,
        tooltip:
          'A parser plus AST demo gives employers a concrete artifact that maps cleanly to compiler internals discussion.',
      },
      {
        title: 'Add variables, scopes, and simple type checks',
      },
      {
        title: 'Lower your AST into a basic IR',
        portfolio: true,
        tooltip:
          'Lowering is where your project starts looking like actual compiler work rather than a one-off language toy.',
      },
      {
        title: 'Implement constant folding or dead code elimination',
      },
    ],
    corePages: [
      { label: 'Compiler Fundamentals Track', to: '/docs/tracks/compiler-fundamentals/' },
      { label: 'Know Your Compiler', to: '/docs/compilers/compiler/' },
      { label: 'Build Your First Compiler', to: '/docs/compilers/build_your_compiler/' },
      { label: 'Intermediate Representation in Compilers', to: '/docs/compilers/ir_in_compiler/' },
      { label: 'Role of the Parser', to: '/docs/compilers/front_end/role_of_parser/' },
    ],
    progressMarker:
      'You stop treating compilers like black boxes and start thinking in stages and representations.',
    proTip:
      'Do not over-index on parser generators. Interviews and real work both reward engineers who can explain the invariants between tokens, AST nodes, symbol tables, and the lowered form.',
    interviewQuestions: [
      'What is the practical difference between parsing and semantic analysis?',
      'Why does a compiler need an intermediate representation instead of going directly from AST to machine code?',
      'How would you represent scope and symbol lookup in a small language implementation?',
    ],
  },
  {
    id: 'phase-3',
    step: 'Phase 3',
    title: 'LLVM Deep Dive',
    difficulty: 'Advanced',
    accent: '#f59e0b',
    quickWin:
      'Generate LLVM IR for one small function, then identify the basic blocks, terminators, and one SSA value by hand.',
    learn:
      'Move from compiler theory into production-grade infrastructure with LLVM, IR, passes, and optimization reasoning.',
    why:
      'LLVM is where compiler learning becomes career-relevant. This is the phase where your skill begins to look like something real teams can use.',
    topics: [
      'LLVM architecture',
      'LLVM IR structure and semantics',
      'SSA, CFG, and dominance',
      'Analysis passes vs transformation passes',
      'Pass managers and optimization flow',
      'Clang-to-LLVM pipeline',
      'Tooling for inspecting and debugging IR',
    ],
    projects: [
      {
        title: 'Generate LLVM IR from small C or C++ programs',
      },
      {
        title: 'Read and annotate simple IR by hand',
      },
      {
        title: 'Write a basic LLVM analysis pass',
        portfolio: true,
        tooltip:
          'A pass is an immediate signal that you moved from “I read about LLVM” to “I can work in LLVM”.',
      },
      {
        title: 'Write a simple transformation pass',
        portfolio: true,
        tooltip:
          'Transformation passes stand out because they force you to reason about correctness, safety, and IR mutation.',
      },
      {
        title: 'Compare optimized and unoptimized IR output',
      },
      {
        title: 'Track how high-level code lowers into compiler internals',
      },
    ],
    corePages: [
      { label: 'LLVM and IR Track', to: '/docs/tracks/llvm-and-ir/' },
      { label: 'LLVM Roadmap', to: '/docs/llvm/intro-to-llvm/' },
      { label: 'What Is LLVM?', to: '/docs/llvm/llvm_basic/What_is_LLVM/' },
      { label: 'LLVM Architecture', to: '/docs/llvm/llvm_basic/LLVM_Architecture/' },
      { label: 'LLVM IR Introduction', to: '/docs/llvm/llvm_ir/intro_to_llvm_ir/' },
      { label: 'Static Single Assignment', to: '/docs/llvm/llvm_Curriculum/level0/Static_Single_Assignment/' },
      { label: 'Dominator Tree and Dominance Frontier', to: '/docs/llvm/llvm_Curriculum/level0/Dominator_Tree_And_Dominance_Frontier/' },
    ],
    progressMarker: 'You stop reading about LLVM and start working with it.',
    proTip:
      'The fastest LLVM learners constantly ask two questions: what invariants does this pass rely on, and what analyses become invalid after this transformation?',
    interviewQuestions: [
      'What problem does SSA solve, and why does it make many optimizations easier?',
      'How would you explain the difference between an analysis pass and a transformation pass?',
      'What would you inspect first if an LLVM optimization changed program behavior incorrectly?',
    ],
  },
  {
    id: 'phase-4',
    step: 'Phase 4',
    title: 'Advanced / GPU / Backend',
    difficulty: 'Expert',
    accent: '#8b5cf6',
    quickWin:
      'Take one CPU-bound loop and explain, in plain language, why its behavior would differ on a GPU before writing any kernel code.',
    learn:
      'Connect compiler knowledge to backend architecture, GPU execution, performance reasoning, and the engineering problems that matter in production systems.',
    why:
      'This is where you separate yourself from general learners. Backend and GPU-aware compiler depth is rare, valuable, and difficult to fake.',
    topics: [
      'Backend architecture and lowering',
      'Machine-level code generation concepts',
      'Performance analysis and benchmarking',
      'GPU execution models',
      'Kernel compilation pipelines',
      'Throughput, latency, and optimization tradeoffs',
      'Runtime and backend interaction',
    ],
    projects: [
      {
        title: 'Analyze how optimized IR changes generated output',
      },
      {
        title: 'Study a simple GPU kernel path from code to execution',
      },
      {
        title: 'Compare CPU and GPU execution tradeoffs',
        portfolio: true,
        tooltip:
          'This is valuable because it demonstrates performance judgment and hardware-aware reasoning, not just framework familiarity.',
      },
      {
        title: 'Build a benchmark-driven optimization experiment',
        portfolio: true,
        tooltip:
          'Benchmark work is portfolio-worthy because it shows rigor, measurement discipline, and the ability to communicate tradeoffs.',
      },
      {
        title: 'Create a visible project around LLVM, GPU compilation, or performance tooling',
        portfolio: true,
        tooltip:
          'A visible infrastructure-style project is the strongest proof that you can contribute beyond tutorial-level work.',
      },
    ],
    corePages: [
      { label: 'GPU Compilers Track', to: '/docs/tracks/gpu-compilers/' },
      { label: 'What Is GPU?', to: '/docs/gpu/what_is_gpu/' },
      { label: 'OpenCL Path', to: '/docs/gpu/opencl/' },
      { label: 'Writing Your First Kernel', to: '/docs/gpu/opencl/basic/Writing_your_first_kernel/' },
      { label: 'GPU Programming TOC', to: '/docs/gpu/gpu_programming/gpu_programming_toc/' },
      { label: 'ML Compilers Track', to: '/docs/tracks/ml-compilers/' },
      { label: 'MLIR Introduction', to: '/docs/MLIR/intro/' },
      { label: 'TVM Introduction', to: '/docs/tvm/' },
    ],
    progressMarker:
      'You stop sounding like a learner and start sounding like an engineer who can work on real infrastructure.',
    proTip:
      'The differentiator here is not memorizing hardware buzzwords. It is being able to explain how compiler decisions interact with throughput, latency, memory movement, and backend constraints.',
    interviewQuestions: [
      'What tradeoffs change when lowering work for a GPU instead of a CPU?',
      'How would you investigate a performance regression when the generated code looks “correct” but throughput drops?',
      'What makes backend or GPU compiler work harder to fake than frontend compiler familiarity?',
    ],
  },
];
