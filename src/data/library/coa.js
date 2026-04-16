export const coaTopic = {
  id: 'coa',
  title: 'COA',
  description: 'Computer organization, architecture intuition, and machine-level execution references.',
  coverTone: 'coverCopper',
  coverImage: '/img/og/coa.png',
  articleCategory: 'Computer Architecture',
  articleDescription:
    'A compact reading shelf for execution flow, memory behavior, and the machine-level details that shape compiler output.',
  relatedTopicIds: ['llvm', 'compilersutra-material'],
  sections: [
    {
      id: 'execution-model',
      title: 'Execution model',
      paragraphs: [
        'Computer organization and architecture gives the context for why generated code behaves the way it does on real machines.',
        'For compiler learners, the useful layer is the one that connects source code, assembly, caches, branches, and memory access into a single mental model.',
      ],
      code: {
        language: 'cpp',
        snippet: `for (int i = 0; i < n; ++i) {\n  sum += values[i];\n}`,
      },
    },
    {
      id: 'what-to-watch',
      title: 'What to watch',
      paragraphs: [
        'Start with the cost of loads, stores, and branches. Those three decisions explain a large part of performance variation in compiled programs.',
        'A good COA study path is not about memorizing hardware diagrams. It is about recognizing which machine constraints a compiler is optimizing around.',
      ],
    },
    {
      id: 'library-collection',
      title: 'Library collection',
      paragraphs: [
        'This shelf collects papers that map directly to the execution-model article sequence: dynamic scheduling, speculation, vector execution, and multicore memory behavior.',
      ],
    },
  ],
  conclusion:
    'Use this shelf when you want to understand why low-level code shape matters before moving into IR design or optimization pipelines.',
};

export const coaPapers = [
  {
    id: 'pipelining-modern-processors',
    topic: 'coa',
    category: 'Pipeline and Execution Flow',
    thumbnailLabel: 'PIPE',
    title: 'Pipelining in Modern Processors',
    author: 'Muhammad Hataba',
    year: '2020',
    coverTone: 'coverCopper',
    file: 'https://www.researchgate.net/profile/Muhammad-Hataba/publication/373629826_Pipelining_in_Modern_Processors/links/64f4db90aef680084cbdd7e2/Pipelining-in-Modern-Processors.pdf',
    note: 'A direct paper-length walkthrough of modern pipelining, hazards, and stage structure that matches the start of this COA execution series.',
  },
  {
    id: 'comparative-pipeline-branch-superscalar',
    topic: 'coa',
    category: 'Superscalar and Speculation',
    thumbnailLabel: 'EXEC',
    title: 'A Comparative Study of Pipelining, Branch Prediction, and Superscalar Architectures for Enhanced Computer Performance',
    author: 'Mohammed Kawu Sambo',
    year: '2023',
    coverTone: 'coverTeal',
    file: 'https://www.researchgate.net/profile/Mohammed-Sambo-9/publication/370679883_A_Comparative_Study_of_Pipelining_Branch_Prediction_and_Superscalar_Architectures_for_Enhanced_Computer_Performance/links/645d1a2a4af788735263f05e/A-Comparative-Study-of-Pipelining-Branch-Prediction-and-Superscalar-Architectures-for-Enhanced-Computer-Performance.pdf',
    note: 'A broader paper that sits much closer to this article’s scope: pipelining, branch prediction, superscalar execution, and the path toward speculation.',
  },
  {
    id: 'parsimony-simd-vector',
    topic: 'coa',
    category: 'SIMD and Vector Execution',
    thumbnailLabel: 'SIMD',
    title: 'Parsimony: Enabling SIMD/Vector Programming in Standard Compiler Flows',
    author: 'Vijay Kandiah et al.',
    year: '2023',
    coverTone: 'coverSlate',
    file: 'https://users.cs.northwestern.edu/~hardav/paragon/papers/2023-CGO-Parsimony-Kandiah.pdf',
    note: 'Modern SIMD/vector paper with a strong compiler angle, useful after the SIMD section of the article.',
  },
  {
    id: 'multicore-memory-hierarchy',
    topic: 'coa',
    category: 'Multicore Memory Behavior',
    thumbnailLabel: 'MC',
    title: 'Performance Aware Shared Memory Hierarchy Model for Multicore Processors',
    author: 'Ahmed M. Mohamed, Nada Mubark, Saad Zagloul',
    year: '2023',
    coverTone: 'coverTeal',
    file: 'https://www.nature.com/articles/s41598-023-34297-3.pdf',
    note: 'Open-access paper on shared memory hierarchy behavior in multicore processors, useful for the multicore and contention discussion.',
  },
];
