---
title: "Markdown Link Checker 3"
description: "Learn how to create and manage static libraries in Linux. This is Part 2 in our series, where Part 1 covered the concept and types of libraries. In this tutorial, we explore the Python implementation of a Markdown Link Checker for parsing, reporting, and improving developer workflows."
keywords:
  - markdown
  - markdown link checker
  - python markdown link checker
  - static library tutorial
  - linux static library
  - gcc static library
  - g++ static library
  - how to create static library
  - c++ static library example
  - compile static library
  - ar command static library
  - nm command static library
  - ranlib static library
  - static vs dynamic libraries
  - markdown dead link checker
  - python log parser
  - pandas log analysis
  - excel report generator python
  - json reporting python
  - csv reporting python
  - broken link checker python
  - documentation best practices
  - seo optimized documentation
  - compilersutra tutorial
  - github actions link checker
  - ci cd markdown link checker
  - python regex parser
  - handling dead links markdown
  - structured logging python
  - build static library gcc
  - c++ library compilation
  - export static library linux
  - linux programming tutorials
  - programming documentation guide
  - python developer tutorials
  - parsing markdown logs
  - mermaid diagrams in documentation
  - technical writing seo
  - markdown content optimization
  - devops link checker
  - open source documentation tools
  - markdown link validation
  - tutorial on python pandas
  - handling 404 errors markdown
  - create link reports json
  - export link reports csv
  - export link reports excel
  - compiler construction tutorials
  - bash vs python link checker
  - comparison link checkers
  - best practices static library
  - efficient log parsing
  - regex in python tutorial
  - advanced markdown parsing
  - broken link automation
  - cli tools for developers
  - linux developer tools
  - pandas dataframe tutorial
  - python tutorial compilersutra
  - c++ gcc g++ static library
  - developer guide libraries
  - common pitfalls static libraries
  - static library linking errors
  - python script markdown
  - python json export tutorial
  - python excel export tutorial
  - python csv export tutorial
  - pandas dataframe export
  - dead link detection tutorial
  - structured markdown doc
  - advanced seo documentation
  - markdown anchors link checking
  - in-page reference validation
  - linux systems programming
  - python automation scripting
  - creating cli python scripts
  - python log analyzer tutorial
  - compilersutra part 2
  - compilersutra part 3 python
  - learning static libraries
  - python developer workflows
  - python pandas beginner
  - data reporting python
  - broken link reporting
  - excel json csv python outputs
  - seo friendly python tutorial
  - static vs shared library
  - object files static library
  - create archive library linux
  - python markdown link validator
  - github ci cd static library
  - devops link automation
  - compiler design static library
  - compilersutra tutorials series
---


import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ZoomableImage from '@site/src/components/ZoomableImage';



# Markdown Link Checker (Part 3: Python Implementation)



📩 Interested in deep dives like pipelines, cache, and compiler optimizations?

<div
  style={{
    width: '100%',
    maxWidth: '900px',
    margin: '1rem auto',
  }}
>
  <iframe
    src="https://docs.google.com/forms/d/e/1FAIpQLSebP1JfLFDp0ckTxOhODKPNVeI1e21rUqMJ0fbBwJoaa-i4Yw/viewform?embedded=true"
    style={{
      width: '100%',
      minHeight: '620px',
      border: '0',
      borderRadius: '12px',
      background: '#fff',
    }}
    loading="lazy"
  >
    Loading…
  </iframe>
</div>

In the [previous part](https://www.compilersutra.com/docs/linux/markdown_checker_part2/), we explored a **Bash-based Markdown Link Checker**.  
While effective, Bash scripts can become difficult to maintain for more complex reporting.  

In this article, we shift to **Python**, leveraging its strengths in **regex parsing, data analysis, and report generation**. This enables a cleaner, extensible, and professional solution to validating links in your documentation.

:::caution check the youtube video
<div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', marginTop: '20px' }}>
  <iframe 
    src="https://www.youtube.com/embed/sfuTzw6HqIk"
    title="MakeFile tutorial"
    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowFullScreen
  />
</div>

:::

<div>
  <AdBanner />
</div>



## For Your Information

This guide introduces a [**Python implementation**](https://www.python.org) of a `Markdown Link Checker`.  
We will walk through log parsing, broken link detection, and generating reports in multiple formats.  

<Tabs>
  <TabItem value="Header" label="Header of Math">

  Python provides advanced libraries like `pandas` and `openpyxl` that make it easier to handle structured data and generate reports compared to plain Bash scripting.

  </TabItem>
  <TabItem value="Alternative" label="Alternative Approach">

  For lighter use cases, you may still prefer Bash or tools like `markdown-link-check`. However, Python provides flexibility for scaling and automation.

  </TabItem>
</Tabs>

### What’s Covered

- Environment setup and dependencies  
- Parsing Markdown link checker logs using regex  
- Skipping false positives such as in-page anchors  
- Generating structured reports (CSV, JSON, Excel)  
- Summarizing broken links by file and status  
- Possible extensions: CI integration, HTML reports, external validation  


<div>
  <AdBanner />
</div>


###### Complete Enhanced Markdown Link Checker Article with Python Implementation

## 🔧 Table of Contents
1. [Introduction](#1-introduction)
2. [Environment Setup](#2-environment-setup)
3. [Understanding the Log Format](#3-understanding-the-log-format)
4. [Step-by-Step Python Implementation](#4-step-by-step-python-implementation)
5. [Building the Parser](#5-building-the-parser)
6. [Generating Reports](#6-generating-reports)
7. [Summary & Statistics](#7-summary--statistics)
8. [Complete Python Script](#8-complete-python-script)
9. [Improvements & Extensions](#9-improvements--extensions)
10. [Conclusion](#10-conclusion)
11. [Read More](#more-articles)

---

:::caution check the youtube video
<div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', marginTop: '20px' }}>
  <iframe 
    src="https://www.youtube.com/embed/XDp50sPtruY"
    title="MakeFile tutorial"
    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowFullScreen
  />
</div>
:::

## 1. Introduction

Welcome to the comprehensive guide on implementing a `Markdown Link Checker` in Python which will take input from the output genrated by [bash](https://www.compilersutra.com/docs/linux/markdown_checker_part2/#actual-bash-code). 

In this article, we'll build a robust parser that processes link checker logs, extracts broken links, and generates detailed reports in multiple formats.

While basic shell scripts can handle simple text parsing, Python offers superior capabilities for complex log processing, error handling, and data export. Our implementation will handle multiple log formats, track file contexts, and produce structured outputs ready for analysis.

## 2. Environment Setup

**Requirements**
- Python 3.8 or higher
- Essential libraries: `pandas`, `openpyxl`

**Installation**
```bash
pip install pandas openpyxl
```

**Test Log File**
Create a sample log file (`test_log.txt`) with the following content:

```rust
🔍 Checking: ./docs/cpp/standard/cpp11.md
[✖] ./docs//c++/standard/cpp11.md#forwarding-references → Status: 404
[✖] ./docs//c++/standard/cpp11.md#rvalue-references → Status: 404
🔍 Checking: ./docs/python/pandas.md
[✖] ./docs/python/pandas.md#invalid-link → Status: 404
ERROR: 2 dead links found in ./docs/python/numpy.md !
→ ./docs/python/numpy.md#broken-link
→ ./docs/python/numpy.md#missing-section
🔍 Checking: ./docs/linux/bash.md
✅ All links verified successfully!
```

## 3. Understanding the Log Format

Markdown link checker logs typically contain several types of entries:

1. **File headers**: `🔍 Checking: filename.md` - indicates which file is being checked
2. **Broken links**: `[✖] url → Status: code` - specific broken links with HTTP status codes
3. **Error blocks**: `ERROR: X dead links found in file !` followed by `→ link` lines
4. **Success messages**: `✅ All links verified successfully!` - files with no broken links

<details>
<summary>Explanation / Insight</summary>

The log contains **file references, URLs, status codes, and error blocks**. Our parser needs to correctly capture all broken links while handling different formats and tracking the current file context.

</details>

<details>
<summary>Comparison / Alternatives</summary>

Bash-based solutions rely on text matching with tools like `grep`, `awk`, and `sed`, which may generate noisy results and struggle with complex patterns. Python, by contrast, provides structured parsing with regex and powerful libraries for downstream reporting.

</details>

<details>
<summary>Practical Tips / Best Practices</summary>

Always configure your checker to **ignore `#anchors`** unless you explicitly validate that the target headings exist in the same file. This prevents false positives. Additionally, consider normalizing file paths to ensure consistent reporting.

</details>

## 4. Step-by-Step Python Implementation

Our implementation strategy involves:

1. Reading the log file line by line
2. Using regex patterns to identify different log entry types
3. Maintaining context of the current file being processed
4. Extracting relevant information (file, URL, status code)
5. Storing results in a structured format for reporting

:::tip How the implementation digram will look like
:::

*Figure: Interactive system diagram with mouse-based navigation.*  
- Adjust Zoom
- Hold **left mouse button** and drag to move the diagram horizontally or vertically.  
- This allows you to **explore different parts** of the diagram without zooming.  
- Release the mouse to stop movement and return to a static view

<ZoomableImage
  src="/img/mermaid_python_implementation.svg"
  alt="Mermaid diagram generated using Python implementation"
/>

:::caution Digram Explanation
You know that [bash script](https://www.compilersutra.com/docs/linux/markdown_checker_part2/#actual-bash-code) we built last time? The one that spits out a log file that looks like a messy bachelor room , which need to clean now. 

I got tired of squinting at terminal output, trying to remember which files were the real problem children. So I built this Python parser. It's not fancy, but it gets the job done in a way that actually makes sense.


<details> 
<summary><strong> Here's the real story of what it does, step by step</strong></summary>

**tip First, It Just Reads the Darn File.**

Look, we've all been there. You run the bash checker, it vomits a thousand lines into a `check.log` file, and you just stare at it. This script's first job is to open that file and actually read it, line by line. No magic, just `open()` and a loop. It's the digital equivalent of taking a deep breath before you start sorting laundry.

**Then, It Plays a Game of "What Am I Looking At?" With Every Single Line.**

This is the core of it. For each line in that mess of a log file, it asks a series of questions to figure out what it's dealing with. It's like being a detective at a crime scene with a really specific checklist.

<Tabs>
  <TabItem value="checking" label="🔍 Checking: somefile.md">

  Does this line say **`🔍 Checking: somefile.md`**?

  - If yes, cool. It makes a mental note:  
    "Okay, whatever broken links come next probably live in `somefile.md`."  
  - It holds onto that filename like a bookmark.  
  - This is the most important trick—it always knows what context it's in.

  </TabItem>

  <TabItem value="broken" label="[✖] https://broken.link → Status: 404">

  Does this line look like **`[✖] https://broken.link → Status: 404`**?

  - Bingo. This is the classic broken link.  
  - It uses a regex (just a smart pattern matcher) to neatly pluck out the URL and the error code.  
  - It then packages that up with the current filename it's holding onto and throws that package into a "to-fix" pile. **Clean.**

  </TabItem>

  <TabItem value="error" label="ERROR: 5 dead links found in…">

  Does this line start with **`ERROR: 5 dead links found in…`**?

  - Ah, the bash script's dramatic way of telling us a file is really broken.  
  - The parser sees this and immediately updates its mental bookmark.  
  - *"Whoa, okay, the next few broken links are all from this file. Got it."*

  </TabItem>

  <TabItem value="arrow" label="→ another.broken.link">

  Is this line just **`→ another.broken.link`**?

  - Yep, that's a follow-up from the previous **ERROR** line.  
  - Since it's already got the right file bookmarked, it just takes the URL, slaps a **"DEAD"** label on it (because these lines don’t have a status code), and adds it to the pile.

  </TabItem>
</Tabs>


---

> *It does this for every... single... line. It's tedious, but computers are good at tedious. By the end, instead of a chaotic text file, we have a nice, clean list of dictionaries. Each one is a simple object: `{file: 'path/to/file.md', url: 'the.broken.link', status: 404}`. This is a way better starting point.*

---

**Now for the Fun Part: Making Useful Stuff.**

Having a clean list of problems is one thing. Doing something about it is another. This is where Python's libraries save us a million hours.

*   **The JSON File (`report.json`):** I output this because it's pure data. If I ever want to build a web dashboard, feed this into another script, or just look at it in a structured way, JSON is the go-to. It's the machine-friendly version of the report.

*   **The CSV File (`report.csv`):** This is for me, or for a project manager. You can open it in Excel, Google Sheets, LibreOffice, whatever. You can sort by filename to see all the issues in one place, or filter by `404` to see all the "Not Found" errors. It's the universal language of spreadsheet people.

*   **The Excel File (`report.xlsx`):** This is the fancy version of the CSV. Why? Because I can. Sometimes you want to send a report to someone who wants a single, clickable file that looks a bit more formal. Python's `pandas` library makes creating this as easy as creating the CSV.

**Finally, It Gives Me the TL;DR.**

I don't always want to open a spreadsheet. Sometimes I just want to know the big picture before my coffee kicks in. So the script gives me a summary right there in the terminal.

It'll say:
*   "Hey, you've got 12 broken links total."
*   "They're spread across 4 different files."
*   "`docs/that-one-tricky-guide.md` is the worst offender with 7 broken links."
*   "Most of the errors are 404s (page not found), but there are a couple of 500s (server errors) too."

This 30-second summary is often all I need to know where to start fixing things.

**So, Why Bother?**

The bash script *found* the problems. This Python script *organizes* them. It turns a headache-inducing log file into actionable tasks. It's the difference between being handed a bag of scattered Lego pieces and being handed the same pieces sorted into little bags by step number.

It's not about being clever. It's about being effective. And this? This is effective. Now I can actually go fix the links instead of just figuring out what's wrong.





***We'll use these regex patterns:***

```python
file_pattern = re.compile(r"^🔍 Checking:\s+(.+)")
broken_pattern = re.compile(r"^\[✖\]\s+(.+?)\s+→\s+Status:\s+(\d+)")
error_file_pattern = re.compile(r"^ERROR: \d+ dead links found in (.+?) !")
error_link_pattern = re.compile(r"^→\s+(.+)")
```

</details>

:::

## 5. Building the Parser

The core of our implementation is the `parse_log()` function:
> *This function handles all the log formats we might encounter and returns a list of dictionaries containing the file path, broken URL, and status code.*

<Tabs>

<TabItem value="Step 1" label="1. Initialize">

* Create an empty list `records` to hold results.
* Keep track of the current file being checked with `current_file = None`.

```python
def parse_log(log_file):
    records = []
    current_file = None
```


</TabItem>

<TabItem value="Step 2" label="2. Define Regex Patterns">

* **`file_pattern`**: Detects when the log starts checking a new file
  Example: `🔍 Checking: somefile.md`

* **`broken_pattern`**: Detects a broken link with an explicit status code
  Example: `[✖] https://broken.link → Status: 404`

* **`error_file_pattern`**: Detects an error summary header
  Example: `ERROR: 3 dead links found in file.md !`

* **`error_link_pattern`**: Detects dead links listed under an error block
  Example: `→ https://another.dead.link`

```python
    # Compile regex patterns for efficiency
    file_pattern = re.compile(r"^🔍 Checking:\s+(.+)")
    broken_pattern = re.compile(r"^\[✖\]\s+(.+?)\s+→\s+Status:\s+(\d+)")
    error_file_pattern = re.compile(r"^ERROR: \d+ dead links found in (.+?) !")
    error_link_pattern = re.compile(r"^→\s+(.+)")
```


</TabItem>

<TabItem value="Step 3" label="3. Read Line by Line">

* Open the log file and read line by line.
* Remove leading/trailing spaces using `strip()`.

```python
    with open(log_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
```

</TabItem>

<TabItem value="Step 4" label="4. Handle Cases">

* **Case 1 (File being checked):**
  If line matches `file_pattern`, update `current_file`.

* **Case 2 (Standard broken link):**
  If line matches `broken_pattern` and a file is set, extract `url` & `status`, then append to `records`.

* **Case 3 (Error block header):**
  If line matches `error_file_pattern`, update `current_file`.

* **Case 4 (Error block link):**
  If line matches `error_link_pattern`, append a record with `"status": "DEAD"`.

  ```python
            # Case 1: File being checked
            file_match = file_pattern.match(line)
            if file_match:
                current_file = file_match.group(1)
                continue
            
            # Case 2: Standard broken link format
            broken_match = broken_pattern.match(line)
            if broken_match and current_file:
                url, status = broken_match.groups()
                records.append({
                    "file": current_file,
                    "url": url,
                    "status": int(status)
                })
                continue
            
            # Case 3: ERROR block header
            error_file_match = error_file_pattern.match(line)
            if error_file_match:
                current_file = error_file_match.group(1)
                continue
            
            # Case 4: Link in ERROR block
            error_link_match = error_link_pattern.match(line)
            if error_link_match and current_file:
                url = error_link_match.group(1)
                records.append({
                    "file": current_file,
                    "url": url,
                    "status": "DEAD"  # No status code in this format
                })
```
```

</TabItem>

<TabItem value="Step 5" label="5. Return Results">

*After processing all lines, return `records` as a list of dictionaries.

```python
    return records
```
</TabItem>

<TabItem value="Complete" label="🔗 Complete Implementation">

Here is the combination of all the step as 


1. **Initialization**

   * Start with an empty list `records`.
   * Keep track of the current file using `current_file`.

2. **Define Regex Patterns i.e. Pattern Matching**

   * Use regex patterns to detect files, broken links, error blocks, and dead links.

3. **Read Line by Line for Parsing**

   * Read each line, strip whitespace, and test against the patterns.

```python
import re

def parse_log(log_file):
    records = []
    current_file = None

    # Compile regex patterns for efficiency
    file_pattern = re.compile(r"^🔍 Checking:\s+(.+)")
    broken_pattern = re.compile(r"^\[✖\]\s+(.+?)\s+→\s+Status:\s+(\d+)")
    error_file_pattern = re.compile(r"^ERROR: \d+ dead links found in (.+?) !")
    error_link_pattern = re.compile(r"^→\s+(.+)")

    with open(log_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            
            # Case 1: File being checked
            file_match = file_pattern.match(line)
            if file_match:
                current_file = file_match.group(1)
                continue
            
            # Case 2: Standard broken link format
            broken_match = broken_pattern.match(line)
            if broken_match and current_file:
                url, status = broken_match.groups()
                records.append({
                    "file": current_file,
                    "url": url,
                    "status": int(status)
                })
                continue
            
            # Case 3: ERROR block header
            error_file_match = error_file_pattern.match(line)
            if error_file_match:
                current_file = error_file_match.group(1)
                continue
            
            # Case 4: Link in ERROR block
            error_link_match = error_link_pattern.match(line)
            if error_link_match and current_file:
                url = error_link_match.group(1)
                records.append({
                    "file": current_file,
                    "url": url,
                    "status": "DEAD"  # No status code in this format
                })
    
    return records
```

</TabItem>
</Tabs>


<div>
  <AdBanner />
</div>



## 6. Generating Reports

We will create one seperate function for generating the reports

> **`save_reports()` Function**

:::tip **What it does** 
>*After parsing broken link logs into structured `records`,                                                                                       
> this function generates **reports**                                                                                                  
> in three formats:* 
    >> 1. **JSON** → structured machine-readable format.
    >> 2. **CSV** → spreadsheet/text-based format.
    >> 3. **Excel** → fully formatted spreadsheet file.
:::

*It uses **pandas DataFrame** to handle the conversion efficiently.*


 **Algorithm (Step-by-Step)**

1. **Convert Records**

   * Convert `records` (list of dicts) into a Pandas `DataFrame`.

2. **Check for Empty Data**

   * If there are no broken links (`df.empty`), print a warning and exit.

3. **Generate Reports**

   * Save as JSON (`to_json`) with indentation for readability.
   * Save as CSV (`to_csv`) for spreadsheet/text use.
   * Save as Excel (`to_excel`) for formatted spreadsheets.

4. **Confirm Success**

   * Print which files were generated.



<Tabs>

<TabItem value="Init" label="1. Convert to DataFrame">

```python
def save_reports(records, base_name="link_report"):
    df = pd.DataFrame(records)
```

</TabItem>

<TabItem value="Check" label="2. Check Empty Data">

```python
    if df.empty:
        print("⚠️ No broken links found in log file.")
        return
```

</TabItem>

<TabItem value="JSON" label="3a. Save JSON">

```python
    # Save JSON (structured data)
    df.to_json(f"{base_name}.json", orient="records", indent=4)
```

</TabItem>

<TabItem value="CSV" label="3b. Save CSV">

```python
    # Save CSV (spreadsheet compatible)
    df.to_csv(f"{base_name}.csv", index=False)
```

</TabItem>

<TabItem value="Excel" label="3c. Save Excel">

```python
    # Save Excel (formatted spreadsheet)
    df.to_excel(f"{base_name}.xlsx", index=False)
```

</TabItem>

<TabItem value="Confirm" label="4. Confirm Reports">

```python
    print(f"✅ Reports generated: {base_name}.json, {base_name}.csv, {base_name}.xlsx")
```

</TabItem>

<TabItem value="Complete" label="🔗 Complete Implementation + Theory">

***Theory (4 Key Steps)***

1. **Initialization & Conversion**
   * Convert `records` into a Pandas DataFrame.

2. **Validation**
   * If no records, show a warning and exit.

3. **Report Generation**
   * Save data into JSON, CSV, and Excel formats.

4. **Confirmation**
   * Print a success message with generated filenames.

```python
import pandas as pd

def save_reports(records, base_name="link_report"):
    df = pd.DataFrame(records)
    
    # Step 1: Check if DataFrame is empty
    if df.empty:
        print("⚠️ No broken links found in log file.")
        return
    
    # Step 2: Save JSON (structured data)
    df.to_json(f"{base_name}.json", orient="records", indent=4)
    
    # Step 3: Save CSV (spreadsheet compatible)
    df.to_csv(f"{base_name}.csv", index=False)
    
    # Step 4: Save Excel (formatted spreadsheet)
    df.to_excel(f"{base_name}.xlsx", index=False)
    
    # Step 5: Confirm success
    print(f"✅ Reports generated: {base_name}.json, {base_name}.csv, {base_name}.xlsx")
```

</TabItem>

</Tabs>

This approach gives us flexibility in how we use the data—JSON for automated processing, CSV for simple analysis, and Excel for formatted reports.

## 7. Summary & Statistics

To provide quick insights, we generate summary statistics:

```python
def print_summary(records):
    if not records:
        print("No broken links detected ✅")
        return
    
    df = pd.DataFrame(records)
    
    print("\n📊 Broken Links Summary\n")
    summary = df.groupby(["file"]).size().reset_index(name="broken_count")
    print(summary.to_string(index=False))
    
    print("\n🔎 Status breakdown:")
    print(df["status"].value_counts().to_string())
    
    # Additional statistics
    print(f"\n📈 Total broken links: {len(records)}")
    print(f"📂 Files with broken links: {len(summary)}")
```

:::tip  `*The above `summary` helps identify which files need the most `attention` and shows the `distribution of HTTP status` codes.*`
:::
## 8. Complete Python Script

Here's the complete enhanced implementation:

```python
#!/usr/bin/env python3
"""
Enhanced Markdown Link Checker Parser
Parses logs with multiple formats:
  - "🔍 Checking:" + "[✖]" broken links
  - "ERROR: X dead links found in file !" format
Generates JSON, CSV, Excel reports using pandas.
Adds comprehensive error handling and statistics.
"""

import re
import sys
from pathlib import Path
import pandas as pd

def parse_log(log_file):
    """
    Parse a markdown link checker log file and extract broken links.
    
    Args:
        log_file (str): Path to the log file
        
    Returns:
        list: Dictionary records of broken links with file, url, and status
    """
    records = []
    current_file = None

    # Compile regex patterns for efficiency
    file_pattern = re.compile(r"^🔍 Checking:\s+(.+)")
    broken_pattern = re.compile(r"^\[✖\]\s+(.+?)\s+→\s+Status:\s+(\d+)")
    error_file_pattern = re.compile(r"^ERROR: \d+ dead links found in (.+?) !")
    error_link_pattern = re.compile(r"^→\s+(.+)")
    success_pattern = re.compile(r"^✅ All links verified successfully!")

    try:
        with open(log_file, "r", encoding="utf-8") as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()
                
                # Skip empty lines
                if not line:
                    continue
                
                # Case 1: File being checked
                file_match = file_pattern.match(line)
                if file_match:
                    current_file = file_match.group(1)
                    continue
                
                # Case 2: Standard broken link format
                broken_match = broken_pattern.match(line)
                if broken_match and current_file:
                    url, status = broken_match.groups()
                    records.append({
                        "file": current_file,
                        "url": url,
                        "status": int(status)
                    })
                    continue
                
                # Case 3: ERROR block header
                error_file_match = error_file_pattern.match(line)
                if error_file_match:
                    current_file = error_file_match.group(1)
                    continue
                
                # Case 4: Link in ERROR block
                error_link_match = error_link_pattern.match(line)
                if error_link_match and current_file:
                    url = error_link_match.group(1)
                    records.append({
                        "file": current_file,
                        "url": url,
                        "status": "DEAD"  # No status code in this format
                    })
                    continue
                    
                # Case 5: Success message (reset current file to avoid false associations)
                if success_pattern.match(line):
                    current_file = None
                    
    except UnicodeDecodeError:
        print(f"Error: Unable to read file with UTF-8 encoding. Try specifying a different encoding.")
        sys.exit(1)
    except Exception as e:
        print(f"Error reading file: {e}")
        sys.exit(1)
    
    return records

def save_reports(records, base_name="link_report"):
    """
    Save parsed data to multiple report formats.
    
    Args:
        records (list): Parsed broken link records
        base_name (str): Base name for output files
    """
    if not records:
        print("⚠️ No broken links found in log file.")
        return
    
    df = pd.DataFrame(records)
    
    # Save JSON (structured data)
    try:
        df.to_json(f"{base_name}.json", orient="records", indent=4)
    except Exception as e:
        print(f"Error saving JSON report: {e}")
    
    # Save CSV (spreadsheet compatible)
    try:
        df.to_csv(f"{base_name}.csv", index=False)
    except Exception as e:
        print(f"Error saving CSV report: {e}")
    
    # Save Excel (formatted spreadsheet)
    try:
        df.to_excel(f"{base_name}.xlsx", index=False)
    except Exception as e:
        print(f"Error saving Excel report: {e}")
    
    print(f"✅ Reports generated: {base_name}.json, {base_name}.csv, {base_name}.xlsx")

def print_summary(records):
    """
    Print a summary of broken links statistics.
    
    Args:
        records (list): Parsed broken link records
    """
    if not records:
        print("No broken links detected ✅")
        return
    
    df = pd.DataFrame(records)
    
    print("\n" + "="*50)
    print("📊 BROKEN LINKS SUMMARY")
    print("="*50)
    
    # Files with broken links count
    file_summary = df.groupby(["file"]).size().reset_index(name="broken_count")
    print("\n📂 Files with broken links:")
    print(file_summary.to_string(index=False))
    
    # Status code breakdown
    print("\n🔎 Status code breakdown:")
    print(df["status"].value_counts().to_string())
    
    # Additional statistics
    print(f"\n📈 Total broken links: {len(records)}")
    print(f"📂 Files with broken links: {len(file_summary)}")
    
    # Most problematic files
    if len(file_summary) > 0:
        max_broken = file_summary["broken_count"].max()
        worst_files = file_summary[file_summary["broken_count"] == max_broken]
        print(f"🚨 File with most broken links: {worst_files['file'].iloc[0]} ({max_broken} links)")

def main():
    """Main function to handle command line execution."""
    if len(sys.argv) < 2:
        print("Usage: python md_link_checker.py <log_file> [output_base_name]")
        print("Example: python md_link_checker.py link_check.log my_report")
        sys.exit(1)
    
    log_file = Path(sys.argv[1])
    base_name = sys.argv[2] if len(sys.argv) > 2 else "link_report"

    if not log_file.exists():
        print(f"Error: File '{log_file}' not found.")
        sys.exit(1)
    
    print(f"📖 Parsing log file: {log_file}")
    records = parse_log(log_file)
    
    save_reports(records, base_name)
    print_summary(records)

if __name__ == "__main__":
    main()
```

## 9. Improvements & Extensions

Our implementation can be extended in several ways:

### 1. Anchor Validation
```python
def validate_anchors(markdown_file, anchor_links):
    """Check if anchors actually exist in the markdown file."""
    with open(markdown_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract all headings from the markdown
    headings = re.findall(r'^#+\s+(.+)$', content, re.MULTILINE)
    # Convert to anchor format (simplified)
    existing_anchors = {re.sub(r'[^a-zA-Z0-9]+', '-', h.lower().strip()) for h in headings}
    
    valid_links = []
    broken_links = []
    
    for link in anchor_links:
        anchor = link.split('#')[-1].lower()
        if anchor in existing_anchors:
            valid_links.append(link)
        else:
            broken_links.append(link)
    
    return valid_links, broken_links
```

### 2. External Link Checking
```python
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

def check_external_link(url, timeout=5):
    """Check if an external URL is accessible."""
    try:
        response = requests.head(url, timeout=timeout, allow_redirects=True)
        return url, response.status_code
    except requests.RequestException:
        return url, "ERROR"

def check_external_links(urls, max_workers=10):
    """Check multiple external links concurrently."""
    results = {}
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_url = {executor.submit(check_external_link, url): url for url in urls}
        for future in as_completed(future_to_url):
            url = future_to_url[future]
            try:
                url, status = future.result()
                results[url] = status
            except Exception as e:
                results[url] = f"EXCEPTION: {e}"
    return results
```

### 3. CI/CD Integration
Create a GitHub Actions workflow (`.github/workflows/link-checker.yml`):

```yaml
name: Markdown Link Checker

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  link-check:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install pandas openpyxl requests
        
    - name: Run link checker
      run: |
        # Assuming you have a script that checks links and generates a log
        python -m markdown_link_checker --recursive --verbose ./docs > link_check.log
        
    - name: Parse results and generate report
      run: |
        python md_link_checker.py link_check.log
        
    - name: Upload report artifact
      uses: actions/upload-artifact@v3
      with:
        name: link-report
        path: link_report.*
```

### 4. HTML Dashboard
Generate an interactive HTML dashboard:

```python
def generate_html_dashboard(records, output_file="link_dashboard.html"):
    """Generate an interactive HTML dashboard of broken links."""
    df = pd.DataFrame(records)
    
    # Group by file and status
    summary = df.groupby(['file', 'status']).size().unstack(fill_value=0)
    
    # Create HTML content
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Markdown Link Checker Report</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; }}
            .chart-container {{ width: 800px; margin: 20px auto; }}
            table {{ border-collapse: collapse; width: 100%; }}
            th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
            th {{ background-color: #f2f2f2; }}
            tr:nth-child(even) {{ background-color: #f9f9f9; }}
        </style>
    </head>
    <body>
        <h1>Markdown Link Checker Report</h1>
        <p>Generated on {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        
        <h2>Summary</h2>
        <p>Total broken links: {len(df)}</p>
        <p>Files with broken links: {len(df['file'].unique())}</p>
        
        <div class="chart-container">
            <canvas id="statusChart"></canvas>
        </div>
        
        <h2>Detailed Report</h2>
        {df.to_html(index=False)}
        
        <script>
            // Create status distribution chart
            const statusData = {df['status'].value_counts().to_dict()};
            const ctx = document.getElementById('statusChart').getContext('2d');
            new Chart(ctx, {{
                type: 'pie',
                data: {{
                    labels: Object.keys(statusData),
                    datasets: [{{
                        data: Object.values(statusData),
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                        ]
                    }}]
                }},
                options: {{
                    responsive: true,
                    plugins: {{
                        title: {{
                            display: true,
                            text: 'Broken Links by Status Code'
                        }}
                    }}
                }}
            }});
        </script>
    </body>
    </html>
    """
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✅ HTML dashboard generated: {output_file}")
```

## 10. Conclusion

Python offers a **robust, scalable, and maintainable approach** to Markdown link validation compared to Bash scripts. Its rich ecosystem of libraries enables sophisticated parsing, data analysis, and automated reporting that integrates seamlessly into CI/CD pipelines.

Our implementation handles multiple log formats, provides detailed reporting in various formats, and can be extended with additional functionality like external link checking and anchor validation.

**What's Next**:
In future articles, we'll explore:
- Advanced external link validation with retry mechanisms and caching
- Integration with static site generators like Hugo and Jekyll
- Automated link fixing suggestions
- Historical trend analysis of broken links

## Sample Output

Running our script with the test log would produce:

```
📖 Parsing log file: test_log.txt
✅ Reports generated: link_report.json, link_report.csv, link_report.xlsx

==================================================
📊 BROKEN LINKS SUMMARY
==================================================

📂 Files with broken links:
file                            broken_count
./docs/cpp/standard/cpp11.md    2
./docs/python/pandas.md         1
./docs/python/numpy.md          2

🔎 Status code breakdown:
404    3
DEAD   2

📈 Total broken links: 5
📂 Files with broken links: 3
🚨 File with most broken links: ./docs/cpp/standard/cpp11.md (2 links)
```

The script also generates three report files with the complete data for further analysis.


## More Articles

<Tabs>
  <TabItem value="docs" label="📚 Documentation">
             - [CompilerSutra Home](https://compilersutra.com)
                - [CompilerSutra Homepage (Alt)](https://compilersutra.com/)
                - [Getting Started Guide](https://compilersutra.com/get-started)
                - [Newsletter Signup](https://compilersutra.com/newsletter)
                - [Skip to Content (Accessibility)](https://compilersutra.com#__docusaurus_skipToContent_fallback)


  </TabItem>

  <TabItem value="tutorials" label="📖 Tutorials & Guides">

        - [AI Documentation](https://compilersutra.com/docs/Ai)
        - [DSA Overview](https://compilersutra.com/docs/DSA/)
        - [DSA Detailed Guide](https://compilersutra.com/docs/DSA/DSA)
        - [MLIR Introduction](https://compilersutra.com/docs/MLIR/intro)
        - [TVM for Beginners](https://compilersutra.com/docs/tvm-for-beginners)
        - [Python Tutorial](https://compilersutra.com/docs/python/python_tutorial)
        - [C++ Tutorial](https://compilersutra.com/docs/c++/CppTutorial)
        - [C++ Main File Explained](https://compilersutra.com/docs/c++/c++_main_file)
        - [Compiler Design Basics](https://compilersutra.com/docs/compilers/compiler)
        - [OpenCL for GPU Programming](https://compilersutra.com/docs/gpu/opencl)
        - [LLVM Introduction](https://compilersutra.com/docs/llvm/intro-to-llvm)
        - [Introduction to Linux](https://compilersutra.com/docs/linux/intro_to_linux)

  </TabItem>

  <TabItem value="assessments" label="📝 Assessments">

        - [C++ MCQs](https://compilersutra.com/docs/mcq/cpp_mcqs)
        - [C++ Interview MCQs](https://compilersutra.com/docs/mcq/interview_question/cpp_interview_mcqs)

  </TabItem>

  <TabItem value="projects" label="🛠️ Projects">

            - [Project Documentation](https://compilersutra.com/docs/Project)
            - [Project Index](https://compilersutra.com/docs/project/)
            - [Graphics Pipeline Overview](https://compilersutra.com/docs/The_Graphic_Rendering_Pipeline)
            - [Graphic Rendering Pipeline (Alt)](https://compilersutra.com/docs/the_graphic_rendering_pipeline/)

  </TabItem>

  <TabItem value="resources" label="🌍 External Resources">

            - [LLVM Official Docs](https://llvm.org/docs/)
            - [Ask Any Question On Quora](https://compilersutra.quora.com)
            - [GitHub: FixIt Project](https://github.com/aabhinavg1/FixIt)
            - [GitHub Sponsors Page](https://github.com/sponsors/aabhinavg1)

  </TabItem>

  <TabItem value="social" label="📣 Social Media">

            - [🐦 Twitter - CompilerSutra](https://twitter.com/CompilerSutra)
            - [💼 LinkedIn - Abhinav](https://www.linkedin.com/in/abhinavcompilerllvm/)
            - [📺 YouTube - CompilerSutra](https://www.youtube.com/@compilersutra)

  </TabItem>
</Tabs>

## Linux Home

Return to [Linux Home](/docs/linux/) for the section map and command starter pack.
