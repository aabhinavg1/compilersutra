const parallel = {
  parallelComputingSidebar: [
    {
      type: 'category',
      label: 'Parallel Programming',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'parallel-computing/index',
      },
      items: [
        {
          type: 'category',
          label: 'Fundamentals',
          collapsed: false,
          link: {
            type: 'doc',
            id: 'parallel-computing/fundamentals/what-is-parallel-computing',
          },
          items: [
            'parallel-computing/fundamentals/what-is-parallel-computing',
            'parallel-computing/fundamentals/program-process-thread-core',
            'parallel-computing/fundamentals/memory-models',
            'parallel-computing/fundamentals/amdahls-and-gustafsons-law',
            'parallel-computing/fundamentals/parallel-hardware-overview',
            'parallel-computing/fundamentals/measuring-parallel-performance',
          ],
        },
        {
          type: 'category',
          label: 'GPU tracks',
          collapsed: false,
          items: [
            { type: 'link', label: 'What is a GPU?', href: '/docs/gpu/what_is_gpu/' },
            { type: 'link', label: 'CUDA', href: '/docs/gpu/platforms/cuda/' },
            { type: 'link', label: 'ROCm', href: '/docs/gpu/platforms/rocm/' },
            { type: 'link', label: 'Vulkan', href: '/docs/gpu/platforms/vulkan/' },
            { type: 'link', label: 'OpenCL', href: '/docs/gpu/opencl/basic/what_is_opencl/' },
            { type: 'link', label: 'GPU optimizations', href: '/docs/gpu/optimizations/' },
          ],
        },
      ],
    },
  ],
};

module.exports = parallel;
