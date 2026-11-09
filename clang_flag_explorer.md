Write a hand-authored Clang flag article matching the quality and structure of:

src/pages/tools/clang-flags/flags/flag-2d6663616c6c2d73617665642d783130.mdx
(-fcall-saved-x10)

Target flag: <FLAG_NAME>

Requirements:

1. Edit the existing generated MDX for that flag under `src/pages/tools/clang-flags/flags/`. Keep `{/* HAND_AUTHORED */}` exactly so `generate-clang-flag-pages.mjs` does not overwrite it. Do not invent a new path scheme.
2. Wrap the article in `FlagArticleShell` with the correct `flagPath` and a precise one-line summary.
3. Keep the article technically exact and evidence-based:
   - Use compiler-engineering terminology: say accesses may alias, accesses do not normally refer to the same object, or the compiler conservatively assumes they may alias.
   - Do not describe aliasing as merely a relationship between pointer values.
   - Do not claim a flag fixes undefined behavior unless the language rules actually say so.
   - Distinguish driver options, `cc1` options, frontend/codegen state, LLVM IR metadata, backend lowering, and linking.
4. Use these components where they fit:
   - `KeyFacts`, `Callout`, `SourceCode`, `AsmDiff`, `PerfReport`
   - `RegisterLayout` only for ABI/register flags, passing the register name.
5. Required sections, in this order and with the same practical spirit as `-fcall-saved-x10`:
   - **At a glance**: table containing architecture, category, compiler, optimization behavior, risk, plus a one-line summary.
   - **What this flag actually does**: explain mechanics, defaults, interactions, and semantic limits; avoid marketing language.
   - **Minimal realistic example**: use `SourceCode`; make the compiler-visible effect clear.
   - **Before vs. after assembly**: use real `clang -S` or `objdump` output; state compiler version, optimization level, target triple, and relevant source/command.
   - Do not use identical or illustrative before/after assembly as a placeholder. If the flag acts in preprocessing, diagnostics, language selection, or debug metadata, show the appropriate observable artifact (`-E`, diagnostics, `-###`, IR, or object sections) and explain why machine instructions are unchanged.
   - Keep `SourceCode` examples genuinely multiline and readable in the rendered page; do not pass a long one-line JSX string when formatted source is required.
   - **Why use it / when not to use it**: include ABI, portability, correctness, and build-consistency warnings where relevant.
   - **Performance impact**: explain qualitative tradeoffs. Use `PerfReport` only with real measurements obtained by actually running [CompilerSutraPerf](https://www.compilersutra.com/docs/project/compilersutra-perf/) (`csperf`, [PyPI](https://pypi.org/project/compilersutra-perf/)) or its documented CLI. Include the without/with arrays, workload, machine, compiler, trial setup, limitations, and exact reproduction commands. Run the commands in the workspace before reporting any numbers; never invent, estimate, or copy placeholder measurements. If the tool or workload cannot be run, say so and omit `PerfReport` data.
   - Link the `CompilerSutraPerf` name to the in-site docs and https://pypi.org/project/compilersutra-perf/ whenever measurements are reported.
   - Format reproduction commands for mobile and desktop: wrap commands line-by-line, avoid repeating long absolute paths, and use tabs or separate compact blocks for comparison variants.
   - **Compatibility**: table covering Clang, GCC, MSVC where relevant, language modes, and target restrictions.
   - **Usage example**: exact, copy-pasteable Clang command lines; include `-###` or IR inspection when useful.
   - **Adjacent options**: siblings, inverse/negative form, related optimization controls, and internal options only when clearly labeled.
   - **How it works inside Clang**: include an `Implementation` subsection and a compact stage table covering option definition, driver parsing/forwarding, invocation setup, code generation, LLVM IR/TBAA or target effect, backend, and linker.
   - **Related LLVM Optimizations & Backend Mechanisms** (required; see §13): after “How it works inside Clang”, before “Key facts”. Map optimization passes and/or backend mechanisms with relationship classification, verification commands, and upstream source links. Do not invent passes. Diagnostic/frontend flags may state `No direct pass` with a short justification instead of a fake optimization table.
   - **Key facts** footer using `KeyFacts`.
6. Implementation/source-link requirements:
   - Link directly to the current upstream LLVM source on GitHub, not just plain file paths.
   - Include concrete symbols and line-numbered links where possible. For this flag family, check the current upstream locations for `clang/include/clang/Options/Options.td`, `clang/lib/Driver/ToolChains/Clang.cpp`, `clang/lib/Frontend/CompilerInvocation.cpp`, `clang/lib/CodeGen/CodeGenTBAA.cpp`, and relevant LLVM documentation.
   - For optimization-level articles, include an Implementation subsection with a stage table naming current line-linked symbols for option definition, driver parsing, invocation setup, CodeGenOptions, BackendUtil/PassBuilder pipeline selection, LLVM pass behavior, target backend, and linker; verify every line range against upstream before publishing.
   - For non-optimization flags, make the same table mechanism-specific: identify the actual frontend, diagnostic, preprocessor, target, sanitizer, debug-info, runtime, or linker symbols instead of copying an optimization pipeline. Do not describe a stage as consuming the flag if it only receives transformed state.
   - Verify line numbers against the current upstream source before writing them; do not guess stale locations.
   - Use a Mermaid flowchart for multi-stage driver/frontend/IR/backend pipelines whenever the article explains three or more dependent compilation stages. Keep labels concise and technically accurate; do not use Mermaid as decoration.
7. SEO and page metadata are required:
   - Add a useful frontmatter `keywords` list with the flag spelling, inverse/sibling spellings, Clang/GCC terms, language terms, LLVM/TBAA terms, and relevant optimization concepts.
   - Write a descriptive, search-friendly frontmatter `description` that names the flag, Clang, the affected compiler mechanism, and C/C++ or target scope as applicable.
   - Import Head as a default export only: `import Head from '@docusaurus/Head';`. Never `import { Head }` (undefined → Vercel `Element type is invalid`).
   - Keep `Head` metadata aligned with the page: `keywords`, `og:title`, `og:description`, `og:type`, and Twitter title/description. Do not keyword-stuff or make claims unsupported by the article.
8. Use Docusaurus Markdown extensions where they improve clarity:
   - Use `:::tip` for practical guidance or a safe workflow.
   - Use `:::caution` for correctness, ABI, portability, or undefined-behavior warnings.
   - Use `:::important` for build-wide or contract-level requirements.
   - Use `:::note` for version, target, measurement, or implementation caveats.
   - Use `tabs` and `tabItem` when presenting equivalent C/C++ commands, compiler variants, target variants, or before/after workflows. Do not force tabs around a single command.

9. Add the existing mailing-list CTA near the top of the article, immediately after `FlagArticleShell` opens:
   - Use the established Google Forms URL: `https://docs.google.com/forms/d/e/1FAIpQLSebP1JfLFDp0ckTxOhODKPNVeI1e21rUqMJ0fbBwJoaa-i4Yw/viewform`.
   - Use a centered, visible Docusaurus CTA: `className="button button--primary button--lg"`.
   - Label it `✉ Subscribe to Weekly Compiler Notes` and add a short supporting line about practical LLVM/Clang/compiler-engineering notes.
   - Open external links with `target="_blank"` and `rel="noopener noreferrer"`; include an accessible `aria-label`.
   - MDX-critical: keep the entire `<a>...</a>` on a single line. Do not put the link text on its own line between the tags (MDX treats that as a markdown paragraph and the build fails with `end-tag-mismatch` on `</a>`). Prefer this exact shape:
     `<div className="text--center margin-bottom--md"><a className="button button--primary button--lg" href="https://docs.google.com/forms/d/e/1FAIpQLSebP1JfLFDp0ckTxOhODKPNVeI1e21rUqMJ0fbBwJoaa-i4Yw/viewform" target="_blank" rel="noopener noreferrer" aria-label="Subscribe to CompilerSutra Weekly Compiler Notes">✉ Subscribe to Weekly Compiler Notes</a><p className="margin-top--sm">Practical LLVM, Clang, and compiler-engineering notes delivered weekly.</p></div>`
10. Tone: technical reference for compiler engineers. Concrete, measured, ABI-honest. No hype, no “AI/agent” voice, no filler.
11. Keep CSS/components as-is unless a small prop/CSS fix is required for this flag’s content.
12. After writing, sanity-check:
   - the exact generated page path and slug;
   - responsive rendering of long commands and comparison blocks on mobile and desktop;
   - performance claims link to CompilerSutraPerf docs and PyPI when measurements are used;
   - `{/* HAND_AUTHORED */}` is still present;
   - all links and source paths are correct;
   - Mermaid/MDX syntax is valid;
   - `git diff --check` passes;
   - no fake measurements or unsupported source claims were introduced;
   - Related LLVM Optimizations & Backend Mechanisms uses only evidence-backed pass/mechanism names and relationship labels.

13. Related LLVM Optimizations & Backend Mechanisms (shared standard)

Every published flag article must help the reader trace:

**Clang flag → Driver → Frontend → LLVM IR → Optimization passes / Backend mechanisms → Machine code → Runtime behavior**

using source evidence and, where applicable, IR/asm/`csperf` verification. Do **not** assume every Clang flag corresponds to an LLVM IR optimization pass.

### 13.1 Classify the flag before mapping

| Category | Examples | Investigate |
| :--- | :--- | :--- |
| **A. LLVM IR optimization** | `-fvectorize`, `-fslp-vectorize`, `-fstrict-aliasing`, `-fmerge-functions`, `-O*` | IR passes / analyses actually gated or influenced by the flag |
| **B. Backend / code generation** | `-fomit-frame-pointer`, `-fno-omit-frame-pointer`, `-ffixed-x10`, `-fcall-saved-x10` | Frame lowering, regalloc, ISel, prologue/epilogue, spills — **not** IR opt passes by default |
| **C. Instrumentation** | `-fsanitize=*`, `-fprofile-instr-generate` | Frontend instrumentation, IR instrumentation passes, metadata, runtimes, link deps |
| **D. Diagnostic / frontend** | `-Wall`, `-Wextra`, `-Werror`, `-D`, `-I`, `-std=` | Diagnostics, preprocessing, language mode — **No direct pass** unless evidence shows otherwise |
| **E. ABI / calling convention** | register / visibility / ABI flags | Calling convention, register preservation, param/return lowering, `RegisterLayout` when useful |

### 13.2 Relationship labels (required vocabulary)

| Relationship | Meaning |
| :--- | :--- |
| **Directly controlled** | The flag directly enables, disables, or configures the pass/mechanism |
| **Indirectly affected** | The flag changes compiler state or IR that influences later optimization/codegen |
| **Backend mechanism** | Target-specific ISel, regalloc, frame lowering, or emission |
| **Related mechanism** | Useful context; not directly controlled by the flag |
| **No direct pass** | No LLVM IR optimization pass correspondence |

Never invent a pass name. Never claim a backend mechanism is “directly enabled” without source evidence.

### 13.3 Per-entry fields

For each relevant mechanism/pass, document:

- Name
- Compiler stage
- LLVM pass name or source symbol (when applicable)
- Relationship classification
- What it changes
- How to verify
- Upstream LLVM source link (current revision; prefer the commit recorded in `static/data/clang-flags.json` when available)

### 13.4 Section presentation

Place this section **after** `## How it works inside Clang` and **before** `## Key facts`.

Title:

```markdown
## Related LLVM Optimizations & Backend Mechanisms
```

Preferred table:

| Mechanism | Stage | Relationship | Effect |
| :--- | :--- | :--- | :--- |
| … | Backend / LLVM IR / Frontend / … | Directly controlled / … | Concrete behavior |

Then:

#### How to verify

Give commands that match the mechanism. Valid tools include `clang -###`, `clang -emit-llvm -S`, `opt -passes=...`, `llc`, `llvm-objdump`, `llvm-readobj`, and `-mllvm -print-pipeline-passes` / `-debug-pass-manager` when supported.

- Do **not** suggest `opt` for behavior that exists only in target machine-code generation.
- Distinguish Clang’s pipeline from a separately constructed `opt` pipeline.
- When useful, show IR function attributes, metadata, optimization remarks, MIR, assembly, object sections, or unwind info.

#### Source investigation

Link the actual files/symbols involved (for example under `clang/include/clang/Driver/Options.td` or `clang/include/clang/Options/Options.td`, `clang/lib/Driver/`, `clang/lib/CodeGen/`, `llvm/lib/Passes/`, `llvm/lib/Transforms/`, `llvm/lib/CodeGen/`, `llvm/lib/Target/`). Do not pad with unrelated paths.

### 13.5 Investigation method (source + IR verification)

For optimization-related flags, perform two independent stages before writing claims:

1. **Source-code pipeline discovery**: Options.td → driver → cc1/codegen options → PassBuilder / target lowering. Record symbols and line ranges from the checked-out LLVM revision.
2. **IR-level experimental verification**: generate IR with/without the flag; print the pass pipeline when supported; run targeted `opt` only when the pass is IR-level; diff IR; compare assembly for codegen flags.

Three-way rule:

- Source explains **why** something is scheduled.
- Pipeline logs confirm **what executed**.
- IR/asm diffs confirm **what changed**.

Do not confuse: registered ≠ scheduled ≠ executed ≠ transformed IR ≠ better machine code.

For backend-only flags (reference: `-fomit-frame-pointer`):

- Report `No direct pass` / backend mechanisms.
- Do **not** call the flag an LLVM optimization pass.
- Do **not** claim it universally frees a GPR or that all stack allocations disappear.
- Distinguish **frame-pointer omission** from **stack-frame elimination**.
- Separate unwind/CFI metadata from dedicated FP register usage.
- Note target-specific defaults (e.g. Darwin often keeps frame pointers).

Gold structural example for this section: the hand-authored `-fomit-frame-pointer` article.

### 13.6 Optional explorer metadata (`optimizationMapping`)

`static/data/clang-flags.json` is generated from Options.td with a fixed option field set. Optional, backward-compatible enrichment may add:

```json
{
  "optimizationMapping": {
    "category": "backend",
    "passes": [],
    "mechanisms": [
      {
        "name": "Machine Frame Lowering",
        "stage": "backend",
        "relationship": "directly-controlled",
        "description": "Controls target-specific frame-pointer decisions.",
        "sourceFiles": ["llvm/lib/CodeGen/"],
        "verification": ["clang -S", "llc"]
      }
    ]
  }
}
```

Use empty arrays or omit the field when nothing applies. Do **not** fabricate mappings in bulk JSON. Hand-authored MDX remains the source of truth until a generator consumes this field. Preserve existing option keys and page-generation scripts.

Deliverable: the completed MDX and only necessary tiny component tweaks.
