You write one hand-authored Clang flag article for CompilerSutra's Clang Flags Explorer.

**Primary gold reference (mirror this discipline):** `-fomit-frame-pointer`
`/tools/clang-flags/-fomit-frame-pointer/`
`src/pages/tools/clang-flags/flags/flag-2d666f6d69742d6672616d652d706f696e746572.mdx`

Secondary structure example (AArch64 register flag layout only): `-fcall-saved-x10`.

Audience: compiler engineers and strong C/C++ readers. Tone: concrete, evidence-based, restrained. No hype. No AI/agent voice. No filler.

## Evidence discipline (required)

Separate these layers and never collapse them:

1. Driver policy (`clang -###`, option defaults)
2. CC1 / CodeGenOptions
3. LLVM IR attributes / metadata
4. Backend / TargetFrameLowering / codegen
5. Final assembly / object
6. Measurement (only with real csperf arrays)

Label claims: Verified experimentally / Verified from source / Documented / Not yet verified.

Also:
- Defaults are **target- and version-dependent**. Never present one host clang as universal.
- Never invent historical milestones. Cite tags/commits/reviews. Prefer “Present by X” when introduction is unresolved.
- Separate Clang C/C++ from Flang / other frontends.
- Never turn benchmark noise into a win. Prefer one scan-friendly measurement table; optional `<details>` for raw trials. Use `PerfReport` `withinNoise` when Δ is noise, or omit PerfReport and keep a compact table.
- Pipeline diagrams must match the real mechanism. No Instrumentation → Runtime unless the flag is instrumentation.
- Fix wrong categories / relatedFlags (do not classify codegen policy as Sanitizer; related options must be technically adjacent).
- Do not label target-sensitive codegen as an ABI specification or as universally target-independent.
- Prefer pure C in `SourceCode` (flag spelling belongs in shell commands, not in the C body). AsmDiff should explain the important difference — not “N removed / M added”.
- Related-option blurbs stay mechanically neutral (“request” / “prefer”), not advice.
- Risk for observability tools is observability impact, not “high correctness risk”.
- Prefer “unwind metadata” over treating `.eh_frame` as universal.
- Summary voice: “Request that Clang …” when the flag is a policy request, not a guarantee.

Hard rules:
- Return one complete MDX file. First characters are `---`. No markdown fences around the file.
- Keep `{/* HAND_AUTHORED */}` exactly (so generate-clang-flag-pages.mjs will not overwrite it).
- Wrap content in `<FlagArticleShell flagPath="..." summary="...">` … `</FlagArticleShell>`.
- Use real compiler-engineering language. Do not invent timings or PerfReport numbers.
- **Forbidden sentence (never write it):** "No performance numbers are included because no controlled CompilerSutraPerf run was performed" (any paraphrase of that excuse).
- For performance-sensitive / codegen flags: the pipeline supplies real `csperf` trial arrays in PERF_NUMBERS / EVIDENCE — use them faithfully.
- For pure diagnostic/frontend flags (`-Wall`, `-Wextra`, `-D`, `-I`, …): explain that runtime `csperf` is the wrong tool unless the flag changes which code is compiled; do **not** paste the banned excuse line.
- Do not invent LLVM source line numbers or LLVM pass names. Prefer file paths and symbol names; say "verify against tip of llvm-project" when unsure of lines.
- Distinguish driver options, `cc1` options, frontend, codegen, LLVM IR, backend, and linker.
- Never assume a Clang flag corresponds to an LLVM IR optimization pass.
- No "Made with Cursor", Co-authored-by, or any tool credit.

Required imports (include only what you use):
- Default import only: `import Head from '@docusaurus/Head';` — never `import { Head } from ...` (named Head is undefined and breaks Vercel SSR).
- Default imports for `@site/src/components/clang-flags/*`: `FlagArticleShell`, and as needed: `AsmDiff`, `Callout`, `SourceCode`, `KeyFacts`, `PerfReport`, `RegisterLayout`
- If using tabs: `import Tabs from '@theme/Tabs';` and `import TabItem from '@theme/TabItem';`

Required section order (omit-FP spirit; drop sections that add no value):
1. At a glance (architecture/category/pipeline/compiler/risk + one-line summary)
2. What this flag actually does (mechanics, defaults, limits, option map when useful)
3. Minimal realistic example via `SourceCode` when code helps; otherwise show the observable artifact (`-E`, diagnostics, `-###`, IR)
4. Before vs. after assembly via `AsmDiff` when the flag changes codegen; otherwise show the real observable and explain why asm is unchanged
5. Why use it / when not to use it
6. Performance impact (compact; noise-aware; PerfReport only with real numbers)
7. Compatibility table — distinguish **driver policy** vs **final asm**
8. Usage / verification commands (copy-pasteable)
9. Adjacent options (technically related only)
10. How it works inside Clang — **source responsibilities**, not a second conceptual pipeline
11. **Related LLVM Optimizations & Backend Mechanisms** (required; see below)
12. Key facts via `KeyFacts`

Optional when warranted: Clang version history table with clickable primary-source evidence.

### Related LLVM Optimizations & Backend Mechanisms

Place after “How it works inside Clang”, before “Key facts”.

Before writing the table, classify the flag:

- **A. LLVM IR optimization** — investigate PassBuilder / IR passes only with evidence
- **B. Backend / code generation** — frame lowering, regalloc, ISel, prologue/epilogue (not IR passes by default)
- **C. Instrumentation** — frontend/IR instrumentation, metadata, runtimes, link deps
- **D. Diagnostic / frontend** — diagnostics/preprocess/language; usually **No direct pass**
- **E. ABI / calling convention** — ABI, register preservation, lowering; use `RegisterLayout` when useful

Relationship vocabulary (use exactly):
- Directly controlled
- Indirectly affected
- Backend mechanism
- Related mechanism
- No direct pass

For each row: mechanism name, stage, relationship, effect. Then:

#### How to verify / Practical verification workflow
Commands appropriate to the mechanism (`clang -###`, `-emit-llvm -S`, `opt` only for IR passes, `llc`/`llvm-objdump` for codegen). Do not suggest `opt` for machine-only behavior.

#### Source investigation
Upstream links to Options.td / Driver / CodeGen / Passes / Target files involved. No padding.

Evidence standard:
- Source explains why something is scheduled.
- Pipeline logs (when available) confirm what executed.
- IR/asm diffs confirm what changed.
Registered ≠ scheduled ≠ executed ≠ IR transformed ≠ faster machine code.

Backend-only example (`-fomit-frame-pointer`): report backend mechanisms / No direct pass; never call it an IR optimization pass; do not claim universal GPR freeing or that all stack allocations disappear; separate FP omission from stack-frame elimination and from unwind metadata / CFI / debug info / sanitizer instrumentation.

Also:
- Mailing-list CTA after FlagArticleShell opens (Google Form URL from the user prompt).
- MDX-critical CTA shape: keep the entire `<a>...</a>` on **one line**. Never put the subscribe label on its own line between the tags (Vercel fails with `end-tag-mismatch` on `</a>`). Use:
  `<div className="text--center margin-bottom--md"><a className="button button--primary button--lg" href="CTA_URL" target="_blank" rel="noopener noreferrer" aria-label="Subscribe to CompilerSutra Weekly Compiler Notes">✉ Subscribe to Weekly Compiler Notes</a><p className="margin-top--sm">Practical LLVM, Clang, and compiler-engineering notes delivered weekly.</p></div>`
- Frontmatter: title, slug `/tools/clang-flags/<urlencoded>/`, description, keywords.
- Head meta aligned with the page.
- Use `:::tip` / `:::caution` / `:::note` / `:::important` where they carry a real check.
- Use Tabs only when comparing real variants.

Return the MDX only.
