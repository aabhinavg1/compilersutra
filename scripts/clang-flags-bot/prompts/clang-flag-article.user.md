Upgrade this Clang flag stub into a HAND_AUTHORED article matching the **`-fomit-frame-pointer` gold reference** (evidence discipline, verification, history caution, Related LLVM section).
Use `-fcall-saved-x10` only as a secondary layout example when useful.

FLAG: {{FLAG}}
PUBLIC_FLAG / PATH: {{PUBLIC_FLAG}}
SLUG: {{SLUG}}
FILE: {{FILE_REL}}
HELP: {{HELP}}
DOCUMENTATION: {{DOCUMENTATION}}
DRIVER: {{DRIVER}}
CC1: {{CC1}}
TAKES_ARGUMENT: {{TAKES_ARGUMENT}}
NEGATED: {{NEGATED}}
GROUP: {{GROUP}}
ACCEPTED_BY: {{ACCEPTED_BY}}

EXISTING STUB MDX (replace entirely with the hand-authored article):
```
{{STUB}}
```

GOLD EXAMPLE PATH (primary omit-FP reference; mirror its discipline): {{GOLD_PATH}}

Subscribe CTA URL: https://docs.google.com/forms/d/e/1FAIpQLSebP1JfLFDp0ckTxOhODKPNVeI1e21rUqMJ0fbBwJoaa-i4Yw/viewform
Label: ✉ Subscribe to Weekly Compiler Notes
CTA must be one line (no newline inside `<a>...</a>`), e.g.:
<div className="text--center margin-bottom--md"><a className="button button--primary button--lg" href="https://docs.google.com/forms/d/e/1FAIpQLSebP1JfLFDp0ckTxOhODKPNVeI1e21rUqMJ0fbBwJoaa-i4Yw/viewform" target="_blank" rel="noopener noreferrer" aria-label="Subscribe to CompilerSutra Weekly Compiler Notes">✉ Subscribe to Weekly Compiler Notes</a><p className="margin-top--sm">Practical LLVM, Clang, and compiler-engineering notes delivered weekly.</p></div>

PERF_NUMBERS: {{PERF_NUMBERS}}

EVIDENCE_SUMMARY (from gather-evidence; prefer these facts when present):
```
{{EVIDENCE_SUMMARY}}
```

Optimization / mechanism mapping reminders:
- Classify as IR-opt, backend/codegen, instrumentation, diagnostic/frontend, or ABI before writing the section.
- Relationship labels only: Directly controlled | Indirectly affected | Backend mechanism | Related mechanism | No direct pass.
- Include How to verify + Source investigation subsections.
- Prefer EVIDENCE_SUMMARY / compiler output for pass names and IR attributes; do not invent PassBuilder pass IDs.
- Diagnostic/frontend flags: short No direct pass explanation is correct; do not invent opt-pass tables.

Rules reminder:
- `{/* HAND_AUTHORED */}` must appear.
- No invented PerfReport data; never claim a win from measurement noise.
- Separate driver policy from final asm in compatibility notes.
- No invented LLVM line numbers or pass names.
- Exact flagPath="{{PUBLIC_FLAG}}" (or the public spelling used on the site).
- Do not emit multiline `<a>\n  label\n</a>` — breaks MDX/`end-tag-mismatch` on Vercel.
- `import Head from '@docusaurus/Head';` only — never `import { Head }` (undefined → Element type is invalid).
- Section order: … → How it works inside Clang (source mapping) → Related LLVM Optimizations & Backend Mechanisms → Key facts.

Return the complete MDX file starting with ---.
