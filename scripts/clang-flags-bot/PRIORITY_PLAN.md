# Priority-ranked improvement plan

## Batch 0 — remaining stub-only in bot state
Still GENERATED on this tree (and likely open/unmerged PRs):

- `-fPIC`
- `-ffast-math`
- `-fno-exceptions`

## Batch 1 — deepen HAND_AUTHORED (lowest completeness / Category A first)

- `-Os` completeness=76 cat=A gaps=pass_mention
- `-fpic` completeness=81 cat=B gaps=ir_mention, pass_mention
- `-Wextra` completeness=86 cat=E gaps=asm_diff, perf_report, pass_mention
- `-march=` completeness=86 cat=B gaps=perf_report, ir_mention, pass_mention
- `-pthread` completeness=86 cat=D gaps=asm_diff, perf_report, pass_mention
- `-fbounds-safety` completeness=89 cat=C gaps=asm_diff, perf_report
- `-fomit-frame-pointer` completeness=89 cat=A gaps=source_code, perf_report, pass_mention
- `-D` completeness=92 cat=E gaps=perf_report, pass_mention
- `-I` completeness=92 cat=E gaps=perf_report, pass_mention
- `-O2` completeness=92 cat=A gaps=ir_mention, pass_mention
- `-Ofast` completeness=92 cat=A gaps=perf_report, pass_mention
- `-Wall` completeness=92 cat=E gaps=perf_report, pass_mention
