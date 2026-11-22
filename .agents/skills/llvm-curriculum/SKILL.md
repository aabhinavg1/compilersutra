---
name: compilersutra-llvm-curriculum
description: >-
  Curriculum-driven LLVM content pipeline for CompilerSutra. Source of truth is
  docs/llvm/intro-to-llvm.md (Level 0–10). Use for backlog analysis, Coming Soon
  gap detection, and (later) research/write/review of missing curriculum articles.
  Start with the read-only analyzer; never invent a parallel topic list.
---

# CompilerSutra LLVM curriculum pipeline

## Source of truth

**`docs/llvm/intro-to-llvm.md`** — the live LLVM roadmap.

Jenkins / agents must derive the backlog from this file. Do **not** maintain a duplicated topic spreadsheet.

## Milestone 1 — analyzer only

```bash
python3 scripts/llvm-curriculum-bot/analyze_curriculum.py
```

Outputs under `scripts/llvm-curriculum-bot/out/`:

- `curriculum-backlog.json` / `.md`
- `next-article.json`

Statuses: `published` | `coming_soon` | `mixed` (Coming Soon + related published link).

## Production order (Level 0 first)

Prefer completing Level 0 Coming Soon topics before later levels, especially:

1. Hash tables, tries, string matching  
2. Parse trees / AST / LL/LR (extend existing AST vs Parse Tree)  
3. CFG foundations  
4. Symbol tables / attribute grammars / union-find  
5. DAG / TAC  
6. Data-flow / worklists  
7. DP / graph coloring  
8. Expression trees / interference graphs  
9. Instruction scheduling  

## Pipeline stages (later)

| Stage | Skill | Mutates repo? |
| --- | --- | --- |
| Analyze | `cs-curriculum-analyzer` | No |
| Research | `compiler-research` | No |
| Write | `compiler-article-writer` | Branch + MDX draft |
| Experiments | `compiler-experiment` | Branch |
| Review | `cs-article-reviewer` | Comments / fixes |
| Social | `cs-social-publisher` | Draft only |
| Update roadmap | `cs-curriculum-updater` | **Only after merge** |

## Hard rules

- Never regenerate a published curriculum article.
- For `mixed` rows, extend related coverage; don’t clone it.
- VERIFY FIRST for commands, IR, and LLVM API claims (same as Basic Terminology skill).
- Roadmap Coming Soon → link only after the article PR is approved.

## First article target

**Hash Tables in Compiler Design: Identifier Lookup, String Interning and Symbol Management**  
(Level 0 · Lexical analysis · currently Coming Soon)
