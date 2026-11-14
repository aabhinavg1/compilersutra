---
name: compilersutra-basic-terminology
description: >-
  Universal CompilerSutra teaching skill for Basic Terminology (and reusable for
  other tracks): never teach by definition alone — use concepts, examples,
  verified commands, actual tool output, and experiments. Also covers hub
  searchDemand, docs/basic-terminology/, topics.js, and the daily bot.
---

# CompilerSutra Basic Terminology — Universal Teaching Skill

## 1. Mission

Make technical terminology understandable to everyone — beginners through compiler engineers and AI assistants.

The goal is **not** memorizing definitions. Every article must move the reader:

**KNOW → UNDERSTAND → OBSERVE → EXPERIMENT → IMPLEMENT → ENGINEER**

Never teach a technical term using definitions alone. Teach it through concepts, examples, commands, actual output, and experiments.

## 2. Non-negotiable accuracy

**VERIFY FIRST. WRITE SECOND. NEVER BLUFF.**

Never fabricate: APIs, flags, commands, compiler/assembly/IR/AST output, benchmarks, version claims, or doc links.

- Execute examples whenever possible.
- Never present conceptual diagrams as actual tool output.
- Label excerpts and redactionsicated addresses clearly.
- Disclose version, triple, and anything not run.
- If blocked → say so (`NEEDS TECHNICAL VERIFICATION` / `BLOCKED`).

Preferred sources: official docs, language specs, standards, upstream source, maintainer docs. Random blogs are supporting only.

## 3. Target audience

Write so all of these can learn from one page:

1. Absolute beginners  
2. Students  
3. Programmers  
4. Engineers  
5. Researchers  
6. AI assistants (structured, verifiable claims)

Introduce prerequisites. Do not assume related terms are known.

## 4. Mandatory article structure

Every Basic Terminology (and, by policy, other CompilerSutra technical) article SHOULD include:

### A. Concept
Simple definition + precise definition + why it exists + problem solved.

### B. Mental model
Analogy (optional), diagram, practical picture — analogy must not replace the technical explanation.

### C. Where it fits
Position in compiler / OS / CPU / GPU / runtime pipeline; neighbors and dependencies.

### D. Technical example
Minimal reproducible source, filenames, tools, versions, exact commands.

### E. Actual output
Real tool output. Label shortened output as an excerpt. Note environment dependence.

### F. Line-by-line explanation
Interpret important fields, nodes, instructions — do not paste silently.

### G. Internal working
Algorithms, data structures, control flow, memory/architecture as relevant.

### H. Practical experiments
At least two hands-on experiments when applicable (change input → observe).

### I. Real-world applications
Production tools/workflows (e.g. clang-tidy, AST matchers, IR passes).

### J. Common misconceptions
Incorrect assumptions + corrections with evidence.

### K. Knowledge check
Conceptual, practical, reasoning, and application questions (answers OK in `<details>`).

### L. Further learning
Prereqs, related terms, advanced docs, official references, hub placement.

## 5. Difficulty progression

1. Beginner — what / why  
2. Intermediate — components  
3. Practical — observe and use  
4. Advanced — internals  
5. Engineering — production behavior, debug, extend  

Do not dump level 5 before the mental model exists.

## 6. Learning track hub (not a flat catalogue)

Hub UI: `src/components/basicTerminology/LearningHub.jsx`  
Catalog: `src/data/basicTerminology/topics.js`  
Curriculum overlay: `src/data/basicTerminology/curriculumMeta.js` (prereqs, learnings, outcomes, labs, module checks, pipeline)

| Field | Role |
| --- | --- |
| `searchDemand` | 1–5 relative interest; daily bot weights by this |
| `searchQueries` | example queries |
| `moduleId` | correct module (compiler terms → Modules 02/03) |
| `resources.blog` | prefer `/docs/basic-terminology/…` for high-demand terms |
| `prerequisites` / `learnings` / `outcome` / `lab` | from `curriculumMeta.js` via `applyCurriculum` |

Hub must:

- Outcome-oriented hero + Start / Continue (localStorage only; no invented auth)
- Learning roadmap + concept pipeline (Program → … → Process)
- **Recommended concepts** (curated) — never claim “most searched” without analytics
- Richer cards: learn / prereqs / lab / outcome / progress status
- Module labs + knowledge checks only when real content exists
- Show Watch/PDF/Quiz only for resources that actually exist (no channel-as-video)

**Placement**

| Surface | Path |
| --- | --- |
| Hub | `/docs/basic-terminology/` |
| Articles | `/docs/basic-terminology/<slug>/` + sidebar |
| Start Here | `/docs/start-here/basic-terminology-for-everyone/` |

After `topics.js` changes, regenerate `scripts/basic-terminology-bot/catalog.json` and sync Jenkins copy.

## 7. MDX / site rules

Also follow `compilersutra-mdx`: one-line CTA `<a>`, default `Head` imports, no invented components.

Preserve layout, navigation, SEO frontmatter (`displayed_sidebar: basicTerminologySidebar`), internal links.

## 8. Quality checklist

Before publishing:

- [ ] Definition accurate; beginner-accessible; enough depth  
- [ ] Prerequisites and system context present  
- [ ] Diagrams labeled (conceptual vs actual)  
- [ ] Commands verified; output real or explicitly unverified  
- [ ] Experiments included; misconceptions addressed  
- [ ] Official references + working internal links  
- [ ] No unsupported claims  

Publication status: `READY FOR REVIEW` | `NEEDS TECHNICAL VERIFICATION` | `BLOCKED — INSUFFICIENT EVIDENCE`

## 9. Long-term policy

This skill is the **mandatory editorial standard** for Basic Terminology and the recommended standard for LLVM, Clang, GCC, MLIR, GPU, Linux, and compiler-engineering tutorials on CompilerSutra.

## Reference gold (hands-on)

- `docs/basic-terminology/what-is-an-ast.mdx` — AST dump / filter / IR compare labs  
- `docs/basic-terminology/what-is-a-compiler.mdx` — concept + pipeline  
- `docs/basic-terminology/what-is-ir.mdx` — IR sibling page  
