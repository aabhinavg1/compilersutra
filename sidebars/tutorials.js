const tutorials = {
  learningPathsSidebar: [
    {
      type: 'category',
      label: 'Start Here',
      collapsed: false,
      items: [
        'start-here',
        'tracks/index',
        'tracks/compiler-fundamentals',
        'tracks/llvm-and-ir',
        'tracks/gpu-compilers',
        'tracks/ml-compilers',
      ],
    },
  ],

  toolsSidebar: [
    {
      type: 'category',
      label: 'Tools',
      collapsed: false,
      items: [
        'tools/tools',
      ],
    },
  ],

  labsSidebar: [
    {
      type: 'category',
      label: 'Labs',
      collapsed: false,
      items: [
        'labs/labs',
      ],
    },
  ],

  compilersSidebar: [
    {
      type: 'category',
      label: 'Know Your Compiler',
      collapsed: false,
      items: [
        'compilers/index',
        'compilers/Compiler',
        'compilers/ir_in_compiler',
        'compilers/sourcecode_to_executable',
        'compilers/IntroductionToCompilers',
        'compilers/front_end/compiler-frontend',
        'compilers/front_end/role_of_parser',
        'compilers/back_end/introduction-to-backend-compilers',
        'compilers/flag/compiler-flags',
        'compilers/Verification_Vs_Validation',
        'compilers/build_your_compiler',
        'compilers/other_arch/other-architectures',
        'compilers/basic_block_in_compiler',
      ],
    },
    {
      type: 'category',
      label: 'GCC vs LLVM',
      collapsed: true,
      items: [
        'compilers/gcc_vs_llvm',
        'compilers/gcc_vs_llvm_2',
      ],
    },
    {
      type: 'category',
      label: 'C vs C++ Compilation',
      collapsed: true,
      items: [
        'compilers/clang-c-vs-cpp-compilation',
      ],
    },
    {
      type: 'category',
      label: 'CPU Compilers',
      collapsed: true,
      items: [
        'compilers/CPU/cpu-compilers',
      ],
    },
    {
      type: 'category',
      label: 'GPU Compilers',
      collapsed: true,
      items: [
        'compilers/GPU/gpu-compilers',
      ],
    },
  ],

  openclMasterSidebar: [
    {
      type: 'category',
      label: 'OpenCL Master',
      collapsed: true,
      items: [
        'gpu/opencl/opencl',
        'gpu/opencl/amdgpu',
        'gpu/opencl/amdcpu',
        'gpu/opencl/nvidia',
        'gpu/opencl/openclforandroid',
      ],
    },
  ],

  openclAMDGPUsidebar: [
    {
      type: 'category',
      label: 'OpenCL on AMDGPU',
      collapsed: true,
      items: [
        'gpu/opencl/amdgpu',
        'gpu/opencl/basic/what_is_opencl',
        'gpu/opencl/basic/setting_up_opencl',
        'gpu/opencl/basic/getting_started_with_opencl_on_amdgpu',
        'gpu/opencl/basic/running_first_opencl_code',
        'gpu/opencl/basic/running_first_opencl_code_part2_a',
        'gpu/opencl/basic/Writing_your_first_kernel',
      ],
    },
  ],

  openclAMDCPUSidebar: [
    {
      type: 'category',
      label: 'OpenCL on AMD CPU',
      collapsed: true,
      items: [
        'gpu/opencl/amdcpu',
        'gpu/opencl/basic/what_is_opencl',
        'gpu/opencl/basic/setting_up_opencl',
        'gpu/opencl/basic/running_first_opencl_code',
        'gpu/opencl/basic/running_first_opencl_code_part2_a',
      ],
    },
  ],

  openclNVIDIASidebar: [
    {
      type: 'category',
      label: 'OpenCL on NVIDIA',
      collapsed: true,
      items: [
        'gpu/opencl/nvidia',
        'gpu/opencl/basic/what_is_opencl',
        'gpu/opencl/basic/setting_up_opencl',
        'gpu/opencl/basic/running_first_opencl_code',
        'gpu/opencl/basic/running_first_opencl_code_part2_a',
        'gpu/opencl/basic/Writing_your_first_kernel',
      ],
    },
  ],

  openclAndroidSidebar: [
    {
      type: 'category',
      label: 'OpenCL for Android',
      collapsed: true,
      items: [
        'gpu/opencl/openclforandroid',
        'gpu/opencl/basic/detecting_opencl_gpu_on_android',
      ],
    },
  ],

  gpuProgrammingSidebar: [
    {
      type: 'category',
      label: 'Table of Content',
      collapsed: true,
      items: [
        'gpu/gpu_programming/gpu_programming_toc',
        'gpu/gpu_programming/how_computer_works',
        'gpu/gpu_programming/Setting_your_Gpu',
      ],
    },
  ],

  gpuTutorialSidebar: [
    {
      type: 'category',
      label: 'GPU Tutorials',
      collapsed: true,
      items: [
        'gpu/index',
        'gpu/introduction',
        'gpu/optimizations',
        'gpu/evolution-of-parallel-programming',
        'gpu/CPU_Vs_GPU',
      ],
    },
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: true,
      items: [
        'gpu/Parallel_Programming/Intro_to_Parallel_Programming',
        'gpu/what_is_gpu',
      ],
    },
  ],

  llvmTutorialSidebar: [
    {
      type: 'category',
      label: 'LLVM Tutorials',
      collapsed: true,
      items: [
        'llvm/index',
        'llvm/intro-to-llvm',
        {
          type: 'category',
          label: 'LLVM Basics',
          items: [
            'llvm/llvm_basic/Build',
            'llvm/llvm_basic/What_is_LLVM',
            'llvm/llvm_basic/Why_LLVM',
            'llvm/fix_llvm_build_bugs',
            'llvm/llvm_basic/LLVM_Architecture',
          ],
        },
        {
          type: 'category',
          label: 'LLVM Extras',
          items: [
            'llvm/llvm_extras/manage_llvm_version',
            'llvm/llvm_extras/llvm-guide',
            'llvm/llvm_extras/llvm_pass_timing',
          ],
        },
        {
          type: 'category',
          label: 'LLVM Tools',
          items: [
            'llvm/llvm_tools/llvm_tools',
          ],
        },
        {
          type: 'category',
          label: 'LLVM IR',
          items: [
            'llvm/llvm_ir/intro_to_llvm_ir',
            'llvm/llvm_ir/hierarchy_of_llvm_ir',
          ],
        },
        {
          type: 'category',
          label: 'LLVM Passes',
          items: [
            'llvm/Intermediate/What_Is_LLVM_Passes',
            '/llvm/llvm_basic/pass/Create_LLVM_Pass_As_A_Plugin',
            'llvm/llvm_pass_tracker/llvm_pass',
          ],
        },
        {
          type: 'category',
          label: 'LEVEL 0 - Compiler-Specific DSA Foundations',
          items: [
            'llvm/llvm_Curriculum/level0/Static_Single_Assignment',
            'llvm/llvm_Curriculum/level0/Static_Single_Assignment_part2',
            'llvm/llvm_Curriculum/level0/Dominator_Tree_And_Dominance_Frontier',
          ],
        },
      ],
    },
  ],

  tvmTutorialSidebar: [
    {
      type: 'category',
      label: 'TVM Tutorials',
      collapsed: true,
      items: [
        'tvm/index',
        'tvm/tvm-for-beginners',
        {
          type: 'category',
          label: 'TVM Basics',
          collapsed: true,
          items: [
            'tvm/basics/installation',
            'tvm/basics/first-model',
          ],
        },
      ],
    },
  ],

  pythonAutomationSidebar: [
    {
      type: 'category',
      label: 'Python Automation',
      collapsed: true,
      items: ['python/python_tutorial'],
    },
  ],

  dsaTutorialSidebar: [
    {
      type: 'category',
      label: 'DSA Tutorials',
      collapsed: true,
      items: [
        'DSA/introduction-to-dsa',
        'DSA/Mathematical_Foundation',
        'DSA/DSA',
        'DSA/Bit_Manipulation_Technique',
        'DSA/Time_and_space',
        'DSA/Linear_DSA',
        'DSA/non-Linear-DSA',
        'DSA/arrays-and-strings',
      ],
    },
  ],

  linuxTutorialSidebar: [
    {
      type: 'category',
      label: 'Linux Tutorials',
      collapsed: true,
      items: [
        'linux/index',
        'linux/intro_to_linux',
        'linux/basic_of_linux',
        'linux/What_is_bashrc',
        'linux/Environment_variable_in_linux',
        'linux/Declaring_Variable_In_bash',
        'linux/if_else_in_bash',
        'linux/loop_in_bash',
        'linux/markdown_checker',
        'linux/markdown_checker_part2',
        'linux/markdown_checker_part3',
        'linux/username_in_linux',
        'linux/know_machine_ip',
        'linux/how_ssh_scp_work',
        'linux/live',
      ],
    },
  ],
};

module.exports = tutorials;
