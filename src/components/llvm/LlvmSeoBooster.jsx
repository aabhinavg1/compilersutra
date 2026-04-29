import React from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';

const topics = {
  'llvm-home': {
    title: 'LLVM Tutorial Hub Explained Simply',
    description:
      'Explore LLVM tutorials, IR, passes, tools, and roadmap articles in one place with guided internal links for faster compiler learning.',
    keyword: 'LLVM tutorial',
    links: [
      { to: '/docs/llvm/intro-to-llvm', label: 'LLVM roadmap and curriculum' },
      { to: '/docs/llvm/llvm_basic/What_is_LLVM', label: 'what LLVM is and why it matters' },
      { to: '/docs/llvm/llvm_ir/intro_to_llvm_ir', label: 'LLVM IR introduction' },
      { to: '/docs/llvm/llvm_pass_tracker/llvm_pass', label: 'LLVM pass infrastructure tracker' },
    ],
    faqs: [
      ['What is LLVM?', 'LLVM is a modular compiler infrastructure that provides IR, optimizers, backends, and tooling used by Clang and many other language ecosystems.'],
      ['Why learn LLVM first through a roadmap?', 'LLVM has many subsystems, so a roadmap prevents random topic-hopping and helps you learn IR, passes, and codegen in the right order.'],
      ['What is the difference between LLVM and Clang?', 'LLVM is the reusable compiler infrastructure, while Clang is the frontend compiler that lowers C, C++, and Objective-C into LLVM IR.'],
      ['What is a good first LLVM topic?', 'A good first topic is the LLVM overview plus LLVM IR, because those two pages make the rest of the optimizer and backend topics much easier to follow.'],
    ],
  },
  'llvm-roadmap': {
    title: 'LLVM Roadmap for Beginners Explained',
    description:
      'Follow a structured LLVM roadmap covering basics, IR, SSA, passes, and backend topics with a practical study order.',
    keyword: 'LLVM roadmap',
    links: [
      { to: '/docs/llvm/', label: 'LLVM home and topic hub' },
      { to: '/docs/llvm/llvm_basic/What_is_LLVM', label: 'what LLVM is' },
      { to: '/docs/llvm/llvm_ir/intro_to_llvm_ir', label: 'LLVM IR basics' },
      { to: '/docs/llvm/llvm_Curriculum/level0/Static_Single_Assignment', label: 'Static Single Assignment fundamentals' },
    ],
    faqs: [
      ['What is an LLVM roadmap?', 'An LLVM roadmap is a recommended study sequence for learning LLVM basics, IR, SSA, passes, and backend concepts without getting lost in subsystem details.'],
      ['Why should beginners start with LLVM IR?', 'LLVM IR is the representation where optimization reasoning becomes concrete, so understanding it unlocks passes, SSA, and backend lowering.'],
      ['What is the difference between LLVM basics and LLVM passes?', 'LLVM basics explain the ecosystem and architecture, while LLVM passes explain how analysis and transformation run over IR.'],
      ['What is a good LLVM study order?', 'A good order is LLVM overview, LLVM IR, SSA, CFG and dominance, pass infrastructure, then backend and target-specific topics.'],
    ],
  },
  'fix-build': {
    title: 'Fix LLVM Build Errors on Linux',
    description:
      'Fix common LLVM build failures like collect2 signal 9, memory pressure, linker crashes, and slow builds with practical Linux steps.',
    keyword: 'LLVM build errors',
    links: [
      { to: '/docs/llvm/llvm_basic/Build', label: 'LLVM build setup guide' },
      { to: '/docs/llvm/llvm_extras/manage_llvm_version', label: 'manage multiple LLVM versions' },
      { to: '/docs/llvm/llvm_basic/LLVM_Architecture', label: 'LLVM architecture overview' },
      { to: '/docs/llvm/intro-to-llvm', label: 'LLVM roadmap for broader context' },
    ],
    faqs: [
      ['What causes collect2 fatal error signal 9 during LLVM builds?', 'It usually happens when the linker or compiler is killed by the operating system because the machine ran out of memory during a large build.'],
      ['Why do LLVM builds need so much memory?', 'LLVM and Clang are large codebases with heavy template usage, many translation units, and expensive linking stages, especially in optimized builds.'],
      ['What is the best way to stabilize an LLVM build?', 'Reduce parallelism, add swap, use lld when appropriate, and avoid aggressive debug-plus-optimization combinations on memory-constrained machines.'],
      ['What is an example of a practical LLVM build fix?', 'A common fix is lowering Ninja jobs, adding swap, and retrying the link with a lighter memory footprint.'],
    ],
  },
  'llvm-passes-overview': {
    title: 'LLVM Passes Explained with Examples',
    description:
      'Understand LLVM passes, pass types, analysis vs transformation, and where passes fit in the frontend, middle-end, and backend.',
    keyword: 'LLVM passes',
    links: [
      { to: '/docs/llvm/llvm_basic/pass/Understanding_LLVM_Pass', label: 'understanding LLVM passes' },
      { to: '/docs/llvm/llvm_basic/pass/Create_LLVM_Pass_As_A_Plugin', label: 'create an LLVM pass plugin' },
      { to: '/docs/llvm/llvm_pass_tracker/llvm_pass', label: 'LLVM pass tracker' },
      { to: '/docs/llvm/llvm_ir/intro_to_llvm_ir', label: 'LLVM IR introduction' },
    ],
    faqs: [
      ['What is an LLVM pass?', 'An LLVM pass is a unit of analysis or transformation that runs over LLVM IR or later compiler representations.'],
      ['What is the difference between analysis pass and transformation pass?', 'Analysis passes compute information about code, while transformation passes modify the code to improve it or canonicalize it.'],
      ['Why does LLVM use many passes instead of one optimizer?', 'Pass pipelines keep compiler logic modular so analyses and optimizations can be composed, reused, and targeted at different scopes.'],
      ['What is an example of an LLVM pass?', 'Instruction combining, dead code elimination, and inlining are common LLVM pass examples.'],
    ],
  },
  'llvm-frontend': {
    title: 'LLVM Frontend Explained Simply',
    description:
      'Learn what the LLVM frontend does, from parsing and semantic checks to AST handling and LLVM IR generation.',
    keyword: 'LLVM frontend',
    links: [
      { to: '/docs/llvm/Intermediate/middlend/middleend', label: 'LLVM middle-end explained' },
      { to: '/docs/llvm/Intermediate/backend/backend', label: 'LLVM backend explained' },
      { to: '/docs/llvm/llvm_ir/intro_to_llvm_ir', label: 'LLVM IR introduction' },
      { to: '/docs/compilers/front_end/role_of_parser', label: 'role of parser in compiler design' },
    ],
    faqs: [
      ['What is the LLVM frontend?', 'The LLVM frontend is the compiler stage that parses source code, checks it semantically, and lowers it into LLVM IR or another internal representation.'],
      ['What is the difference between frontend and backend in LLVM?', 'The frontend understands the source language, while the backend turns lowered IR into target-specific machine code.'],
      ['Why is LLVM frontend design important?', 'Frontend design affects diagnostics, AST quality, language support, and how cleanly code can be lowered into LLVM IR.'],
      ['What is an example of an LLVM frontend?', 'Clang is the best-known LLVM frontend for C, C++, and Objective-C.'],
    ],
  },
  'llvm-middleend': {
    title: 'LLVM Middle-End Explained with Examples',
    description:
      'Learn how the LLVM middle-end analyzes and transforms IR through optimization passes before backend code generation.',
    keyword: 'LLVM middle-end',
    links: [
      { to: '/docs/llvm/Intermediate/frontend/fronend', label: 'LLVM frontend explained' },
      { to: '/docs/llvm/Intermediate/backend/backend', label: 'LLVM backend explained' },
      { to: '/docs/llvm/llvm_basic/pass/Understanding_LLVM_Pass', label: 'LLVM pass basics' },
      { to: '/docs/llvm/llvm_ir/intro_to_llvm_ir', label: 'LLVM IR introduction' },
    ],
    faqs: [
      ['What is the LLVM middle-end?', 'The LLVM middle-end is the optimizer layer that runs analyses and transformations over IR before target-specific code generation.'],
      ['What is the difference between middle-end and backend in LLVM?', 'The middle-end works mostly on target-independent IR, while the backend lowers code into architecture-specific instructions.'],
      ['Why is the LLVM middle-end important?', 'It is where canonicalization, simplification, inlining, dead code elimination, and many other performance-critical transformations happen.'],
      ['What is an example of a middle-end optimization?', 'Constant propagation and dead code elimination are classic middle-end optimizations.'],
    ],
  },
  'llvm-backend': {
    title: 'LLVM Backend Explained Simply',
    description:
      'Understand the LLVM backend, instruction selection, register allocation, and how IR becomes machine-specific code.',
    keyword: 'LLVM backend',
    links: [
      { to: '/docs/llvm/Intermediate/frontend/fronend', label: 'LLVM frontend explained' },
      { to: '/docs/llvm/Intermediate/middlend/middleend', label: 'LLVM middle-end explained' },
      { to: '/docs/llvm/llvm_basic/LLVM_Architecture', label: 'LLVM architecture overview' },
      { to: '/docs/llvm/llvm_ir/hierarchy_of_llvm_ir', label: 'LLVM IR hierarchy' },
    ],
    faqs: [
      ['What is the LLVM backend?', 'The LLVM backend is the compiler stage that lowers optimized IR into target-specific machine instructions, assembly, and object code.'],
      ['What is the difference between LLVM IR and backend code?', 'LLVM IR is target-independent, while backend code is shaped around a specific architecture and instruction set.'],
      ['Why is instruction selection important in the LLVM backend?', 'Instruction selection maps generic IR operations to efficient machine instructions and strongly affects final performance.'],
      ['What is an example of backend work in LLVM?', 'Register allocation, instruction scheduling, and target-specific lowering are backend tasks.'],
    ],
  },
  'dominator-tree': {
    title: 'Dominator Tree and Dominance Frontier',
    description:
      'Learn dominator trees, dominance frontiers, and PHI placement with LLVM-oriented intuition for SSA construction and CFG reasoning.',
    keyword: 'dominator tree',
    links: [
      { to: '/docs/llvm/llvm_Curriculum/level0/Static_Single_Assignment', label: 'SSA fundamentals' },
      { to: '/docs/llvm/llvm_Curriculum/level0/Static_Single_Assignment_part2', label: 'SSA deep dive' },
      { to: '/docs/llvm/llvm_ir/hierarchy_of_llvm_ir', label: 'LLVM IR hierarchy and CFG context' },
      { to: '/docs/llvm/llvm_ir/intro_to_llvm_ir', label: 'LLVM IR introduction' },
    ],
    faqs: [
      ['What is a dominator tree?', 'A dominator tree summarizes which basic blocks must be passed through to reach other basic blocks in a control-flow graph.'],
      ['What is the difference between dominance and dominance frontier?', 'Dominance tells which blocks are always on a path, while dominance frontier identifies join points where definitions from different paths meet.'],
      ['Why are dominance frontiers important?', 'They help compilers decide where PHI nodes are needed during SSA construction.'],
      ['What is an example use of a dominator tree in LLVM?', 'LLVM uses dominator information in SSA construction, optimization reasoning, and many CFG-based analyses.'],
    ],
  },
  'ssa': {
    title: 'Static Single Assignment Explained',
    description:
      'Understand Static Single Assignment form, PHI nodes, dominance, and why SSA makes compiler optimization easier.',
    keyword: 'Static Single Assignment',
    links: [
      { to: '/docs/llvm/llvm_Curriculum/level0/Static_Single_Assignment_part2', label: 'SSA deep dive' },
      { to: '/docs/llvm/llvm_Curriculum/level0/Dominator_Tree_And_Dominance_Frontier', label: 'dominator tree and dominance frontier' },
      { to: '/docs/llvm/llvm_ir/intro_to_llvm_ir', label: 'LLVM IR introduction' },
      { to: '/docs/llvm/llvm_ir/hierarchy_of_llvm_ir', label: 'LLVM IR hierarchy' },
    ],
    faqs: [
      ['What is Static Single Assignment?', 'Static Single Assignment is an IR form where each variable-like value is assigned once, making data-flow reasoning much simpler for optimizers.'],
      ['What is the difference between SSA and normal variable assignment?', 'In SSA, each definition gets a unique name, while ordinary source code can reassign the same variable many times.'],
      ['Why does SSA help compiler optimization?', 'SSA makes def-use chains explicit, which simplifies constant propagation, dead code elimination, and many analyses.'],
      ['What is an example of SSA structure?', 'PHI nodes at control-flow joins are a classic SSA mechanism for merging values from different paths.'],
    ],
  },
  'ssa-deep-dive': {
    title: 'SSA Deep Dive for LLVM Engineers',
    description:
      'Go deeper on SSA form, PHI nodes, construction algorithms, and how LLVM and GCC reason about values in optimization.',
    keyword: 'SSA form',
    links: [
      { to: '/docs/llvm/llvm_Curriculum/level0/Static_Single_Assignment', label: 'SSA fundamentals' },
      { to: '/docs/llvm/llvm_Curriculum/level0/Dominator_Tree_And_Dominance_Frontier', label: 'dominance and PHI placement' },
      { to: '/docs/llvm/llvm_ir/intro_to_llvm_ir', label: 'LLVM IR overview' },
      { to: '/docs/llvm/llvm_basic/LLVM_Architecture', label: 'LLVM architecture overview' },
    ],
    faqs: [
      ['What is SSA deep dive really about?', 'It goes beyond the definition of SSA to explain PHI placement, renaming, value reasoning, and how optimizers depend on SSA structure.'],
      ['What is the difference between SSA basics and SSA deep dive?', 'SSA basics explain the concept, while a deep dive focuses on construction, invariants, and optimization mechanics.'],
      ['Why do modern compilers rely heavily on SSA?', 'Because SSA exposes value flow clearly enough for many optimizations to be implemented efficiently and correctly.'],
      ['What is an example of SSA-driven optimization?', 'Constant propagation and sparse conditional constant propagation become much cleaner on SSA-based IR.'],
    ],
  },
  'build-llvm': {
    title: 'Build LLVM from Source on Linux',
    description:
      'Build LLVM from source with CMake and Ninja, understand common flags, and avoid setup mistakes when compiling Clang and LLVM.',
    keyword: 'build LLVM from source',
    links: [
      { to: '/docs/llvm/fix_llvm_build_bugs', label: 'fix LLVM build bugs' },
      { to: '/docs/llvm/llvm_extras/manage_llvm_version', label: 'manage multiple LLVM versions' },
      { to: '/docs/llvm/llvm_basic/What_is_LLVM', label: 'what LLVM is' },
      { to: '/docs/llvm/intro-to-llvm', label: 'LLVM roadmap' },
    ],
    faqs: [
      ['What is the best way to build LLVM from source?', 'A common workflow uses CMake plus Ninja with a clean build directory and only the projects and targets you actually need.'],
      ['Why do developers build LLVM from source?', 'They build from source to experiment with compiler changes, test passes, study internals, or use newer LLVM versions than system packages provide.'],
      ['What is the difference between building LLVM and building Clang?', 'LLVM is the core infrastructure, while Clang is one of the projects you can enable in the LLVM monorepo build.'],
      ['What is an example of a practical LLVM build command?', 'A typical example is configuring with CMake, selecting Ninja, choosing enabled projects, and then running the build in a separate directory.'],
    ],
  },
  'llvm-architecture': {
    title: 'LLVM Architecture Explained Simply',
    description:
      'Understand LLVM architecture, IR, optimizers, frontend and backend boundaries, and how the modular design powers compiler engineering.',
    keyword: 'LLVM architecture',
    links: [
      { to: '/docs/llvm/llvm_basic/What_is_LLVM', label: 'what LLVM is' },
      { to: '/docs/llvm/llvm_ir/intro_to_llvm_ir', label: 'LLVM IR explained' },
      { to: '/docs/llvm/Intermediate/frontend/fronend', label: 'LLVM frontend' },
      { to: '/docs/llvm/Intermediate/backend/backend', label: 'LLVM backend' },
    ],
    faqs: [
      ['What is LLVM architecture?', 'LLVM architecture is the modular organization of frontends, IR, optimizers, code generation backends, and tooling libraries.'],
      ['What is the difference between LLVM architecture and LLVM IR?', 'LLVM architecture refers to the whole compiler framework, while LLVM IR is the central intermediate representation inside that framework.'],
      ['Why is LLVM architecture considered modular?', 'Its major subsystems are designed as reusable libraries rather than one tightly coupled compiler binary.'],
      ['What is an example of LLVM modularity?', 'Clang can lower to LLVM IR, then independent tools such as opt and llc can analyze or lower that IR further.'],
    ],
  },
  'what-is-llvm': {
    title: 'What Is LLVM Explained with Examples',
    description:
      'Learn what LLVM is, how Clang and LLVM IR fit together, and why LLVM matters for modern compilers and tooling.',
    keyword: 'what is LLVM',
    links: [
      { to: '/docs/llvm/llvm_basic/LLVM_Architecture', label: 'LLVM architecture overview' },
      { to: '/docs/llvm/llvm_ir/intro_to_llvm_ir', label: 'LLVM IR introduction' },
      { to: '/docs/llvm/intro-to-llvm', label: 'LLVM roadmap' },
      { to: '/docs/compilers/clang-vs-gcc-vs-llvm', label: 'Clang vs GCC vs LLVM comparison' },
    ],
    faqs: [
      ['What is LLVM?', 'LLVM is a modular compiler infrastructure with a reusable IR, optimizer pipeline, backend framework, and broad tooling ecosystem.'],
      ['What is the difference between LLVM and Clang?', 'LLVM is the infrastructure, while Clang is the frontend compiler that uses LLVM.'],
      ['Why is LLVM important?', 'LLVM made reusable compiler engineering much easier for language designers, systems programmers, and tool builders.'],
      ['What is an example of LLVM use in practice?', 'Clang, Rust toolchains, Swift tooling, and many research compilers build on LLVM technology.'],
    ],
  },
  'why-llvm': {
    title: 'Why LLVM Matters for Modern Compilers',
    description:
      'See why LLVM became central to modern compilers through modular design, IR reuse, strong tooling, and ecosystem reach.',
    keyword: 'why LLVM',
    links: [
      { to: '/docs/llvm/llvm_basic/What_is_LLVM', label: 'what LLVM is' },
      { to: '/docs/llvm/llvm_basic/LLVM_Architecture', label: 'LLVM architecture overview' },
      { to: '/docs/compilers/clang-vs-gcc-vs-llvm', label: 'Clang vs GCC vs LLVM comparison' },
      { to: '/docs/llvm/llvm_extras/More_About_LLVM', label: 'more about LLVM' },
    ],
    faqs: [
      ['Why is LLVM popular?', 'LLVM is popular because it offers reusable compiler infrastructure, strong optimization tooling, broad language support, and a modular design.'],
      ['What is the difference between LLVM and traditional compiler designs?', 'LLVM emphasizes reusable libraries and a common IR, while many traditional compilers are more tightly integrated as single toolchains.'],
      ['Why do new languages often choose LLVM?', 'LLVM reduces the cost of building optimizers and backends, so new language teams can focus more on frontend and language design.'],
      ['What is an example of LLVM ecosystem impact?', 'Clang, Rust, Swift, Julia, and many accelerator toolchains rely on LLVM or LLVM-derived infrastructure.'],
    ],
  },
  'why-what-llvm': {
    title: 'LLVM Architecture and Benefits Explained',
    description:
      'Understand LLVM architecture, modular compiler design, IR, and the practical reasons LLVM powers many modern toolchains.',
    keyword: 'LLVM architecture',
    links: [
      { to: '/docs/llvm/llvm_basic/What_is_LLVM', label: 'what LLVM is' },
      { to: '/docs/llvm/llvm_basic/Why_LLVM', label: 'why LLVM matters' },
      { to: '/docs/llvm/llvm_ir/intro_to_llvm_ir', label: 'LLVM IR introduction' },
      { to: '/docs/llvm/llvm_tools/llvm_tools', label: 'LLVM tools overview' },
    ],
    faqs: [
      ['What is LLVM architecture?', 'LLVM architecture combines modular frontends, IR, analysis and optimization passes, and target backends in one reusable framework.'],
      ['Why does LLVM architecture help compiler development?', 'It lets teams reuse IR, optimizers, and backends instead of rebuilding every subsystem from scratch.'],
      ['What is the difference between LLVM architecture and LLVM pass design?', 'Architecture is the whole system layout, while pass design concerns one optimization and analysis layer inside that system.'],
      ['What is an example of LLVM architecture in action?', 'Clang lowers source to LLVM IR, opt runs transformations, and llc or backend codegen lowers IR to machine code.'],
    ],
  },
  'llvm-basic-index': {
    title: 'LLVM Basics and Passes Guide',
    description:
      'Browse LLVM basics, pass tutorials, and setup guides with a cleaner entry point into hands-on LLVM learning.',
    keyword: 'LLVM basics',
    links: [
      { to: '/docs/llvm/llvm_basic/What_is_LLVM', label: 'what LLVM is' },
      { to: '/docs/llvm/llvm_basic/Build', label: 'build LLVM from source' },
      { to: '/docs/llvm/llvm_basic/pass/Understanding_LLVM_Pass', label: 'understanding LLVM passes' },
      { to: '/docs/llvm/llvm_basic/pass/Create_LLVM_Pass_As_A_Plugin', label: 'create an LLVM pass plugin' },
    ],
    faqs: [
      ['What should I learn first in LLVM basics?', 'Start with what LLVM is, the architecture overview, and LLVM IR before moving to custom pass implementation.'],
      ['What is the difference between LLVM basics and LLVM extras?', 'LLVM basics focus on core concepts and pass tutorials, while extras cover workflows, version management, and related utilities.'],
      ['Why do LLVM basics matter before pass writing?', 'Without basics, pass code feels mechanical because you have not yet built enough intuition about IR and the pipeline.'],
      ['What is an example of an LLVM basics topic?', 'Building LLVM, understanding LLVM IR, and writing a first function pass are all basics topics.'],
    ],
  },
  'create-pass-plugin': {
    title: 'Create an LLVM Pass Plugin',
    description:
      'Write and register an LLVM pass plugin with the new pass manager using a practical example and build commands.',
    keyword: 'LLVM pass plugin',
    links: [
      { to: '/docs/llvm/llvm_basic/pass/Understanding_LLVM_Pass', label: 'understanding LLVM passes' },
      { to: '/docs/llvm/llvm_basic/pass/Function_Count_Pass', label: 'function pass example' },
      { to: '/docs/llvm/llvm_extras/manage_llvm_version', label: 'manage LLVM versions for development' },
      { to: '/docs/llvm/llvm_tools/llvm_tools', label: 'LLVM tools like opt and llvm-config' },
    ],
    faqs: [
      ['What is an LLVM pass plugin?', 'An LLVM pass plugin is a dynamically loadable extension that registers custom analysis or transformation passes with LLVM tools such as opt.'],
      ['What is the difference between a pass plugin and built-in pass?', 'A built-in pass ships with LLVM, while a plugin is developed and loaded separately.'],
      ['Why use the new pass manager for plugins?', 'The new pass manager is the modern LLVM pass infrastructure and is the preferred path for current pass development.'],
      ['What is an example of an LLVM pass plugin use case?', 'A plugin can count instructions, inspect loops, or apply a custom transformation to IR during opt runs.'],
    ],
  },
  'function-count-pass': {
    title: 'LLVM Function Pass Example in C++',
    description:
      'Build an LLVM function pass example in C++ and see how to inspect functions, register the pass, and run it on IR.',
    keyword: 'LLVM function pass',
    links: [
      { to: '/docs/llvm/llvm_basic/pass/Create_LLVM_Pass_As_A_Plugin', label: 'create an LLVM pass plugin' },
      { to: '/docs/llvm/llvm_basic/pass/Instruction_Count_Pass', label: 'instruction count pass example' },
      { to: '/docs/llvm/llvm_basic/pass/Understanding_LLVM_Pass', label: 'understanding LLVM passes' },
      { to: '/docs/llvm/llvm_ir/hierarchy_of_llvm_ir', label: 'LLVM IR hierarchy' },
    ],
    faqs: [
      ['What is an LLVM function pass?', 'An LLVM function pass is a pass that processes one function at a time and is commonly used for per-function analysis or transformation.'],
      ['What is the difference between function pass and module pass?', 'A function pass works on individual functions, while a module pass can reason across the whole module.'],
      ['Why start with a function count pass?', 'It is simple enough to learn pass structure while still showing how to walk IR and inspect functions.'],
      ['What is an example of function pass output?', 'A function pass might print function names, counts, instruction statistics, or transformed IR.'],
    ],
  },
  'instruction-count-pass': {
    title: 'LLVM Instruction Count Pass Example',
    description:
      'Learn an LLVM instruction count pass example that walks functions, counts IR instructions, and clarifies pass structure.',
    keyword: 'LLVM instruction count pass',
    links: [
      { to: '/docs/llvm/llvm_basic/pass/Function_Count_Pass', label: 'function count pass example' },
      { to: '/docs/llvm/llvm_basic/pass/Create_LLVM_Pass_As_A_Plugin', label: 'LLVM pass plugin setup' },
      { to: '/docs/llvm/llvm_basic/pass/Understanding_LLVM_Pass', label: 'pass concepts in LLVM' },
      { to: '/docs/llvm/llvm_ir/hierarchy_of_llvm_ir', label: 'LLVM IR hierarchy and instructions' },
    ],
    faqs: [
      ['What is an LLVM instruction count pass?', 'It is a pass that visits IR and counts instructions, usually per function, to help with analysis or learning pass structure.'],
      ['Why count LLVM instructions?', 'Instruction counts are a simple way to inspect IR shape and understand how transformations affect a program.'],
      ['What is the difference between instruction count and source line count?', 'Instruction count reflects compiler IR operations rather than the number of source lines written by a developer.'],
      ['What is an example use of an instruction count pass?', 'It can compare optimization stages or validate how much IR a transformation removed or introduced.'],
    ],
  },
  'understanding-pass': {
    title: 'Understanding LLVM Passes Simply',
    description:
      'Understand LLVM passes, pass categories, and the role of opt and pass managers in LLVM optimization workflows.',
    keyword: 'understanding LLVM passes',
    links: [
      { to: '/docs/llvm/Intermediate/What_Is_LLVM_Passes', label: 'LLVM passes and their types' },
      { to: '/docs/llvm/llvm_basic/pass/Create_LLVM_Pass_As_A_Plugin', label: 'create a pass plugin' },
      { to: '/docs/llvm/llvm_pass_tracker/llvm_pass', label: 'pass infrastructure history' },
      { to: '/docs/llvm/llvm_extras/LLVM_Pass_Timing', label: 'measure LLVM pass timing' },
    ],
    faqs: [
      ['What are LLVM passes?', 'LLVM passes are modular analysis or transformation steps that operate on IR and related compiler representations.'],
      ['What is the difference between pass manager and pass?', 'A pass performs one job, while the pass manager schedules and organizes many passes.'],
      ['Why are LLVM passes important?', 'They are the core mechanism through which LLVM analyzes, simplifies, canonicalizes, and optimizes code.'],
      ['What is an example of an LLVM pass workflow?', 'Clang emits IR, opt runs a pass pipeline, and later backend stages lower the transformed IR to machine code.'],
    ],
  },
  'pass-timing': {
    title: 'LLVM Pass Timing Explained',
    description:
      'Measure LLVM pass timing, inspect optimization cost, and understand where compile-time is spent in pass pipelines.',
    keyword: 'LLVM pass timing',
    links: [
      { to: '/docs/llvm/llvm_basic/pass/Understanding_LLVM_Pass', label: 'understanding LLVM passes' },
      { to: '/docs/llvm/llvm_pass_tracker/llvm_pass', label: 'LLVM pass tracker' },
      { to: '/docs/llvm/llvm_tools/llvm_tools', label: 'LLVM tools overview' },
      { to: '/docs/llvm/llvm_extras/disable_llvm_pass', label: 'disable an LLVM pass' },
    ],
    faqs: [
      ['What is LLVM pass timing?', 'LLVM pass timing measures how much compile-time is spent in individual passes or pipeline stages.'],
      ['Why does LLVM pass timing matter?', 'It helps identify expensive optimization stages and makes compile-time tradeoffs easier to analyze.'],
      ['What is the difference between runtime profiling and pass timing?', 'Runtime profiling measures the compiled program, while pass timing measures the compiler itself during optimization.'],
      ['What is an example use of pass timing?', 'A compiler engineer can compare pass timing before and after adding a new transformation to see whether compile-time regressed.'],
    ],
  },
  'more-about-llvm': {
    title: 'More About LLVM and Its Ecosystem',
    description:
      'Explore more about LLVM, its optimizer ecosystem, architecture, and why it remains central to modern compiler tooling.',
    keyword: 'more about LLVM',
    links: [
      { to: '/docs/llvm/llvm_basic/Why_LLVM', label: 'why LLVM matters' },
      { to: '/docs/llvm/llvm_basic/LLVM_Architecture', label: 'LLVM architecture overview' },
      { to: '/docs/llvm/llvm_tools/llvm_tools', label: 'LLVM tools overview' },
      { to: '/docs/llvm/intro-to-llvm', label: 'LLVM roadmap' },
    ],
    faqs: [
      ['What should I learn after the basics of LLVM?', 'A strong next step is LLVM IR, pass infrastructure, tool usage, and backend architecture.'],
      ['Why does LLVM have such a large ecosystem?', 'Its modular design made it useful not only for one compiler, but for tooling, research, new languages, and accelerator stacks.'],
      ['What is the difference between LLVM ecosystem and LLVM core?', 'LLVM core refers to the main compiler infrastructure, while the ecosystem includes frontends, tools, research projects, and downstream toolchains.'],
      ['What is an example of LLVM ecosystem tooling?', 'Clang, opt, lld, lldb, and many language frontends are part of the broader LLVM ecosystem.'],
    ],
  },
  'llvm-extras-index': {
    title: 'LLVM Extras and Workflow Guides',
    description:
      'Browse LLVM extras such as version management, pass timing, pass control, and practical workflows around LLVM development.',
    keyword: 'LLVM extras',
    links: [
      { to: '/docs/llvm/llvm_extras/manage_llvm_version', label: 'manage LLVM versions' },
      { to: '/docs/llvm/llvm_extras/LLVM_Pass_Timing', label: 'LLVM pass timing guide' },
      { to: '/docs/llvm/llvm_extras/disable_llvm_pass', label: 'disable an LLVM pass' },
      { to: '/docs/llvm/llvm_tools/llvm_tools', label: 'LLVM tools overview' },
    ],
    faqs: [
      ['What are LLVM extras?', 'LLVM extras are practical workflow topics around the core architecture, such as version management, pass timing, and pass control.'],
      ['Why are workflow guides useful in LLVM?', 'Because many real LLVM tasks involve toolchain setup and debugging, not just theory about IR and passes.'],
      ['What is the difference between LLVM basics and LLVM extras?', 'LLVM basics explain foundational concepts, while extras focus on supporting workflows and troubleshooting.'],
      ['What is an example of an LLVM extras topic?', 'Managing multiple LLVM versions or measuring pass timing are good examples.'],
    ],
  },
  'manage-llvm-version': {
    title: 'Manage Multiple LLVM Versions',
    description:
      'Install, switch, and manage multiple LLVM versions cleanly on Linux and macOS without toolchain confusion.',
    keyword: 'manage multiple LLVM versions',
    links: [
      { to: '/docs/llvm/llvm_basic/Build', label: 'build LLVM from source' },
      { to: '/docs/llvm/fix_llvm_build_bugs', label: 'fix LLVM build issues' },
      { to: '/docs/llvm/llvm_tools/llvm_tools', label: 'LLVM tools and llvm-config' },
      { to: '/docs/llvm/intro-to-llvm', label: 'LLVM roadmap' },
    ],
    faqs: [
      ['Why manage multiple LLVM versions?', 'Different projects, passes, and research experiments often depend on different LLVM APIs or toolchain versions.'],
      ['What is the difference between system LLVM and custom LLVM builds?', 'System LLVM comes from packages, while custom builds are locally compiled toolchains you control directly.'],
      ['Why does llvm-config matter when switching versions?', 'llvm-config tells build systems which headers, libraries, and settings belong to the active LLVM installation.'],
      ['What is an example of version-management confusion in LLVM?', 'A project may compile against one LLVM version but run tools from another, causing ABI or plugin mismatch problems.'],
    ],
  },
  'disable-pass': {
    title: 'Disable an LLVM Pass Explained',
    description:
      'Learn how to disable an LLVM pass, inspect pass pipelines, and reason about optimization control in LLVM.',
    keyword: 'disable an LLVM pass',
    links: [
      { to: '/docs/llvm/llvm_basic/pass/Understanding_LLVM_Pass', label: 'understanding LLVM passes' },
      { to: '/docs/llvm/llvm_extras/LLVM_Pass_Timing', label: 'measure LLVM pass timing' },
      { to: '/docs/llvm/llvm_pass_tracker/llvm_pass', label: 'pass infrastructure tracker' },
      { to: '/docs/llvm/llvm_tools/llvm_tools', label: 'LLVM tools overview' },
    ],
    faqs: [
      ['Why disable an LLVM pass?', 'Developers disable passes to debug transformations, isolate performance behavior, or study the effect of one pass in a larger pipeline.'],
      ['What is the difference between disabling a pass and removing a pass implementation?', 'Disabling stops it from running in a pipeline, while removing implementation changes the compiler source itself.'],
      ['Why can disabling one pass change many results?', 'Passes interact, so removing one transformation can affect later canonicalization, analysis results, and optimization opportunities.'],
      ['What is an example of pass-control debugging?', 'A compiler engineer may disable an inliner or simplification pass to see which stage introduced a regression.'],
    ],
  },
  'llvm-ir-hierarchy': {
    title: 'LLVM IR Hierarchy Explained Simply',
    description:
      'Understand the LLVM IR hierarchy from module to function to basic block to instruction with practical compiler intuition.',
    keyword: 'LLVM IR hierarchy',
    links: [
      { to: '/docs/llvm/llvm_ir/intro_to_llvm_ir', label: 'LLVM IR introduction' },
      { to: '/docs/llvm/llvm_Curriculum/level0/Static_Single_Assignment', label: 'SSA in LLVM IR' },
      { to: '/docs/llvm/llvm_Curriculum/level0/Dominator_Tree_And_Dominance_Frontier', label: 'CFG and dominance concepts' },
      { to: '/docs/llvm/llvm_basic/pass/Instruction_Count_Pass', label: 'instruction-level pass example' },
    ],
    faqs: [
      ['What is the LLVM IR hierarchy?', 'The LLVM IR hierarchy organizes code as modules containing functions, functions containing basic blocks, and basic blocks containing instructions.'],
      ['What is the difference between a module and a function in LLVM IR?', 'A module is the top-level container, while a function represents one callable code unit inside the module.'],
      ['Why are basic blocks important in LLVM IR?', 'Basic blocks are the core CFG units that make control flow and many optimizations explicit.'],
      ['What is an example of LLVM IR hierarchy usage?', 'Passes often iterate module to function to basic block to instruction when analyzing or transforming IR.'],
    ],
  },
  'intro-to-llvm-ir': {
    title: 'LLVM IR Explained with Examples',
    description:
      'Learn LLVM IR, why compilers need it, how SSA works in practice, and how Clang, opt, and llc fit into the workflow.',
    keyword: 'LLVM IR',
    links: [
      { to: '/docs/llvm/llvm_ir/hierarchy_of_llvm_ir', label: 'LLVM IR hierarchy' },
      { to: '/docs/llvm/llvm_Curriculum/level0/Static_Single_Assignment', label: 'SSA fundamentals' },
      { to: '/docs/llvm/llvm_basic/What_is_LLVM', label: 'what LLVM is' },
      { to: '/docs/llvm/llvm_tools/llvm_tools', label: 'LLVM tools like opt and llc' },
    ],
    faqs: [
      ['What is LLVM IR?', 'LLVM IR is the intermediate representation used by LLVM for analysis, transformation, and target-independent optimization.'],
      ['What is the difference between source code and LLVM IR?', 'Source code is language-specific, while LLVM IR is a lower-level representation designed for compiler reasoning and optimization.'],
      ['Why is LLVM IR usually in SSA form?', 'SSA makes value flow explicit and simplifies many optimizations and analyses.'],
      ['What is an example of a workflow using LLVM IR?', 'Clang can emit LLVM IR, opt can transform it, and llc can lower it to target-specific assembly.'],
    ],
  },
  'llvm-pass-tracker': {
    title: 'LLVM Pass Infrastructure History',
    description:
      'Track the evolution of LLVM pass infrastructure, legacy and new pass managers, and version-specific changes across LLVM.',
    keyword: 'LLVM pass manager',
    links: [
      { to: '/docs/llvm/Intermediate/What_Is_LLVM_Passes', label: 'LLVM pass overview' },
      { to: '/docs/llvm/llvm_basic/pass/Understanding_LLVM_Pass', label: 'understanding LLVM passes' },
      { to: '/docs/llvm/llvm_pass_tracker/transformpass/inliner_llvm_v1', label: 'LLVM inliner pass v1 analysis' },
      { to: '/docs/llvm/llvm_extras/LLVM_Pass_Timing', label: 'LLVM pass timing' },
    ],
    faqs: [
      ['What is the LLVM pass manager?', 'The LLVM pass manager is the infrastructure that organizes, schedules, and composes pass execution over compiler representations.'],
      ['What is the difference between legacy and new pass manager in LLVM?', 'The new pass manager improves modularity, analysis preservation handling, and pipeline organization compared with the older infrastructure.'],
      ['Why study LLVM pass history?', 'Version-specific differences matter when maintaining passes, reading old code, or migrating plugins across LLVM releases.'],
      ['What is an example of LLVM pass infrastructure change?', 'The move from the legacy pass manager to the new pass manager changed registration and pipeline construction patterns.'],
    ],
  },
  'inliner-v1': {
    title: 'LLVM Inliner Pass v1 Analysis',
    description:
      'Study the LLVM inliner pass version 1, its call-graph structure, heuristics, and what early inlining design reveals about LLVM evolution.',
    keyword: 'LLVM inliner pass',
    links: [
      { to: '/docs/llvm/llvm_pass_tracker/llvm_pass', label: 'LLVM pass infrastructure history' },
      { to: '/docs/llvm/llvm_basic/pass/Understanding_LLVM_Pass', label: 'LLVM pass concepts' },
      { to: '/docs/llvm/llvm_basic/LLVM_Architecture', label: 'LLVM architecture overview' },
      { to: '/docs/llvm/llvm_ir/intro_to_llvm_ir', label: 'LLVM IR introduction' },
    ],
    faqs: [
      ['What is the LLVM inliner pass?', 'The LLVM inliner pass decides when one function should be inlined into another to reduce call overhead or expose optimization opportunities.'],
      ['What is the difference between inlining and cloning in LLVM?', 'Inlining replaces a call with the callee body at the call site, while cloning duplicates function bodies for other transformation purposes.'],
      ['Why study early LLVM inliner versions?', 'They show how pass heuristics and infrastructure evolved, which helps when reading historical LLVM code or reasoning about migration.'],
      ['What is an example of an inliner tradeoff?', 'Inlining can improve optimization opportunities but also increase code size.'],
    ],
  },
  'llvm-tools': {
    title: 'LLVM Tools Explained with Examples',
    description:
      'Learn essential LLVM tools like opt, llc, llvm-dis, llvm-as, llvm-nm, and more for IR inspection and compiler workflows.',
    keyword: 'LLVM tools',
    links: [
      { to: '/docs/llvm/llvm_ir/intro_to_llvm_ir', label: 'LLVM IR introduction' },
      { to: '/docs/llvm/llvm_extras/manage_llvm_version', label: 'manage LLVM versions' },
      { to: '/docs/llvm/llvm_basic/pass/Create_LLVM_Pass_As_A_Plugin', label: 'use opt with a pass plugin' },
      { to: '/docs/llvm/llvm_extras/LLVM_Pass_Timing', label: 'measure LLVM pass timing' },
    ],
    faqs: [
      ['What are LLVM tools?', 'LLVM tools are command-line utilities for assembling, disassembling, analyzing, optimizing, linking, and lowering LLVM IR and related artifacts.'],
      ['What is the difference between opt and llc?', 'opt transforms or analyzes LLVM IR, while llc lowers LLVM IR to target-specific assembly or machine code.'],
      ['Why are LLVM tools important for learning LLVM?', 'They let you inspect each stage of the pipeline directly instead of treating the compiler as a black box.'],
      ['What is an example of an LLVM tool workflow?', 'A common flow is clang to emit IR, opt to transform it, and llc to lower it to assembly.'],
    ],
  },
};

export default function LlvmSeoBooster({topic}) {
  const data = topics[topic];
  if (!data) return null;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  };

  return (
    <>
      <Head>
        <title>{data.title}</title>
        <meta name="description" content={data.description} />
      </Head>

      <section>
        <h2>Related {data.keyword} Articles</h2>
        <ul>
          {data.links.map((link) => (
            <li key={link.to}>
              <Link to={link.to}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>{data.keyword} FAQ</h2>
        {data.faqs.map(([question, answer]) => (
          <div key={question}>
            <p>
              <strong>{question}</strong>
            </p>
            <p>{answer}</p>
          </div>
        ))}
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(faqSchema)}}
      />
    </>
  );
}
