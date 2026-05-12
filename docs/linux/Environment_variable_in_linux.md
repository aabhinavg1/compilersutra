---
title: "Environment Variables in Linux - Temporary vs Permanent Explained"
description: "Understand how environment variables work in Linux, including the difference between temporary and permanent variables, and how to manage them for development and production environments."
keywords:
- linux environment variables
- temporary environment variables
- permanent environment variables
- export linux variable
- set environment variable bash
- environment variables linux tutorial
- linux bashrc vs bash\_profile
- env vs export command
- linux developer settings
- linux shell configuration
- linux login shell variables
- environment variable persistence
- .bashrc vs .profile
- linux shell scripting variables
- env command in linux
- linux system config
- shell environment variables explained
- how to make env variables permanent linux
- linux path environment variable

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


# Environment Variables in Linux – Temporary vs Permanent Explained

Environment variables in Linux are **dynamic key-value pairs** that act like global settings for your system.  
They help control how programs run, where they look for files, and what user preferences to follow all without needing to change the program's source code.

## What you will learn

* What environment variables are and how they differ from shell variables
* How temporary and permanent variables behave
* How `export`, `env`, and `printenv` fit together
* How `.bashrc`, `.profile`, and `.zshrc` affect persistence
* How to debug environment-related problems in real workflows

## Best way to read this article

1. Start with the core concept and real-world use cases.
1. Learn the temporary vs permanent split.
1. Practice the command examples in your own shell.
1. Return to [Linux Home](/docs/linux/) for the full section map.

:::caution think like
Think of them as invisible instructions that guide both the operating system and applications during runtime.  
They are essential for customizing your shell, setting up development environments, and automating tasks.
:::

<div>
    <AdBanner />
</div>

<div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', marginTop: '20px' }}>
  <iframe
    src="https://www.youtube.com/embed/sPZ5IPRq9M0"
    title="CompilerSutra Tutorial"
    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  />
</div>



## 📑 Table of Contents

* [Section 1: Core Concept](#section-1-core-concept)

* [Section 2: Temporary vs Permanent](#section-2-temporary-vs-permanent)

* [Section 3: Common Commands](#section-3-common-commands)

* [Section 4: Visual Workflow](#section-4-visual-workflow)

* [Section 5: Debugging Environment Variables](#section-5-debugging-environment-variables)

* [Additional Considerations](#additional-considerations)

  * [Environment Variables vs Shell Variables](#environment-variables-vs-shell-variables)

* [What’s Next](#whats-next)

<div>
    <AdBanner />
</div>


## Section 1: Core Concept

### Real-World Use Cases of Environment Variables
Environment variables play a **crucial role** in configuring how software behaves without requiring changes to the source code itself. They provide a flexible and secure mechanism to define settings, control behavior, and pass critical information across environments and tools.

<details>
<summary> Some key benefits include</summary>

*  **Separation of Configuration and Code**  
  Keep configuration external, ensuring the same codebase runs differently in dev, test, and production.

*  **Portability Across Environments**  
  Easily migrate applications between machines, containers, or servers without hardcoded values.

* **Security of Sensitive Data**  
  Store secrets like API tokens, credentials, or keys in environment variables instead of code or version control.

* **Dynamic Behavior Control**  
  Enable features, change logging levels, or switch database connections using environment flags.

* 🤖 **Automation and Scripting Support**  
  Use variables in CI/CD pipelines, cron jobs, or shell scripts to adapt to different execution contexts.

</details>

<Tabs groupId="env-use-cases" defaultValue="web" values={[
  { label: 'Web Servers', value: 'web' },
  { label: 'CI/CD Pipelines', value: 'cicd' },
  { label: 'Containerization', value: 'docker' },
  { label: 'Language Runtimes', value: 'runtime' },
  { label: 'Cloud Environments', value: 'cloud' },
]}>

<TabItem value="web">

**Web Servers** 

**Why It’s Useful**

* Configure server settings without changing code.
* Switch environments easily by updating the variables.
* Keep secrets (like database credentials) out of source code.

***Sample Commands (Linux/macOS)***

```python
export PORT=3000
export HOST=127.0.0.1
export DATABASE_URL="postgres://user:pass@localhost:5432/mydb"
```

To make them permanent (for bash shell):

```bash
echo 'export PORT=3000' >> ~/.bashrc
echo 'export HOST=127.0.0.1' >> ~/.bashrc
echo 'export DATABASE_URL="postgres://user:pass@localhost:5432/mydb"' >> ~/.bashrc
source ~/.bashrc
```

***Example: Node.js Express App***

```js
const express = require('express');
const app = express();

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
```

Run the app with environment variables:

```python
PORT=3000 HOST=127.0.0.1 node app.js
```

**Output:**

```python
Server running at http://127.0.0.1:3000
```
---

</TabItem>

<TabItem value="cicd">

**Use Case: CI/CD Pipelines**

Use environment variables to define secrets, tokens, and deployment stages (like `TEST`, `STAGING`, `PRODUCTION`) across CI platforms such as GitHub Actions or GitLab CI.

**Why It’s Useful**

- Securely store API tokens and credentials.
- Easily switch between environments during deployment.
- Enable conditional execution of jobs based on the stage.



* 🔧 Example: GitHub Actions Workflow Snippet

```yaml
name: Deploy App

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      STAGE: production
      API_TOKEN: ${{ secrets.API_TOKEN }}
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to ${{ env.STAGE }}
      run: |
        echo "Deploying to $STAGE"
        ./deploy.sh --stage $STAGE --token $API_TOKEN
```
:::tip
Store secrets like `API_TOKEN` securely using GitHub Secrets or GitLab CI/CD variables.
:::
---
</TabItem>

<TabItem value="docker">
**Use Case: Containerization**

In Dockerfiles or `docker-compose.yml`, `ENV` variables are used to inject runtime values and secrets, keeping images flexible and secure.

**Why It’s Useful**

- Avoid hardcoding values into the image.
- Pass secrets, API keys, or configs at runtime.
- Reuse the same image for different environments.

**Example: Dockerfile**

```dockerfile
FROM node:18-alpine

ENV PORT=3000
ENV NODE_ENV=production

WORKDIR /app
COPY . .

CMD ["node", "app.js"]
```

* 🔧 Example: docker-compose.yml

```yaml
version: '3'
services:
  web:
    image: myapp:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - API_KEY=${API_KEY}
```
:::tip
Use `.env` files with `docker-compose` for better management.
:::
</TabItem>

<TabItem value="runtime">

* 🧪 Use Case: Language Runtimes

Languages like Java, Python, or Node.js rely on environment variables such as `JAVA_HOME`, `PYTHONPATH`, or `NODE_ENV` to locate dependencies and set runtime behavior.

***Why It’s Useful***

- Ensures compilers and runtimes can find required libraries and tools.
- Enables configuration of debug, test, or production modes.
- Promotes consistent behavior across environments.

* 🔧 Example: Java

```python
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export PATH=$JAVA_HOME/bin:$PATH
```

* 🔧 Example: Python

```python
export PYTHONPATH=/my/custom/modules
```

* 🔧 Example: Node.js

```python
export NODE_ENV=production
```

:::tip
 These variables can be used in scripts or build tools (like Maven, pip, or npm) to automate environment-specific behaviors.
:::


</TabItem>

<TabItem value="cloud">

**Cloud Environments**  * ☁️ Use Case: Cloud Environments

Cloud providers like AWS, GCP, and Azure let you store environment variables securely to manage API keys, database URLs, and runtime configurations without hardcoding.

***Why It’s Useful***

- Keeps sensitive information out of code repositories.
- Allows easy updates to configuration without redeploying code.
- Supports secure and dynamic configuration per environment (dev, test, prod).

* 🔧 Example: AWS Lambda

Environment variables can be set in the Lambda console or using AWS CLI:

```python
aws lambda update-function-configuration \
  --function-name my-function \
  --environment "Variables={API_KEY=abcd1234,ENV=production}"
```

* 🔧 Example: Google Cloud Functions

You can set environment variables when deploying:

```python
gcloud functions deploy my-function \
  --runtime nodejs18 \
  --set-env-vars API_KEY=abcd1234,ENV=production
```

* 🔧 Example: Azure Functions

Use Azure CLI or the portal to configure:

```python
az functionapp config appsettings set \
  --name myFunctionApp \
  --resource-group myResourceGroup \
  --settings API_KEY=abcd1234 ENV=production
```
:::tip
Use secret managers or configuration services offered by each cloud provider to further enhance security.
:::

</TabItem>

</Tabs>

<div>
    <AdBanner />
</div>


### Why Are Environment Variables Important?

Environment variables are essential for:

* **Customization**: Tailor application behavior without altering source code.
* **Security**: Manage secrets, tokens, and keys without hardcoding.
* **Portability**: Provide consistent configuration across environments (e.g., dev, staging, production).
* **Scripting Automation**: Enable reusable scripts to work dynamically based on environment state.
* **Performance**: Use them to set runtime options for compilers, interpreters, and servers.



Environment variables are powerful tools for controlling behavior across Linux systems and applications. Below are key areas where they play a critical role, now organized using tabbed navigation for easier reference.

<Tabs>

<TabItem value="Customization" label="Customization" default>

**Customization**: Tailor application behavior without altering source code. Environment variables allow users and developers to adjust how programs behave by providing external configuration.

For example, when working with Git or command-line tools, you can set your preferred editor:

```python
export EDITOR=vim
```

This tells applications like Git to open files using Vim when editing commit messages or configuration files.

You can also configure language preferences or visual display settings globally:

```python
export LANG=en_US.UTF-8
export PAGER=less
```

</TabItem>

<TabItem value="Security" label="Security">

**Security**: Manage secrets, tokens, and keys without hardcoding. Storing sensitive information in environment variables keeps it out of source code, which reduces the risk of accidentally exposing credentials in public repositories.

For example, setting an API key for a cloud service:

```python
export API_KEY="your-secret-token"
```

This variable can be accessed in applications via secure shell environments or configuration files that read from the environment.

You can also use environment variables with `.env` files and tools like `dotenv`, `Docker`, or cloud deployment services.

</TabItem>

<TabItem value="Portability" label="Portability">

**Portability**: Provide consistent configuration across environments (e.g., dev, staging, production). By using environment variables instead of hardcoded values, applications can behave differently based on the deployment environment without changing code.

For example:

```python
export NODE_ENV=production
```

This allows your application to run optimized builds and configurations when in production versus development.

Another use case:

```python
export DATABASE_URL="postgresql://localhost/dev_db"
```

In staging or production, this can be set to another URL while reusing the same codebase.

</TabItem>

<TabItem value="Scripting Automation" label="Scripting Automation">

**Scripting Automation**: Enable reusable scripts to work dynamically based on environment state. Shell scripts often rely on environment variables to make decisions and remain flexible across users and machines.

Example of a simple Bash script using variables:

```python
#!/bin/bash
if [ "$DEBUG" = "true" ]; then
  echo "Debug mode is ON"
fi
```

Run this script with:

```python
export DEBUG=true
./myscript.sh
```

This makes your scripts adaptable without needing hardcoded logic.

</TabItem>

<TabItem value="Performance" label="Performance">

**Performance**: Use environment variables to control and optimize how software runs. Many tools like compilers, interpreters, and servers read environment variables to adjust memory usage, parallelization, or cache settings.

For example, to compile using 4 threads:

```python
export MAKEFLAGS="-j4"
make
```

Or to set memory usage for a Java application:

```python
export JAVA_OPTS="-Xmx2G"
```

This sets the maximum heap size for Java Virtual Machines to 2 GB.

</TabItem>

</Tabs>


<div>
    <AdBanner />
</div>

## Section 2: Temporary vs Permanent

## Temporary vs Permanent Environment Variables

Environment variables can be set temporarily for the duration of a single session, or permanently to persist across sessions and system reboots. Understanding the difference is critical for managing system behavior reliably.

* **Temporary variables** are set using the `export` command in a terminal. They disappear once you close the session.
* **Permanent variables** are written to shell configuration files like `.bashrc`, `.bash_profile`, or `.zshrc` so they load automatically in new sessions.

**Example (temporary):**

```python
export TEMP_VAR="I exist until this terminal closes"
echo $TEMP_VAR
```

**Example (permanent):**
Edit your shell configuration file:

```python
nano ~/.bashrc
```

Add this line at the bottom:

```python
export PERM_VAR="I will persist across reboots"
```

Apply changes:

```python
source ~/.bashrc
```

<div>
    <AdBanner />
</div>

## Section 3: Common Commands

Environment variables can be managed directly from the terminal using simple commands. Below are categorized operations for viewing, setting, and persisting environment variables in Linux-based systems.

<Tabs groupId="env-commands" defaultValue="view" values={[
{ label: 'View Variables', value: 'view' },
{ label: 'Set Temporarily', value: 'temp' },
{ label: 'Set Permanently', value: 'perm' }
]}>

<TabItem value="view">

### Viewing Environment Variables

Use the following commands to list current environment variables:

```python
env
```

or

```python
printenv
```

These commands display all active environment variables for the current session.

</TabItem>

<TabItem value="temp">

### Setting a Variable Temporarily

To create an environment variable valid only for the current terminal session:

```bash
export VAR_NAME="value"
```

This variable will be accessible by any child process spawned from this shell, but it will disappear once the session ends.

</TabItem>

<TabItem value="perm">

### Making a Variable Permanent

To persist environment variables across sessions:

1. Append the variable to your shell's configuration file:

```bash
echo 'export VAR_NAME="value"' >> ~/.bashrc
```

2. Apply the changes immediately without restarting:

```bash
source ~/.bashrc
```

For other shells:

* **Zsh**: use `~/.zshrc`
* **Fish**: use `set -Ux VAR_NAME "value"`

</TabItem>

</Tabs>



<div>
    <AdBanner />
</div>


## Section 4: Visual Workflow

```mermaid
graph TD
    A["User opens terminal"] --> B{Session type}
    B -->|Interactive| C[Uses .bashrc]
    B -->|Login| D["Uses .profile / .bash_profile" ]
    C --> E[Load environment variables]
    D --> E
    E --> F[ with configured variables]
```

This diagram illustrates how environment variables are loaded during different shell sessions.

## Section 5: Debugging Environment Variables

### How to Check If a Variable Is Set

```bash
echo $MY_VAR
```

If the output is empty, the variable is either unset or not yet exported.

### Listing All Current Variables

```bash
printenv
```

### Checking Variable Source

Use tools like:

```bash
declare -p MY_VAR
typeset -p MY_VAR
```

### Troubleshooting Tips

* Ensure the export statement has no syntax errors
* Use `source ~/.bashrc` or restart your terminal after making permanent changes
* Use `env | grep VAR_NAME` to search in environment

## Additional Considerations

### Environment Variables vs Shell Variables

Environment and shell variables are often used interchangeably, but they serve different purposes and have distinct scopes:

| Feature       | Shell Variable                      | Environment Variable                       |
| ------------- | ----------------------------------- | ------------------------------------------ |
| Visibility    | Local to the current shell          | Inherited by child processes and subshells |
| Persistence   | Disappears after session ends       | Temporary unless exported in config file   |
| Export Needed | No                                  | Yes, using `export`                        |
| Typical Use   | Internal scripting, temporary logic | Application config, persistent settings    |
| Example       | `my_var=123`                        | `export PATH="$PATH:/usr/local/bin"`       |

### When to Use Which?

* **Use shell variables** when you only need a value within a script or a single shell session.
* **Use environment variables** when you want a setting to be available to other applications or subprocesses.

```bash
# Shell variable
name="CompilerSutra"
echo $name

# Environment variable
export API_KEY="abcd1234"
```

While both look **similar**, shell variables are local to the current shell, whereas environment variables are inherited by child processes.

```bash
MY_SHELL_VAR="test"       # Shell variable
export MY_ENV_VAR="test"  # Environment variable
```

### Best Practices for Developers

* **Use ************`.env`************ files** for structured environment setups in projects.
* **Validate variables** with checks in scripts.
* **Document required variables** for new team members or deployment automation.

## What’s Next

Now that you understand how to set up temporary and permanent environment variables in Linux, explore advanced topics such as:

* Environment variable scoping in scripts
* Managing variables in Docker containers
* Using `.env` files in application development

Visit [CompilerSutra.com](https://compilersutra.com) for more in-depth Linux tutorials.
<div>
    <AdBanner />
</div>

Here are some helpful resources to further your understanding of Linux:

- [The Linux Foundation Training](https://training.linuxfoundation.org/)
- [Linux Journey - A free, handy learning portal](https://linuxjourney.com/)
- [Ubuntu Documentation](https://help.ubuntu.com/)
- [Debian Wiki](https://wiki.debian.org/)
- [Fedora Docs](https://docs.fedoraproject.org/)
- [Arch Wiki](https://wiki.archlinux.org/)
- [Explainshell - Learn what each part of a shell command does](https://explainshell.com/)
- [LinuxCommand.org - Learning the shell](http://linuxcommand.org/)
- [GNU Bash Manual](https://www.gnu.org/software/bash/manual/bash.html)
- [TLDP: The Linux Documentation Project](https://tldp.org/)
- [OverTheWire: Bandit (Linux terminal wargame for practice)](https://overthewire.org/wargames/bandit/)

---

By regularly using and referencing these resources, you can reinforce your Linux knowledge and become more confident navigating both the terminal and system internals.

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
