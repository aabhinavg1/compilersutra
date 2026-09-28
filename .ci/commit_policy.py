#!/usr/bin/env python3
import os
import subprocess
import sys
import re
import json
import requests

# --- Logging helper ---
def log(msg: str):
    print(f"[CI][COMMIT_POLICY] {msg}")

# --- Run shell command ---
def run(cmd: str) -> str:
    log(f"Running command: {cmd}")
    return subprocess.check_output(cmd, shell=True, text=True).strip()

# --- Determine if docs changed ---
def docs_changed(base: str, head: str) -> bool:
    diff = run(f"git diff --name-only {base} {head}")
    changed = any(line.startswith("docs/") for line in diff.splitlines())
    log(f"Docs changed: {changed}")
    return changed

# --- Get base commit safely ---
def get_base_commit() -> str:
    try:
        base = run("git rev-parse HEAD~1")
        log(f"Using HEAD~1 as base: {base}")
        return base
    except subprocess.CalledProcessError:
        base = run("git rev-list --max-parents=0 HEAD")
        log(f"Using root commit as base: {base}")
        return base

# --- Get commit log ---
def get_commit_log(docs_changed_flag: bool, base: str = "") -> str:
    if docs_changed_flag:
        base = base or get_base_commit()
        log(f"Docs changed: reading commits from {base} to HEAD")
        return run(f"git log {base}..HEAD --no-merges --pretty=format:'---%n%B'")
    else:
        log("No docs changed: reading latest commit only")
        return run("git log -1 --no-merges --pretty=format:'---%n%B'")

# --- Parse commit log ---
def parse_commit_log(log_text: str):
    link = None
    nodoc = False
    log("Parsing commit log")

    for line in log_text.splitlines():
        line = line.strip()
        if not link:
            m = re.match(r'(?i)^link:\s*(.+)$', line)
            if m:
                link = m.group(1).strip()
                log(f"Found link: {link}")

        if re.match(r'(?i)^nodoc\b', line):
            nodoc = True
            log("Found nodoc marker")

    return link, nodoc

# --- Send Discord message ---
def send_discord(message: str, webhook_url: str):
    if not webhook_url:
        log("No webhook URL provided, skipping Discord notification")
        return
    webhook_url = webhook_url.strip()
    payload = {"content": message}
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.post(webhook_url, headers=headers, data=json.dumps(payload), timeout=10)
        if response.status_code != 204:
            log(f"Failed to send Discord message: {response.status_code} {response.text}")
            sys.exit(1)
        log(f"Discord message sent successfully to {webhook_url}")
    except requests.RequestException as e:
        log(f"Error sending Discord message: {e}")
        sys.exit(1)

# --- Write GitHub Actions output safely (encode newlines) ---
def write_output(name: str, value: str):
    output_file = os.environ.get("GITHUB_OUTPUT")
    if output_file:
        safe_value = value.replace("\n", "%0A")  # Encode newlines
        with open(output_file, "a") as f:
            f.write(f"{name}={safe_value}\n")
        log(f"Set GitHub output {name}={safe_value}")
    else:
        log(f"GITHUB_OUTPUT not set, skipping output {name}")

# --- Main ---
def main():
    base = os.environ.get("BASE_COMMIT", "").strip()
    head = os.environ.get("HEAD_COMMIT", "").strip()
    docs_flag = os.environ.get("DOCS_CHANGED", "false").lower() == "true"

    general_webhook = os.environ.get("DISCORD_WEBHOOK_GENERAL", "").strip()
    llvm_webhook = os.environ.get("DISCORD_WEBHOOK_LLVM_DISCUSSION", "").strip()

    log(f"DOCS_CHANGED={docs_flag}")
    log(f"BASE={base}, HEAD={head}")

    if not base:
        base = get_base_commit()
        log(f"Fallback base commit: {base}")
    if not head:
        head = run("git rev-parse HEAD")
        log(f"Fallback head commit: {head}")

    commit_log = get_commit_log(docs_flag, base)
    print("\n===== COMMIT LOG =====")
    print(commit_log)
    print("=====================\n")

    link, nodoc = parse_commit_log(commit_log)

    # Enforce commit message policy
    if docs_flag and not link:
        log("Policy violation: docs changed but missing 'link:'")
        sys.exit(1)
    if not docs_flag and not nodoc:
        log("Policy violation: no docs changed but missing 'nodoc'")
        sys.exit(1)

    # Set GitHub Actions outputs
    write_output("link", link or "")
    write_output("nodoc", "true" if nodoc else "")

    # Build Discord message if link exists
    if link:
        clean_link = link.strip()
        article_url = f"https://www.compilersutra.com/docs{clean_link}"
        message = f"New article published on CompilerSutra\n{article_url}"
        write_output("discord_message", message)
        log(f"Discord message: {message}")

        # Select webhook based on link
        webhook = llvm_webhook if clean_link.lower().startswith("/llvm") else general_webhook
        send_discord(message, webhook)

    log("Commit message policy passed")

if __name__ == "__main__":
    main()
