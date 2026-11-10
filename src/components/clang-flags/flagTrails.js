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
  '-mframe-pointer=',
]);

function isFramePointerFlag(flag) {
  const name = String(flag?.flag || '');
  return FRAME_POINTER_FLAGS.has(name) || name.includes('frame-pointer');
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

  if (isFramePointerFlag(flag)) {
    return [
      { title: 'Clang Driver', note: 'Parse -f(no-)omit-frame-pointer / leaf variants and target -O defaults' },
      { title: 'CC1 / CodeGenOptions', note: 'Emit -mframe-pointer= into FramePointerKind' },
      { title: 'LLVM IR frame-pointer policy', note: 'Function/module frame-pointer attributes (when keep applies)' },
      { title: 'TargetFrameLowering', note: 'hasFP() may still require an FP (VLA, EH, …)' },
      { title: 'Prologue / Epilogue', note: 'Reserve or free the FP register in machine code' },
      { title: 'Machine code + unwind', note: 'Optional .eh_frame / CFI — orthogonal to FP policy' },
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

  if (isFramePointerFlag(flag)) {
    return [
      {
        title: 'Options.td',
        value: flag.sourcePath || 'clang/include/clang/Driver/Options.td',
        note: 'Defines -f(no-)omit-frame-pointer, leaf omit variants, and -mframe-pointer=.',
      },
      {
        title: 'Driver policy',
        value: 'ToolChains/CommonArgs.cpp',
        note: 'getFramePointerKind / useFramePointerForTargetByDefault / areOptimizationsEnabled select -mframe-pointer=.',
      },
      {
        title: 'CodeGenOptions',
        value: 'CodeGenOptions::FramePointerKind',
        note: 'CC1 stores the keep/omit/non-leaf/reserved policy for codegen.',
      },
      {
        title: 'IR policy attrs',
        value: 'LLVM IR "frame-pointer" attribute / module flag',
        note: 'Keep policies commonly emit attributes; omit may leave them absent — inspect IR on your version.',
      },
      {
        title: 'Frame lowering',
        value: 'TargetFrameLowering::hasFP (e.g. X86FrameLowering)',
        note: 'Backend may still require an FP for VLAs, realignment, EH helpers, or ABI constraints.',
      },
      {
        title: 'Prologue / unwind',
        value: 'Machine prologue/epilogue + optional .eh_frame',
        note: 'FP policy is separate from -funwind-tables / -fasynchronous-unwind-tables and from -g.',
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
