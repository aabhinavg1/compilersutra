Improve this published Clang flag article. Do not create a duplicate page. Overwrite the same FILE path.
Match the **`-fomit-frame-pointer` gold reference**: evidence layers, verification workflow, restrained history, Related LLVM section, no noise-as-win, faithful pipelines.

FLAG: {{FLAG}}
PUBLIC_FLAG / PATH: {{PUBLIC_FLAG}}
SLUG: {{SLUG}}
FILE: {{FILE_REL}}
HELP: {{HELP}}
DOCUMENTATION: {{DOCUMENTATION}}
DRIVER: {{DRIVER}}
CC1: {{CC1}}
EXPERIMENT CATEGORY: {{CATEGORY}} ({{CATEGORY_LABEL}})

AUDIT ISSUES:
```
{{AUDIT_ISSUES}}
```

MISSING EVIDENCE:
```
{{MISSING_EVIDENCE}}
```

EXISTING ARTICLE (preserve what is correct):
```
{{EXISTING_ARTICLE}}
```

EVIDENCE_JSON from gather-evidence.mjs (compiler IR/asm excerpts + optional csperf; do not invent beyond this):
```
{{EVIDENCE_JSON}}
```

PERF_NUMBERS policy: {{PERF_NUMBERS}}

Subscribe CTA URL: https://docs.google.com/forms/d/e/1FAIpQLSebP1JfLFDp0ckTxOhODKPNVeI1e21rUqMJ0fbBwJoaa-i4Yw/viewform
CTA must be one line inside `<a>...</a>`.

Optimization / mechanism mapping reminders:
- Classify before mapping. Prefer EVIDENCE_JSON over guessing.
- Relationship labels only: Directly controlled | Indirectly affected | Backend mechanism | Related mechanism | No direct pass.
- Place the section after How it works / implementation content and before Key facts.
- How to verify + Source investigation required when mechanisms are listed.
- Never invent pass names. Diagnostic/frontend → No direct pass is valid.

Rules reminder:
- `{/* HAND_AUTHORED */}` must appear.
- `flagPath="{{PUBLIC_FLAG}}"` (public spelling).
- `import Head from '@docusaurus/Head';` only.
- No invented PerfReport; no “faster” claims from noise.
- Prefer evidence excerpts for AsmDiff / IR blocks when `ir_changed` or `asm_changed` is true.
- If csperf was skipped/failed, give reproducible commands and label results as pending.
- Do not expand a strong article merely to make it longer.

Return the complete MDX file starting with ---.
