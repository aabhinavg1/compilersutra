---
title: "Markdown Link Checker 2"
description: "Learn how to write a portable, Bash-based markdown link checker for your project. Includes code, explanations, alternatives, diagrams, and usage examples."
keywords:
  - markdown
  - markdown link checker
  - bash script markdown
  - markdown link validation
  - broken link checker
  - markdown automation script
  - link check in markdown files
  - check md links bash
  - bash markdown documentation
  - markdown static validation
  - markdown linting bash
  - markdown tools
  - shell script for markdown
  - recursive markdown file scanner
  - bash programming
  - npx markdown-link-check
  - validate documentation bash
  - bash link checker script
  - markdown documentation quality
  - technical writing tools
  - open source docs automation
  - markdown ci checker
  - bash cli arguments
  - markdown error detection
  - bash link validation
  - lint markdown links
  - markdown link analysis
  - markdown for loop bash
  - markdown terminal output redirect
  - bash if else examples
  - markdown find command
  - bash markdown tutorial
  - nodejs markdown checker
  - markdown scripting linux
  - markdown consistency checker
  - github docs validation
  - bash link linter
  - markdown link logger
  - bash redirect output
  - markdown documentation integrity
  - markdown parser bash
  - shell scripting for docs
  - markdown link analysis cli
  - bash static site testing
  - bash for writers
  - markdown deployment validation
  - bash script content automation
  - markdown project checks
  - markdown scripting examples
---
import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';



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

<div>
  <AdBanner />
</div>


###### <h5 align="center" > 1. Introduction </h5>

## <h2 align="center">Recap</h2>


In [Part 1](https://www.compilersutra.com/docs/linux/markdown_checker), we covered the problem statement, why broken links matter, and the essential knowledge required to get started with Bash and Python.

:::tip check the youtube video
<div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', marginTop: '20px' }}>
  <iframe
    src="https://www.youtube.com/embed/AP672uiTh_I"
    title="MakeFile tutorial"
    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowFullScreen
  />
</div>

:::


## <h4 align="center">What we Cover In This Article</h4>
In this article, we will:

* Write a **Bash script** to automate link checking.


By the end, of this series you’ll have a working, production-ready link checker.


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


## Table of Contents

1. **Introduction**

   * [Quick recap of Part 1](#recap)
   * [What we’ll achieve in this article](#what-we-cover-in-this-article)

2. **Bash Script Logic**
   * [Bash Logic](#implementing-the-bash-script)
   * [Actual Implementation](#actual-bash-code)

3. **What Next**

---
###### <h5 align="center" > 2. Bash Script Logic </h5>


Before jumping into code, let’s define what role Bash plays:

* **Automation**: find every Markdown file automatically.
* **Setup**: ensure dependencies (`markdown-link-check`) are installed.
* **Execution**: run checks on each file.
* **Reporting**: collect raw results in a single log file.
* **Delegation**: hand over parsing to Python for structured reporting.

Bash is lightweight, portable, and ideal for handling file traversal and external commands.

<div>
  <AdBanner />
</div>


#### Implementing the Bash Script

Digram of the logic
<img
  src="/img/bash_script_flow.svg"
  alt="Diagram illustrating the implementation of the bash for the static link checker"
  style={{
    width: '100%',
    maxWidth: '400px',
    height: 'auto',
    display: 'block',
    margin: '0 auto'
  }}
/>

 The Dirgam Explanation

<details>
<summary>Click here</summary>
:::caution Work flow
This diagram represents the workflow of the **Markdown Link Checker script** in a very visual way. It captures how the script begins, what it processes, and how decisions are made depending on the results.

It all starts with the **"Start" node** (green), which symbolizes launching the script. The first real action is **reading markdown files from the CLI input**. If no directory is given, it defaults to the current directory.

Once the files are identified, the process moves on to **checking links inside those files**. This is where the `markdown-link-check` tool comes into play. Every hyperlink in each `.md` file is validated.

The next step is a **decision point** (yellow diamond). The script asks: *“Are there any broken links?”*.

* If the answer is **Yes**, the broken link details are captured and **logged into the report file**. This ensures that developers or maintainers can review exactly which links need fixing.
* If the answer is **No**, the process skips report generation since there’s nothing to log.

Finally, whether a report is created or skipped, the workflow always ends at the **“Done” state**. This confirms the script has finished its execution successfully.

To summarize the logic in simpler bullet points:

* Start the script.
* Collect markdown files from the specified directory.
* Check all links inside those files.
* Decide based on results:

  * If broken links exist → save them in a report file.
  * If no issues → skip writing a report.
* End the process cleanly.
:::
</details>

###### Let's see how we will do all this

<Tabs>
<TabItem value="input" label="📂 Input Handling">
***Prerequisite***

When you run a Bash script, you can pass arguments directly from the command line. These arguments are accessible inside the script through special variables:

* `$0` → The name of the script.
* `$1, $2, $3, ...` → The first, second, third, etc. arguments.
* `$@` → All arguments as a list.
* `$#` → The total number of arguments passed.

***Getting the Input Directory***

In many scripts, you may want to accept a directory path as an argument. If no argument is provided, the script should use the current directory by default. This can be handled neatly with parameter expansion:

```rust
DIR=${1:-.}  # If $1 is set, use it. Otherwise, use "."
```

* `${1:-.}` means:

  * If the first argument `$1` is provided, assign it to `DIR`.
  * If `$1` is empty or missing, default to `.` (the current directory).

So, when running:


```rust
$ cat script.sh
#!/bin/bash

# Markdown Link Checker CLI
# Usage: check-links [directory]

DIR=${1:-.}   # default to current directory
$ ./script.sh /home/user/docs
```

`DIR` will be `/home/user/docs`.

And when running without arguments:

```rust
./script.sh
```

`DIR` will default to `.` (current folder).



</TabItem>

<TabItem value="deps" label="📦 Dependencies">

***2. Check if Command Exists***
 **Once we have the directory path…**

   We have to detect if the `markdown-link-check` tool is installed. If it is not installed, the script will install it automatically using `npm`.

***3. Install Required Tool***

```rust
npm install -g markdown-link-check
```
We can automate by

   ```rust
    // This ensures the script always has the required tool available before running any link checks.
    // Got it. Let’s break down the `if` statement in your script:
   if ! command -v markdown-link-check &>/dev/null; then
       echo "Installing markdown-link-check..."
       npm install -g markdown-link-check
   fi
   ```

 

**Explanation**

1. **`command -v markdown-link-check`**

   * `command -v` checks if a command exists and is available in your system’s PATH.
   * If `markdown-link-check` is installed, this will return its path (e.g., `/usr/local/bin/markdown-link-check`).
   * If it is not installed, it will return nothing.

2. **`!` (negation)**

   * The `!` means “not”.
   * So `! command -v markdown-link-check` will be true if the tool is **not** installed.

3. **`&>/dev/null`**

   * Redirects both standard output (`stdout`) and standard error (`stderr`) to `/dev/null`.
   * This hides any messages, so the check runs silently.

4. **`then ... fi` block**

   * If the condition is true (tool not found), the commands inside run:

     ```bash
     echo "Installing markdown-link-check..."
     npm install -g markdown-link-check
     ```
   * This prints a message and installs the tool globally via `npm`.
   * `fi` ends the `if` block.

---

:::important 👉 In simple terms:

* If `markdown-link-check` exists → do nothing.
* If it does not exist → print a message and install it.
:::
</TabItem>

<TabItem value="fileops" label="📄 File Operations">

4. **Define the report file name**

When checking Markdown links across many files, we don’t want results scattered in the terminal output. Instead, we need a single place where all results are collected and stored for later review.

:::caution That’s why we:
:::
- Create a variable **REPORT_FILE** to define the output file name ***(links_report.txt)***.
- Ensure it is always fresh by clearing old contents before starting.
- Add a proper header with context (directory scanned and timestamp).
- Append link check results from each Markdown file into this same report file.

   ```rust
   REPORT_FILE="links_report.txt"
   ```

   * This variable holds the name of the file where all results will be written.
   * Using a variable makes it easy to change the filename in one place instead of updating it everywhere in the script.

 **Clean any old report**

   ```rust
   > "$REPORT_FILE"
   ```

   * The `>` operator clears the contents of the file if it already exists.
   * If the file doesn’t exist, it creates a new empty one.
   * This ensures we always start with a fresh report instead of appending to an old one.

5. **Add report header**

   ```rust
   echo "=== Markdown Link Checker Report ===" >> "$REPORT_FILE"
   echo "Directory: $DIR" >> "$REPORT_FILE"
   echo "Generated on: $(date)" >> "$REPORT_FILE"
   echo "" >> "$REPORT_FILE"
   ```

   * Each `echo ... >> "$REPORT_FILE"` appends information to the file.
   * The header includes:

     * A title (`=== Markdown Link Checker Report ===`).
     * The directory being scanned.
     * A timestamp showing when the report was generated.
   * The empty `echo ""` just adds a blank line for readability.

---

:::important 👉 In short:

* `REPORT_FILE` is where all scan results are stored.
* The script **resets it at the start** to avoid mixing old and new results.
* Then it **writes useful metadata** (title, directory, date) before adding link check results later.
:::
</TabItem>

<TabItem value="processing" label="⚙️ Processing">

 8. **Once we have the directory path, the soul of the script begins…**

The core task of this script is to **find all Markdown (`.md`) files recursively** and then check each one for broken links.

```rust
find "$DIR" -name "*.md" | while read -r file; do
    echo "Checking: $file"
    echo "---- $file ----" >> "$REPORT_FILE"
    markdown-link-check "$file" --quiet >> "$REPORT_FILE" 2>&1
    echo "" >> "$REPORT_FILE"
done
```

* **`find "$DIR" -name "*.md"`**
  Recursively searches through the given directory (`$DIR`) and lists every Markdown file. This ensures no file is missed, even if it’s deep inside subfolders.

* **`while read -r file; do ... done`**
  Reads each file path returned by `find` and processes it one by one.

* **Inside the loop:**

  * Prints the current file being checked to the console → `echo "Checking: $file"`.
  * Appends a header (`---- file ----`) to the report file so results are grouped clearly.
  * Runs `markdown-link-check` on the file.

    * Valid and broken links are checked silently (`--quiet`).
    * Both output and errors are written into the report (`>> "$REPORT_FILE" 2>&1`).
  * Adds a blank line after results to keep the report readable.

</TabItem>

<TabItem value="completion" label="✅ Completion">

***10. Success Notification***

```rust
echo "✅ Done. Report saved in links_report.txt"
```

* Once all Markdown files are processed, the script prints a success message.
* This acts as the final confirmation that the scan has completed.
* The message includes the name of the report file so the user knows exactly where to find the results.
* This output can also be passed on to a **Python script** for further processing, such as:

  * Parsing the report.
  * Sending notifications (email, Slack, etc.).
  * Generating analytics or summaries of broken links.


👉 So, the Bash script handles automation (finding files, running checks, storing results), and Python can take the final output to perform smarter decision-making.



</TabItem>
</Tabs>

<div>
  <AdBanner />
</div>


###### Actual Bash Code

<details>

<summary> The complete code will look something like </summary>

For the explanation of the code visit each section abovem [link](#lets-see-how-we-will-do-all-this) named as 
- 1 Input Handling
- 2 Dependencies 
- 3 File Operation
- 4 Processing
- 5 COmpletion
```rust

#!/bin/bash

# Markdown Link Checker CLI
# Usage: check-links [directory]

DIR=${1:-.}   # default to current directory
REPORT_FILE="links_report.txt"

# Ensure markdown-link-check is installed
if ! command -v markdown-link-check &>/dev/null; then
    echo "Installing markdown-link-check..."
    npm install -g markdown-link-check
fi

# Clean old report
> "$REPORT_FILE"

echo "=== Markdown Link Checker Report ===" >> "$REPORT_FILE"
echo "Directory: $DIR" >> "$REPORT_FILE"
echo "Generated on: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Run checks
find "$DIR" -name "*.md" | while read -r file; do
    echo "Checking: $file"
    echo "---- $file ----" >> "$REPORT_FILE"
    markdown-link-check "$file" --quiet >> "$REPORT_FILE" 2>&1
    echo "" >> "$REPORT_FILE"
done

echo "✅ Done. Report saved in $REPORT_FILE"
```
</details>

## What Next
* Build a **Python parser** to extract, analyze, and report broken links.
* Run the tool on sample projects.
* Integrate it into **CI/CD pipelines**.


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


<div>
  <AdBanner />
</div>


    

 




## Linux Home

Return to [Linux Home](/docs/linux/) for the section map and command starter pack.
