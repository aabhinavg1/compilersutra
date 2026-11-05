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
   - no fake measurements or unsupported source claims were introduced.

Deliverable: the completed MDX and only necessary tiny component tweaks.
