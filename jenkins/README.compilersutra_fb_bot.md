# compilersutra_fb_bot (local Jenkins + Facebook Page)

Monitors `aabhinavg1/compilersutra` **Production** deployments and posts to Facebook Page **`61577245012547`** only when a deployment succeeds **and** the deployed commit contains an article `link:` line. Prevents broken/early links. State is stored in `STATE_FILE` to avoid duplicate posts.

## Files
- `scripts/compilersutra_fb_bot.py` – monitor + post bot (`--once` for CI/Jenkins, loop for service)
- `jenkins/Jenkinsfile.compilersutra_fb_bot` – Jenkins pipeline (cron every 2 min, runs `--once`)

## Local Jenkins setup (macOS)
1. Install/start Jenkins (requires Java 17+):
   ```bash
   brew install jenkins-lts
   brew services start jenkins-lts
   # open http://localhost:8080 and complete setup
   ```
2. Create a **Pipeline** job (or Multibranch) pointing to this repo/branch and set **Script Path** to `jenkins/Jenkinsfile.compilersutra_fb_bot`.
3. Add Jenkins credentials (Manage Jenkins → Credentials → *global* → Add):
   - **Secret text** ID `compilersutra-github-token`: GitHub token with `repo`/deployments read (or your `gh auth token`).
   - **Secret text** ID `compilersutra-fb-page-access-token`: Facebook Page access token with `pages_manage_posts` for page `61577245012547`.
4. (Optional, free) Jenkins user API token for triggering/CLI: Manage Jenkins → Users → your user → Configure → **API Token** → Add new Token. Use as `USER:TOKEN` with Jenkins REST/CLI.
5. Enable the cron trigger in the job (pipeline defines `H/2 * * * *`).

## Run without Jenkins (alternative local monitoring)
```bash
export GITHUB_TOKEN=...
export FB_PAGE_ID=61577245012547
export FB_PAGE_ACCESS_TOKEN=...
# dry run
DRY_RUN=true python3 scripts/compilersutra_fb_bot.py --once
# continuous monitor
python3 scripts/compilersutra_fb_bot.py
```

## Notes
- **Jenkins token**: free. **Hosting Jenkins** needs a machine you control (local is fine).
- **Facebook**: Page posting via Graph API is free; keep a valid/long-lived Page token and required permissions.
- GitHub Actions `notify-discord-on-deploy.yml` handles deploy-success notifications in CI; this Jenkins bot is the local/FB-focused monitor as requested.
