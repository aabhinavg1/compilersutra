#!/usr/bin/env python3
"""Daily Basic Terminology spotlight — one concept per day from the hub catalog."""

from __future__ import annotations

import argparse
import json
from datetime import date, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT_DIR = ROOT / "out"
# Hub catalog lives in the site source (JS). Keep a mirrored JSON for the bot.
CATALOG = ROOT / "catalog.json"
SITE = "https://www.compilersutra.com"


def load_catalog():
    data = json.loads(CATALOG.read_text(encoding="utf-8"))
    topics = data["topics"]
    modules = {m["id"]: m for m in data["modules"]}
    return topics, modules


def pick_topic(topics: list, on: date):
    # Stable daily rotation from epoch day
    idx = on.toordinal() % len(topics)
    return topics[idx], idx


def write_markdown(topic: dict, module: dict, on: date, out_path: Path):
    blog = (topic.get("resources") or {}).get("blog") or ""
    youtube = (topic.get("resources") or {}).get("youtube") or ""
    pdf = (topic.get("resources") or {}).get("pdf") or ""
    lines = [
        f"# Daily Basic Terminology — {on.isoformat()}",
        "",
        f"**Module {module.get('num', '')} · {module.get('title', '')}**",
        "",
        f"## {topic['title']}",
        "",
        topic.get("description", ""),
        "",
        "### Why today",
        "",
        "One concept a day keeps the beginner path moving. Read the short page, then follow one resource link.",
        "",
        "### Resources",
        "",
    ]
    if blog:
        url = blog if blog.startswith("http") else SITE + blog
        lines.append(f"- Read: {url}")
    if youtube:
        lines.append(f"- Watch: {youtube}")
    if pdf:
        url = pdf if pdf.startswith("http") else SITE + pdf
        lines.append(f"- PDF: {url}")
    lines.extend(
        [
            "",
            "### Hub",
            "",
            f"- {SITE}/docs/basic-terminology/",
            "",
            "### Share line",
            "",
            f"Today's CompilerSutra term: **{topic['title']}** — {topic.get('description', '')} {SITE}/docs/basic-terminology/",
            "",
        ]
    )
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text("\n".join(lines), encoding="utf-8")


def try_write_pdf(topic: dict, module: dict, on: date, out_path: Path) -> bool:
    try:
        from fpdf import FPDF
    except ImportError:
        return False

    class Deck(FPDF):
        def footer(self):
            self.set_y(-12)
            self.set_font("Helvetica", "", 8)
            self.set_text_color(120, 120, 120)
            self.cell(0, 8, f"{SITE}/docs/basic-terminology/  |  {on.isoformat()}", align="C")

    def safe(text: str) -> str:
        for a, b in {
            "\u2014": "-",
            "\u2013": "-",
            "\u2019": "'",
            "\u2018": "'",
            "\u2026": "...",
            "\u2192": "->",
        }.items():
            text = text.replace(a, b)
        return text.encode("latin-1", "replace").decode("latin-1")

    pdf = Deck(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()
    pdf.set_fill_color(216, 114, 0)
    pdf.rect(0, 0, 210, 3, "F")
    pdf.set_xy(16, 18)
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(216, 114, 0)
    pdf.cell(0, 7, safe("COMPILERSUTRA  |  DAILY BASIC TERMINOLOGY"))
    pdf.set_xy(16, 30)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 6, safe(f"{on.isoformat()}  ·  Module {module.get('num', '')} {module.get('title', '')}"))
    pdf.set_xy(16, 42)
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(20, 20, 20)
    pdf.multi_cell(178, 10, safe(topic["title"]))
    pdf.set_xy(16, pdf.get_y() + 4)
    pdf.set_font("Helvetica", "", 12)
    pdf.set_text_color(50, 50, 50)
    pdf.multi_cell(178, 7, safe(topic.get("description", "")))
    y = pdf.get_y() + 10
    pdf.set_xy(16, y)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 7, safe("Resources"))
    y = pdf.get_y() + 4
    resources = topic.get("resources") or {}
    for label, key in (("Read", "blog"), ("Watch", "youtube"), ("PDF", "pdf")):
        val = resources.get(key)
        if not val:
            continue
        url = val if str(val).startswith("http") else SITE + str(val)
        pdf.set_xy(16, y)
        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(20, 20, 20)
        pdf.cell(18, 6, safe(f"{label}:"))
        pdf.set_font("Helvetica", "U", 10)
        pdf.set_text_color(40, 90, 160)
        pdf.write(6, safe(url), url)
        y = pdf.get_y() + 8
    pdf.set_xy(16, y + 6)
    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(50, 50, 50)
    pdf.multi_cell(
        178,
        6,
        safe("Hub: browse all modules at compilersutra.com/docs/basic-terminology/"),
    )
    out_path.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(out_path))
    return True


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--date", help="YYYY-MM-DD (default: today)")
    parser.add_argument("--out-dir", default=str(OUT_DIR))
    args = parser.parse_args(argv)

    on = parse_date(args.date) if args.date else date.today()
    topics, modules = load_catalog()
    topic, _idx = pick_topic(topics, on)
    module = modules.get(topic["moduleId"], {"num": "?", "title": topic["moduleId"]})

    out_dir = Path(args.out_dir)
    md_path = out_dir / f"daily-{on.isoformat()}-{topic['id']}.md"
    pdf_path = out_dir / f"daily-{on.isoformat()}-{topic['id']}.pdf"

    write_markdown(topic, module, on, md_path)
    print(md_path)
    if try_write_pdf(topic, module, on, pdf_path):
        print(pdf_path)
    else:
        print("PDF skipped (install fpdf2 for PDF output)")
    return 0


def parse_date(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()


if __name__ == "__main__":
    raise SystemExit(main())
