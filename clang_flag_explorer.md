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
   - **How it works inside Clang**: include an Implementation subsection and a compact stage table covering option definition, driver parsing/forwarding, invocation setup, code generation, LLVM IR/TBAA or target effect, backend, and linker.
   - **Clang version history**: primary-source table; prefer “Present by X” when introduction is unresolved; separate Flang rows.
   - **Related LLVM Optimizations & Backend Mechanisms** (required; before Key facts): classify IR-opt / backend / instrumentation / diagnostic / ABI; relationship labels only: Directly controlled | Indirectly affected | Backend mechanism | Related mechanism | No direct pass. Include How to verify + Source investigation. No invented pass names.
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
11. After writing, sanity-check:
   - `{/* HAND_AUTHORED */}` present; CTA one-liner; Related LLVM before Key facts
   - hero meta / relatedFlags / trails match the mechanism
   - O-level defaults table present when applicable
   - no fake measurements or unsupported source claims
   - `git diff --check` passes

Deliverable: the completed MDX and only necessary JSON / FlagArticleShell / flagTrails tweaks.
