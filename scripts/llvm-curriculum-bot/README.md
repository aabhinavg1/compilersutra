# LLVM curriculum bot (curriculum-driven content pipeline)

**Source of truth:** [`docs/llvm/intro-to-llvm.md`](../../docs/llvm/intro-to-llvm.md) — the live LLVM roadmap (Level 0–10).

Jenkins / OpenCode must **follow this curriculum**, not invent a parallel topic list.

## Milestone 1 (implemented) — read-only analyzer

```bash
python3 scripts/llvm-curriculum-bot/analyze_curriculum.py
```

Reads the roadmap tables, classifies each row as:

| Status | Meaning |
| --- | --- |
| `published` | Linked article path exists; no Coming Soon |
| `coming_soon` | Coming Soon (or empty / missing file) |
| `mixed` | Coming Soon **and** related published link(s) — extend, don’t duplicate |

Writes:

- `out/curriculum-backlog.json` — machine-readable backlog
- `out/curriculum-backlog.md` — human summary
- `out/next-article.json` — recommended next Coming Soon topic (Level 0 first)

**Does not** edit the roadmap, open PRs, or generate articles.

### Recommended first article (from analyzer)

Level 0 · Lexical analysis · **Hash tables, tries, string matching**

Working title: *Hash Tables in Compiler Design: Identifier Lookup, String Interning and Symbol Management*

## Pipeline vision (later milestones)

1. Read curriculum (this analyzer)
2. Identify missing content / overlaps
3. Research (`compiler-research`)
4. Draft article (`compiler-article-writer` + `compiler-experiment`)
5. Review (`cs-article-reviewer`)
6. Social draft (`cs-social-publisher`)
7. Human PR approval → then `cs-curriculum-updater` patches the roadmap

### Planned skills (one responsibility each)

| Skill | Responsibility |
| --- | --- |
| `cs-curriculum-analyzer` | Read roadmap + emit backlog (this bot) |
| `compiler-research` | Theory + LLVM implementation notes |
| `compiler-article-writer` | Technical MDX article |
| `compiler-experiment` | Reproducible labs |
| `cs-article-reviewer` | Correctness / MDX / links |
| `cs-social-publisher` | LinkedIn draft |
| `cs-curriculum-updater` | Roadmap update **after** merge |

## Jenkins

See `jenkins/Jenkinsfile.llvm_curriculum_analyzer` — checkout + run analyzer + archive `out/*`.

## Rules

- Never regenerate already-published curriculum articles.
- For `mixed` topics, extend the related article / write the missing angle only.
- Update Coming Soon → link **only after** the article PR is approved.
