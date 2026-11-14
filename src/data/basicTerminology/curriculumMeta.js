/**
 * Learning-track metadata for Basic Terminology.
 * Prerequisites are recommendations (not hard locks).
 * Labs use verified, reproducible commands only.
 */

/** Ordered compiler/runtime story shown on the hub. */
export const CONCEPT_PIPELINE = [
  { id: 'what-is-a-computer-program', label: 'Program' },
  { id: 'what-is-source-code', label: 'Source' },
  { id: 'what-is-a-programming-language', label: 'Language' },
  { id: 'what-is-a-compiler', label: 'Compiler' },
  { id: 'what-is-a-lexer', label: 'Lexer' },
  { id: 'what-is-a-parser', label: 'Parser' },
  { id: 'what-is-an-ast', label: 'AST' },
  { id: 'what-is-ir', label: 'IR' },
  { id: 'what-is-machine-code', label: 'Machine code' },
  { id: 'what-is-a-linker', label: 'Linker' },
  { id: 'what-is-a-loader', label: 'Loader' },
  { id: 'what-is-a-process', label: 'Process' },
];

/** Curated starter concepts (not analytics-backed popularity). */
export const RECOMMENDED_TOPIC_IDS = [
  'what-is-a-computer',
  'what-is-a-computer-program',
  'what-is-source-code',
  'what-is-a-compiler',
  'what-is-an-ast',
  'what-is-ir',
  'what-is-llvm',
  'what-is-memory-ram',
  'what-is-a-cpu',
  'what-is-a-process',
];

/**
 * Per-module learning objective + practical lab summary.
 * @type {Record<string, { objective: string, labSummary: string, labCommands: string[] }>}
 */
export const MODULE_CURRICULUM = {
  'computer-fundamentals': {
    objective:
      'Explain what a computer is, how hardware and software cooperate, and why binary representation matters.',
    labSummary: 'Convert a small decimal value to binary and inspect your machine with free/lscpu.',
    labCommands: ['printf "%d → " 13; echo "obase=2; 13" | bc', 'lscpu | head -n 20', 'free -h'],
  },
  'programming-fundamentals': {
    objective:
      'Describe a program, source code, and languages — and distinguish compilers from interpreters.',
    labSummary: 'Write and run a tiny C program with Clang.',
    labCommands: [
      'printf \'#include <stdio.h>\\nint main(void){puts("hello");}\\n\' > hello.c',
      'clang hello.c -o hello && ./hello',
    ],
  },
  'compilation-execution': {
    objective:
      'Trace source code through frontend stages, IR, object files, linking, loading, and process start.',
    labSummary: 'Compile with Clang, emit AST and LLVM IR, then inspect the binary.',
    labCommands: [
      'clang -Xclang -ast-dump -fsyntax-only hello.c | head',
      'clang -S -emit-llvm hello.c -o hello.ll && head hello.ll',
      'clang -c hello.c -o hello.o && file hello.o hello',
    ],
  },
  'memory-storage': {
    objective:
      'Explain where program data lives: RAM, cache, virtual memory, storage, and the file system.',
    labSummary: 'Inspect system memory and process address-space clues.',
    labCommands: ['free -h', 'cat /proc/self/maps | head'],
  },
  'processing-hardware': {
    objective:
      'Describe CPU vs GPU roles, instructions, and ISA — enough to read architecture docs.',
    labSummary: 'Explore CPU identity and instruction-set features on Linux.',
    labCommands: ['lscpu', 'grep -m1 "^model name" /proc/cpuinfo'],
  },
  'operating-systems': {
    objective:
      'Connect processes, threads, system calls, the kernel, and context switching to real program execution.',
    labSummary: 'Inspect processes and a live process status file.',
    labCommands: ['ps aux | head', 'cat /proc/self/status | head'],
  },
};

/**
 * @typedef {{
 *   prerequisites?: string[],
 *   learnings?: string[],
 *   outcome?: string,
 *   lab?: { title: string, commands: string[] },
 *   recommended?: boolean,
 * }} TopicCurriculum
 */

/** @type {Record<string, TopicCurriculum>} */
export const TOPIC_CURRICULUM = {
  'what-is-a-computer': {
    prerequisites: [],
    learnings: [
      'What a computer does with data and instructions',
      'Why hardware and software are both required',
      'Where the OS fits between apps and the machine',
    ],
    outcome: 'Explain a computer as a programmable instruction-following machine.',
    lab: {
      title: 'Identify the machine you are on',
      commands: ['uname -a', 'lscpu | head -n 12'],
    },
    recommended: true,
  },
  'how-computers-work': {
    prerequisites: ['what-is-a-computer'],
    learnings: [
      'Fetch–decode–execute at a high level',
      'How hardware, OS, and programs cooperate',
      'Why “running a program” is a pipeline of layers',
    ],
    outcome: 'Describe the cooperation loop from code to CPU work.',
    lab: {
      title: 'See CPU and memory at a glance',
      commands: ['lscpu | head -n 15', 'free -h'],
    },
  },
  'what-is-hardware': {
    prerequisites: ['what-is-a-computer'],
    learnings: ['Physical components that store and execute', 'CPU, memory, storage roles'],
    outcome: 'Name the main hardware layers a program depends on.',
  },
  'what-is-software': {
    prerequisites: ['what-is-a-computer'],
    learnings: ['Software as instructions and data', 'Programs vs operating system software'],
    outcome: 'Distinguish software layers that sit on hardware.',
  },
  'what-is-an-operating-system': {
    prerequisites: ['what-is-hardware', 'what-is-software'],
    learnings: ['Why programs need an OS', 'Resources the OS manages', 'User programs vs kernel'],
    outcome: 'Explain the OS as the mediator between programs and hardware.',
  },
  'what-is-a-computer-program': {
    prerequisites: ['what-is-a-computer'],
    learnings: [
      'A program as a sequence of instructions',
      'Source vs running instance',
      'Why compilers and loaders exist',
    ],
    outcome: 'Define a program and separate “source” from “running process”.',
    lab: {
      title: 'Compile and run a one-liner C program',
      commands: [
        'printf \'#include <stdio.h>\\nint main(void){puts("hi");}\\n\' > hi.c',
        'clang hi.c -o hi && ./hi',
      ],
    },
    recommended: true,
  },
  'what-is-source-code': {
    prerequisites: ['what-is-a-computer-program'],
    learnings: ['Human-readable program text', 'Why machines need translation', 'Files vs running images'],
    outcome: 'Explain what source code is and why it must be compiled or interpreted.',
    recommended: true,
  },
  'what-is-a-programming-language': {
    prerequisites: ['what-is-source-code'],
    learnings: ['Syntax and semantics at a glance', 'Why languages need compilers/interpreters'],
    outcome: 'Describe a programming language as rules for writing programs.',
  },
  'what-is-a-compiler': {
    prerequisites: ['what-is-source-code', 'what-is-a-programming-language'],
    learnings: [
      'Why compilers exist',
      'Frontend / optimizer / backend roles',
      'Source → IR or machine code',
    ],
    outcome: 'Explain the major stages of compilation and what each produces.',
    lab: {
      title: 'Compile C and emit LLVM IR',
      commands: [
        'printf \'int add(int a,int b){return a+b;}\\n\' > add.c',
        'clang -S -emit-llvm add.c -o add.ll && head -n 20 add.ll',
      ],
    },
    recommended: true,
  },
  'what-is-an-interpreter': {
    prerequisites: ['what-is-a-programming-language'],
    learnings: ['Execute without a separate binary image', 'Trade-offs vs ahead-of-time compilation'],
    outcome: 'Contrast interpreters with compilers.',
  },
  'what-is-machine-code': {
    prerequisites: ['what-is-a-compiler'],
    learnings: ['CPU-executable instructions', 'Why IR is not machine code'],
    outcome: 'Say what machine code is and where it sits after compilation.',
  },
  'what-is-an-executable': {
    prerequisites: ['what-is-machine-code', 'what-is-a-linker'],
    learnings: ['Linked program image', 'What the OS loader expects'],
    outcome: 'Describe an executable as a loadable program image.',
    lab: {
      title: 'Inspect a linked binary',
      commands: ['clang -O0 hi.c -o hi && file hi'],
    },
  },
  'what-is-compilation': {
    prerequisites: ['what-is-a-compiler'],
    learnings: ['Compilation as a multi-stage pipeline', 'Artifacts along the way'],
    outcome: 'Outline compilation from source to linkable objects.',
  },
  'what-happens-when-you-run-a-program': {
    prerequisites: ['what-is-an-executable', 'what-is-a-loader'],
    learnings: ['Loader → process creation', 'Memory map and entry point', 'OS involvement at start'],
    outcome: 'Narrate what happens from typing ./prog to first instruction.',
  },
  'what-is-a-linker': {
    prerequisites: ['what-is-an-object-file'],
    learnings: ['Combining object files', 'Symbols and relocation at a glance'],
    outcome: 'Explain why linking is needed after compilation.',
  },
  'what-is-a-loader': {
    prerequisites: ['what-is-an-executable', 'what-is-an-operating-system'],
    learnings: ['Mapping an executable into memory', 'Preparing a process to run'],
    outcome: 'Describe the loader’s job at program start.',
  },
  'what-is-an-ast': {
    prerequisites: ['what-is-a-parser', 'what-is-source-code'],
    learnings: [
      'Tree shape of program structure',
      'Why compilers prefer trees over raw text',
      'How to dump Clang’s AST',
    ],
    outcome: 'Explain what an AST is and dump one with Clang.',
    lab: {
      title: 'Dump a Clang AST',
      commands: [
        'printf \'int f(int x){return x+1;}\\n\' > f.c',
        'clang -Xclang -ast-dump -fsyntax-only f.c | head -n 40',
      ],
    },
    recommended: true,
  },
  'what-is-ir': {
    prerequisites: ['what-is-a-compiler', 'what-is-an-ast'],
    learnings: [
      'Why compilers use intermediate representations',
      'LLVM IR as a portable IR example',
      'AST vs IR responsibilities',
    ],
    outcome: 'Explain IR’s role between frontend and codegen.',
    lab: {
      title: 'Emit LLVM IR with Clang',
      commands: ['clang -S -emit-llvm f.c -o f.ll && head -n 30 f.ll'],
    },
    recommended: true,
  },
  'what-is-an-object-file': {
    prerequisites: ['what-is-compilation', 'what-is-machine-code'],
    learnings: ['Compiled but not fully linked units', 'Symbols still unresolved'],
    outcome: 'Distinguish object files from final executables.',
    lab: {
      title: 'Build an object file',
      commands: ['clang -c f.c -o f.o && file f.o'],
    },
  },
  'what-is-an-assembler': {
    prerequisites: ['what-is-machine-code', 'what-is-an-instruction'],
    learnings: ['Assembly text ↔ machine encoding', 'Assembler vs compiler'],
    outcome: 'Explain the assembler’s place after or beside compilation.',
  },
  'what-is-a-lexer': {
    prerequisites: ['what-is-source-code', 'what-is-a-compiler'],
    learnings: ['Tokens from characters', 'Why lexing comes before parsing'],
    outcome: 'Describe lexing as the first frontend stage.',
  },
  'what-is-a-parser': {
    prerequisites: ['what-is-a-lexer'],
    learnings: ['Grammar-driven structure', 'Parser output feeds the AST'],
    outcome: 'Explain parsing as turning tokens into structure.',
  },
  'what-is-abi': {
    prerequisites: ['what-is-an-executable', 'what-is-a-linker'],
    learnings: ['Calling conventions and binary interfaces', 'Why ABIs matter across languages'],
    outcome: 'State what an ABI governs between compiled units.',
  },
  'what-is-undefined-behavior': {
    prerequisites: ['what-is-a-programming-language', 'what-is-a-compiler'],
    learnings: ['What “undefined” means in language rules', 'Why optimizers exploit UB'],
    outcome: 'Explain undefined behavior without confusing it with a crash.',
  },
  'what-is-bytecode': {
    prerequisites: ['what-is-ir', 'what-is-an-interpreter'],
    learnings: ['Portable instruction streams', 'VM execution model'],
    outcome: 'Relate bytecode to IR and interpreters/VMs.',
  },
  'what-is-jit': {
    prerequisites: ['what-is-bytecode', 'what-is-a-compiler'],
    learnings: ['Compile during execution', 'When JIT helps performance'],
    outcome: 'Describe JIT compilation at a conceptual level.',
  },
  'what-is-llvm': {
    prerequisites: ['what-is-ir', 'what-is-a-compiler'],
    learnings: ['LLVM as a compiler infrastructure', 'Clang + LLVM IR relationship'],
    outcome: 'Place LLVM in the modern compiler toolchain.',
    recommended: true,
  },
  'what-is-memory-ram': {
    prerequisites: ['what-is-hardware'],
    learnings: ['Volatile working memory', 'Why programs need addressable RAM'],
    outcome: 'Explain RAM’s role during program execution.',
    lab: {
      title: 'Check available memory',
      commands: ['free -h'],
    },
    recommended: true,
  },
  'what-is-storage': {
    prerequisites: ['what-is-memory-ram'],
    learnings: ['Persistent storage vs RAM', 'Files and durability'],
    outcome: 'Contrast storage with main memory.',
  },
  'what-is-cache': {
    prerequisites: ['what-is-memory-ram', 'what-is-a-cpu'],
    learnings: ['Why caches exist', 'Locality of reference'],
    outcome: 'Explain cache as a speed layer between CPU and RAM.',
  },
  'what-is-virtual-memory': {
    prerequisites: ['what-is-memory-ram', 'what-is-a-process'],
    learnings: ['Per-process address spaces', 'Why virtual addresses exist'],
    outcome: 'Describe virtual memory as the process view of memory.',
    lab: {
      title: 'Peek at a process map',
      commands: ['head -n 15 /proc/self/maps'],
    },
  },
  'what-is-a-file-system': {
    prerequisites: ['what-is-storage', 'what-is-an-operating-system'],
    learnings: ['Organizing persistent data', 'Paths, files, directories'],
    outcome: 'Explain the file system as the OS’s storage interface.',
  },
  'what-is-a-cpu': {
    prerequisites: ['what-is-hardware'],
    learnings: ['Instruction execution engine', 'Cores and general-purpose compute'],
    outcome: 'Describe what the CPU does for a running program.',
    lab: {
      title: 'Read CPU summary',
      commands: ['lscpu'],
    },
    recommended: true,
  },
  'what-is-a-gpu': {
    prerequisites: ['what-is-a-cpu'],
    learnings: ['Throughput-oriented parallel hardware', 'When GPUs help'],
    outcome: 'Contrast GPU strengths with CPU strengths.',
  },
  'cpu-vs-gpu': {
    prerequisites: ['what-is-a-cpu', 'what-is-a-gpu'],
    learnings: ['Latency vs throughput trade-offs', 'Workload fit'],
    outcome: 'Choose CPU vs GPU for a given class of workload at a high level.',
  },
  'what-is-an-instruction': {
    prerequisites: ['what-is-a-cpu'],
    learnings: ['Unit of CPU work', 'Opcodes and operands at a glance'],
    outcome: 'Define a machine instruction in plain language.',
  },
  'what-is-an-isa': {
    prerequisites: ['what-is-an-instruction'],
    learnings: ['Contract between software and CPU', 'Why portability needs ISAs'],
    outcome: 'Explain ISA as the architecture interface compilers target.',
  },
  'what-is-a-process': {
    prerequisites: ['what-is-a-computer-program', 'what-is-an-operating-system'],
    learnings: ['Running program instance', 'Address space and resources'],
    outcome: 'Define a process and relate it to an executable.',
    lab: {
      title: 'List processes',
      commands: ['ps aux | head -n 15'],
    },
    recommended: true,
  },
  'what-is-a-thread': {
    prerequisites: ['what-is-a-process'],
    learnings: ['Execution paths inside a process', 'Shared address space'],
    outcome: 'Explain threads as concurrent execution within a process.',
  },
  'what-is-a-system-call': {
    prerequisites: ['what-is-a-kernel', 'what-is-a-process'],
    learnings: ['Controlled requests into the kernel', 'I/O and process control examples'],
    outcome: 'Describe system calls as the program↔kernel boundary.',
  },
  'what-is-a-kernel': {
    prerequisites: ['what-is-an-operating-system'],
    learnings: ['Privileged OS core', 'Hardware mediation'],
    outcome: 'Explain the kernel’s privileged role.',
  },
  'what-is-context-switching': {
    prerequisites: ['what-is-a-thread', 'what-is-a-cpu'],
    learnings: ['Saving and restoring CPU state', 'Why multitasking needs switches'],
    outcome: 'Describe context switching as sharing CPU time among tasks.',
  },
};

/**
 * Lightweight module self-checks (understanding, not memorization).
 * Shown only when defined — never invent completion scores.
 * @type {Record<string, { prompt: string, choices: string[], answerIndex: number, explain: string }[]>}
 */
export const MODULE_CHECKS = {
  'compilation-execution': [
    {
      prompt: 'What happens after Clang successfully parses a C expression (in a normal compile path)?',
      choices: [
        'The CPU executes the AST directly.',
        'Clang continues semantic analysis and eventually lowers toward LLVM IR / codegen.',
        'The linker generates the AST.',
        'The operating system converts it into source code.',
      ],
      answerIndex: 1,
      explain:
        'Parsing builds structure; semantic analysis and later stages lower the program. The CPU never runs an AST, and the linker does not create it.',
    },
    {
      prompt: 'Which artifact is typically produced before linking creates a final executable?',
      choices: [
        'A running process',
        'An object file with machine code and unresolved symbols',
        'A kernel thread',
        'A GPU shader cache',
      ],
      answerIndex: 1,
      explain: 'Compilers emit object files; the linker combines them into an executable the loader can map.',
    },
    {
      prompt: 'LLVM IR is best described as:',
      choices: [
        'The only language CPUs understand',
        'An intermediate representation used inside many LLVM-based compilers',
        'A replacement for the operating system',
        'A file-system format',
      ],
      answerIndex: 1,
      explain: 'IR sits between frontend ASTs and final machine code; it is not what the CPU executes directly.',
    },
  ],
  'computer-fundamentals': [
    {
      prompt: 'Hardware and software relate how?',
      choices: [
        'Software replaces hardware entirely',
        'Software is instructions and data; hardware stores and executes them',
        'Hardware only exists inside programming languages',
        'The OS is physical circuitry only',
      ],
      answerIndex: 1,
      explain: 'Programs are software; CPUs, memory, and devices are hardware that carry them out.',
    },
  ],
  'programming-fundamentals': [
    {
      prompt: 'A compiler’s job is primarily to:',
      choices: [
        'Schedule OS threads at runtime',
        'Translate source programs into another form such as IR or machine code',
        'Allocate GPU warps',
        'Mount file systems',
      ],
      answerIndex: 1,
      explain: 'Compilation is translation/lowering. Scheduling and mounting are OS concerns.',
    },
  ],
  'memory-storage': [
    {
      prompt: 'Virtual memory primarily gives each process:',
      choices: [
        'Unlimited disk space with no OS involvement',
        'Its own address-space view managed with OS and hardware support',
        'Direct access to another process’s registers',
        'A replacement for the instruction set',
      ],
      answerIndex: 1,
      explain: 'Virtual memory isolates and maps address spaces; it is not “infinite disk” by itself.',
    },
  ],
  'processing-hardware': [
    {
      prompt: 'An ISA is best described as:',
      choices: [
        'A GUI toolkit',
        'The interface of instructions and resources software can rely on for a CPU family',
        'A Python package manager',
        'A linker script language',
      ],
      answerIndex: 1,
      explain: 'Compilers target an ISA; it is the software-visible architecture contract.',
    },
  ],
  'operating-systems': [
    {
      prompt: 'A process is:',
      choices: [
        'Only a source file on disk',
        'A running program instance with resources and an address space',
        'A single CPU register',
        'A GPU core type',
      ],
      answerIndex: 1,
      explain: 'Source is static; a process is the OS-managed running instance.',
    },
  ],
};

export function applyCurriculum(topic) {
  const extra = TOPIC_CURRICULUM[topic.id] || {};
  return {
    ...topic,
    prerequisites: extra.prerequisites || [],
    learnings: extra.learnings || [],
    outcome: extra.outcome || '',
    lab: extra.lab || null,
    recommended: Boolean(extra.recommended || RECOMMENDED_TOPIC_IDS.includes(topic.id)),
  };
}
