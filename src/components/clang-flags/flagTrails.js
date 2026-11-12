const PLACEHOLDER_GUIDANCE = new Set([
  'when the flag matches the behavior you need',
  'when the flag matches the behavior you need in this compilation',
  'when the flag is not relevant to this build',
]);

function isPlaceholder(item) {
  const normalized = String(item).trim().toLowerCase();
  return !normalized || PLACEHOLDER_GUIDANCE.has(normalized);
}

function fallbackGuidance(flag, mode) {
  const lines = [];
  const target = flag.groupLabel ? String(flag.groupLabel).replace(/^AARCH64$/, 'AArch64') : null;
  const kind = flag.kind || 'flag';

  if (mode === 'use') {
    if (target) {
      lines.push(`You are targeting ${target} and want this ${kind.toLowerCase()} behavior applied to the whole compilation.`);
    }
    if (flag.clangOnly) {
      lines.push('You are compiling with Clang (the option is not accepted by other compilers).');
    }
    if (flag.cc1 && !flag.driver) {
      lines.push('You are driving the frontend directly or forwarding the option with `-Xclang`, since the driver does not expose it.');
    }
    if (!lines.length) {
      lines.push(`You have a concrete need for the behavior this ${flag.category || 'compiler'} option enables and have verified it applies to your build.`);
    }
  } else {
    if (target) {
      lines.push(`Your build targets a different architecture — this ${kind.toLowerCase()} is accepted only when targeting ${target}.`);
    }
    if (flag.cc1 && !flag.driver) {
      lines.push('You expect the option to work as a regular driver flag — it requires `-Xclang` forwarding or a direct `clang -cc1` invocation.');
    }
    if (flag.clangOnly) {
      lines.push('You need the same behavior from GCC or another compiler that does not implement this option.');
    }
    if (!lines.length) {
      lines.push('The behavior enabled by this option does not apply to the code or target you are building.');
    }
  }

  return lines;
}

export function buildWhenToUse(flag) {
  const items = flag.whenToUse && flag.whenToUse.some((item) => !isPlaceholder(item))
    ? flag.whenToUse.filter((item) => !isPlaceholder(item))
    : fallbackGuidance(flag, 'use');
  return items.length ? items : ['No specific guidance — the option is generally safe when it matches your goal.'];
}

export function buildWhenNotToUse(flag) {
  const items = flag.whenNotToUse && flag.whenNotToUse.some((item) => !isPlaceholder(item))
    ? flag.whenNotToUse.filter((item) => !isPlaceholder(item))
    : fallbackGuidance(flag, 'avoid');
  return items.length ? items : ['No specific guidance available.'];
}

const BOUNDS_SAFETY_FLAGS = new Set([
  '-fexperimental-bounds-safety',
  '-fno-experimental-bounds-safety',
]);

const FRAME_POINTER_FLAGS = new Set([
  '-fomit-frame-pointer',
  '-fno-omit-frame-pointer',
  '-momit-leaf-frame-pointer',
  '-mno-omit-leaf-frame-pointer',
]);

function isLoopVectorizeFlag(flagName) {
  const name = String(flagName || '').toLowerCase();
  if (name.includes('slp-vectorize') || name.includes('tree-slp-vectorize')) return false;
  return (
    name.includes('vectorize') ||
    name === '-qvec' ||
    name === '-qvec-' ||
    name === '/qvec' ||
    name === '/qvec-'
  );
}

function isSlpVectorizeFlag(flagName) {
  const name = String(flagName || '').toLowerCase();
  return name.includes('slp-vectorize') || name.includes('tree-slp-vectorize');
}

function isLoopUnrollFlag(flagName) {
  const name = String(flagName || '').toLowerCase();
  return name.includes('unroll-loops') && !name.includes('variable-expansion');
}

function isLoopRerollFlag(flagName) {
  const name = String(flagName || '').toLowerCase();
  return name.includes('reroll-loops');
}

export function buildPipelineTrail(flag) {
  if (BOUNDS_SAFETY_FLAGS.has(flag.flag)) {
    return [
      { title: '-fexperimental-bounds-safety', note: 'CC1 option — verified entry point on debad832' },
      { title: 'Option marshalling', note: 'Expected cc1 option-processing path (not individually traced on this page)' },
      { title: 'LangOpts.BoundsSafety', note: 'Language option set by the cc1 flag' },
      { title: 'SemaBoundsSafety', note: 'Verified effect: semantic checks and warning→error promotion' },
      { title: 'AST / attributed types', note: 'Bounds annotations in the frontend type system' },
      { title: 'CodeGen / runtime checks', note: 'Evolving — not demonstrated by the diagnostic experiment on this page' },
    ];
  }

  if (FRAME_POINTER_FLAGS.has(flag.flag) || String(flag.flag || '').includes('frame-pointer')) {
    return [
      { title: 'Clang Driver', note: 'Parse -f(no-)omit-frame-pointer / leaf variants and target -O defaults' },
      { title: 'CC1 / CodeGenOptions', note: 'Emit -mframe-pointer= into FramePointerKind' },
      { title: 'LLVM IR frame-pointer policy', note: 'Function/module frame-pointer attributes (when keep applies)' },
      { title: 'TargetFrameLowering', note: 'hasFP() may still require an FP (VLA, EH, …)' },
      { title: 'Prologue / Epilogue', note: 'Reserve or free the FP register in machine code' },
      { title: 'Machine code + unwind', note: 'Optional unwind metadata / CFI — orthogonal to FP policy' },
    ];
  }

  if (isLoopVectorizeFlag(flag.flag)) {
    return [
      { title: 'Clang Driver', note: 'Parse -f(no-)vectorize; apply shouldEnableVectorizerAtOLevel defaults' },
      { title: 'CC1', note: 'Forward -vectorize-loops when enabled (absent when disabled)' },
      { title: 'CodeGenOpts', note: 'CompilerInvocation records VectorizeLoop for the mid-end' },
      { title: 'PassBuilder', note: 'Schedule LoopVectorize in the optimization pipeline when enabled' },
      { title: 'LoopVectorize', note: 'Widen profitable/legal loops into vector IR' },
      { title: 'Target backend', note: 'Lower vector IR to SIMD / scalar machine code' },
    ];
  }

  if (isSlpVectorizeFlag(flag.flag)) {
    return [
      { title: 'Clang Driver', note: 'Parse -f(no-)slp-vectorize; apply SLP O-level defaults' },
      { title: 'CC1', note: 'Forward -vectorize-slp when enabled' },
      { title: 'CodeGenOpts', note: 'CompilerInvocation records VectorizeSLP' },
      { title: 'PassBuilder', note: 'Schedule SLPVectorizer when enabled' },
      { title: 'SLPVectorizer', note: 'Pack independent scalar ops into vector ops' },
      { title: 'Target backend', note: 'Lower vector IR to SIMD / scalar machine code' },
    ];
  }

  if (isLoopUnrollFlag(flag.flag)) {
    return [
      { title: 'Clang Driver', note: 'Parse -f(no-)unroll-loops; forward last arg to cc1' },
      { title: 'CC1 / CodeGenOpts', note: 'UnrollLoops defaults true when OptLevel > 1; flags override' },
      { title: 'BackendUtil / PassBuilder', note: 'PipelineTuningOptions.LoopUnrolling ← UnrollLoops' },
      { title: 'LoopUnrollPass', note: 'Partial/runtime unroll under cost model + TTI' },
      { title: 'LoopFullUnrollPass', note: 'Full unroll when trip count/cost allow' },
      { title: 'Target backend', note: 'Lower expanded scalar/vector IR to machine code' },
    ];
  }

  if (isLoopRerollFlag(flag.flag)) {
    return [
      { title: 'Clang Driver', note: 'Parse -f(no-)reroll-loops' },
      { title: 'CC1 / CodeGenOpts', note: 'RerollLoops option state' },
      { title: 'PassBuilder', note: 'Schedule loop-reroll when enabled' },
      { title: 'LoopReroll', note: 'Try to collapse unrolled patterns back to compact loops' },
      { title: 'Target backend', note: 'Lower resulting IR' },
    ];
  }

  const steps = [
    { title: 'Options.td', note: 'Driver option table entry' },
    { title: 'Driver.cpp', note: 'Parse and validate spelling' },
    { title: 'CompilerInvocation.cpp', note: 'Apply option state' },
    { title: 'Frontend', note: 'Configure compilation phases' },
    { title: 'LLVM IR', note: 'Lower the selected behavior' },
    { title: 'Optimization', note: 'Transform the IR pipeline' },
    { title: 'Backend', note: 'Select target lowering' },
    { title: 'Object File', note: 'Emit machine code or metadata' },
    { title: 'Executable', note: 'Link the final artifact' },
  ];

  if (flag.category === 'Sanitizer') {
    steps[4] = { title: 'Instrumentation', note: 'Insert sanitizer checks' };
    steps[5] = { title: 'Runtime', note: 'Bind sanitizer support' };
  } else if (flag.category === 'Warning') {
    steps[3] = { title: 'Diagnostics', note: 'Tune warning emission' };
    steps[5] = { title: 'Report', note: 'Surface the diagnostic' };
  }

  return steps;
}

export function buildImplementationTrail(flag) {
  if (BOUNDS_SAFETY_FLAGS.has(flag.flag)) {
    return [
      {
        title: 'Options.td',
        value: 'clang/include/clang/Options/Options.td:2070–2076',
        note: 'defm bounds_safety / experimental-bounds-safety → LangOpts.BoundsSafety (CC1Option only; commit debad832).',
      },
      {
        title: 'LangOptions.def',
        value: 'clang/include/clang/Basic/LangOptions.def:523',
        note: 'LANGOPT(BoundsSafety, …) — bounds-safety language mode toggle.',
      },
      {
        title: 'SemaBoundsSafety.cpp',
        value: 'clang/lib/Sema/SemaBoundsSafety.cpp',
        note: 'Verified on this page: FAM + __counted_by layout checks; warning→error when BoundsSafety is on (~L157–176).',
      },
      {
        title: 'CodeGen (design target)',
        value: 'clang/lib/CodeGen/CodeGenFunction.cpp',
        note: 'Not verified by the -fsyntax-only diagnostic experiment on this page.',
      },
    ];
  }

  if (isLoopVectorizeFlag(flag.flag)) {
    return [
      {
        title: 'Options.td',
        value: flag.sourcePath || 'clang/include/clang/Driver/Options.td',
        note: 'Defines -fvectorize / -fno-vectorize and GCC/MSVC aliases (-ftree-vectorize, -Qvec / -Qvec-).',
      },
      {
        title: 'Driver O-level defaults',
        value: 'ToolChains/Clang.cpp :: shouldEnableVectorizerAtOLevel',
        note: 'Loop vectorize defaults on for OptLevel > 1 and -Os/-Ofast; off for -O0/-O1; -Oz leaves loops off (SLP still considered separately).',
      },
      {
        title: 'Driver forwarding',
        value: 'ToolChains/Clang.cpp',
        note: 'hasFlag(-fvectorize, …, -fno-vectorize, EnableVec) emits cc1 -vectorize-loops when enabled.',
      },
      {
        title: 'Invocation setup',
        value: 'CompilerInvocation.cpp',
        note: 'Records CodeGenOptions::VectorizeLoop from the cc1 -vectorize-loops option.',
      },
      {
        title: 'Pass pipeline',
        value: 'BackendUtil / PassBuilder',
        note: 'Schedules the LoopVectorize pass when VectorizeLoop is set; -fno-vectorize keeps that pass out of the pipeline.',
      },
      {
        title: 'LoopVectorize',
        value: 'llvm/lib/Transforms/Vectorize/LoopVectorize.cpp',
        note: 'Widens legal/profitable loops into vector IR; backend then lowers SIMD or falls back to scalar.',
      },
    ];
  }

  if (isSlpVectorizeFlag(flag.flag)) {
    return [
      {
        title: 'Options.td',
        value: flag.sourcePath || 'clang/include/clang/Driver/Options.td',
        note: 'Defines -fslp-vectorize / -fno-slp-vectorize and tree-slp aliases.',
      },
      {
        title: 'Driver O-level defaults',
        value: 'ToolChains/Clang.cpp :: shouldEnableVectorizerAtOLevel(isSlpVec=true)',
        note: 'SLP defaults on for OptLevel > 1, -Os, -Oz, and -Ofast; off for -O0/-O1.',
      },
      {
        title: 'Driver forwarding',
        value: 'ToolChains/Clang.cpp',
        note: 'Emits cc1 -vectorize-slp when SLP vectorization is enabled.',
      },
      {
        title: 'Pass pipeline',
        value: 'BackendUtil / PassBuilder',
        note: 'Schedules SLPVectorizer independently of LoopVectorize.',
      },
      {
        title: 'SLPVectorizer',
        value: 'llvm/lib/Transforms/Vectorize/SLPVectorizer.cpp',
        note: 'Packs straight-line scalar operations into vector operations.',
      },
    ];
  }

  if (isLoopUnrollFlag(flag.flag)) {
    return [
      {
        title: 'Options.td',
        value: flag.sourcePath || 'clang/include/clang/Driver/Options.td',
        note: 'Defines -funroll-loops / -fno-unroll-loops (ClangOption + CC1Option).',
      },
      {
        title: 'Driver forwarding',
        value: 'ToolChains/Clang.cpp',
        note: 'AddLastArg forwards the last of -funroll-loops / -fno-unroll-loops to cc1 when present.',
      },
      {
        title: 'Invocation setup',
        value: 'CompilerInvocation.cpp',
        note: 'CodeGenOptions::UnrollLoops = hasFlag(..., OptimizationLevel > 1). Explicit flags override the O-level default.',
      },
      {
        title: 'Pass pipeline',
        value: 'BackendUtil.cpp',
        note: 'PipelineTuningOptions.LoopUnrolling / LoopInterleaving follow CodeGenOpts.UnrollLoops.',
      },
      {
        title: 'LoopUnrollPass',
        value: 'llvm/lib/Transforms/Scalar/LoopUnrollPass.cpp',
        note: 'Cost-model + TTI decide partial/runtime/full unroll; not every loop unrolls.',
      },
    ];
  }

  if (flag.flag === "-fno-strict-aliasing" || flag.flag === "-fstrict-aliasing") {
    return [
      {
        title: "Options.td",
        value: flag.sourcePath || "clang/include/clang/Driver/Options.td",
        note: "Defines the public aliasing flag and the internal -relaxed-aliasing cc1 option through TableGen marshalling.",
      },
      {
        title: "Driver forwarding",
        value: "ToolChains/Clang.cpp",
        note: "Resolves -fstrict-aliasing versus -fno-strict-aliasing and forwards -relaxed-aliasing to cc1 when strict aliasing is disabled.",
      },
      {
        title: "Invocation setup",
        value: "CompilerInvocation.cpp",
        note: "Parses the cc1 option into CodeGenOpts.RelaxedAliasing using generated option marshalling.",
      },
      {
        title: "TBAA code generation",
        value: "CodeGenTBAA.cpp",
        note: "Suppresses strict type-based alias metadata where relaxed aliasing requires conservative memory-dependence assumptions.",
      },
      {
        title: "LLVM pipeline",
        value: "Alias analysis → target backend",
        note: "LLVM optimization passes consume the reduced alias information before lowering IR to machine code.",
      },
    ];
  }

  const trail = [
    {
      title: 'Options.td',
      value: flag.sourcePath || 'clang/include/clang/Driver/Options.td',
      note: 'The option is defined in the driver tables and emitted into the generated option database.',
    },
    {
      title: 'Driver parsing',
      value: 'Driver.cpp',
      note: 'The driver resolves the spelling, validates arguments, and forwards the selected semantics.',
    },
    {
      title: 'Invocation setup',
      value: 'CompilerInvocation.cpp',
      note: 'Clang turns command-line flags into structured invocation state for the frontend.',
    },
  ];

  if (flag.category === 'Sanitizer') {
    trail.push(
      {
        title: 'Sanitizer args',
        value: 'SanitizerArgs.cpp',
        note: 'Sanitizer-specific options are collected and normalized before instrumentation is enabled.',
      },
      {
        title: 'Instrumentation',
        value: 'AddressSanitizer / UBSan passes',
        note: 'The compiler injects runtime checks and LLVM IR instrumentation based on the flag.',
      },
    );
    return trail;
  }

  if (flag.category === 'Optimization') {
    trail.push(
      {
        title: 'Pass selection',
        value: 'PassBuilder.cpp',
        note: 'Optimization level controls the pass pipeline and which transformations are scheduled.',
      },
      {
        title: 'LLVM pipeline',
        value: 'LLVM Pass Pipeline',
        note: 'The selected pipeline shapes inlining, vectorization, codegen, and late simplification.',
      },
    );
    return trail;
  }

  if (flag.category === 'Warning') {
    trail.push(
      {
        title: 'Diagnostics',
        value: 'DiagnosticOptions + DiagnosticsEngine',
        note: 'Warning flags alter which diagnostics are enabled, promoted, or suppressed.',
      },
      {
        title: 'Warning groups',
        value: 'DiagnosticGroups.td',
        note: 'Grouped warnings are expanded into fine-grained diagnostics during option processing.',
      },
    );
    return trail;
  }

  if (flag.category === 'Preprocessor') {
    trail.push(
      {
        title: 'Preprocessor config',
        value: 'PreprocessorOptions',
        note: 'Macro expansion, include paths, and conditional compilation are configured early.',
      },
      {
        title: 'Frontend impact',
        value: 'PPCallbacks / lexer setup',
        note: 'Preprocessor toggles influence tokenization and how source is fed into the parser.',
      },
    );
    return trail;
  }

  trail.push(
    {
      title: 'Code generation',
      value: 'CodeGenOptions / TargetInfo',
      note: 'The frontend lowers the option into codegen knobs that shape emitted IR and object code.',
    },
    {
      title: 'Backend effect',
      value: 'LLVM IR + target backend',
      note: 'The backend consumes the invocation state when generating the final machine code.',
    },
  );
  return trail;
}
