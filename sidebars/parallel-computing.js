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
        {
          type: 'category',
          label: 'Course',
          collapsed: false,
          items: [
            { type: 'link', label: 'Start Here', href: '/docs/parallel-computing/start-here/' },
            { type: 'link', label: 'Chapter 1. Parallel Thinking', href: '/docs/parallel-computing/chapter-1/' },
            { type: 'link', label: 'Chapter 2. CPU', href: '/docs/parallel-computing/chapter-2/' },
            { type: 'link', label: 'Chapter 3. OpenMP', href: '/docs/parallel-computing/chapter-3/' },
            { type: 'link', label: 'Chapter 4. Algorithms', href: '/docs/parallel-computing/chapter-4/' },
            { type: 'link', label: 'Chapter 5. SIMD', href: '/docs/parallel-computing/chapter-5/' },
            { type: 'link', label: 'Chapter 6. GPU', href: '/docs/parallel-computing/chapter-6/' },
            { type: 'link', label: 'Chapter 7. Distributed', href: '/docs/parallel-computing/chapter-7/' },
            { type: 'link', label: 'Chapter 8. Measuring', href: '/docs/parallel-computing/chapter-8/' },
            { type: 'link', label: 'Projects', href: '/docs/parallel-computing/projects/' },
          ],
        },
      ],
    },
  ],
};

function chapterSidebar(label, ids) {
  return [
    {
      type: 'category',
      label,
      collapsed: false,
      items: ids,
    },
  ];
}

const p = 'parallel-computing';

parallel.parallelStartSidebar = chapterSidebar('Start Here', [
  `${p}/start-here/index`,
  `${p}/start-here/how-to-use-this-course`,
  `${p}/start-here/the-list-of-numbers`,
]);

parallel.parallelChapter1Sidebar = chapterSidebar('Chapter 1. Parallel Thinking', [
  `${p}/chapter-1/index`,
  `${p}/chapter-1/a-program-is-a-list-of-steps`,
  `${p}/chapter-1/why-one-core-stops-being-enough`,
  `${p}/chapter-1/sequential-and-parallel`,
  `${p}/chapter-1/concurrent-parallel-and-distributed`,
  `${p}/chapter-1/your-first-parallel-problem`,
]);

parallel.parallelChapter2Sidebar = chapterSidebar('Chapter 2. CPU', [
  `${p}/chapter-2/index`,
  `${p}/chapter-2/cpu-cores`,
  `${p}/chapter-2/processes-and-threads`,
  `${p}/chapter-2/shared-memory`,
  `${p}/chapter-2/race-conditions`,
  `${p}/chapter-2/mutex`,
  `${p}/chapter-2/atomics`,
  `${p}/chapter-2/waiting-and-deadlock`,
]);

parallel.parallelChapter3Sidebar = chapterSidebar('Chapter 3. OpenMP', [
  `${p}/chapter-3/index`,
  `${p}/chapter-3/parallel-and-for`,
  `${p}/chapter-3/reduction`,
  `${p}/chapter-3/sections-and-synchronization`,
  `${p}/chapter-3/openmp-project`,
]);

parallel.parallelChapter4Sidebar = chapterSidebar('Chapter 4. Algorithms', [
  `${p}/chapter-4/index`,
  `${p}/chapter-4/map`,
  `${p}/chapter-4/reduce`,
  `${p}/chapter-4/histogram`,
  `${p}/chapter-4/matrix-multiplication`,
  `${p}/chapter-4/stencil`,
  `${p}/chapter-4/scan`,
  `${p}/chapter-4/parallel-sorting`,
]);

parallel.parallelChapter5Sidebar = chapterSidebar('Chapter 5. SIMD', [
  `${p}/chapter-5/index`,
  `${p}/chapter-5/what-simd-is`,
  `${p}/chapter-5/vectorization`,
  `${p}/chapter-5/simd-and-threads`,
]);

parallel.parallelChapter6Sidebar = chapterSidebar('Chapter 6. GPU', [
  `${p}/chapter-6/index`,
  `${p}/chapter-6/why-gpus`,
  `${p}/chapter-6/gpu-architecture`,
  `${p}/chapter-6/threads-and-blocks`,
  `${p}/chapter-6/simt`,
  `${p}/chapter-6/gpu-memory`,
  `${p}/chapter-6/cuda`,
  `${p}/chapter-6/hip-and-rocm`,
  `${p}/chapter-6/opencl`,
  `${p}/chapter-6/vulkan`,
  `${p}/chapter-6/gpu-project`,
]);

parallel.parallelChapter7Sidebar = chapterSidebar('Chapter 7. Distributed', [
  `${p}/chapter-7/index`,
  `${p}/chapter-7/why-a-cluster`,
  `${p}/chapter-7/mpi`,
  `${p}/chapter-7/send-and-receive`,
  `${p}/chapter-7/collective-operations`,
  `${p}/chapter-7/distributed-project`,
]);

parallel.parallelChapter8Sidebar = chapterSidebar('Chapter 8. Measuring', [
  `${p}/chapter-8/index`,
  `${p}/chapter-8/speedup-and-amdahl`,
  `${p}/chapter-8/cache-and-false-sharing`,
  `${p}/chapter-8/memory-bandwidth`,
  `${p}/chapter-8/load-balancing`,
  `${p}/chapter-8/profiling`,
]);

parallel.parallelProjectsSidebar = chapterSidebar('Projects', [
  `${p}/projects/index`,
  `${p}/projects/cpu-project`,
  `${p}/projects/simd-project`,
  `${p}/projects/gpu-project`,
  `${p}/projects/final-project`,
]);

module.exports = parallel;
