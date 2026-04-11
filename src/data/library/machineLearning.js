export const machineLearningTopic = {
  id: 'machine-learning',
  title: 'Machine Learning',
  description: 'Papers at the intersection of ML systems, optimization, and compiler techniques.',
  coverTone: 'coverSlate',
  coverImage: '/img/og/compilers.png',
  articleCategory: 'ML Systems',
  articleDescription:
    'Papers that connect compiler optimization, program representation, and machine learning guided decisions.',
  relatedTopicIds: ['mlir', 'llvm'],
  sections: [
    {
      id: 'where-ml-fits',
      title: 'Where ML fits',
      paragraphs: [
        'Machine learning enters compiler work where heuristics become brittle, search spaces become large, or cost models become hard to hand-tune.',
        'The useful frame is not AI replacing compilers. It is models supporting decisions in optimization, scheduling, and representation learning.',
      ],
      code: {
        language: 'python',
        snippet: `score = model(features)\nif score > threshold:\n    apply_pass()`,
      },
    },
    {
      id: 'reading-approach',
      title: 'Reading approach',
      paragraphs: [
        'Read these papers with one question in mind: what compiler decision is being modeled, and what information does the model actually use.',
        'That keeps the discussion grounded in engineering tradeoffs rather than broad claims about automation.',
      ],
    },
    {
      id: 'library-collection',
      title: 'Library collection',
      paragraphs: [
        'This shelf is intentionally small and keeps the emphasis on practical compiler-facing ML research.',
      ],
    },
  ],
  conclusion:
    'This topic is most useful once you already understand the classical compiler workflow and want to examine where learned models fit.',
};

export const machineLearningPapers = [
  {
    id: 'tvm-osdi18',
    topic: 'machine-learning',
    category: 'Core Papers',
    thumbnailLabel: 'PDF',
    title: 'TVM: An Automated End-to-End Optimizing Compiler for Deep Learning',
    author: 'Tianqi Chen et al.',
    year: '2018',
    coverTone: 'coverCopper',
    file: 'https://www.usenix.org/system/files/osdi18-chen.pdf',
    note: 'A foundational ML compiler paper covering graph-level optimization, operator-level optimization, and performance portability across hardware backends.',
  },
  {
    id: 'cmlcompiler',
    topic: 'machine-learning',
    category: 'Advanced Papers',
    thumbnailLabel: 'PDF',
    title: 'CMLCompiler: A Unified Compiler for Classical Machine Learning',
    author: 'Xu Wen et al.',
    year: '2023',
    coverTone: 'coverTeal',
    file: 'https://arxiv.org/pdf/2301.13441',
    note: 'Shows how unified abstractions and compiler pipelines extend beyond deep learning into classical ML and mixed ML workloads.',
  },
  {
    id: 'neural-compiler-optimization',
    topic: 'machine-learning',
    category: 'Advanced Papers',
    thumbnailLabel: 'PDF',
    title: 'Neural Compiler Optimization',
    author: 'Uri Alon et al.',
    year: '2020',
    coverTone: 'coverSlate',
    file: 'https://www2.eecs.berkeley.edu/Pubs/TechRpts/2021/EECS-2021-2.pdf',
    note: 'Machine-learning compiler paper hosted by Berkeley EECS.',
  },
];
