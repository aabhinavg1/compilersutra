#!/usr/bin/env python3
"""CompilerSutra weekly-live presentation PDF — 16:9 deck matching branded reference."""

from __future__ import annotations

import argparse
import json
from datetime import date, datetime
from pathlib import Path

from fpdf import FPDF

ROOT = Path(__file__).resolve().parent
SCHEDULE_PATH = ROOT / "schedule.json"
CURRICULUM_DIR = ROOT / "curriculum"
OUT_DIR = ROOT / "out"
ASSETS = ROOT / "assets"

# True 16:9 widescreen (mm)
W, H = 320.0, 180.0
MX = 18.0  # side margin

# Brand from reference deck
INK = (11, 10, 8)          # near-black title slides
CREAM = (250, 250, 248)    # content ground
WHITE = (255, 255, 255)
ORANGE = (216, 114, 0)     # accent
NAVY = (28, 36, 48)
MUTED = (110, 116, 126)
BODY = (40, 44, 52)
SOFT_LINE = (230, 230, 226)
CARD = (255, 255, 255)

SITE = "https://www.compilersutra.com"
SUBSCRIBE = (
    "https://docs.google.com/forms/d/e/"
    "1FAIpQLSebP1JfLFDp0ckTxOhODKPNVeI1e21rUqMJ0fbBwJoaa-i4Yw/viewform"
)


def safe(text: str) -> str:
    text = str(text)
    for a, b in {
        "\u2014": "-",
        "\u2013": "-",
        "\u2019": "'",
        "\u2018": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u2026": "...",
        "\u2192": "->",
        "\u00b7": "-",
        "\u2011": "-",
    }.items():
        text = text.replace(a, b)
    return text.encode("latin-1", "replace").decode("latin-1")


class Deck(FPDF):
    def __init__(self):
        # Portrait + explicit WxH avoids fpdf landscape swap
        super().__init__(orientation="P", unit="mm", format=(W, H))
        self.set_auto_page_break(auto=False)
        self.slide = 0
        self.logo = None
        for candidate in (
            ASSETS / "logo.jpg",
            ASSETS / "icon-512x512.png",
            ASSETS / "compilersutra-social-card.png",
        ):
            if candidate.exists():
                self.logo = candidate
                break

    def _footer(self, dark: bool = False):
        self.set_xy(MX, H - 9)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(*(140, 140, 140) if not dark else (120, 118, 112))
        self.cell(W / 2 - MX, 5, safe(SITE), align="L")
        self.set_xy(W / 2, H - 9)
        self.cell(W / 2 - MX, 5, f"{self.slide} / 12", align="R")

    def _logo(self, dark: bool = False):
        if not self.logo:
            return
        try:
            if dark:
                self.image(str(self.logo), x=W - 28, y=10, h=12)
            else:
                self.image(str(self.logo), x=W - 26, y=8, h=10)
        except Exception:
            pass

    def dark_slide(self):
        self.add_page()
        self.slide += 1
        self.set_fill_color(*INK)
        self.rect(0, 0, W, H, "F")
        # thin orange accent line at top
        self.set_fill_color(*ORANGE)
        self.rect(0, 0, W, 1.6, "F")
        self._logo(dark=True)
        self._footer(dark=True)

    def light_slide(self, eyebrow: str = "", title: str = "", subtitle: str = ""):
        self.add_page()
        self.slide += 1
        self.set_fill_color(*CREAM)
        self.rect(0, 0, W, H, "F")
        # top orange hairline
        self.set_fill_color(*ORANGE)
        self.rect(0, 0, W, 1.4, "F")
        self._logo(dark=False)

        y = 14
        if eyebrow:
            self.set_xy(MX, y)
            self.set_font("Helvetica", "B", 9)
            self.set_text_color(*ORANGE)
            self.cell(0, 5, safe(eyebrow.upper()))
            y += 8
        if title:
            self.set_xy(MX, y)
            self.set_font("Helvetica", "B", 26)
            self.set_text_color(*INK)
            self.multi_cell(W - 2 * MX - 20, 10, safe(title))
            y = self.get_y() + 1
        if subtitle:
            self.set_xy(MX, y)
            self.set_font("Helvetica", "", 12)
            self.set_text_color(*MUTED)
            self.multi_cell(W - 2 * MX - 20, 6, safe(subtitle))
            y = self.get_y() + 4
        self.content_y = max(y, 36)
        self._footer(dark=False)

    def pill(self, x, y, w, h, label, value, sub=""):
        self.set_fill_color(*WHITE)
        self.set_draw_color(*SOFT_LINE)
        self.rect(x, y, w, h, "DF")
        self.set_fill_color(*ORANGE)
        self.rect(x, y, w, 1.8, "F")
        self.set_xy(x + 6, y + 10)
        self.set_font("Helvetica", "B", 28)
        self.set_text_color(*INK)
        self.cell(w - 12, 12, safe(value), align="C")
        self.set_xy(x + 6, y + 26)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(*ORANGE)
        self.cell(w - 12, 6, safe(label), align="C")
        if sub:
            self.set_xy(x + 6, y + 34)
            self.set_font("Helvetica", "", 9)
            self.set_text_color(*MUTED)
            self.cell(w - 12, 5, safe(sub), align="C")

    def card(self, x, y, w, h, title, body, footer=""):
        self.set_fill_color(*WHITE)
        self.set_draw_color(*SOFT_LINE)
        self.rect(x, y, w, h, "DF")
        self.set_fill_color(*ORANGE)
        self.rect(x, y, 2.2, h, "F")
        self.set_xy(x + 7, y + 6)
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(*INK)
        self.multi_cell(w - 12, 6, safe(title))
        self.set_x(x + 7)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(*BODY)
        self.multi_cell(w - 12, 5, safe(body))
        if footer:
            self.set_xy(x + 7, y + h - 10)
            self.set_font("Helvetica", "B", 8)
            self.set_text_color(*ORANGE)
            self.cell(w - 12, 5, safe(footer))

    def bullet(self, text, size=12, indent=0):
        x = MX + indent
        y = self.get_y()
        self.set_fill_color(*ORANGE)
        self.rect(x, y + 2.6, 2.0, 2.0, "F")
        self.set_xy(x + 5, y)
        self.set_font("Helvetica", "", size)
        self.set_text_color(*BODY)
        self.multi_cell(W - x - MX - 5, 6.2, safe(text))
        self.ln(1.2)

    def link_row(self, label, url):
        self.set_x(MX)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(*INK)
        self.write(6, safe(f"{label}  "))
        self.set_font("Helvetica", "U", 10)
        self.set_text_color(40, 90, 160)
        self.write(6, safe(url), url)
        self.ln(7.5)


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def parse_date(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()


def find_live(schedule: dict, *, live_id: str | None = None, on: date | None = None):
    lives = schedule.get("lives") or []
    if live_id:
        for item in lives:
            if item.get("id") == live_id:
                return item
        raise SystemExit(f"Live id not found: {live_id}")
    if on:
        matches = [item for item in lives if item.get("date") == on.isoformat()]
        if not matches:
            raise SystemExit(f"No live scheduled on {on.isoformat()}")
        return matches[0]
    raise SystemExit("Provide --live or --date")


def next_upcoming(schedule: dict, today: date):
    upcoming = []
    for item in schedule.get("lives") or []:
        d = parse_date(item["date"])
        if d >= today:
            upcoming.append((d, item))
    if not upcoming:
        raise SystemExit("No upcoming lives in schedule.json")
    upcoming.sort(key=lambda pair: pair[0])
    return upcoming[0][1]


def curriculum_for(live: dict):
    course = live.get("course")
    if not course:
        return None
    path = CURRICULUM_DIR / f"{course}.json"
    return load_json(path) if path.exists() else None


def build_presentation(live: dict, curriculum: dict | None, out_path: Path):
    pdf = Deck()
    stats = (curriculum or {}).get("stats") or {"lessons": 52, "chapters": 8, "price": "Free"}
    chapters = (curriculum or {}).get("chapters") or []

    # ---- 1 Title ----
    pdf.dark_slide()
    pdf.set_xy(MX, 28)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(*ORANGE)
    pdf.cell(0, 6, safe("COMPILERSUTRA  |  WEEKLY LIVE"))

    pdf.set_xy(MX, 48)
    pdf.set_font("Helvetica", "B", 34)
    pdf.set_text_color(*WHITE)
    pdf.multi_cell(W - 2 * MX - 10, 13, safe("Parallel Programming:\nOne Problem, Several Machines."))

    pdf.set_xy(MX, pdf.get_y() + 6)
    pdf.set_font("Helvetica", "", 13)
    pdf.set_text_color(180, 176, 168)
    pdf.multi_cell(
        W - 2 * MX - 20,
        6.5,
        safe(
            "A hands-on journey moving a single computation across single-thread CPU, "
            "OpenMP, SIMD vector lanes, GPU kernels, and distributed MPI clusters."
        ),
    )

    # meta chips
    y = H - 42
    pdf.set_xy(MX, y)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(*ORANGE)
    pdf.cell(55, 6, safe("52 SELF-PACED LESSONS"))
    pdf.set_text_color(180, 176, 168)
    pdf.cell(8, 6, safe("|"))
    pdf.set_text_color(*ORANGE)
    pdf.cell(55, 6, safe("BASIC C / C++"))
    pdf.set_text_color(180, 176, 168)
    pdf.cell(8, 6, safe("|"))
    pdf.set_text_color(*ORANGE)
    pdf.cell(40, 6, safe("FREE COURSE"))

    pdf.set_xy(MX, y + 10)
    pdf.set_font("Helvetica", "U", 11)
    pdf.set_text_color(*ORANGE)
    pdf.write(6, safe(SITE), SITE)

    # ---- 2 Three pillars ----
    pdf.light_slide("Core Philosophy", "Three Pillars of High-Performance Code")
    y = pdf.content_y + 2
    cw = (W - 2 * MX - 12) / 3
    cards = [
        (
            "1. Keep It Correct",
            "Races, shared memory hazards, and synchronization are first-class - not afterthoughts.",
            "Mutex + Atomics + Barriers",
        ),
        (
            "2. Adapt the Machine",
            "OpenMP, SIMD, CUDA/ROCm/OpenCL, and MPI are specialized engines for the same algorithm.",
            "CPU + Vector + GPU + Cluster",
        ),
        (
            "3. Measure What Changed",
            "Validate gains with speedup, parallel efficiency, and Amdahl's Law bounds.",
            "Speedup + Efficiency + Profiling",
        ),
    ]
    for i, (t, b, f) in enumerate(cards):
        pdf.card(MX + i * (cw + 6), y, cw, 78, t, b, f)

    # ---- 3 Session overview ----
    pdf.light_slide("Session Overview", "What We Are Covering Today")
    items = [
        ("01", "Why this course exists", "Standardizing one computation across varied hardware targets."),
        ("02", "Curriculum breakdown", "Chapters 1 to 8 across 52 self-contained lessons."),
        ("03", "Zero-hardware barrier", "Learn GPU programming directly on your smartphone."),
        ("04", "CompilerSutra ecosystem", "Interactive tools, ABI Explorer, and track guidance."),
    ]
    y = pdf.content_y
    for num, title, body in items:
        pdf.set_xy(MX, y)
        pdf.set_font("Helvetica", "B", 18)
        pdf.set_text_color(*ORANGE)
        pdf.cell(14, 8, safe(num))
        pdf.set_font("Helvetica", "B", 14)
        pdf.set_text_color(*INK)
        pdf.cell(0, 8, safe(title))
        pdf.set_xy(MX + 14, y + 8)
        pdf.set_font("Helvetica", "", 11)
        pdf.set_text_color(*MUTED)
        pdf.multi_cell(W - MX - 40, 5.5, safe(body))
        y = pdf.get_y() + 4

    # ---- 4 Course glance ----
    pdf.light_slide("Course Scale", "Course at a Glance")
    y = pdf.content_y + 8
    pw = (W - 2 * MX - 16) / 3
    pdf.pill(MX, y, pw, 48, "STRUCTURED CHAPTERS", str(stats.get("chapters", 8)))
    pdf.pill(MX + pw + 8, y, pw, 48, "HANDS-ON LESSONS", str(stats.get("lessons", 52)))
    pdf.pill(MX + 2 * (pw + 8), y, pw, 48, "FREE & OPEN ACCESS", "100%")
    pdf.set_xy(MX, y + 62)
    pdf.set_font("Helvetica", "", 12)
    pdf.set_text_color(*BODY)
    pdf.multi_cell(
        W - 2 * MX,
        6,
        safe(
            (curriculum or {}).get("summary")
            or "Take the same computation from one CPU core to threads, OpenMP, SIMD, GPU, and cluster. "
            "Keep it correct. Measure what actually changed."
        ),
    )
    pdf.set_y(pdf.get_y() + 4)
    pdf.link_row("Course hub", f"{SITE}/docs/parallel-computing/")

    # ---- 5 Chapters 1-4 ----
    pdf.light_slide("Part 1", "Curriculum Foundations (Ch. 1-4)", "CPU & Shared Memory Focus")
    y = pdf.content_y
    defaults_a = [
        ("01", "Parallel Thinking", "Sequential execution, concurrency models, identifying races."),
        ("02", "CPU Multithreading", "Threads, cores, mutex locks, atomics, barrier sync."),
        ("03", "OpenMP Pragmas", "Parallel regions, reductions, scheduling, private vars."),
        ("04", "Parallel Patterns", "Map, reduce, scan, stencil, data decomposition."),
    ]
    ch_a = []
    for i, ch in enumerate(chapters[:4]):
        ch_a.append((f"{ch.get('num', i+1):02d}" if isinstance(ch.get('num'), int) else f"{i+1:02d}",
                     ch.get("label", defaults_a[i][1]),
                     ch.get("covers", defaults_a[i][2])))
    if not ch_a:
        ch_a = defaults_a
    cw = (W - 2 * MX - 8) / 2
    card_h = 52
    for i, (num, title, body) in enumerate(ch_a):
        col = i % 2
        row = i // 2
        x = MX + col * (cw + 8)
        yy = y + row * (card_h + 6)
        pdf.card(x, yy, cw, card_h, f"Chapter {num}  {title}", body)

    # ---- 6 Chapters 5-8 ----
    pdf.light_slide("Part 2", "Advanced & Hardware (Ch. 5-8)", "Vector, Acceleration & Cluster")
    y = pdf.content_y
    defaults_b = [
        ("05", "SIMD Vectorization", "Vector lanes, alignment, intrinsics, auto-vectorization."),
        ("06", "GPU Kernel Execution", "Memory, thread blocks, CUDA, ROCm, OpenCL, Vulkan."),
        ("07", "Distributed Computing", "MPI, point-to-point transfers, collectives."),
        ("08", "Measuring Performance", "Speedup, efficiency, Amdahl limits, profiling."),
    ]
    ch_b = []
    for i, ch in enumerate(chapters[4:8]):
        ch_b.append((f"{ch.get('num', i+5):02d}" if isinstance(ch.get('num'), int) else f"{i+5:02d}",
                     ch.get("label", defaults_b[i][1]),
                     ch.get("covers", defaults_b[i][2])))
    if not ch_b:
        ch_b = defaults_b
    for i, (num, title, body) in enumerate(ch_b):
        col = i % 2
        row = i // 2
        x = MX + col * (cw + 8)
        yy = y + row * (card_h + 6)
        pdf.card(x, yy, cw, card_h, f"Chapter {num}  {title}", body)

    # ---- 7 How to study ----
    pdf.light_slide("Practical Learning Loop", "How to Study for Maximum Retention")
    y = pdf.content_y + 6
    steps = [
        ("Read Page", "Absorb one focused conceptual unit at a time."),
        ("Run Exercise", "Complete the targeted coding challenge on that page."),
        ("Verify Metric", "Observe the hardware speedup directly on your system."),
    ]
    sw = (W - 2 * MX - 12) / 3
    for i, (t, b) in enumerate(steps):
        x = MX + i * (sw + 6)
        pdf.set_fill_color(*WHITE)
        pdf.set_draw_color(*SOFT_LINE)
        pdf.rect(x, y, sw, 55, "DF")
        pdf.set_fill_color(*ORANGE)
        pdf.rect(x, y, sw, 1.8, "F")
        pdf.set_xy(x + 6, y + 8)
        pdf.set_font("Helvetica", "B", 22)
        pdf.set_text_color(*ORANGE)
        pdf.cell(sw - 12, 10, safe(f"{i+1:02d}"))
        pdf.set_xy(x + 6, y + 22)
        pdf.set_font("Helvetica", "B", 13)
        pdf.set_text_color(*INK)
        pdf.cell(sw - 12, 7, safe(t))
        pdf.set_xy(x + 6, y + 32)
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(*BODY)
        pdf.multi_cell(sw - 12, 5, safe(b))
    pdf.set_xy(MX, y + 66)
    pdf.link_row("How to use this course", f"{SITE}/docs/parallel-computing/start-here/how-to-use-this-course/")

    # ---- 8 Phone GPU ----
    pdf.light_slide("Hardware Access", "No Desktop GPU? You Still Have One.")
    pdf.set_xy(MX, pdf.content_y)
    pdf.set_font("Helvetica", "", 13)
    pdf.set_text_color(*BODY)
    pdf.multi_cell(
        W - 2 * MX - 10,
        7,
        safe(
            "Learn parallel programming on hardware you already own. "
            "Android phones with Adreno or Mali graphics chips run the same "
            "data-parallel ideas as server-grade CUDA chips."
        ),
    )
    y = pdf.get_y() + 8
    chips = [("OpenCL", "When the device exposes it"), ("Vulkan Compute", "Portable on-device kernels"), ("Android NDK", "Native mobile toolchain")]
    cw = (W - 2 * MX - 12) / 3
    for i, (t, b) in enumerate(chips):
        pdf.card(MX + i * (cw + 6), y, cw, 42, t, b)
    pdf.set_xy(MX, y + 52)
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(*ORANGE)
    pdf.cell(0, 6, safe("Same execution model. Same workgroups. Hardware you already own."))
    pdf.set_y(pdf.get_y() + 8)
    pdf.link_row("Learn parallel on your phone GPU", f"{SITE}/docs/gpu/platforms/android/learn-parallel-on-phone/")
    pdf.link_row("Android GPU track", f"{SITE}/docs/gpu/platforms/android/")

    # ---- 9 Phone roadmap ----
    pdf.light_slide("Smartphone Learning Track", "Phone GPU Execution Roadmap")
    steps = [
        ("STEP 1", "Master Fundamentals", "Threads, shared memory, Amdahl limits on the host CPU."),
        ("STEP 2", "OpenCL & Vulkan Drivers", "Query compute capability on mobile chipset targets."),
        ("STEP 3", "Data-Parallel Kernels", "Map matrix ops across mobile GPU workgroups."),
        ("STEP 4", "Memory Buffer Transfer", "Manage host-to-device buffer copies efficiently."),
        ("STEP 5", "On-Device Benchmarking", "Evaluate latency, bandwidth, and thermal efficiency."),
    ]
    y = pdf.content_y - 2
    for tag, title, body in steps:
        pdf.set_xy(MX, y)
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_text_color(*ORANGE)
        pdf.cell(18, 6, safe(tag))
        pdf.set_font("Helvetica", "B", 12)
        pdf.set_text_color(*INK)
        pdf.cell(55, 6, safe(title))
        pdf.set_font("Helvetica", "", 11)
        pdf.set_text_color(*BODY)
        pdf.cell(0, 6, safe(body))
        y += 12
    pdf.set_y(y + 4)
    pdf.link_row("What is a GPU?", f"{SITE}/docs/gpu/what_is_gpu/")
    pdf.link_row("Detect OpenCL on Android", f"{SITE}/docs/gpu/opencl/basic/detecting_opencl_gpu_on_android/")
    pdf.link_row("What is OpenCL?", f"{SITE}/docs/gpu/opencl/basic/what_is_opencl/")

    # ---- 10 Ecosystem ----
    pdf.light_slide("Ecosystem", "More Tracks & Interactive Tools")
    y = pdf.content_y
    left, right = MX, W / 2 + 4
    pdf.set_xy(left, y)
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(*ORANGE)
    pdf.cell(0, 7, safe("GPU Platforms"))
    pdf.ln(9)
    for label, url in [
        ("CUDA", f"{SITE}/docs/gpu/platforms/cuda/"),
        ("ROCm", f"{SITE}/docs/gpu/platforms/rocm/"),
        ("OpenCL", f"{SITE}/docs/gpu/opencl/basic/what_is_opencl/"),
        ("Vulkan Compute", f"{SITE}/docs/gpu/platforms/vulkan/"),
        ("Parallel Computing", f"{SITE}/docs/parallel-computing/"),
    ]:
        pdf.set_x(left)
        pdf.set_font("Helvetica", "", 12)
        pdf.set_text_color(40, 90, 160)
        pdf.write(6.5, safe(label), url)
        pdf.ln(8)

    pdf.set_xy(right, y)
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(*ORANGE)
    pdf.cell(0, 7, safe("Site Tools"))
    pdf.ln(9)
    for label, url in [
        ("Clang Flags Explorer", f"{SITE}/tools/clang-flags/"),
        ("-fomit-frame-pointer", f"{SITE}/tools/clang-flags/-fomit-frame-pointer/"),
        ("ABI Explorer", f"{SITE}/abi/"),
        ("Weekly Problems", f"{SITE}/docs/weekly-problems/"),
        ("MCQ Hub", f"{SITE}/docs/mcq/"),
    ]:
        pdf.set_x(right)
        pdf.set_font("Helvetica", "", 12)
        pdf.set_text_color(40, 90, 160)
        pdf.write(6.5, safe(label), url)
        pdf.ln(8)

    # ---- 11 Next action ----
    pdf.light_slide("Next Action", "After This Live Session", "Do this next - then bring questions to the next session.")
    actions = [
        "Open the Course Hub and read Start Here",
        "Finish Chapter 1 before the next live",
        "No desktop GPU? Start the phone GPU path",
        "Subscribe to Weekly Compiler Notes for follow-ups",
    ]
    for a in actions:
        pdf.bullet(a, size=13)
    pdf.ln(4)
    pdf.link_row("Course hub", f"{SITE}/docs/parallel-computing/")
    pdf.link_row("Phone GPU path", f"{SITE}/docs/gpu/platforms/android/learn-parallel-on-phone/")
    pdf.link_row("Subscribe", SUBSCRIBE)

    # ---- 12 Close ----
    pdf.dark_slide()
    pdf.set_xy(MX, 40)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(*ORANGE)
    pdf.cell(0, 6, safe("COMPILERSUTRA"))

    pdf.set_xy(MX, 58)
    pdf.set_font("Helvetica", "B", 30)
    pdf.set_text_color(*WHITE)
    pdf.multi_cell(W - 2 * MX - 10, 12, safe("Let's build parallel intuition -\nfor real."))

    pdf.set_xy(MX, pdf.get_y() + 8)
    pdf.set_font("Helvetica", "", 13)
    pdf.set_text_color(180, 176, 168)
    pdf.multi_cell(
        W - 2 * MX - 20,
        6.5,
        safe("Free guided paths moving from high-level source code down to hardware execution."),
    )
    pdf.set_xy(MX, H - 36)
    pdf.set_font("Helvetica", "U", 12)
    pdf.set_text_color(*ORANGE)
    pdf.write(6, safe(SITE), SITE)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(out_path))


def write_daily_pdf(live: dict, today: date, curriculum: dict | None, out_path: Path):
    pdf = Deck()
    remaining = (parse_date(live["date"]) - today).days
    if remaining > 1:
        countdown = f"{remaining} days to go"
    elif remaining == 1:
        countdown = "Tomorrow"
    elif remaining == 0:
        countdown = "Live today"
    else:
        countdown = "Session pack ready"

    pdf.dark_slide()
    pdf.set_xy(MX, 36)
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(*ORANGE)
    pdf.cell(0, 7, safe(countdown.upper()))
    pdf.set_xy(MX, 52)
    pdf.set_font("Helvetica", "B", 28)
    pdf.set_text_color(*WHITE)
    pdf.multi_cell(W - 2 * MX - 10, 12, safe(live.get("title") or "Parallel Programming Course"))
    pdf.set_xy(MX, pdf.get_y() + 4)
    pdf.set_font("Helvetica", "", 13)
    pdf.set_text_color(180, 176, 168)
    pdf.multi_cell(
        W - 2 * MX - 20,
        6.5,
        safe(live.get("subtitle") or "One problem. Several machines. Full curriculum walkthrough."),
    )

    pdf.light_slide("Share This", "One sentence + one link")
    pdf.bullet("Launching a free Parallel Computing course: one problem across CPU, OpenMP, SIMD, GPU, and MPI.")
    pdf.bullet("No desktop GPU? Learn on your phone GPU.")
    pdf.ln(2)
    pdf.link_row("Course", f"{SITE}/docs/parallel-computing/")
    pdf.link_row("Phone GPU path", f"{SITE}/docs/gpu/platforms/android/learn-parallel-on-phone/")
    pdf.link_row("Subscribe", SUBSCRIBE)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(out_path))


def main(argv=None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--live")
    parser.add_argument("--date")
    parser.add_argument("--daily", action="store_true")
    parser.add_argument("--upcoming", action="store_true")
    parser.add_argument("--both", action="store_true")
    parser.add_argument("--out-dir", default=str(OUT_DIR))
    args = parser.parse_args(argv)

    schedule = load_json(SCHEDULE_PATH)
    today = date.today()
    if args.date and args.daily:
        today = parse_date(args.date)

    if args.live:
        live = find_live(schedule, live_id=args.live)
    elif args.date and not args.daily:
        live = find_live(schedule, on=parse_date(args.date))
    else:
        live = next_upcoming(schedule, today)

    live = dict(live)
    live.pop("timeLocal", None)

    curriculum = curriculum_for(live)
    out_dir = Path(args.out_dir)
    outputs = []

    if args.both or not args.daily:
        session_path = out_dir / f"{live['id']}.pdf"
        build_presentation(live, curriculum, session_path)
        outputs.append(session_path)

    if args.both or args.daily:
        daily_path = out_dir / f"daily-{today.isoformat()}-{live['id']}.pdf"
        write_daily_pdf(live, today, curriculum, daily_path)
        outputs.append(daily_path)

    for path in outputs:
        print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
