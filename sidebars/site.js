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
        'coa/basic_terminology_in_coa',
        'coa/intro_to_coa',
        'coa/instruction_flow_modern_cpu',
        'coa/types_of_execution',
        'coa/superscalar_execution',
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

module.exports = site;
