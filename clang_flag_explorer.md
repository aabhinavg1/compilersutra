Write a hand-authored Clang flag article matching the quality and structure of the **twin gold references**:

1. `src/pages/tools/clang-flags/flags/flag-2d666f6d69742d6672616d652d706f696e746572.mdx` (`-fomit-frame-pointer`) — backend / frame-pointer policy
2. `src/pages/tools/clang-flags/flags/flag-2d666e6f2d766563746f72697a65.mdx` (`-fno-vectorize`) — mid-end / O-level-gated LoopVectorize

Secondary layout-only example when useful: `flag-2d6663616c6c2d73617665642d783130.mdx` (`-fcall-saved-x10`).

Agent skill: `compilersutra-clang-flags` (plus `compilersutra-mdx` for CTA/Head/MDX hard rules).
Bot prompts: `scripts/clang-flags-bot/prompts/clang-flag-{article,improve}.{system,user}.md`.

Target flag: <FLAG_NAME>

Requirements:

1. Edit the existing generated MDX for that flag under `src/pages/tools/clang-flags/flags/`. Keep `{/* HAND_AUTHORED */}` exactly so `generate-clang-flag-pages.mjs` does not overwrite it. Do not invent a new path scheme.
2. Wrap the article in `FlagArticleShell` with the correct `flagPath` and a precise one-line summary (“Request that Clang …” when it is a policy request).
3. Keep the article technically exact and evidence-based:
   - Use compiler-engineering terminology: say accesses may alias, accesses do not normally refer to the same object, or the compiler conservatively assumes they may alias.
   - Do not describe aliasing as merely a relationship between pointer values.
   - Do not claim a flag fixes undefined behavior unless the language rules actually say so.
   - Distinguish driver options, `cc1` options, frontend/codegen state, LLVM IR metadata, backend lowering, and linking.
4. Use these components where they fit:
   - `KeyFacts`, `Callout`, `SourceCode`, `AsmDiff`, `PerfReport`
   - `RegisterLayout` only for ABI/register flags, passing the register name.
5. Required sections, in this order and with the same practical spirit as the gold pages:
   - **At a glance**: architecture, category, pipeline, compiler, optimization-level behavior, risk, plus a one-line summary.
   - **What this flag actually does**: mechanics, defaults, interactions, and semantic limits; avoid marketing language.
   - **Option map and precedence**: when siblings/aliases/`-m*` exist.
   - **Defaults by optimization level**: **required** when `-O*` changes the flag’s default or enables the mechanism. Build the table from `clang -###` on a named host+triple+version. Explicitly state **which `-O` introduces / flips** the default. If O-level does not affect the flag, say so with evidence.
   - **Minimal realistic example**: use `SourceCode`; make the compiler-visible effect clear.
   - **Before vs. after assembly**: use real `clang -S` or `objdump` output; state compiler version, optimization level, target triple, and relevant source/command.
   - Do not use identical or illustrative before/after assembly as a placeholder. If the flag acts in preprocessing, diagnostics, language selection, or debug metadata, show the appropriate observable artifact (`-E`, diagnostics, `-###`, IR, or object sections) and explain why machine instructions are unchanged.
   - Keep `SourceCode` examples genuinely multiline and readable in the rendered page; do not pass a long one-line JSX string when formatted source is required.
   - **Why use it / when not to use it**: include ABI, portability, correctness, and build-consistency warnings where relevant.
   - **Performance impact**: explain qualitative tradeoffs. Use `PerfReport` only with real measurements obtained by actually running [CompilerSutraPerf](https://www.compilersutra.com/docs/project/compilersutra-perf/) (`csperf`, [PyPI](https://pypi.org/project/compilersutra-perf/)) or its documented CLI. Include the without/with arrays, workload, machine, compiler, trial setup, limitations, and exact reproduction commands. Run the commands in the workspace before reporting any numbers; never invent, estimate, or copy placeholder measurements. If the tool or workload cannot be run, say so and omit `PerfReport` data.
   - Link the `CompilerSutraPerf` name to the in-site docs and https://pypi.org/project/compilersutra-perf/ whenever measurements are reported.
   - Format reproduction commands for mobile and desktop: wrap commands line-by-line, avoid repeating long absolute paths, and use tabs or separate compact blocks for comparison variants.
   - **Compatibility**: table covering Clang, GCC, MSVC where relevant, language modes, and target restrictions. Distinguish driver policy vs final asm.
   - **Usage example**: exact, copy-pasteable Clang command lines; include `-###` or IR inspection when useful.
   - **Adjacent options**: siblings, inverse/negative form, related optimization controls, and internal options only when clearly labeled.
   - **How it works inside Clang**: include an `Implementation` subsection and a compact stage table covering option definition, driver parsing/forwarding, invocation setup, code generation, LLVM IR/TBAA or target effect, backend, and linker.
   - **Related LLVM Optimizations & Backend Mechanisms** (required; see §13): after “How it works inside Clang”, before “Key facts”. Map optimization passes and/or backend mechanisms with relationship classification, verification commands, and upstream source links. Do not invent passes. Diagnostic/frontend flags may state `No direct pass` with a short justification instead of a fake optimization table.
   - **Key facts** footer using `KeyFacts`.
6. Hero “More Support” meta + metadata:
   - Fix `static/data/clang-flags.json` `category`, `help`, `documentation`, `relatedFlags`, `whenToUse` / `whenNotToUse`.
   - Fill help text for every related flag you list (empty help → “No help text available” in the UI).
   - Add FlagArticleShell / flagTrails special-cases when Architecture / Optimization / Pipeline would otherwise be wrong.
   - Never insert Instrumentation → Runtime in the shell pipeline unless the flag is instrumentation.
7. Implementation/source-link requirements:
   - Link directly to upstream LLVM source on GitHub (tag-pinned when citing a verified baseline).
   - Include concrete symbols; verify line numbers before publishing; do not guess stale locations.
   - Use a Mermaid flowchart for multi-stage pipelines when useful — do not duplicate the shell overview pipeline.
8. SEO and page metadata are required:
   - Frontmatter `keywords` + descriptive `description`.
   - Import Head as a default export only: `import Head from '@docusaurus/Head';`. Never `import { Head }`.
   - Keep `Head` metadata aligned with the page.
9. Add the mailing-list CTA immediately after `FlagArticleShell` opens — **entire `<a>...</a>` on one line** (see skill `compilersutra-mdx`).
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

14. Historical research, teaching quality, and QA (shared standard)

Gold teaching + history reference: the hand-authored `-fomit-frame-pointer` page.

### 14.1 Historical research

When a flag article includes version history (recommended for long-lived driver/codegen flags):

- Verify introduction using Git history **and** release tags. An early commit is not automatically the first released version.
- Prefer Options.td / release notes / Phabricator or GitHub reviews as primary sources.
- Track only **meaningful** behavior or encoding changes (driver defaults, IR attribute encoding, target-specific defaults). Skip speculative per-release filler.
- Cite commit hashes, review IDs, and release-note anchors.
- Separate Clang C/C++ behavior from Flang or other frontends.
- If the first released version cannot be established, say so explicitly.
- Never invent historical milestones.

Suggested table (place near defaults / compatibility):

| Clang / LLVM version | Change | Practical impact | Evidence |

### 14.2 Technical correctness reminders

- Separate **driver policy** (`clang -###` → `-mframe-pointer=` / equivalent) from **final asm** (`clang -S`).
- Defaults are **target- and version-dependent**; never present one host clang as universal.
- Label claims: Verified experimentally / Verified from source / Documented / Not yet verified.
- Frame pointers ≠ stack frames ≠ DWARF CFI ≠ `.eh_frame` ≠ exception tables ≠ `-g` debug info.
- Do not put sanitizer/runtime stages in the mandatory pipeline diagram for non-sanitizer flags.
- Keep `FlagArticleShell` pipeline/implementation trails (`flagTrails.js`) faithful to the same mechanism as the MDX narrative; fix wrong `clang-flags.json` categories (e.g. do not classify frame-pointer policy as Sanitizer) and strip unrelated `relatedFlags`.
- Do not label target-sensitive codegen flags as ABI specifications or as universally “target-independent.”
- Benchmarks: never convert measurement noise into a performance win; use `PerfReport` `withinNoise` for neutral presentation; preserve methodology, environment, and limitations. Do not treat lower stdev across few trials as a win.
- Explain every `-mframe-pointer=` enum you list (`reserved` ≠ conventional FP setup; version-gate when needed). Prefer observability wording over “high risk” for profiler impact.
- One overview pipeline; later sections name source responsibilities. Prefer pure C in `SourceCode` examples (put the flag only in shell commands). Related flags need non-empty help text. Collapse duplicate PerfReport means into one measurement table once noise is stated.
- After the omit-FP gold page is polished, prioritize consistency across other HAND_AUTHORED flag pages over further expansion of that page.

### 14.3 Teaching quality

- Open with the problem the flag addresses in plain language (assume basic C/C++, not LLVM literacy).
- One mechanism at a time; short prose then a command or tiny example.
- Include a copy-paste verification workflow: `--version`, `-###`, `-S -emit-llvm`, `-S`, `llvm-objdump` / `readelf` as appropriate.
- Avoid marketing language, duplicated sections, and unexplained jargon.

### 14.4 Quality assurance before publish

- Links resolve; Mermaid/MDX valid; `{/* HAND_AUTHORED */}` retained; CTA one-liner intact.
- Examples name compiler version + target triple + exact command.
- Site build succeeds for touched pages.
- Mobile-friendly command wrapping for long lines.

Deliverable: the completed MDX and only necessary JSON / FlagArticleShell / flagTrails tweaks.
