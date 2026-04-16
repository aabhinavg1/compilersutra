const site = {
  projectSidebar: [
    {
      type: 'category',
      label: 'Project',
      collapsed: true,
      items: ['project/Project'],
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
          collapsed: true,
          items: [
            'AI/is_gpt_is_opensource',
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
        'ml-compilers/introduction-roadmap',
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
        'articles/gcc_vs_clang_assembly_part2a',
        'articles/gcc_vs_clang_stencil_ir_passes_part2b',
        'articles/where_gcc_and_clang_diverge_stencil_pass_trace',
        {
          type: 'category',
          label: 'Tech Blog',
          collapsed: true,
          items: [
            'AI/is_gpt_is_opensource',
          ],
        },
      ],
    },
  ],
};

module.exports = site;
