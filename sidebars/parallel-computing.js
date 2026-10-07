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
          label: 'Daily lessons',
          collapsed: false,
          items: [
            'parallel-computing/why-parallel-programs',
          ],
        },
      ],
    },
  ],
};

module.exports = parallel;
