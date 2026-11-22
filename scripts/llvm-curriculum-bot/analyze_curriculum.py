#!/usr/bin/env python3
"""Read-only LLVM curriculum analyzer.

Source of truth: docs/llvm/intro-to-llvm.md (the live LLVM roadmap).
Does not invent a separate backlog list. Does not modify the curriculum.

Outputs:
  - out/curriculum-backlog.json
  - out/curriculum-backlog.md
  - out/next-article.json  (recommended first Coming Soon topic)
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_ROADMAP = ROOT / "docs" / "llvm" / "intro-to-llvm.md"
OUT_DIR = Path(__file__).resolve().parent / "out"

LEVEL_RE = re.compile(r"^##\s+(LEVEL\s+(\d+)\s*[—\-–]\s*(.+?))\s*$", re.I)
TABLE_SEP_RE = re.compile(r"^\|\s*-+")
LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
COMING_SOON_RE = re.compile(r"Coming\s+Soon", re.I)

# Preferred production order within Level 0 (user curriculum plan).
# Matched against topic/title/dsa text; first unmatched Coming Soon wins.
LEVEL0_PRIORITY = [
    "hash tables, tries, string matching",
    "parse trees, ast, ll/lr",
    "cfg",
    "symbol tables, attribute grammars, union-find",
    "dag, tac",
    "data-flow graphs, worklists",
    "dynamic programming, graph coloring",
    "expression trees, interference graphs",
    "instruction scheduling",
    "scheduling",
]


@dataclass
class RelatedLink:
    title: str
    href: str
    exists: bool | None = None
    resolved_path: str | None = None


@dataclass
class CurriculumTopic:
    level: int
    level_title: str
    row_label: str
    topic: str
    status: str  # published | coming_soon | mixed
    coming_soon: bool
    related: list[RelatedLink] = field(default_factory=list)
    notes: str = ""


def repo_relative(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


def href_to_candidate_files(href: str) -> list[Path]:
    """Map a site href to possible docs/pages files in this repo."""
    raw = href.strip()
    if raw.startswith("http://") or raw.startswith("https://"):
        # Only resolve compilersutra.com internal docs when path-like.
        m = re.search(r"compilersutra\.com(/docs/[^?#]+|/abi/?|/tools/[^?#]+)", raw)
        if not m:
            return []
        raw = m.group(1)
    if raw.startswith("#"):
        return []

    path = raw.split("#", 1)[0].split("?", 1)[0]
    if not path.startswith("/"):
        # Relative markdown link from docs/llvm/
        base = DEFAULT_ROADMAP.parent
        return _expand_file_candidates(base / path)

    # Absolute site path
    if path.startswith("/docs/"):
        rel = path[len("/docs/") :].strip("/")
        return _expand_file_candidates(ROOT / "docs" / rel)
    if path.startswith("/abi"):
        return _expand_file_candidates(ROOT / "src" / "pages" / "abi")
    if path.startswith("/tools/"):
        rel = path[len("/tools/") :].strip("/")
        return _expand_file_candidates(ROOT / "src" / "pages" / "tools" / rel)
    if path.startswith("/library") or path.startswith("/dsa") or path.startswith("/books"):
        rel = path.strip("/")
        return _expand_file_candidates(ROOT / "src" / "pages" / rel)
    return []


def _expand_file_candidates(base: Path) -> list[Path]:
    candidates: list[Path] = []
    # Direct file with extensions
    if base.suffix in {".md", ".mdx", ".js", ".jsx", ".tsx"}:
        candidates.append(base)
        return candidates

    stem = base
    for ext in (".mdx", ".md", ".js", ".jsx", ".tsx"):
        candidates.append(Path(str(stem) + ext))
    candidates.append(stem / "index.mdx")
    candidates.append(stem / "index.md")
    candidates.append(stem / "index.js")
    return candidates


def resolve_href(href: str) -> tuple[bool | None, str | None]:
    candidates = href_to_candidate_files(href)
    if not candidates:
        return None, None
    for cand in candidates:
        if cand.exists():
            return True, repo_relative(cand)
    return False, repo_relative(candidates[0])


def split_table_row(line: str) -> list[str]:
    line = line.strip()
    if not line.startswith("|"):
        return []
    cells = [c.strip() for c in line.strip("|").split("|")]
    return cells


def parse_cell_links(cell: str) -> list[RelatedLink]:
    links: list[RelatedLink] = []
    for title, href in LINK_RE.findall(cell):
        exists, resolved = resolve_href(href)
        links.append(RelatedLink(title=title, href=href, exists=exists, resolved_path=resolved))
    return links


def classify_article_cell(cell: str) -> tuple[str, bool, str]:
    """Return status, coming_soon flag, notes."""
    has_coming = bool(COMING_SOON_RE.search(cell))
    links = parse_cell_links(cell)
    published_links = [l for l in links if l.exists is True]
    missing_links = [l for l in links if l.exists is False]

    if has_coming and published_links:
        return "mixed", True, "Coming Soon with related published article(s)"
    if has_coming:
        return "coming_soon", True, "Planned — no dedicated published article yet"
    if published_links and not missing_links:
        return "published", False, "Linked article file(s) found in repo"
    if published_links and missing_links:
        return "mixed", False, "Some linked paths missing on disk"
    if missing_links:
        return "coming_soon", True, "Linked path missing on disk (treat as backlog)"
    if cell.strip() in {"", "—", "-"}:
        return "coming_soon", True, "Empty article cell"
    return "published", False, "No Coming Soon marker"


def parse_roadmap(text: str) -> list[CurriculumTopic]:
    topics: list[CurriculumTopic] = []
    lines = text.splitlines()
    level = -1
    level_title = ""
    in_table = False
    header_cells: list[str] = []

    i = 0
    while i < len(lines):
        line = lines[i]
        m = LEVEL_RE.match(line)
        if m:
            level = int(m.group(2))
            level_title = m.group(1).strip()
            in_table = False
            header_cells = []
            i += 1
            continue

        if level < 0:
            i += 1
            continue

        if line.strip().startswith("|") and not TABLE_SEP_RE.match(line):
            cells = split_table_row(line)
            # Detect header row
            lowered = [c.lower() for c in cells]
            if any(h in lowered for h in ("article", "link")) and any(
                h in lowered for h in ("phase", "title", "#", "core dsa / algorithms")
            ):
                header_cells = cells
                in_table = True
                i += 1
                # skip separator if next
                if i < len(lines) and TABLE_SEP_RE.match(lines[i]):
                    i += 1
                continue

            if in_table and cells and header_cells:
                # Map columns loosely
                header_l = [h.lower() for h in header_cells]
                def col(*names: str) -> str:
                    for name in names:
                        if name in header_l:
                            return cells[header_l.index(name)] if header_l.index(name) < len(cells) else ""
                    return ""

                row_label = col("#", "phase") or (cells[0] if cells else "")
                topic = col("core dsa / algorithms", "title") or (cells[1] if len(cells) > 1 else "")
                article = col("article", "link") or (cells[-1] if cells else "")

                status, coming, notes = classify_article_cell(article)
                related = parse_cell_links(article)
                # Also capture "see also" style links already in article cell
                topics.append(
                    CurriculumTopic(
                        level=level,
                        level_title=level_title,
                        row_label=row_label,
                        topic=topic,
                        status=status,
                        coming_soon=coming,
                        related=related,
                        notes=notes,
                    )
                )
                i += 1
                continue

        # End table on blank / non-table after being in table
        if in_table and not line.strip().startswith("|"):
            in_table = False
            header_cells = []

        i += 1

    return topics


def pick_next_article(topics: list[CurriculumTopic]) -> CurriculumTopic | None:
    """Prefer Level 0 Coming Soon in the recommended production order."""
    level0 = [t for t in topics if t.level == 0 and t.coming_soon]
    for needle in LEVEL0_PRIORITY:
        for t in level0:
            hay = f"{t.topic} {t.row_label}".lower()
            if all(part.strip() in hay for part in needle.split(",") if part.strip()) or needle in hay:
                return t
            # softer: any keyword overlap for shorter needles
            if needle in hay:
                return t
    if level0:
        return level0[0]
    soon = [t for t in topics if t.coming_soon]
    return soon[0] if soon else None


def write_outputs(topics: list[CurriculumTopic], roadmap: Path, out_dir: Path) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    published = [t for t in topics if t.status == "published"]
    coming = [t for t in topics if t.coming_soon]
    mixed = [t for t in topics if t.status == "mixed"]
    next_topic = pick_next_article(topics)

    by_level: dict[str, dict] = {}
    for t in topics:
        key = str(t.level)
        bucket = by_level.setdefault(
            key,
            {"level": t.level, "title": t.level_title, "published": 0, "coming_soon": 0, "mixed": 0, "topics": []},
        )
        bucket["topics"].append(asdict(t))
        if t.status == "published":
            bucket["published"] += 1
        elif t.status == "mixed":
            bucket["mixed"] += 1
            bucket["coming_soon"] += 1
        else:
            bucket["coming_soon"] += 1

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sourceOfTruth": repo_relative(roadmap),
        "readOnly": True,
        "summary": {
            "topicsParsed": len(topics),
            "published": len(published),
            "comingSoon": len(coming),
            "mixed": len(mixed),
        },
        "levels": by_level,
        "backlog": [asdict(t) for t in coming],
        "recommendedNext": asdict(next_topic) if next_topic else None,
    }

    json_path = out_dir / "curriculum-backlog.json"
    md_path = out_dir / "curriculum-backlog.md"
    next_path = out_dir / "next-article.json"

    json_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    if next_topic:
        next_path.write_text(json.dumps(asdict(next_topic), indent=2) + "\n", encoding="utf-8")

    lines = [
        "# LLVM curriculum backlog (read-only)",
        "",
        f"Source of truth: `{repo_relative(roadmap)}`",
        f"Generated: {payload['generatedAt']}",
        "",
        "## Summary",
        "",
        f"- Topics parsed: **{len(topics)}**",
        f"- Published: **{len(published)}**",
        f"- Coming Soon / backlog: **{len(coming)}**",
        f"- Mixed (Coming Soon + related published): **{len(mixed)}**",
        "",
    ]
    if next_topic:
        lines.extend(
            [
                "## Recommended next article",
                "",
                f"- **Level {next_topic.level}** — {next_topic.level_title}",
                f"- Phase/row: {next_topic.row_label}",
                f"- Topic: **{next_topic.topic}**",
                f"- Notes: {next_topic.notes}",
                "",
                "Suggested title direction: *Hash Tables in Compiler Design: Identifier Lookup, String Interning and Symbol Management* (when matching Level 0 lexical hash/tries topic).",
                "",
            ]
        )

    lines.extend(["## Backlog by level", ""])
    for level_key in sorted(by_level.keys(), key=int):
        bucket = by_level[level_key]
        lines.append(f"### Level {bucket['level']} — {bucket['title']}")
        lines.append("")
        lines.append(f"Published {bucket['published']} · Coming Soon {bucket['coming_soon']}")
        lines.append("")
        for t in bucket["topics"]:
            if not t["coming_soon"]:
                continue
            related = ", ".join(f"[{r['title']}]({r['href']})" for r in t["related"]) or "—"
            lines.append(f"- **{t['topic']}** ({t['status']}) — related: {related}")
        lines.append("")

    lines.extend(
        [
            "## Rules",
            "",
            "- Do **not** regenerate published curriculum articles.",
            "- Extend related articles when status is `mixed` (Coming Soon + see also).",
            "- Update the roadmap only after a PR for a new article is approved.",
            "",
        ]
    )
    md_path.write_text("\n".join(lines), encoding="utf-8")

    return {
        "json": str(json_path),
        "md": str(md_path),
        "next": str(next_path) if next_topic else None,
        "summary": payload["summary"],
        "recommendedNext": payload["recommendedNext"],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--roadmap", type=Path, default=DEFAULT_ROADMAP)
    parser.add_argument("--out", type=Path, default=OUT_DIR)
    args = parser.parse_args()

    roadmap = args.roadmap if args.roadmap.is_absolute() else ROOT / args.roadmap
    if not roadmap.exists():
        raise SystemExit(f"Roadmap not found: {roadmap}")

    topics = parse_roadmap(roadmap.read_text(encoding="utf-8"))
    if not topics:
        raise SystemExit("No curriculum topics parsed — check roadmap table format.")

    result = write_outputs(topics, roadmap, args.out)
    print(json.dumps(result["summary"], indent=2))
    if result["recommendedNext"]:
        nxt = result["recommendedNext"]
        print(
            f"recommendedNext: L{nxt['level']} · {nxt['topic']} ({nxt['status']})"
        )
    print(f"wrote: {result['json']}")
    print(f"wrote: {result['md']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
