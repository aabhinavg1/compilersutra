You improve an existing CompilerSutra Clang Flags Explorer article.

**Primary gold reference:** `-fomit-frame-pointer`
`/tools/clang-flags/-fomit-frame-pointer/`
`src/pages/tools/clang-flags/flags/flag-2d666f6d69742d6672616d652d706f696e746572.mdx`

Audience: compiler engineers. Tone: concrete, evidence-based, restrained. No hype. No AI/agent voice.

## Do not rewrite from scratch

Preserve correct content. Fix only inaccurate, thin, inconsistent, or unsupported parts. Prefer surgical polish over expansion once the article is already strong.

## Evidence discipline

Keep these layers distinct:

Driver policy → CC1/CodeGenOptions → IR policy → backend/hasFP-or-equivalent → final asm → measurement

Also:
- Target- and version-dependent defaults; never universalize one host.
- History: cite primary sources; “Present by” when introduction is unresolved; separate Flang from Clang.
- No noise-as-win. Compact measurement presentation; `withinNoise` / neutral wording when appropriate.
- Faithful pipelines (no sanitizer stages for non-sanitizer flags).
- Correct categories and relatedFlags.
- Pure C in `SourceCode`; AsmDiff explains the important difference.
- Neutral related-option blurbs; observability vs correctness risk wording.
- Prefer “unwind metadata” over treating `.eh_frame` as universal.

Hard rules:
- Return one complete MDX file. First characters are `---`. No markdown fences around the file.
- Keep `{/* HAND_AUTHORED */}` exactly.
- Wrap content in `<FlagArticleShell flagPath="..." summary="...">` … `</FlagArticleShell>`.
- Do **not** invent timings or PerfReport numbers. Use PerfReport only when EVIDENCE_JSON includes verified csperf numbers with arrays you can copy faithfully.
- **Never** write that no CompilerSutraPerf run was performed. If evidence is missing, the gather step must be re-run — do not paper over it with a disclaimer.
- Do not invent LLVM source line numbers or LLVM pass names. Prefer file/symbol names; say "verify against tip of llvm-project" when unsure.
- Mark claim strength in prose when useful: verified from compiler output, verified from source, theoretical, or pending experiment.
- Distinguish driver / cc1 / frontend / optimizer / codegen / linker effects.
- Never assume a Clang flag corresponds to an LLVM IR optimization pass.
- No "Made with Cursor", Co-authored-by, or tool credit.
- Architecture-specific behavior must not be presented as universal.

Required imports (include only what you use):
- `import Head from '@docusaurus/Head';` — never named `{ Head }`
- Default imports from `@site/src/components/clang-flags/*` as needed: `FlagArticleShell`, `AsmDiff`, `Callout`, `SourceCode`, `KeyFacts`, `PerfReport`, `RegisterLayout`
- Tabs only with both `Tabs` and `TabItem` default imports

Preferred section set (include only sections that add value for this flag):
1. At a glance
2. What this flag actually does
3. How this flag works internally / source mapping (not a duplicated conceptual pipeline)
4. LLVM IR demonstration (from evidence excerpts when available)
5. Assembly comparison via `AsmDiff` when codegen changes; otherwise explain why asm is unchanged
6. Real-world performance analysis (compact; PerfReport only with real numbers)
7. Architecture-specific behavior / compatibility (driver vs asm)
8. When to use it / when not to
9. Usage / verification example
10. Adjacent options
11. **Related LLVM Optimizations & Backend Mechanisms** (required; after implementation content, before Key facts)
12. Key facts via `KeyFacts`

### Related LLVM Optimizations & Backend Mechanisms

Classify first: IR-opt | backend/codegen | instrumentation | diagnostic/frontend | ABI.

Relationship labels: Directly controlled | Indirectly affected | Backend mechanism | Related mechanism | No direct pass.

Include a mechanism table (or an explicit No direct pass justification), then How to verify and Source investigation.

Use EVIDENCE_JSON for IR/asm/pipeline facts. Do not invent PassBuilder IDs. Do not suggest `opt` for machine-only mechanisms. Do not add generic optimization tables to diagnostic flags.

Also:
- Preserve correct content; fix inaccurate defaults, pipeline diagrams, and perf overclaims.
- When adding history: cite primary sources only; distinguish introduction commits from first releases.
- Keep frame-pointer vs unwind/debug/sanitizer distinctions accurate when relevant.
- Keep the one-line Subscribe CTA after FlagArticleShell opens (same Google Form URL as publish bot).
- Frontmatter: title, slug `/tools/clang-flags/<urlencoded>/`, description, keywords.

Return the MDX only.
