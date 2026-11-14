# Basic Terminology daily bot

Publishes **one beginner concept per day** from the Basic Terminology hub catalog,
**weighted by `searchDemand`** so high-search compiler-domain terms (IR, AST, linker, LLVM, …) appear more often than low-demand cards.

## Generate today’s spotlight

```bash
cd /path/to/FixIt_Compilersutra
python3 scripts/basic-terminology-bot/generate_daily_term.py
```

Optional:

```bash
python3 scripts/basic-terminology-bot/generate_daily_term.py --date 2026-11-11
```

Outputs land in `scripts/basic-terminology-bot/out/`:

- `daily-YYYY-MM-DD-<topic-id>.md` — always
- `daily-YYYY-MM-DD-<topic-id>.pdf` — when `fpdf2` is installed

## Refresh catalog

After editing `src/data/basicTerminology/topics.js`:

```bash
node --input-type=module -e "
import fs from 'fs';
import * as mod from './src/data/basicTerminology/topics.js';
fs.writeFileSync('scripts/basic-terminology-bot/catalog.json', JSON.stringify({
  modules: mod.MODULES,
  topics: mod.TOPICS,
  learningPath: mod.LEARNING_PATH,
  hub: mod.HUB_META,
}, null, 2) + '\n');
"
```

## Cron (optional)

```cron
0 8 * * * cd /path/to/FixIt_Compilersutra && python3 scripts/basic-terminology-bot/generate_daily_term.py >> /tmp/basic-term-bot.log 2>&1
```

Hub page: https://www.compilersutra.com/docs/basic-terminology/
