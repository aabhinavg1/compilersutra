# Clang Flags Explorer — source of truth (HAND_AUTHORED articles)

**This file is the single contract** for every new publish and every improve.

- Cursor skill `compilersutra-clang-flags` **must follow this file** (skill = short runbook + link here).
- Jenkins `write-flag` / `improve-flag` / `mdx-audit` **must fail closed** on the hard gates listed in §16.
- Local prompts (`scripts/clang-flags-bot/prompts/`, gitignored) and `jenkins_pipeline/prompts/` must mirror this contract — do not invent a third checklist.

Also obey `compilersutra-mdx` for MDX/CTA/`Head` hard build rules.

---

## Gold references (mirror discipline, not mechanics)

| Kind | Flag | Path |
| :--- | :--- | :--- |
| Backend / frame policy | `-fomit-frame-pointer` | `src/pages/tools/clang-flags/flags/flag-2d666f6d69742d6672616d652d706f696e746572.mdx` |
| Mid-end / O-gated vectorize | `-fno-vectorize` | `src/pages/tools/clang-flags/flags/flag-2d666e6f2d766563746f72697a65.mdx` |
| Mid-end / O-gated unroll | `-funroll-loops` | `src/pages/tools/clang-flags/flags/flag-2d66756e726f6c6c2d6c6f6f7073.mdx` |

Secondary layout-only example: `flag-2d6663616c6c2d73617665642d783130.mdx` (`-fcall-saved-x10`).

Target flag: `<FLAG_NAME>`

---

## 1. Edit path and marker

1. Edit the existing generated MDX under `src/pages/tools/clang-flags/flags/`.
2. Keep `{/* HAND_AUTHORED */}` exactly so `generate-clang-flag-pages.mjs` does not overwrite it.
3. Do not invent a new path scheme.

## 2. Shell wrapper

Wrap in `<FlagArticleShell flagPath="..." summary="...">` … `</FlagArticleShell>`.

Use “Request that Clang …” when the flag is a policy request, not a guarantee.

## 3. Technical exactness

- Use compiler-engineering terminology: accesses may alias; accesses do not normally refer to the same object; the compiler conservatively assumes they may alias.
- Do not describe aliasing as merely a relationship between pointer values.
- Do not claim a flag fixes undefined behavior unless the language rules say so.
- Distinguish driver options, `cc1` options, frontend/codegen state, LLVM IR metadata, backend lowering, and linking.
- Never invent pass names, line numbers, history milestones, or PerfReport timings.
- Label claims: **Verified experimentally** / **Verified from source** / **Documented** / **Not yet verified**.

## 4. Components

Use where they fit: `KeyFacts`, `Callout`, `SourceCode`, `AsmDiff`, `PerfReport`.  
`RegisterLayout` only for ABI/register flags.

Prefer:

```mdx
<KeyFacts
  items={[
    { label: 'Arguments', value: '…', icon: 'info' },
    { label: 'Accepted by', value: '…', icon: 'check' },
    { label: 'Stage', value: '…', icon: 'info' },
    { label: 'Negated by', value: '…', icon: 'check' },
    { label: 'Defined in', value: 'clang/include/clang/Driver/Options.td', icon: 'info' },
  ]}
/>
```

Legacy KeyFacts props still work via `KeyFacts.jsx` — never leave an empty footer.

## 5. Required section order (common gold)

1. **At a glance** — Architecture, Category, Pipeline, Compiler, Optimization Level / behavior, Risk + one-line summary.
2. **What this flag actually does** — mechanics, defaults, limits; real admonitions where needed.
3. **Option map and precedence** — siblings/aliases/`-m*` / enums; if alone, say so with evidence.
4. **Defaults by optimization level** — when `-O*` changes defaults or enables the mechanism: verified table + **which `-O` introduces/flips**. If O-level does not affect the flag, say so with evidence (do not skip the question).
5. **Minimal realistic example** — `SourceCode` (pure C/C++ in body; flag only in chrome/shell).
6. **Before vs after** — real `AsmDiff` / IR / `-###` / diagnostics / `-E`. Name compiler version + triple + commands. No illustrative placeholders.
7. **Why use / when not**
8. **Performance impact** — qualitative always; `PerfReport` only with real `csperf` arrays. Never noise-as-win.
9. **Compatibility** — driver policy vs final asm; GCC/MSVC/Flang only when verified.
10. **Usage / verification** — copy-pasteable (`-###`, `-emit-llvm`, …).
11. **Adjacent options** — technically adjacent only.
12. **How it works inside Clang** — `Implementation` subsection + stage table (see §7).
13. **Clang version history (REQUIRED)** — 4-column table (see §8). After How it works, before Related LLVM.
14. **Related LLVM Optimizations & Backend Mechanisms (REQUIRED)** — see §9. Before Key facts.
15. **Key facts** — `<KeyFacts />`.

## 6. Hero “More Support” meta + JSON

Hero cards come from `FlagArticleShell` (Architecture / Category / Optimization / Risk / Pipeline / Driver / Tool / Status), **not** free-form MDX.

When publishing/improving a flag family:

1. Fix `static/data/clang-flags.json`: `category`, `help`, `documentation`, `relatedFlags`, `whenToUse` / `whenNotToUse`, `exampleClang`.
2. Fill `help` for every related flag (empty → “No help text available”).
3. Strip junk `relatedFlags` (alphabet soup / unrelated sanitizer options). Cap to technically adjacent spellings.
4. If Architecture / Optimization / Pipeline would be wrong, add a surgical special-case in `FlagArticleShell.jsx` + matching `flagTrails.js` trails.
5. Pipeline chrome must match the article. **Never** Instrumentation → Runtime unless the flag is instrumentation.
6. Do not classify frame-pointer / plain codegen policy as Sanitizer.

## 7. Implementation / source-link requirements

- Link directly to the **current upstream LLVM source on GitHub**, not just plain file paths. Prefer tag-pinned or commit URLs.
- Include concrete symbols and **line-numbered** links where possible. Check current locations for:
  - `clang/include/clang/Options/Options.td` and/or `clang/include/clang/Driver/Options.td`
  - `clang/lib/Driver/ToolChains/Clang.cpp`
  - `clang/lib/Frontend/CompilerInvocation.cpp`
  - `clang/lib/CodeGen/CodeGenTBAA.cpp` / `BackendUtil.cpp` as applicable
  - relevant LLVM documentation
- **Optimization-level / mid-end articles:** Implementation stage table with current line-linked symbols for option definition → driver parsing → invocation setup → CodeGenOptions → BackendUtil/PassBuilder → LLVM pass behavior → target backend → linker (when relevant). Verify every line range against upstream before publishing.
- **Non-optimization flags:** same table, but mechanism-specific (frontend / diagnostic / preprocessor / target / sanitizer / debug-info / runtime / linker). Do not describe a stage as consuming the flag if it only receives transformed state.
- Verify line numbers against current upstream before writing them; do not guess stale locations.
- Use a Mermaid flowchart for multi-stage driver/frontend/IR/backend pipelines whenever the article explains **three or more** dependent stages. Concise, accurate labels; never decoration; do **not** duplicate the shell overview pipeline.

## 8. Clang version history (REQUIRED on every flag)

| Clang / LLVM version | Change | Practical impact | Evidence |
| :--- | :--- | :--- | :--- |

Rules:

- Prefer **“Present by LLVM/Clang X.Y”** when introduction is unresolved.
- Evidence cells must be **clickable primary sources** (Options.td tags, release notes, commits, PRs, Phabricator).
- Separate Flang/Fortran rows from Clang C/C++.
- Never invent milestones. Thin-but-honest (2–4 verified rows) beats a fake long table.
- Place after How it works, before Related LLVM.

## 9. Related LLVM Optimizations & Backend Mechanisms

Help the reader trace:

**Clang flag → Driver → Frontend → LLVM IR → Optimization passes / Backend mechanisms → Machine code → Runtime behavior**

Do **not** assume every Clang flag is an LLVM IR optimization pass.

### 9.1 Classify first

| Category | Examples | Investigate |
| :--- | :--- | :--- |
| **A. LLVM IR optimization** | `-fvectorize`, `-fslp-vectorize`, `-funroll-loops`, `-fstrict-aliasing`, `-O*` | IR passes / analyses gated or influenced by the flag |
| **B. Backend / code generation** | `-fomit-frame-pointer`, `-ffixed-x10`, `-fcall-saved-x10` | Frame lowering, regalloc, ISel, prologue — not IR opts by default |
| **C. Instrumentation** | `-fsanitize=*`, `-fprofile-instr-generate` | Instrumentation, metadata, runtimes, link deps |
| **D. Diagnostic / frontend** | `-Wall`, `-Wextra`, `-D`, `-I`, `-std=` | Usually **No direct pass** |
| **E. ABI / calling convention** | register / visibility / ABI flags | Calling convention, `RegisterLayout` when useful |

### 9.2 Relationship labels (exact)

Directly controlled | Indirectly affected | Backend mechanism | Related mechanism | No direct pass

### 9.3 Table + verify + sources

| Mechanism | Stage | Relationship | Effect |
| :--- | :--- | :--- | :--- |

Then **How to verify** and **Source investigation**.

- `opt` only for IR-level passes; never for machine-only behavior.
- Three-way rule: source explains why scheduled; pipeline logs what executed; IR/asm diffs what changed. Registered ≠ scheduled ≠ executed ≠ transformed ≠ faster.

### 9.4 Flag-family extras (add only what applies)

**A. Mid-end / PassBuilder** (`-f(no-)vectorize`, `-f(no-)unroll-loops`, `-ffast-math`, `-flto`, …)  
Separate driver spelling on `-###` from CodeGenOpts/PTO defaults; name passes only with evidence; orthogonal siblings; enable ≠ every loop transforms.

**B. Backend / frame policy** (`-f(no-)omit-frame-pointer`, `-mframe-pointer=`, …)  
Leaf / `-mframe-pointer=` map; target-sensitive defaults; FP ≠ unwind ≠ “no stack”; risk = observability for FP profilers.

**C. ABI / registers** (`-fcall-saved-*`, `-ffixed-*`, …)  
`RegisterLayout`; build-wide ABI `:::important`.

**D. Sanitizer / instrumentation**  
Runtime/link notes; Instrumentation → Runtime only here.

**E. Diagnostics / preprocessor / language**  
Show diagnostics/`-E`; usually No direct pass; `csperf` usually wrong tool.

**F. Target CPU/arch** (`-march=`, `-mcpu=`, `-mtune=`)  
Triple+CPU; capture asm on stated triple.

**G. Link / PIC / PIE / pthread**  
Driver vs linker; when `-c` makes the flag a no-op.

## 10. SEO and page metadata (REQUIRED)

- Frontmatter `keywords`: flag spelling, inverse/siblings, Clang/GCC terms, language/LLVM/mechanism terms.
- Descriptive, search-friendly frontmatter `description` naming the flag, Clang, mechanism, and C/C++ or target scope.
- `import Head from '@docusaurus/Head';` only — never `import { Head }` (undefined → Vercel `Element type is invalid`).
- Align Head: `keywords`, `og:title`, `og:description`, `og:type`, Twitter title/description. No keyword-stuffing; no unsupported claims.

## 11. Docusaurus admonitions and tabs

- `:::tip` — practical guidance / safe workflow  
- `:::caution` — correctness, ABI, portability, UB  
- `:::important` — build-wide / contract requirements  
- `:::note` — version, target, measurement, implementation caveats  
- `Tabs` / `TabItem` for real variants only — do not force tabs around a single command  

## 12. Subscribe CTA (REQUIRED, exact shape)

Immediately after `<FlagArticleShell ...>` opens:

```mdx
<div className="text--center margin-bottom--md"><a className="button button--primary button--lg" href="https://docs.google.com/forms/d/e/1FAIpQLSebP1JfLFDp0ckTxOhODKPNVeI1e21rUqMJ0fbBwJoaa-i4Yw/viewform" target="_blank" rel="noopener noreferrer" aria-label="Subscribe to CompilerSutra Weekly Compiler Notes">✉ Subscribe to Weekly Compiler Notes</a><p className="margin-top--sm">Practical LLVM, Clang, and compiler-engineering notes delivered weekly.</p></div>
```

MDX-critical: entire `<a>...</a>` on **one line**. Multiline link text → `end-tag-mismatch` on Vercel.

## 13. Tone and CSS

Tone: technical reference for compiler engineers. Concrete, measured, ABI-honest. No hype, no AI/agent voice, no filler.  
Keep CSS/components as-is unless a tiny prop/CSS fix is required.

## 14. Performance / PerfReport

- Qualitative tradeoffs always.
- `PerfReport` only with real CompilerSutraPerf / `csperf` trial arrays run in-workspace.
- Link in-site docs + https://pypi.org/project/compilersutra-perf/ when reporting numbers.
- Never invent, estimate, or copy placeholders. Never claim a win from noise.
- Forbidden excuse: any paraphrase of “no controlled CompilerSutraPerf run was performed.”

## 15. Sanity-check before done

- Exact path/slug; mobile-friendly commands  
- `{/* HAND_AUTHORED */}` + CTA one-liner intact  
- Hero meta / relatedFlags / trails match mechanism  
- Version history table with clickable Evidence  
- Implementation links are `github.com/llvm/llvm-project/...` (prefer `#L…`)  
- Related LLVM evidence-backed only  
- `git diff --check`; build or scoped MDX validation  
- Do not stage gitignored prompts/skills  

## 16. Bot fail-closed gates (publish + improve)

Hard-fail (reject draft / block publish) if any missing:

| Gate | Detection |
| :--- | :--- |
| HAND_AUTHORED marker | `{/* HAND_AUTHORED */}` or `HAND_AUTHORED` |
| FlagArticleShell | `<FlagArticleShell` |
| At a glance | `## At a glance` |
| What this flag actually does | `## What this flag actually does` |
| How it works | `## How it works inside Clang` |
| Clang version history | `## Clang version history` + table header `Practical impact` / `Evidence` |
| Related LLVM | `Related LLVM Optimizations` |
| Key facts | `KeyFacts` or `## Key facts` |
| Subscribe CTA | `Subscribe to Weekly Compiler Notes` + Google Form URL |
| Default Head import | fail if `import { Head }` |
| LLVM GitHub line-links | at least one `github.com/llvm/llvm-project/...#L…` Implementation/source link |
| No AI credit / placeholders | Cursor co-author, lorem, illustrative-only, invented |

Soft/completeness (score + improve priority; hard-fail for O-sensitive flags):

- Option map section **or** explicit “no sibling spellings”
- Defaults by optimization level **or** evidenced “O-level does not change this”
- For `-O*` / vectorize / unroll / omit-frame / fast-math / lto: O-level guidance is **hard-fail**

## 17. Optional `optimizationMapping` JSON

Do not fabricate bulk mappings. Hand-authored MDX remains truth until a generator consumes optional enrichment. Preserve existing option keys.

## 18. Historical research reminders

- Early commit ≠ first release; prefer Present-by when unsure.  
- Meaningful behavior changes only.  
- Cite clickable hashes / reviews / release notes.  
- Separate Flang from Clang C/C++.

Deliverable: completed MDX + only necessary JSON / FlagArticleShell / flagTrails / KeyFacts tweaks.
