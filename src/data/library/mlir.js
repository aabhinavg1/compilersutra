export const mlirTopic = {
  id: 'mlir',
  title: 'MLIR',
  description: 'Multi-level IR papers and material for modern compiler pipelines.',
  coverTone: 'coverTeal',
  coverImage: '/img/og/mlir.png',
  articleCategory: 'Multi-Level IR',
  articleDescription:
    'A focused entry point into MLIR for readers who need structured IR stacks, dialects, and progressive lowering across compiler stages.',
  relatedTopicIds: ['llvm', 'machine-learning'],
  sections: [
    {
      id: 'dialect-idea',
      title: 'The dialect idea',
      paragraphs: [
        'MLIR becomes easier once you stop viewing it as a single IR and start viewing it as a framework for connecting multiple levels of abstraction.',
        'Dialects let you preserve the right amount of structure for longer, which improves both optimization opportunities and system design clarity.',
      ],
      code: {
        language: 'mlir',
        snippet: `%0 = arith.addi %arg0, %arg1 : i32\nreturn %0 : i32`,
      },
    },
    {
      id: 'lowering-strategy',
      title: 'Lowering strategy',
      paragraphs: [
        'The real payoff comes from staged lowering. High-level information is retained when it is useful, then progressively converted into lower-level forms.',
        'That strategy is especially valuable in heterogeneous systems and domain-specific compiler pipelines.',
      ],
    },
    {
      id: 'library-collection',
      title: 'Library collection',
      paragraphs: [
        'This shelf keeps the core MLIR paper accessible as a reference point for modern compiler pipeline design.',
      ],
    },
  ],
  conclusion:
    'Use MLIR after you are comfortable with LLVM IR and want a better abstraction strategy for larger compiler systems.',
};

export const mlirPapers = [
  {
    id: 'tpu-mlir',
    topic: 'mlir',
    category: 'Real Systems',
    thumbnailLabel: 'SYS',
    title: 'TPU-MLIR',
    author: 'Sophgo',
    year: '2026',
    coverTone: 'coverCopper',
    file: 'https://github.com/sophgo/tpu-mlir',
    note: 'A production-oriented MLIR-based ML compiler toolchain that makes lowering, quantization, and hardware deployment concrete.',
  },
  {
    id: 'mlir-paper',
    topic: 'mlir',
    category: 'Core Papers',
    thumbnailLabel: 'PDF',
    title: 'MLIR: A Compiler Infrastructure for the End of Moore’s Law',
    author: 'Chris Lattner et al.',
    year: '2020',
    coverTone: 'coverTeal',
    file: 'https://arxiv.org/pdf/2002.11054',
    note: 'MLIR research paper hosted on arXiv.',
  },
  {
    id: 'mlir-ijsra-review',
    topic: 'mlir',
    category: 'Reviews',
    thumbnailLabel: 'PDF',
    title: 'Enhancing Compiler Design for Machine Learning Workflows with MLIR',
    author: 'IJSRA',
    year: '2025',
    coverTone: 'coverSlate',
    file: 'https://ijsra.net/sites/default/files/fulltext_pdf/IJSRA-2025-2463.pdf',
    note: 'A lightweight review that summarizes why MLIR matters for heterogeneous machine learning workflows.',
  },
];
