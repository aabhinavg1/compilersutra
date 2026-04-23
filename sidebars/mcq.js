const mcq = {
  mcqSidebar: [
    {
      type: 'category',
      label: 'MCQs',
      collapsed: true,
      items: [
        'mcq/mcq-home',
        {
          type: 'category',
          label: 'Basic MCQs',
          collapsed: true,
          items: [
            'mcq/cpp_mcqs',
            'mcq/questions/basic/array-and-strings',
            'mcq/questions/basic/basic',
            'mcq/questions/basic/control-flow',
            'mcq/questions/basic/data-types',
            'mcq/questions/basic/functions',
            'mcq/questions/basic/intro-to-cpp',
            'mcq/questions/basic/io',
            'mcq/questions/basic/loop',
            'mcq/questions/basic/pointers-strings',
            'mcq/questions/basic/variables-and-constants',
            'mcq/questions/basic/pointers-and-references',
          ],
        },
        {
          type: 'category',
          label: 'Intermediate MCQs',
          items: [
            'mcq/questions/intermediate/abstraction',
            'mcq/questions/intermediate/classes-objects',
            'mcq/questions/intermediate/constructors-destructors',
            'mcq/questions/intermediate/encapsulation',
            'mcq/questions/intermediate/file-handling',
            'mcq/questions/intermediate/friend-functions',
            'mcq/questions/intermediate/inheritance',
            'mcq/questions/intermediate/getting-started-with-oops-concept',
            'mcq/questions/intermediate/memory-management',
            'mcq/questions/intermediate/oop',
            'mcq/questions/intermediate/operator-overloading',
            'mcq/questions/intermediate/polymorphism',
          ],
        },
        {
          type: 'category',
          label: 'Advanced MCQs',
          items: [
            'mcq/questions/advanced/concurrency-and-synchronization',
            'mcq/questions/advanced/cpp-features-11-14-17-20',
            'mcq/questions/advanced/exception-handling',
            'mcq/questions/advanced/lambdas',
            'mcq/questions/advanced/move-semantics',
            'mcq/questions/advanced/multithreading',
            'mcq/questions/advanced/stl',
            'mcq/questions/advanced/templates',
            'mcq/questions/advanced/vectors',
          ],
        },
        {
          type: 'category',
          label: 'Specialized MCQs',
          items: [
            'mcq/questions/specialized/algorithm',
            'mcq/questions/specialized/cpp-embedded',
            'mcq/questions/specialized/design-patterns',
            'mcq/questions/specialized/optimization',
            'mcq/questions/specialized/smart-pointers',
            'mcq/questions/specialized/specialized',
          ],
        },
        {
          type: 'category',
          label: 'Interview Questions',
          items: [
            'mcq/interview_question/cpp_interview_mcqs',
            'mcq/interview_question/basic/intro-to-cpp',
            'mcq/interview_question/basic/control-flow',
            'mcq/interview_question/basic/functions-recursion',
            'mcq/interview_question/basic/arrays-strings',
            'mcq/interview_question/basic/io-operations',
            'mcq/interview_question/basic/pointers-references',
            'mcq/interview_question/basic/data-types-variables',
            'mcq/interview_question/intermediate/classes-object',
            'mcq/interview_question/intermediate/constructors-destructors',
            'mcq/interview_question/intermediate/inheritance-polymorphism',
            'mcq/interview_question/intermediate/oop',
            'mcq/interview_question/intermediate/exception-handling',
            'mcq/interview_question/intermediate/memory-management',
            'mcq/interview_question/intermediate/operator-overloading',
            'mcq/interview_question/advanced/templates',
            'mcq/interview_question/advanced/modern-cpp-features',
            'mcq/interview_question/advanced/multi-threading',
            'mcq/interview_question/advanced/stl',
            'mcq/interview_question/advanced/lambda-expressions',
            'mcq/interview_question/advanced/optimization-debugging',
            'mcq/interview_question/advanced/algorithms-design-patterns',
            'mcq/interview_question/standard/modern-cpp',
            'mcq/interview_question/standard/stl-algorithms',
            'mcq/interview_question/specialized/cpp-embedded',
            'mcq/interview_question/specialized/debugging-profiling',
            'mcq/interview_question/specialized/memory-management-detail',
            'mcq/interview_question/specialized/high-performance',
            'mcq/interview_question/specialized/debugging-profiling',
            'mcq/interview_question/specialized/high-performance',
            'mcq/interview_question/specialized/smart-pointers',
            'mcq/interview_question/cpp11/cpp11',
            'mcq/interview_question/cpp14/cpp14',
            'mcq/interview_question/cpp20/cpp20',
          ],
        },
        {
          type: 'category',
          label: 'Interview Questions',
          items: [
            'mcq/interview_question/advanced/stl',
          ],
        },
        {
          type: 'category',
          label: 'Standard Questions',
          items: [
            'mcq/interview_question/cpp11/cpp11',
          ],
        },
      ],
    },
  ],

  reactMcqSidebar: [
    {
      type: 'category',
      label: 'React MCQs',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Basic React MCQs',
          collapsed: true,
          items: [
            'react_mcq/react_mcq',
            'react_mcq/basic/intro-to-react',
            'react_mcq/basic/jsx',
            'react_mcq/basic/components',
            'react_mcq/basic/props-state',
            'react_mcq/basic/events',
            'react_mcq/basic/conditional-rendering',
            'react_mcq/basic/lists-keys',
            'react_mcq/basic/forms',
          ],
        },
        {
          type: 'category',
          label: 'Intermediate React MCQs',
          collapsed: true,
          items: [
            'react_mcq/intermediate/lifecycle',
            'react_mcq/intermediate/hooks',
            'react_mcq/intermediate/effects',
            'react_mcq/intermediate/router',
            'react_mcq/intermediate/lifting-state',
            'react_mcq/intermediate/refs',
            'react_mcq/intermediate/controlled-uncontrolled',
          ],
        },
        {
          type: 'category',
          label: 'Advanced React MCQs',
          collapsed: true,
          items: [
            'react_mcq/advanced/custom-hooks',
            'react_mcq/advanced/context-api',
            'react_mcq/advanced/use-reducer',
            'react_mcq/advanced/memoization',
            'react_mcq/advanced/lazy-loading',
            'react_mcq/advanced/error-boundaries',
            'react_mcq/advanced/portals',
            'react_mcq/advanced/suspense',
          ],
        },
        {
          type: 'category',
          label: 'Specialized React MCQs',
          collapsed: true,
          items: [
            'react_mcq/specialized/redux',
            'react_mcq/specialized/performance',
            'react_mcq/specialized/testing',
            'react_mcq/specialized/typescript',
            'react_mcq/specialized/production',
          ],
        },
      ],
    },
  ],

  domainMcqSidebar: [
    {
      type: 'category',
      label: 'Domain Specific MCQs',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'COA MCQs',
          collapsed: true,
          items: [
            'mcq/questions/domain/coa/coa-home',
            'mcq/questions/domain/coa/coa-quiz',
            'mcq/questions/domain/coa/basic-terminology-home',
            'mcq/questions/domain/coa/basic-terminology-quiz',
            'mcq/questions/domain/coa/architecture-vs-organization-home',
            'mcq/questions/domain/coa/architecture-vs-organization-quiz',
            'mcq/questions/domain/coa/instruction-flow-modern-cpu-home',
            'mcq/questions/domain/coa/instruction-flow-modern-cpu-quiz',
          ],
        },
        {
          type: 'category',
          label: 'Compiler MCQs',
          collapsed: true,
          items: [
            'mcq/questions/domain/compilers/compiler-stack-home',
            'mcq/questions/domain/compilers/compiler/compiler-track-home',
            'mcq/questions/domain/compilers/compiler/compiler-basics',
            'mcq/questions/domain/compilers/compiler/compiler-commands',
            'mcq/questions/domain/compilers/compiler/compiler-ir',
            'mcq/questions/domain/compilers/compiler/compiler-backend',
            'mcq/questions/domain/compilers/compiler/compiler-track-quiz',
            'mcq/questions/domain/compilers/llvm/llvm-track-home',
            'mcq/questions/domain/compilers/llvm/llvm-track-quiz',
            'mcq/questions/domain/compilers/mlir/mlir-track-home',
            'mcq/questions/domain/compilers/mlir/mlir-track-quiz',
            'mcq/questions/domain/compilers/ai-in-compilers/ai-in-compilers-home',
            'mcq/questions/domain/compilers/ai-in-compilers/ai-in-compilers-quiz',
            'mcq/questions/domain/compilers/ai-compiler/compilers-in-ai-home',
            'mcq/questions/domain/compilers/ai-compiler/compilers-in-ai-quiz',
            'mcq/questions/domain/compiler-dev/compiler-dev-home',
            'mcq/questions/domain/compiler-dev/compiler-dev-fundamentals',
            'mcq/questions/domain/compiler-dev/compiler-dev-parsing-ir',
            'mcq/questions/domain/compiler-dev/compiler-dev-llvm-optimization',
            'mcq/questions/domain/compiler-dev/compiler-dev-quiz',
          ],
        },
        {
          type: 'category',
          label: 'System Programming MCQs',
          collapsed: true,
          items: [
            'mcq/questions/domain/system-programming/system-programming-home',
            'mcq/questions/domain/system-programming/system-programming-quiz',
          ],
        },
        {
          type: 'category',
          label: 'GPU Programming MCQs',
          collapsed: true,
          items: [
            'mcq/questions/domain/gpu-programming/gpu-programming-home',
            'mcq/questions/domain/gpu-programming/gpu-programming-quiz',
          ],
        },
        {
          type: 'category',
          label: 'Embedded Systems MCQs',
          collapsed: true,
          items: [
            'mcq/questions/domain/embedded/embedded-home',
            'mcq/questions/domain/embedded/embedded-quiz',
          ],
        },
        {
          type: 'category',
          label: 'HPC and Performance MCQs',
          collapsed: true,
          items: [
            'mcq/questions/domain/data-science-hpc/hpc-home',
            'mcq/questions/domain/data-science-hpc/hpc-quiz',
          ],
        },
        {
          type: 'category',
          label: 'Competitive Programming MCQs',
          collapsed: true,
          items: [
            'mcq/questions/domain/competitive-programming/competitive-programming-home',
            'mcq/questions/domain/competitive-programming/competitive-programming-quiz',
          ],
        },
      ],
    },
  ],

  compilerMcqSidebar: [
    {
      type: 'category',
      label: 'Compiler Design MCQs',
      collapsed: false,
      items: [
        'mcq/questions/domain/compiler-dev/compiler-dev-home',
        'mcq/questions/domain/compiler-dev/compiler-dev-quiz',
      ],
    },
  ],

  coaMcqSidebar: [
    {
      type: 'category',
      label: 'COA MCQs',
      collapsed: false,
      items: [
        'mcq/questions/domain/coa/coa-home',
        'mcq/questions/domain/coa/coa-quiz',
        'mcq/questions/domain/coa/basic-terminology-home',
        'mcq/questions/domain/coa/basic-terminology-quiz',
        'mcq/questions/domain/coa/architecture-vs-organization-home',
        'mcq/questions/domain/coa/architecture-vs-organization-quiz',
        'mcq/questions/domain/coa/instruction-flow-modern-cpu-home',
        'mcq/questions/domain/coa/instruction-flow-modern-cpu-quiz',
      ],
    },
  ],

  systemProgrammingMcqSidebar: [
    {
      type: 'category',
      label: 'System Programming MCQs',
      collapsed: false,
      items: [
        'mcq/questions/domain/system-programming/system-programming-home',
        'mcq/questions/domain/system-programming/system-programming-quiz',
      ],
    },
  ],

  gpuMcqSidebar: [
    {
      type: 'category',
      label: 'GPU Programming MCQs',
      collapsed: false,
      items: [
        'mcq/questions/domain/gpu-programming/gpu-programming-home',
        'mcq/questions/domain/gpu-programming/gpu-programming-quiz',
      ],
    },
  ],

  embeddedMcqSidebar: [
    {
      type: 'category',
      label: 'Embedded Systems MCQs',
      collapsed: false,
      items: [
        'mcq/questions/domain/embedded/embedded-home',
        'mcq/questions/domain/embedded/embedded-quiz',
      ],
    },
  ],

  hpcMcqSidebar: [
    {
      type: 'category',
      label: 'HPC and Performance MCQs',
      collapsed: false,
      items: [
        'mcq/questions/domain/data-science-hpc/hpc-home',
        'mcq/questions/domain/data-science-hpc/hpc-quiz',
      ],
    },
  ],

  competitiveProgrammingMcqSidebar: [
    {
      type: 'category',
      label: 'Competitive Programming MCQs',
      collapsed: false,
      items: [
        'mcq/questions/domain/competitive-programming/competitive-programming-home',
        'mcq/questions/domain/competitive-programming/competitive-programming-quiz',
      ],
    },
  ],

  compilerStackMcqSidebar: [
    {
      type: 'category',
      label: 'Compiler MCQs',
      collapsed: false,
      items: [
        'mcq/questions/domain/compilers/compiler-stack-home',
        'mcq/questions/domain/compilers/compiler/compiler-track-home',
        'mcq/questions/domain/compilers/llvm/llvm-track-home',
        'mcq/questions/domain/compilers/mlir/mlir-track-home',
        'mcq/questions/domain/compilers/ai-in-compilers/ai-in-compilers-home',
        'mcq/questions/domain/compilers/ai-compiler/compilers-in-ai-home',
        'mcq/questions/domain/compiler-dev/compiler-dev-home',
      ],
    },
  ],

  compilerTrackMcqSidebar: [
    {
      type: 'category',
      label: 'Compilers MCQs',
      collapsed: false,
      items: [
        'mcq/questions/domain/compilers/compiler/compiler-track-home',
        'mcq/questions/domain/compilers/compiler/compiler-basics',
        'mcq/questions/domain/compilers/compiler/compiler-commands',
        'mcq/questions/domain/compilers/compiler/compiler-ir',
        'mcq/questions/domain/compilers/compiler/compiler-backend',
        'mcq/questions/domain/compilers/compiler/compiler-track-quiz',
      ],
    },
  ],

  llvmTrackMcqSidebar: [
    {
      type: 'category',
      label: 'LLVM MCQs',
      collapsed: false,
      items: [
        'mcq/questions/domain/compilers/llvm/llvm-track-home',
        'mcq/questions/domain/compilers/llvm/llvm-track-quiz',
      ],
    },
  ],

  mlirTrackMcqSidebar: [
    {
      type: 'category',
      label: 'MLIR MCQs',
      collapsed: false,
      items: [
        'mcq/questions/domain/compilers/mlir/mlir-track-home',
        'mcq/questions/domain/compilers/mlir/mlir-track-quiz',
      ],
    },
  ],

  aiInCompilersTrackMcqSidebar: [
    {
      type: 'category',
      label: 'AI in Compilers MCQs',
      collapsed: false,
      items: [
        'mcq/questions/domain/compilers/ai-in-compilers/ai-in-compilers-home',
        'mcq/questions/domain/compilers/ai-in-compilers/ai-in-compilers-quiz',
      ],
    },
  ],

  compilersInAiTrackMcqSidebar: [
    {
      type: 'category',
      label: 'Compilers in AI MCQs',
      collapsed: false,
      items: [
        'mcq/questions/domain/compilers/ai-compiler/compilers-in-ai-home',
        'mcq/questions/domain/compilers/ai-compiler/compilers-in-ai-quiz',
      ],
    },
  ],
};

module.exports = mcq;
