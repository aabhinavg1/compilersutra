# Live PDF bot

Generate PDFs for CompilerSutra weekly lives:

1. **Session pack** — agenda + curriculum for the live (share / screen / prep)
2. **Daily brief** — short countdown + curriculum spotlight for each day leading up to the live

## Saturday launch (first live)

- **Date:** Saturday, 14 November 2026 · 19:00 IST
- **Topic:** Parallel Programming course launch + curriculum walkthrough

```bash
# Session PDF (full curriculum pack)
python3 scripts/live-pdf-bot/generate_live_pdf.py --live 2026-11-14-parallel-course-launch

# Daily brief for today (countdown + chapter spotlight)
python3 scripts/live-pdf-bot/generate_live_pdf.py --daily --upcoming

# Both
python3 scripts/live-pdf-bot/generate_live_pdf.py --both --upcoming
```

Outputs land in `scripts/live-pdf-bot/out/`.

## Daily cron (optional)

Run every morning so a fresh daily PDF exists before you post:

```cron
0 8 * * * cd /path/to/FixIt_Compilersutra && python3 scripts/live-pdf-bot/generate_live_pdf.py --daily --upcoming >> /tmp/live-pdf-bot.log 2>&1
```

## Add the next live

Edit `schedule.json` and append a live object (`id`, `date`, `title`, `agenda`, …).  
If it is another parallel-course session, keep `"course": "parallel-computing"`.

## Requirements

- `pandoc`
- `xelatex` (preferred) or `pdflatex`

## Jenkins (production)

Daily job runs from the host pipeline tree (not this FixIt path):

- Job: `http://localhost:8080/job/compilersutra-live-pdf-daily/`
- Files: `/home/aitr/compilersutra/jenkins_pipeline/Jenkinsfile.live-pdf`
- Script: `/home/aitr/compilersutra/jenkins_pipeline/scripts/live-pdf-daily/`
- Cron: 08:00 IST daily (`MODE=both`)

Keep `schedule.json` in sync when you add a new Saturday live.

