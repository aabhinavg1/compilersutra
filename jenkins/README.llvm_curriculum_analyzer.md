# Jenkins — LLVM curriculum analyzer (read-only)

Job purpose: scan the **existing** LLVM roadmap and emit a content backlog. No article generation and no roadmap edits in this job.

## Source of truth

`docs/llvm/intro-to-llvm.md`

## Script

```bash
python3 scripts/llvm-curriculum-bot/analyze_curriculum.py
```

## Create the job

1. New Pipeline job, e.g. `compilersutra-llvm-curriculum-analyzer`
2. Pipeline script from SCM → this repo
3. Script path: `jenkins/Jenkinsfile.llvm_curriculum_analyzer`
4. Archive artifacts from `scripts/llvm-curriculum-bot/out/`

## What to do with the output

- Open `curriculum-backlog.md` / `next-article.json`
- Hand the recommended topic to OpenCode / the article-writer skill
- Only after the article PR merges should the roadmap Coming Soon cell be updated
