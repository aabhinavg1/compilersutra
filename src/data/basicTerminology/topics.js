/**
 * Basic Terminology hub — module + topic catalog.
 * Only include resource URLs that exist. Omit missing keys (do not use "Coming Soon").
 */

const YT_CHANNEL = 'https://www.youtube.com/@compilersutra';
const YT_OVERVIEW = 'https://www.youtube.com/watch?v=e8wzEZm2d1I';
const YT_HOW_COMPUTER = 'https://www.youtube.com/watch?v=vN6C7_5uN9s&t=3s';
const YT_PROGRAM = 'https://youtu.be/iE-3Q98w1Fg';
const PDF_SOURCE = '/ppt/live/sourcetobinary.pdf';
const PDF_INSIDE = '/ppt/live/compiler_inside_part1.pdf';
const PDF_LLVM = '/papers/llvm_intro.pdf';

/** @typedef {{ blog?: string, youtube?: string, pdf?: string, mcq?: string }} Resources */

/**
 * @typedef {object} Topic
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string} description
 * @property {string} moduleId
 * @property {'beginner'} level
 * @property {number=} minutes
 * @property {Resources} resources
 * @property {string[]} related
 * @property {number=} searchDemand 1–5 relative beginner/compiler search interest
 * @property {string[]=} searchQueries example queries people type
 */

/** @type {{ id: string, num: string, title: string, tagline: string, level: string, description: string }[]} */
export const MODULES = [
  {
    id: 'computer-fundamentals',
    num: '01',
    title: 'Computer Fundamentals',
    tagline: 'Understand the machine',
    level: 'Foundation',
    description: 'Hardware, software, and the operating system that sits between them.',
  },
  {
    id: 'programming-fundamentals',
    num: '02',
    title: 'Programming Fundamentals',
    tagline: 'Understand programs and code',
    level: 'Foundation',
    description: 'Programs, source code, languages, compilers, and interpreters.',
  },
  {
    id: 'compilation-execution',
    num: '03',
    title: 'Compilation & Execution',
    tagline: 'Understand how code becomes a running program',
    level: 'Core concepts',
    description: 'Machine code, executables, linking, loading, and what happens at run time.',
  },
  {
    id: 'memory-storage',
    num: '04',
    title: 'Memory & Storage',
    tagline: 'Understand where data lives',
    level: 'Computer architecture',
    description: 'RAM, storage, cache, virtual memory, and the file system.',
  },
  {
    id: 'processing-hardware',
    num: '05',
    title: 'Processing & Hardware',
    tagline: 'Understand the chips that execute work',
    level: 'Computer architecture',
    description: 'CPU, GPU, instructions, and the instruction set architecture.',
  },
  {
    id: 'operating-systems',
    num: '06',
    title: 'Operating Systems & Processes',
    tagline: 'Understand the execution model',
    level: 'Execution model',
    description: 'Processes, threads, system calls, the kernel, and context switching.',
  },
];

/** @type {Topic[]} */
export const TOPICS = [
  // Module 01
  {
    id: 'what-is-a-computer',
    slug: 'what-is-a-computer',
    title: 'What Is a Computer?',
    description: 'A machine that stores data and follows instructions to transform inputs into useful outputs.',
    moduleId: 'computer-fundamentals',
    level: 'beginner',
    searchDemand: 3,
    minutes: 8,
    resources: {
      blog: '/docs/gpu/gpu_programming/how_computer_works/',
      youtube: YT_HOW_COMPUTER,
      pdf: PDF_INSIDE,
    },
    related: ['how-computers-work', 'what-is-hardware', 'what-is-software'],
  },
  {
    id: 'how-computers-work',
    slug: 'how-computers-work',
    title: 'How Do Computers Work?',
    description: 'The loop of fetch, decode, execute — and how hardware, OS, and software cooperate.',
    moduleId: 'computer-fundamentals',
    level: 'beginner',
    searchDemand: 3,
    minutes: 12,
    resources: {
      blog: '/docs/gpu/gpu_programming/how_computer_works/',
      youtube: YT_HOW_COMPUTER,
      pdf: PDF_INSIDE,
    },
    related: ['what-is-a-computer', 'what-is-an-operating-system', 'what-is-a-cpu'],
  },
  {
    id: 'what-is-hardware',
    slug: 'what-is-hardware',
    title: 'What Is Hardware?',
    description: 'The physical parts: CPU, memory, storage, GPU, and the buses that connect them.',
    moduleId: 'computer-fundamentals',
    level: 'beginner',
    searchDemand: 3,
    minutes: 8,
    resources: {
      blog: '/docs/gpu/gpu_programming/how_computer_works/',
      youtube: YT_HOW_COMPUTER,
      pdf: PDF_INSIDE,
    },
    related: ['what-is-software', 'what-is-a-cpu', 'what-is-memory-ram'],
  },
  {
    id: 'what-is-software',
    slug: 'what-is-software',
    title: 'What Is Software?',
    description: 'Programs and data that tell hardware what to do — from apps to the operating system.',
    moduleId: 'computer-fundamentals',
    level: 'beginner',
    searchDemand: 3,
    minutes: 8,
    resources: {
      blog: '/docs/gpu/gpu_programming/how_computer_works/',
      youtube: YT_HOW_COMPUTER,
      pdf: PDF_INSIDE,
    },
    related: ['what-is-hardware', 'what-is-a-computer-program', 'what-is-an-operating-system'],
  },
  {
    id: 'what-is-an-operating-system',
    slug: 'what-is-an-operating-system',
    title: 'What Is an Operating System?',
    description: 'The system software that manages hardware, processes, memory, and files for every program.',
    moduleId: 'computer-fundamentals',
    level: 'beginner',
    searchDemand: 4,
    minutes: 10,
    resources: {
      blog: '/docs/gpu/gpu_programming/how_computer_works/',
      youtube: YT_CHANNEL,
      pdf: PDF_INSIDE,
    },
    related: ['what-is-a-kernel', 'what-is-a-process', 'what-is-a-system-call'],
  },

  // Module 02
  {
    id: 'what-is-a-computer-program',
    slug: 'what-is-a-computer-program',
    title: 'What Is a Computer Program?',
    description: 'A set of instructions that tells a computer what to do — written as source, run as a binary.',
    moduleId: 'programming-fundamentals',
    level: 'beginner',
    searchDemand: 4,
    minutes: 10,
    resources: {
      blog: '/docs/basic-terminology/what-is-a-computer-program/',
      youtube: YT_PROGRAM,
      pdf: PDF_SOURCE,
    },
    related: ['what-is-source-code', 'what-is-a-programming-language', 'what-is-a-compiler'],
  },
  {
    id: 'what-is-source-code',
    slug: 'what-is-source-code',
    title: 'What Is Source Code?',
    description: 'Human-readable text that describes a program in a programming language.',
    moduleId: 'programming-fundamentals',
    level: 'beginner',
    searchDemand: 4,
    minutes: 8,
    resources: {
      blog: '/docs/compilers/sourcecode_to_executable/',
      youtube: YT_CHANNEL,
      pdf: PDF_SOURCE,
    },
    related: ['what-is-a-computer-program', 'what-is-a-programming-language', 'what-is-machine-code'],
  },
  {
    id: 'what-is-a-programming-language',
    slug: 'what-is-a-programming-language',
    title: 'What Is a Programming Language?',
    description: 'A formal notation with grammar and meaning that lets humans write precise instructions for machines.',
    moduleId: 'programming-fundamentals',
    level: 'beginner',
    searchDemand: 4,
    minutes: 8,
    resources: {
      blog: '/docs/compilers/sourcecode_to_executable/',
      youtube: YT_CHANNEL,
      pdf: PDF_SOURCE,
    },
    related: ['what-is-source-code', 'what-is-a-compiler', 'what-is-an-interpreter'],
  },
  {
    id: 'what-is-a-compiler',
    slug: 'what-is-a-compiler',
    title: 'What Is a Compiler?',
    description: 'A program that translates source code into another form — often machine code or an intermediate representation.',
    moduleId: 'programming-fundamentals',
    level: 'beginner',
    searchDemand: 5,
    minutes: 10,
    resources: {
      blog: '/docs/basic-terminology/what-is-a-compiler/',
      youtube: YT_CHANNEL,
      pdf: PDF_SOURCE,
    },
    related: ['what-is-an-interpreter', 'what-is-compilation', 'what-is-machine-code'],
  },
  {
    id: 'what-is-an-interpreter',
    slug: 'what-is-an-interpreter',
    title: 'What Is an Interpreter?',
    description: 'A program that reads source (or bytecode) and executes it directly, without producing a standalone binary first.',
    moduleId: 'programming-fundamentals',
    level: 'beginner',
    searchDemand: 5,
    minutes: 8,
    resources: {
      blog: '/docs/compilers/compiler/',
      youtube: YT_CHANNEL,
      pdf: PDF_SOURCE,
    },
    related: ['what-is-a-compiler', 'what-is-a-programming-language', 'what-happens-when-you-run-a-program'],
  },

  // Module 03
  {
    id: 'what-is-machine-code',
    slug: 'what-is-machine-code',
    title: 'What Is Machine Code?',
    description: 'Binary instructions the CPU can fetch and execute directly — the lowest software layer.',
    moduleId: 'compilation-execution',
    level: 'beginner',
    searchDemand: 4,
    minutes: 8,
    resources: {
      blog: '/docs/compilers/sourcecode_to_executable/',
      youtube: YT_CHANNEL,
      pdf: PDF_SOURCE,
    },
    related: ['what-is-an-instruction', 'what-is-an-executable', 'what-is-compilation'],
  },
  {
    id: 'what-is-an-executable',
    slug: 'what-is-an-executable',
    title: 'What Is an Executable?',
    description: 'A file the OS can load into memory and start running — typically containing machine code plus metadata.',
    moduleId: 'compilation-execution',
    level: 'beginner',
    searchDemand: 4,
    minutes: 8,
    resources: {
      blog: '/docs/compilers/sourcecode_to_executable/',
      youtube: YT_CHANNEL,
      pdf: PDF_SOURCE,
    },
    related: ['what-is-a-linker', 'what-is-a-loader', 'what-happens-when-you-run-a-program'],
  },
  {
    id: 'what-is-compilation',
    slug: 'what-is-compilation',
    title: 'What Is Compilation?',
    description: 'The pipeline that turns source into object code or an executable — preprocess, compile, assemble, link.',
    moduleId: 'compilation-execution',
    level: 'beginner',
    searchDemand: 4,
    minutes: 10,
    resources: {
      blog: '/docs/compilers/sourcecode_to_executable/',
      youtube: YT_CHANNEL,
      pdf: PDF_SOURCE,
    },
    related: ['what-is-a-compiler', 'what-is-a-linker', 'what-is-machine-code'],
  },
  {
    id: 'what-happens-when-you-run-a-program',
    slug: 'what-happens-when-you-run-a-program',
    title: 'What Happens When You Run a Program?',
    description: 'From shell to loader to _start to main — how an executable becomes a live process.',
    moduleId: 'compilation-execution',
    level: 'beginner',
    searchDemand: 4,
    minutes: 12,
    resources: {
      blog: '/docs/linux/how_program_runs_from_elf_to_main/',
      youtube: YT_CHANNEL,
      pdf: PDF_INSIDE,
    },
    related: ['what-is-a-loader', 'what-is-a-process', 'what-is-an-executable'],
  },
  {
    id: 'what-is-a-linker',
    slug: 'what-is-a-linker',
    title: 'What Is a Linker?',
    description: 'The tool that combines object files and libraries into one executable or shared library.',
    moduleId: 'compilation-execution',
    level: 'beginner',
    searchDemand: 5,
    minutes: 8,
    resources: {
      blog: '/docs/compilers/sourcecode_to_executable/',
      youtube: YT_CHANNEL,
      pdf: PDF_SOURCE,
    },
    related: ['what-is-compilation', 'what-is-an-executable', 'what-is-a-loader'],
  },
  {
    id: 'what-is-a-loader',
    slug: 'what-is-a-loader',
    title: 'What Is a Loader?',
    description: 'The OS component that maps an executable into memory and prepares it to run.',
    moduleId: 'compilation-execution',
    level: 'beginner',
    searchDemand: 3,
    minutes: 8,
    resources: {
      blog: '/docs/linux/how_program_runs_from_elf_to_main/',
      youtube: YT_CHANNEL,
      pdf: PDF_INSIDE,
    },
    related: ['what-happens-when-you-run-a-program', 'what-is-a-process', 'what-is-an-executable'],
  },


  {
    id: 'what-is-an-ast',
    slug: 'what-is-an-ast',
    title: 'What Is an AST?',
    description: 'An abstract syntax tree — the structured tree the compiler builds from your source after parsing.',
    moduleId: 'compilation-execution',
    level: 'beginner',
    searchDemand: 5,
    searchQueries: ['what is an AST', 'abstract syntax tree compiler', 'AST vs parse tree'],
    minutes: 10,
    resources: {
      blog: '/docs/basic-terminology/what-is-an-ast/',
      youtube: YT_CHANNEL,
      pdf: PDF_SOURCE,
    },
    related: ['what-is-a-parser', 'what-is-ir', 'what-is-a-compiler'],
  },
  {
    id: 'what-is-ir',
    slug: 'what-is-ir',
    title: 'What Is Intermediate Representation (IR)?',
    description: 'The compiler’s internal program form between source and machine code — where most optimization happens.',
    moduleId: 'compilation-execution',
    level: 'beginner',
    searchDemand: 5,
    searchQueries: ['what is IR compiler', 'intermediate representation', 'what is LLVM IR'],
    minutes: 10,
    resources: {
      blog: '/docs/basic-terminology/what-is-ir/',
      youtube: YT_CHANNEL,
      pdf: PDF_LLVM,
    },
    related: ['what-is-an-ast', 'what-is-a-compiler', 'what-is-machine-code'],
  },
  {
    id: 'what-is-an-object-file',
    slug: 'what-is-an-object-file',
    title: 'What Is an Object File?',
    description: 'A compiled translation unit (.o / .obj) with machine code and symbols — not yet a finished executable.',
    moduleId: 'compilation-execution',
    level: 'beginner',
    searchDemand: 4,
    searchQueries: ['what is an object file', 'what is a .o file', 'object file vs executable'],
    minutes: 8,
    resources: {
      blog: '/docs/compilers/sourcecode_to_executable/',
      youtube: YT_CHANNEL,
      pdf: PDF_SOURCE,
    },
    related: ['what-is-a-linker', 'what-is-an-executable', 'what-is-compilation'],
  },
  {
    id: 'what-is-an-assembler',
    slug: 'what-is-an-assembler',
    title: 'What Is an Assembler?',
    description: 'The tool that turns assembly text into machine-code object files — one assembly instruction maps closely to CPU ops.',
    moduleId: 'compilation-execution',
    level: 'beginner',
    searchDemand: 4,
    searchQueries: ['what is an assembler', 'assembler vs compiler', 'assembly language'],
    minutes: 8,
    resources: {
      blog: '/docs/compilers/sourcecode_to_executable/',
      youtube: YT_CHANNEL,
      pdf: PDF_SOURCE,
    },
    related: ['what-is-machine-code', 'what-is-an-object-file', 'what-is-a-compiler'],
  },
  {
    id: 'what-is-a-lexer',
    slug: 'what-is-a-lexer',
    title: 'What Is a Lexer?',
    description: 'Lexical analysis — splitting source characters into tokens (keywords, names, numbers, operators).',
    moduleId: 'compilation-execution',
    level: 'beginner',
    searchDemand: 4,
    searchQueries: ['what is a lexer', 'lexical analysis compiler', 'tokenizer vs lexer'],
    minutes: 8,
    resources: {
      blog: '/docs/compilers/front_end/role_of_lexer/',
      youtube: YT_CHANNEL,
      pdf: PDF_INSIDE,
    },
    related: ['what-is-a-parser', 'what-is-an-ast', 'what-is-source-code'],
  },
  {
    id: 'what-is-a-parser',
    slug: 'what-is-a-parser',
    title: 'What Is a Parser?',
    description: 'Syntax analysis — checking token order against the grammar and building a tree (often an AST).',
    moduleId: 'compilation-execution',
    level: 'beginner',
    searchDemand: 4,
    searchQueries: ['what is a parser', 'parser compiler', 'syntax analysis'],
    minutes: 8,
    resources: {
      blog: '/docs/compilers/front_end/role_of_parser/',
      youtube: YT_CHANNEL,
      pdf: PDF_INSIDE,
    },
    related: ['what-is-a-lexer', 'what-is-an-ast', 'what-is-a-compiler'],
  },
  {
    id: 'what-is-abi',
    slug: 'what-is-abi',
    title: 'What Is an ABI?',
    description: 'Application Binary Interface — calling conventions, register use, and binary layout rules for interoperability.',
    moduleId: 'compilation-execution',
    level: 'beginner',
    searchDemand: 4,
    searchQueries: ['what is ABI', 'application binary interface', 'calling convention'],
    minutes: 10,
    resources: {
      blog: '/docs/compilers/sourcecode_to_executable/',
      youtube: YT_CHANNEL,
      pdf: PDF_SOURCE,
    },
    related: ['what-is-a-linker', 'what-is-an-isa', 'what-is-machine-code'],
  },
  {
    id: 'what-is-undefined-behavior',
    slug: 'what-is-undefined-behavior',
    title: 'What Is Undefined Behavior?',
    description: 'Operations the language standard does not define — optimizers may assume they never happen.',
    moduleId: 'programming-fundamentals',
    level: 'beginner',
    searchDemand: 5,
    searchQueries: ['what is undefined behavior', 'undefined behaviour C', 'UB compiler'],
    minutes: 10,
    resources: {
      blog: '/docs/compilers/compiler/',
      youtube: YT_CHANNEL,
      pdf: PDF_SOURCE,
    },
    related: ['what-is-a-compiler', 'what-is-a-programming-language', 'what-is-source-code'],
  },
  {
    id: 'what-is-bytecode',
    slug: 'what-is-bytecode',
    title: 'What Is Bytecode?',
    description: 'A portable intermediate instruction stream (e.g. JVM / some VMs) executed or JIT-compiled by a runtime.',
    moduleId: 'compilation-execution',
    level: 'beginner',
    searchDemand: 4,
    searchQueries: ['what is bytecode', 'bytecode vs machine code', 'Java bytecode'],
    minutes: 8,
    resources: {
      blog: '/docs/compilers/ir_in_compiler/',
      youtube: YT_CHANNEL,
      pdf: PDF_LLVM,
    },
    related: ['what-is-ir', 'what-is-jit', 'what-is-an-interpreter'],
  },
  {
    id: 'what-is-jit',
    slug: 'what-is-jit',
    title: 'What Is a JIT Compiler?',
    description: 'Just-in-time compilation — translating hot code to machine code while the program is already running.',
    moduleId: 'compilation-execution',
    level: 'beginner',
    searchDemand: 4,
    searchQueries: ['what is JIT', 'JIT compiler', 'just in time compilation'],
    minutes: 8,
    resources: {
      blog: '/docs/compilers/clang-vs-gcc-vs-llvm/',
      youtube: YT_CHANNEL,
      pdf: PDF_LLVM,
    },
    related: ['what-is-bytecode', 'what-is-a-compiler', 'what-is-an-interpreter'],
  },
  {
    id: 'what-is-llvm',
    slug: 'what-is-llvm',
    title: 'What Is LLVM?',
    description: 'Compiler infrastructure (IR, passes, backends) — Clang is a frontend that targets LLVM, not “the LLVM language.”',
    moduleId: 'programming-fundamentals',
    level: 'beginner',
    searchDemand: 5,
    searchQueries: ['what is LLVM', 'LLVM vs Clang', 'LLVM IR'],
    minutes: 10,
    resources: {
      blog: '/docs/compilers/clang-vs-gcc-vs-llvm/',
      youtube: YT_CHANNEL,
      pdf: PDF_LLVM,
    },
    related: ['what-is-a-compiler', 'what-is-ir', 'what-is-machine-code'],
  },

  // Module 04
  {
    id: 'what-is-memory-ram',
    slug: 'what-is-memory-ram',
    title: 'What Is Memory (RAM)?',
    description: 'Fast, temporary working storage the CPU uses while a program is running.',
    moduleId: 'memory-storage',
    level: 'beginner',
    searchDemand: 4,
    minutes: 8,
    resources: {
      blog: '/docs/coa/basic_terminology_in_coa/',
      youtube: YT_CHANNEL,
      pdf: PDF_LLVM,
      mcq: '/docs/mcq/questions/domain/coa/basic-terminology/',
    },
    related: ['what-is-cache', 'what-is-storage', 'what-is-virtual-memory'],
  },
  {
    id: 'what-is-storage',
    slug: 'what-is-storage',
    title: 'What Is Storage?',
    description: 'Persistent places for data — disks and SSDs that keep files after power-off.',
    moduleId: 'memory-storage',
    level: 'beginner',
    searchDemand: 2,
    minutes: 8,
    resources: {
      blog: '/docs/coa/basic_terminology_in_coa/',
      youtube: YT_CHANNEL,
      pdf: PDF_LLVM,
    },
    related: ['what-is-memory-ram', 'what-is-a-file-system', 'what-is-virtual-memory'],
  },
  {
    id: 'what-is-cache',
    slug: 'what-is-cache',
    title: 'What Is Cache?',
    description: 'Small, fast memory near the CPU that holds recently used data to avoid slow RAM trips.',
    moduleId: 'memory-storage',
    level: 'beginner',
    searchDemand: 4,
    minutes: 10,
    resources: {
      blog: '/docs/coa/memory-hierarchy/',
      youtube: YT_CHANNEL,
      pdf: PDF_LLVM,
    },
    related: ['what-is-memory-ram', 'what-is-a-cpu', 'what-is-virtual-memory'],
  },
  {
    id: 'what-is-virtual-memory',
    slug: 'what-is-virtual-memory',
    title: 'What Is Virtual Memory?',
    description: 'An OS abstraction that gives each process its own address space, backed by RAM and disk.',
    moduleId: 'memory-storage',
    level: 'beginner',
    searchDemand: 4,
    minutes: 10,
    resources: {
      blog: '/docs/coa/memory-hierarchy/',
      youtube: YT_CHANNEL,
      pdf: PDF_LLVM,
    },
    related: ['what-is-memory-ram', 'what-is-a-process', 'what-is-a-file-system'],
  },
  {
    id: 'what-is-a-file-system',
    slug: 'what-is-a-file-system',
    title: 'What Is a File System?',
    description: 'The OS structure that organizes files and directories on storage so programs can find data.',
    moduleId: 'memory-storage',
    level: 'beginner',
    searchDemand: 3,
    minutes: 8,
    resources: {
      blog: '/docs/linux/how_program_runs_from_elf_to_main/',
      youtube: YT_CHANNEL,
    },
    related: ['what-is-storage', 'what-is-an-operating-system', 'what-is-an-executable'],
  },

  // Module 05
  {
    id: 'what-is-a-cpu',
    slug: 'what-is-a-cpu',
    title: 'What Is a CPU?',
    description: 'The central processor that fetches instructions and performs the general work of a computer.',
    moduleId: 'processing-hardware',
    level: 'beginner',
    searchDemand: 4,
    minutes: 8,
    resources: {
      blog: '/docs/coa/basic_terminology_in_coa/',
      youtube: YT_CHANNEL,
      pdf: PDF_LLVM,
      mcq: '/docs/mcq/questions/domain/coa/basic-terminology/',
    },
    related: ['what-is-a-gpu', 'cpu-vs-gpu', 'what-is-an-instruction'],
  },
  {
    id: 'what-is-a-gpu',
    slug: 'what-is-a-gpu',
    title: 'What Is a GPU?',
    description: 'A processor built for massive data-parallel work — graphics first, now also compute and AI.',
    moduleId: 'processing-hardware',
    level: 'beginner',
    searchDemand: 4,
    minutes: 10,
    resources: {
      blog: '/docs/gpu/what_is_gpu/',
      youtube: YT_CHANNEL,
      pdf: PDF_LLVM,
    },
    related: ['cpu-vs-gpu', 'what-is-a-cpu', 'what-is-an-instruction'],
  },
  {
    id: 'cpu-vs-gpu',
    slug: 'cpu-vs-gpu',
    title: 'CPU vs GPU',
    description: 'Latency-oriented cores versus throughput-oriented cores — when each wins.',
    moduleId: 'processing-hardware',
    level: 'beginner',
    searchDemand: 4,
    minutes: 10,
    resources: {
      blog: '/docs/gpu/CPU_Vs_GPU/',
      youtube: YT_CHANNEL,
      pdf: PDF_LLVM,
    },
    related: ['what-is-a-cpu', 'what-is-a-gpu', 'what-is-an-isa'],
  },
  {
    id: 'what-is-an-instruction',
    slug: 'what-is-an-instruction',
    title: 'What Is an Instruction?',
    description: 'A single operation the processor understands — add, load, branch, and the rest of the ISA.',
    moduleId: 'processing-hardware',
    level: 'beginner',
    searchDemand: 3,
    minutes: 8,
    resources: {
      blog: '/docs/coa/cpu_execution/',
      youtube: YT_CHANNEL,
      pdf: PDF_LLVM,
    },
    related: ['what-is-machine-code', 'what-is-an-isa', 'what-is-a-cpu'],
  },
  {
    id: 'what-is-an-isa',
    slug: 'what-is-an-isa',
    title: 'What Is an Instruction Set Architecture?',
    description: 'The contract between software and hardware: which instructions exist and what they mean.',
    moduleId: 'processing-hardware',
    level: 'beginner',
    searchDemand: 4,
    minutes: 12,
    resources: {
      blog: '/docs/coa/what-is-an-isa/',
      youtube: YT_CHANNEL,
      pdf: PDF_LLVM,
    },
    related: ['what-is-an-instruction', 'what-is-machine-code', 'what-is-a-compiler'],
  },

  // Module 06
  {
    id: 'what-is-a-process',
    slug: 'what-is-a-process',
    title: 'What Is a Process?',
    description: 'A running instance of a program with its own address space, resources, and scheduling state.',
    moduleId: 'operating-systems',
    level: 'beginner',
    searchDemand: 4,
    minutes: 10,
    resources: {
      blog: '/docs/parallel-computing/fundamentals/program-process-thread-core/',
      youtube: YT_CHANNEL,
      pdf: PDF_INSIDE,
    },
    related: ['what-is-a-thread', 'what-is-a-computer-program', 'what-is-context-switching'],
  },
  {
    id: 'what-is-a-thread',
    slug: 'what-is-a-thread',
    title: 'What Is a Thread?',
    description: 'An execution path inside a process. Threads in one process share the same address space.',
    moduleId: 'operating-systems',
    level: 'beginner',
    searchDemand: 4,
    minutes: 10,
    resources: {
      blog: '/docs/parallel-computing/fundamentals/program-process-thread-core/',
      youtube: YT_CHANNEL,
      pdf: PDF_INSIDE,
    },
    related: ['what-is-a-process', 'what-is-context-switching', 'what-is-a-cpu'],
  },
  {
    id: 'what-is-a-system-call',
    slug: 'what-is-a-system-call',
    title: 'What Is a System Call?',
    description: 'The controlled way a program asks the kernel for services like I/O, memory, and process control.',
    moduleId: 'operating-systems',
    level: 'beginner',
    searchDemand: 3,
    minutes: 8,
    resources: {
      blog: '/docs/gpu/gpu_programming/how_computer_works/',
      youtube: YT_CHANNEL,
      pdf: PDF_INSIDE,
    },
    related: ['what-is-a-kernel', 'what-is-an-operating-system', 'what-happens-when-you-run-a-program'],
  },
  {
    id: 'what-is-a-kernel',
    slug: 'what-is-a-kernel',
    title: 'What Is a Kernel?',
    description: 'The core of the OS that runs with privileged access to hardware and mediates all system services.',
    moduleId: 'operating-systems',
    level: 'beginner',
    searchDemand: 3,
    minutes: 8,
    resources: {
      blog: '/docs/gpu/gpu_programming/how_computer_works/',
      youtube: YT_CHANNEL,
      pdf: PDF_INSIDE,
    },
    related: ['what-is-an-operating-system', 'what-is-a-system-call', 'what-is-a-process'],
  },
  {
    id: 'what-is-context-switching',
    slug: 'what-is-context-switching',
    title: 'What Is Context Switching?',
    description: 'Saving one thread’s CPU state and loading another so many tasks can share the same cores.',
    moduleId: 'operating-systems',
    level: 'beginner',
    searchDemand: 3,
    minutes: 8,
    resources: {
      blog: '/docs/parallel-computing/fundamentals/program-process-thread-core/',
      youtube: YT_CHANNEL,
      pdf: PDF_INSIDE,
    },
    related: ['what-is-a-thread', 'what-is-a-process', 'what-is-a-cpu'],
  },
];

export const LEARNING_PATH = [
  {
    step: 1,
    title: 'Understand the computer',
    detail: 'Hardware → Software → Operating System',
    moduleId: 'computer-fundamentals',
  },
  {
    step: 2,
    title: 'Understand programming',
    detail: 'Program → Source Code → Programming Language',
    moduleId: 'programming-fundamentals',
  },
  {
    step: 3,
    title: 'Understand compilation',
    detail: 'Compiler → Intermediate Representation → Machine Code',
    moduleId: 'compilation-execution',
  },
  {
    step: 4,
    title: 'Understand execution',
    detail: 'Executable → Loader → Process → Thread',
    moduleId: 'operating-systems',
  },
  {
    step: 5,
    title: 'Understand the hardware',
    detail: 'CPU → Memory → Cache → GPU → ISA',
    moduleId: 'processing-hardware',
  },
];

export const HUB_META = {
  title: 'Basic Terminology',
  subtitle: 'Understand computers from the ground up.',
  blurb:
    'Learn how computers work, how programs are created, how they execute, and how hardware and software interact.',
  level: 'Beginner',
  overviewVideo: YT_OVERVIEW,
  overviewPdf: PDF_SOURCE,
  overviewBlog: '/docs/basic-terminology/overview/',
};

export function getModuleById(id) {
  return MODULES.find((m) => m.id === id);
}

export function getTopicById(id) {
  return TOPICS.find((t) => t.id === id);
}

export function topicsForModule(moduleId) {
  return TOPICS.filter((t) => t.moduleId === moduleId);
}

export function topicCount() {
  return TOPICS.length;
}
