#!/usr/bin/env python3
"""compilersutra_fb_bot - posts to Facebook Page only after successful Production deploy.

Monitors GitHub deployments for aabhinavg1/compilersutra. When a Production deployment
status becomes 'success' and the commit message/link indicates a new article (link:),
posts to the configured Facebook Page. Tracks posted deployment IDs to avoid duplicates.

Required env vars:
  GITHUB_TOKEN            - GitHub token (repo read) for deployments/commits
  FB_PAGE_ID              - Facebook Page ID (default: 61577245012547)
  FB_PAGE_ACCESS_TOKEN    - Facebook Page access token with pages_manage_posts

Optional:
  GITHUB_REPO             - default: aabhinavg1/compilersutra
  STATE_FILE              - default: .compilersutra_fb_bot_state.json (next to script or cwd)
  POLL_SECONDS            - default: 120
  DRY_RUN                 - if 'true', log but do not post to Facebook
"""
from __future__ import annotations

import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

REPO = os.environ.get("GITHUB_REPO", "aabhinavg1/compilersutra")
FB_PAGE_ID = os.environ.get("FB_PAGE_ID", "61577245012547")
FB_TOKEN = os.environ.get("FB_PAGE_ACCESS_TOKEN", "").strip()
GH_TOKEN = os.environ.get("GITHUB_TOKEN", "").strip()
POLL = int(os.environ.get("POLL_SECONDS", "120"))
DRY_RUN = os.environ.get("DRY_RUN", "").lower() == "true"
STATE_FILE = Path(os.environ.get("STATE_FILE", Path(__file__).with_name(".compilersutra_fb_bot_state.json")))


def log(msg: str) -> None:
    print(f"[compilersutra_fb_bot] {msg}", flush=True)


def gh_get(url: str):
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {GH_TOKEN}", "Accept": "application/vnd.github+json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def load_state() -> dict:
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text())
        except Exception as e:
            log(f"state read failed ({e}), starting fresh")
    return {"posted_deployments": []}


def save_state(state: dict) -> None:
    state["posted_deployments"] = state.get("posted_deployments", [])[-500:]
    STATE_FILE.write_text(json.dumps(state, indent=2))


def parse_link(commit_message: str) -> str | None:
    for line in commit_message.splitlines():
        m = re.match(r"(?i)^link:\s*(.+)$", line.strip())
        if m:
            return m.group(1).strip()
    return None


def post_facebook(message: str, link: str | None = None) -> None:
    if not FB_TOKEN:
        log("FB_PAGE_ACCESS_TOKEN missing; skipping Facebook post")
        return
    if DRY_RUN:
        log(f"DRY_RUN post: {message} {link or ''}")
        return
    api = f"https://graph.facebook.com/v20.0/{urllib.parse.quote(FB_PAGE_ID)}/feed"
    data = {"message": message, "access_token": FB_TOKEN}
    if link:
        data["link"] = link
    body = urllib.parse.urlencode(data).encode()
    req = urllib.request.Request(api, data=body, method="POST")
    with urllib.request.urlopen(req, timeout=30) as r:
        resp = json.loads(r.read().decode())
    log(f"Facebook posted: {resp}")


def check_once(state: dict) -> None:
    if not GH_TOKEN:
        log("GITHUB_TOKEN missing; cannot monitor deployments")
        return
    deployments = gh_get(f"https://api.github.com/repos/{REPO}/deployments?environment=production&per_page=15")
    posted = set(state.get("posted_deployments", []))
    for dep in deployments:
        dep_id = dep.get("id")
        if dep_id in posted:
            continue
        statuses = gh_get(dep.get("statuses_url") + "?per_page=5")
        if not statuses:
            continue
        latest = statuses[0]  # API returns newest first
        if latest.get("state") != "success":
            continue
        sha = dep.get("sha")
        commit = gh_get(f"https://api.github.com/repos/{REPO}/commits/{sha}")
        msg = (commit.get("commit") or {}).get("message", "")
        link = parse_link(msg)
        if not link:
            posted.add(dep_id)
            state["posted_deployments"] = list(posted)
            save_state(state)
            log(f"deploy {dep_id} success but no article link:; marked seen")
            continue
        clean = link.strip()
        article_url = f"https://www.compilersutra.com/docs{clean}"
        message = f"New article published on CompilerSutra\n{article_url}"
        log(f"Production deploy success ({dep_id}, {sha[:7]}): posting")
        try:
            post_facebook(message, article_url)
            posted.add(dep_id)
            state["posted_deployments"] = list(posted)
            save_state(state)
        except Exception as e:
            log(f"post failed for deploy {dep_id}: {e}")


def main() -> int:
    log(f"repo={REPO} page={FB_PAGE_ID} poll={POLL}s dry_run={DRY_RUN} state={STATE_FILE}")
    if not FB_TOKEN and not DRY_RUN:
        log("warning: FB_PAGE_ACCESS_TOKEN not set (set it or use DRY_RUN=true)")
    state = load_state()
    once = "--once" in sys.argv
    while True:
        try:
            check_once(state)
        except Exception as e:
            log(f"check error: {e}")
        if once:
            return 0
        time.sleep(POLL)


if __name__ == "__main__":
    raise SystemExit(main())
