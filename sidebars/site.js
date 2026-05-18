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

  projectSidebar: [
    {
      type: 'category',
      label: 'Project',
      collapsed: false,
      items: ['project/Project'],
    },
    {
      type: 'category',
      label: 'LLVM Projects',
      collapsed: false,
      items: ['project/llvm/index'],
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
        'coa/basic_terminology_in_coa',
        'coa/intro_to_coa',
        'coa/instruction_flow_modern_cpu',
        'coa/types_of_execution',
        'coa/cpu_execution',
        'coa/memory-hierarchy',
        'coa/measuring_throughput_cache_misses_cpu_behavior_cpp',
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
        'ml-compilers/what-problem-ml-compilers-solve-beyond-llvm',
        'ml-compilers/end-to-end-ml-compiler-pipeline',
        'ml-compilers/introduction-roadmap',
        'ml-compilers/inside-torch-compile-dynamo-aotautograd-inductor-triton-explained',
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
        'articles/hft_stdlib_restrictions',
        'articles/language_energy_efficiency_validation',
        
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

module.exports = site;
