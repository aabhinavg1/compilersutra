---
title: "Vulkan RADV perf_query on Linux: From Broken ICDs to GFX12 AMD Counters with csrun"
description: "Case study: why csrun showed perf_query=no on RX 9060 XT — relative ICD vs /opt/amdgpu, libdrm mismatch, and the Mesa RADV GFX12 feature gate — then unlocking VK_KHR_performance_query with a side-by-side Mesa main build."
keywords:
  - VK_KHR_performance_query explained
  - RADV perf_query yes no
  - Mesa ICD Linux beginner
  - GFX12 RDNA4 counters
  - RX 9060 XT Vulkan Linux
  - amdgpu vs mesa conflict
  - VK_ICD_FILENAMES tutorial
  - libdrm_amdgpu LD_LIBRARY_PATH
  - kisak mesa RADV
  - compilersutra csrun
  - AMD hardware counters Linux
  - how Vulkan finds the driver
---

import AdBanner from '@site/src/components/AdBanner';
import Head from '@docusaurus/Head';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Head>
  <meta name="description" content="Case study: ICD and libdrm clashes, then the RADV GFX12 feature gate — unlocking VK_KHR_performance_query on RX 9060 XT for csrun." />
</Head>

# Vulkan RADV `perf_query` on Linux: From Broken ICDs to GFX12 AMD Counters with `csrun`

## Table of Contents

- [Summary](#summary)
- [Working command](#working-command)
- [Lab transcript (actual runs)](#lab-transcript-actual-runs-on-this-machine)
- [1. Goal: AMD HW counters on the discrete GPU](#1-goal-amd-hw-counters-on-the-discrete-gpu)
- [2. Terms](#2-terms)
- [3. Lab machine](#3-lab-machine)
- [4. Portable queries vs `VK_KHR_performance_query`](#4-portable-queries-vs-vk_khr_performance_query)
- [5. How the Vulkan loader picks a driver (ICD)](#5-how-the-vulkan-loader-picks-a-driver-icd)
- [6. Wrong RADV: relative ICD + `/opt/amdgpu`](#6-wrong-radv-relative-icd--optamdgpu)
- [7. Absolute ICD, then Vulkan disappeared](#7-absolute-icd-then-vulkan-disappeared)
- [8. `libdrm_amdgpu` must match Mesa](#8-libdrm_amdgpu-must-match-mesa)
- [9. Mesa 26.2.3 still has `perf_query=no` on GFX12](#9-mesa-2623-still-has-perf_queryno-on-gfx12)
- [10. The RADV feature gate](#10-the-radv-feature-gate)
- [11. Side-by-side Mesa `main`](#11-side-by-side-mesa-main)
- [12. Env helpers](#12-env-helpers)
- [13. Decision tree / FAQ](#13-decision-tree--faq)
- [14. Takeaways](#14-takeaways)
- [15. References](#15-references)

---

## Summary

CompilerSutraRun (`csrun`) should sample **AMD hardware counters** through `VK_KHR_performance_query` on RADV. On a Ryzen 7 9700X + **RX 9060 XT** box, the iGPU already reported `perf_query=yes` while the discrete GPU reported `perf_query=no`.

Three separate failures stacked:

1. A **relative** ICD + `ldconfig` preferred **`/opt/amdgpu`** RADV → still running **Mesa 25.2.0-devel** after installing kisak 26.2.3.
2. Forcing kisak’s `.so` while leaving amdgpu’s **`libdrm_amdgpu`** first → RADV init failed (`amdgpu_query_sw_info…`), **no Vulkan devices**.
3. With the stack corrected, Mesa **26.2.3** still does not advertise the extension on **GFX12** (`radv_perf_query_supported` requires `gfx_level < GFX12`). Mesa **`main`** after 2026-09-10 uses `<= GFX12`.

Side-by-side Mesa **26.3.0-devel** (`590bf21`) in `~/mesa-radv-26` gives:

`RX 9060 XT … radv perf_query=yes` (14 counters on queue family 0).

:::info Investigation in 30 seconds

<pre>
Wanted:  VK_KHR_performance_query on RX 9060 XT (RADV)
Saw:     iGPU = yes,  dGPU = no

1  relative ICD → /opt/amdgpu RADV (Mesa 25.2)
2  kisak RADV + amdgpu libdrm → Vulkan gone
3  Mesa 26.2.3 gates out GFX12

Fix  Mesa 26.3-devel prefix + absolute ICD
     + LD_LIBRARY_PATH = prefix:/usr  (ahead of /opt/amdgpu)
</pre>

:::

<div>
  <AdBanner />
</div>

---

## Working command

```bash
source scripts/env-mesa-main-radv.sh
./build/bin/csrun --list-devices
```

**Lab output (2026-09-19):**

```text
[mesa-main-radv] .../radeon_icd_mesa_main.json
[INFO][backend] default registry created
WARNING: radv is not a conformant Vulkan implementation, testing use only.
WARNING: radv is not a conformant Vulkan implementation, testing use only.
Warning: Agent creation failed.
The GPU node has an unrecognized id.

Backend	Index	Device
vulkan	0	AMD Radeon RX 9060 XT (RADV GFX1200) [discrete] radv perf_query=yes	(Mesa 26.3.0-devel (git-590bf21d91))
vulkan	1	AMD Ryzen 7 9700X 8-Core Processor (RADV RAPHAEL_MENDOCINO) [integrated] radv perf_query=yes	(Mesa 26.3.0-devel (git-590bf21d91))
opengl	0	AMD Ryzen 7 9700X 8-Core Processor (radeonsi, raphael_mendocino, ACO, DRM 3.64, 7.0.0-31-generic)	(4.6 (Core Profile) Mesa 26.2.3 - kisak-mesa PPA)
```

If you still see `Mesa 25.2` or `perf_query=no` on the 9060, use the [decision tree](#13-decision-tree--faq).

---

## Lab transcript (actual runs on this machine)

Captured on **2026-09-19**, host `7.0.0-31-generic`, packages `mesa-vulkan-drivers 26.2.3~kisak1~n`, side-by-side Mesa **`26.3.0-devel`** (`590bf21`) in `~/mesa-radv-26`.

### A — Default shell (no RADV pin): AMDVLK wins, no HW counters

```bash
./build/bin/csrun --list-devices
```

```text
[INFO][backend] default registry created
WARNING: radv is not a conformant Vulkan implementation, testing use only.
…
Backend	Index	Device
vulkan	0	AMD Radeon Graphics [integrated] AMD open-source driver perf_query=no	(2025.Q1.1 (LLPC))
opengl	0	AMD Radeon Graphics (radeonsi, raphael_mendocino, LLVM 20.1.8, DRM 3.64, 7.0.0-31-generic)	(4.6 (Core Profile) Mesa 25.2.0-devel)
opencl	0	gfx1200	(3662.0 (HSA1.1,LC))
opencl	1	gfx1036	(3662.0 (HSA1.1,LC))
hip	0	AMD Radeon RX 9060 XT	(gfx1200)
hip	1	AMD Radeon Graphics	(gfx1036)
```

Note: Vulkan here is **AMDVLK** (`LLPC`, `perf_query=no`). HIP still sees both GPUs. This is why we force RADV with `VK_ICD_FILENAMES`.

### B — Relative system ICD + `/opt/amdgpu` first: Mesa **25.2.0-devel**

```bash
export DISABLE_LAYER_AMD_SWITCHABLE_GRAPHICS_1=1
export VK_ICD_FILENAMES=/usr/share/vulkan/icd.d/radeon_icd.json
export LD_LIBRARY_PATH=/opt/amdgpu/lib/x86_64-linux-gnu
unset VK_DRIVER_FILES
./build/bin/csrun --list-devices
```

System ICD content (relative name):

```json
{
    "ICD": {
        "api_version": "1.4.354",
        "library_path": "libvulkan_radeon.so"
    },
    "file_format_version": "1.0.1"
}
```

```text
Backend	Index	Device
vulkan	1	AMD Radeon Graphics (RADV RAPHAEL_MENDOCINO) [integrated] radv perf_query=yes	(Mesa 25.2.0-devel)
vulkan	0	AMD Radeon RX 9060 XT (RADV GFX1200) [discrete] radv perf_query=no	(Mesa 25.2.0-devel)
opengl	0	AMD Radeon Graphics (radeonsi, raphael_mendocino, LLVM 20.1.8, DRM 3.64, 7.0.0-31-generic)	(4.6 (Core Profile) Mesa 25.2.0-devel)
opencl	0	gfx1200	(3662.0 (HSA1.1,LC))
opencl	1	gfx1036	(3662.0 (HSA1.1,LC))
hip	0	AMD Radeon RX 9060 XT	(gfx1200)
hip	1	AMD Radeon Graphics	(gfx1036)
```

`ldconfig` on this box (amdgpu first):

```text
libvulkan_radeon.so (libc6,x86-64) => /opt/amdgpu/lib/x86_64-linux-gnu/libvulkan_radeon.so
libvulkan_radeon.so (libc6,x86-64) => /lib/x86_64-linux-gnu/libvulkan_radeon.so
libdrm_amdgpu.so.1 (libc6,x86-64) => /opt/amdgpu/lib/x86_64-linux-gnu/libdrm_amdgpu.so.1
libdrm_amdgpu.so.1 (libc6,x86-64) => /lib/x86_64-linux-gnu/libdrm_amdgpu.so.1
```

### C — Absolute kisak ICD + amdgpu `libdrm`: Vulkan **vanishes**

```bash
export VK_ICD_FILENAMES=/tmp/radeon_icd_kisak26.json   # absolute /usr/.../libvulkan_radeon.so
export LD_LIBRARY_PATH=/opt/amdgpu/lib/x86_64-linux-gnu
./build/bin/csrun --list-devices
```

```text
[INFO][backend] default registry created
amdgpu: amdgpu_query_sw_info(amdgpu_sw_info_address_prt_wa_control_bit) failed.
Backend	Index	Device
opengl	0	AMD Radeon Graphics (radeonsi, raphael_mendocino, LLVM 20.1.8, DRM 3.64, 7.0.0-31-generic)	(4.6 (Core Profile) Mesa 25.2.0-devel)
opencl	0	gfx1200	(3662.0 (HSA1.1,LC))
opencl	1	gfx1036	(3662.0 (HSA1.1,LC))
hip	0	AMD Radeon RX 9060 XT	(gfx1200)
hip	1	AMD Radeon Graphics	(gfx1036)
```

No `vulkan` rows. OpenCL/HIP still work.

### D — kisak env helper: Mesa **26.2.3**, GFX12 still `perf_query=no`

```bash
source scripts/env-kisak-radv.sh
./build/bin/csrun --list-devices
```

```text
[kisak-radv] VK_ICD_FILENAMES=/home/aitr/.cache/csrun/radeon_icd_kisak_abs.json
[kisak-radv] LD_LIBRARY_PATH starts with /usr/lib/x86_64-linux-gnu
[kisak-radv] Note: Mesa 26.2.3 still has perf_query=no on GFX1200; iGPU is yes.
[INFO][backend] default registry created
WARNING: radv is not a conformant Vulkan implementation, testing use only.
WARNING: radv is not a conformant Vulkan implementation, testing use only.
Warning: Agent creation failed.
The GPU node has an unrecognized id.

Backend	Index	Device
vulkan	1	AMD Ryzen 7 9700X 8-Core Processor (RADV RAPHAEL_MENDOCINO) [integrated] radv perf_query=yes	(Mesa 26.2.3 - kisak-mesa PPA)
vulkan	0	AMD Radeon RX 9060 XT (RADV GFX1200) [discrete] radv perf_query=no	(Mesa 26.2.3 - kisak-mesa PPA)
opengl	0	AMD Ryzen 7 9700X 8-Core Processor (radeonsi, raphael_mendocino, ACO, DRM 3.64, 7.0.0-31-generic)	(4.6 (Core Profile) Mesa 26.2.3 - kisak-mesa PPA)
```

Extension probe under the same env:

```text
=== [0] AMD Radeon RX 9060 XT (RADV GFX1200) ===
  driverInfo=Mesa 26.2.3 - kisak-mesa PPA
  VK_KHR_performance_query=no  performanceCounterQueryPools=0
=== [1] AMD Ryzen 7 9700X 8-Core Processor (RADV RAPHAEL_MENDOCINO) ===
  driverInfo=Mesa 26.2.3 - kisak-mesa PPA
  VK_KHR_performance_query=yes  performanceCounterQueryPools=1
  qf0 counters=17 (VkResult=0)
```

### E — Mesa `main` env helper: both GPUs `perf_query=yes`

```bash
source scripts/env-mesa-main-radv.sh
./build/bin/csrun --list-devices
```

ICD used (absolute path to the side-by-side build):

```json
{
    "file_format_version": "1.0.1",
    "ICD": {
        "library_path": "/home/aitr/mesa-radv-26/lib/libvulkan_radeon.so",
        "api_version": "1.4.335"
    }
}
```

```text
Backend	Index	Device
vulkan	0	AMD Radeon RX 9060 XT (RADV GFX1200) [discrete] radv perf_query=yes	(Mesa 26.3.0-devel (git-590bf21d91))
vulkan	1	AMD Ryzen 7 9700X 8-Core Processor (RADV RAPHAEL_MENDOCINO) [integrated] radv perf_query=yes	(Mesa 26.3.0-devel (git-590bf21d91))
opengl	0	AMD Ryzen 7 9700X 8-Core Processor (radeonsi, raphael_mendocino, ACO, DRM 3.64, 7.0.0-31-generic)	(4.6 (Core Profile) Mesa 26.2.3 - kisak-mesa PPA)
```

Extension probe:

```text
=== [0] AMD Radeon RX 9060 XT (RADV GFX1200) ===
  driverInfo=Mesa 26.3.0-devel (git-590bf21d91)
  VK_KHR_performance_query=yes  performanceCounterQueryPools=1
  qf0 counters=14 (VkResult=0)
=== [1] AMD Ryzen 7 9700X 8-Core Processor (RADV RAPHAEL_MENDOCINO) ===
  driverInfo=Mesa 26.3.0-devel (git-590bf21d91)
  VK_KHR_performance_query=yes  performanceCounterQueryPools=1
  qf0 counters=17 (VkResult=0)
```

| Run | Vulkan driver string | RX 9060 `perf_query` | iGPU `perf_query` |
|-----|----------------------|----------------------|-------------------|
| A default | AMDVLK 2025.Q1.1 | *(not listed)* | no |
| B relative + amdgpu | Mesa 25.2.0-devel | no | yes |
| C abs kisak + amdgpu libdrm | *(no Vulkan)* | — | — |
| D kisak env | Mesa 26.2.3 | **no** | yes |
| E Mesa main | Mesa 26.3.0-devel | **yes** (14) | yes (17) |

---

## 1. Goal: AMD HW counters on the discrete GPU

`csrun` already collects **portable** Vulkan timing: timestamps, pipeline stats, occlusion, host submit/wait. That works on almost any device.

What we also wanted on the **RX 9060 XT** is **vendor HW counters** — SQ waves, cache ratios, memory traffic, and the rest of the AMD checklist — via **`VK_KHR_performance_query`** on **RADV**.

`csrun --list-devices` prints a one-line capability flag:

```text
… radv perf_query=yes   ← extension usable for HW counters
… radv perf_query=no    ← portable queries only
```

On this dual-GPU box the iGPU (Raphael / GFX10.3) already had `yes`. The discrete card (GFX1200) stayed `no` until Mesa `main`. That mismatch is the subject of this article.

Related: [Vulkan platform notes](/docs/gpu/platforms/vulkan) · [CompilerSutraPerf](/docs/project/compilersutra-perf/).

---

## 2. Terms

| Term | Meaning |
|------|---------|
| **Vulkan loader** | `libvulkan.so` — finds ICDs and layers |
| **ICD** | JSON that names the driver `.so` |
| **RADV** | Mesa AMD Vulkan driver (`libvulkan_radeon.so`) |
| **AMDVLK** | AMD’s other open Vulkan driver (LLPC); default here had `perf_query=no` |
| **Mesa** | Open-source graphics stack shipping RADV |
| **`/opt/amdgpu`** | AMD userspace package; often an older RADV + `libdrm` |
| **kisak Mesa** | Ubuntu PPA builds (here: 26.2.3) |
| **`libdrm_amdgpu`** | Userspace DRM helper RADV uses against the kernel |
| **GFX10.3 / GFX11 / GFX12** | AMD graphics IP; GFX12 ≈ RDNA4 (RX 9000) |
| **`perf_query`** | `csrun` shorthand for usable `VK_KHR_performance_query` |
| **`csrun`** | CompilerSutraRun |

---

## 3. Lab machine

| Piece | Hardware / stack | Name in logs |
|-------|------------------|--------------|
| CPU + iGPU | Ryzen 7 9700X (Raphael) | `RADV RAPHAEL_MENDOCINO` (GFX10.3) |
| Discrete GPU | RX 9060 XT | `RADV GFX1200` (GFX12) |
| Distro Vulkan | `mesa-vulkan-drivers 26.2.3~kisak1~n` | `/usr/lib/.../libvulkan_radeon.so` |
| AMD package | `/opt/amdgpu` | often `Mesa 25.2.0-devel` in `ldconfig` |
| Side-by-side | `~/mesa-radv-26` | `Mesa 26.3.0-devel (git-590bf21d91)` |

```text
csrun
  → libvulkan.so (loader)
      → ICD JSON (library_path)
          → libvulkan_radeon.so (RADV)
              → libdrm_amdgpu.so.1
                  → kernel amdgpu → iGPU / RX 9060 XT
```

Any wrong `.so` on that chain gives the wrong Mesa string, missing devices, or missing extensions.

---

## 4. Portable queries vs `VK_KHR_performance_query`

**Portable (core / common extensions):** GPU timestamps, pipeline statistics, occlusion, host-side record/submit/queue-wait. Enough for “how long did this dispatch take?”

**Vendor HW (`VK_KHR_performance_query`):** counter blocks RADV wires up from the chip. On AMD Linux this path is RADV; AMDVLK on this host listed as `2025.Q1.1 (LLPC)` with `perf_query=no`.

Inside `csrun`, `perf_query=yes` means all of:

1. Device lists `VK_KHR_performance_query`
2. `performanceCounterQueryPools` is true
3. Queue family 0 enumerates a non-zero counter count

Any miss → `perf_query=no`.

---

## 5. How the Vulkan loader picks a driver (ICD)

The loader does not hard-code RADV. It reads ICD JSON. **Actual** system file `/usr/share/vulkan/icd.d/radeon_icd.json`:

```json
{
    "ICD": {
        "api_version": "1.4.354",
        "library_path": "libvulkan_radeon.so"
    },
    "file_format_version": "1.0.1"
}
```

| `library_path` | Effect |
|----------------|--------|
| Relative (`libvulkan_radeon.so`) | Dynamic linker + `ldconfig` order |
| Absolute (`/usr/lib/.../libvulkan_radeon.so`) | That file only |

**Actual `ldconfig -p` on this lab** (amdgpu first):

```text
libvulkan_radeon.so (libc6,x86-64) => /opt/amdgpu/lib/x86_64-linux-gnu/libvulkan_radeon.so
libvulkan_radeon.so (libc6,x86-64) => /lib/x86_64-linux-gnu/libvulkan_radeon.so
libdrm_amdgpu.so.1 (libc6,x86-64) => /opt/amdgpu/lib/x86_64-linux-gnu/libdrm_amdgpu.so.1
libdrm_amdgpu.so.1 (libc6,x86-64) => /lib/x86_64-linux-gnu/libdrm_amdgpu.so.1
```

Useful env:

```bash
export DISABLE_LAYER_AMD_SWITCHABLE_GRAPHICS_1=1
export VK_ICD_FILENAMES=/path/to/one.json
unset VK_DRIVER_FILES
```

**Rule:** if `csrun` / `vulkaninfo` prints a Mesa version you did not install, fix the ICD / linker path before debugging features.

---

## 6. Wrong RADV: relative ICD + `/opt/amdgpu`

Steps that failed:

1. Installed kisak **Mesa 26.2.3**
2. Set `VK_ICD_FILENAMES=/usr/share/vulkan/icd.d/radeon_icd.json`
3. Still ran **Mesa 25.2.0-devel** (relative `library_path` → `/opt/amdgpu` first)

**Actual output** (also [transcript B](#b--relative-system-icd--optamdgpu-first-mesa-2520-devel)):

```text
vulkan	1	AMD Radeon Graphics (RADV RAPHAEL_MENDOCINO) [integrated] radv perf_query=yes	(Mesa 25.2.0-devel)
vulkan	0	AMD Radeon RX 9060 XT (RADV GFX1200) [discrete] radv perf_query=no	(Mesa 25.2.0-devel)
```

`dpkg` already had `mesa-vulkan-drivers 26.2.3~kisak1~n`. Package install ≠ loaded `.so`.

**Fix direction:** absolute `library_path` to the intended `libvulkan_radeon.so`.

---

## 7. Absolute ICD, then Vulkan disappeared

```bash
cat > /tmp/radeon_icd_kisak26.json <<'EOF'
{
  "file_format_version": "1.0.1",
  "ICD": {
    "library_path": "/usr/lib/x86_64-linux-gnu/libvulkan_radeon.so",
    "api_version": "1.4.354"
  }
}
EOF

export DISABLE_LAYER_AMD_SWITCHABLE_GRAPHICS_1=1
export VK_ICD_FILENAMES=/tmp/radeon_icd_kisak26.json
export LD_LIBRARY_PATH=/opt/amdgpu/lib/x86_64-linux-gnu
unset VK_DRIVER_FILES
./build/bin/csrun --list-devices
```

**Actual output:**

```text
[INFO][backend] default registry created
amdgpu: amdgpu_query_sw_info(amdgpu_sw_info_address_prt_wa_control_bit) failed.
Backend	Index	Device
opengl	0	AMD Radeon Graphics (radeonsi, raphael_mendocino, LLVM 20.1.8, DRM 3.64, 7.0.0-31-generic)	(4.6 (Core Profile) Mesa 25.2.0-devel)
opencl	0	gfx1200	(3662.0 (HSA1.1,LC))
opencl	1	gfx1036	(3662.0 (HSA1.1,LC))
hip	0	AMD Radeon RX 9060 XT	(gfx1200)
hip	1	AMD Radeon Graphics	(gfx1036)
```

Kisak RADV 26 loaded; init against amdgpu’s older `libdrm_amdgpu` failed. No `vulkan` rows. That is still progress: the wrong silent 25.2 path is gone.

---

## 8. `libdrm_amdgpu` must match Mesa

RADV depends on `libdrm_amdgpu.so.1`. Two copies exist; `ldconfig` prefers `/opt/amdgpu` (e.g. 2.4.124) over kisak `/usr` (e.g. 2.4.134). Mesa 26 calling into the older helper produces the `amdgpu_query_sw_info` failure above.

```bash
export DISABLE_LAYER_AMD_SWITCHABLE_GRAPHICS_1=1
export VK_ICD_FILENAMES=/tmp/radeon_icd_kisak26.json
export LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu
unset VK_DRIVER_FILES
./build/bin/csrun --list-devices
```

**Actual result** (`scripts/env-kisak-radv.sh`):

```text
vulkan	1	AMD Ryzen 7 9700X 8-Core Processor (RADV RAPHAEL_MENDOCINO) [integrated] radv perf_query=yes	(Mesa 26.2.3 - kisak-mesa PPA)
vulkan	0	AMD Radeon RX 9060 XT (RADV GFX1200) [discrete] radv perf_query=no	(Mesa 26.2.3 - kisak-mesa PPA)
```

Mesa string correct; GFX12 still `no`.

```bash
LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu \
  ldd /usr/lib/x86_64-linux-gnu/libvulkan_radeon.so | grep drm_amdgpu
```

```text
libdrm_amdgpu.so.1 => /usr/lib/x86_64-linux-gnu/libdrm_amdgpu.so.1 (0x000075c7bb610000)
```

:::caution
Clearing `amdgpu` from an empty `LD_LIBRARY_PATH` does nothing. Prepend `/usr/lib/x86_64-linux-gnu` or the Mesa build `lib/` so it beats `ldconfig`.
:::

---

## 9. Mesa 26.2.3 still has `perf_query=no` on GFX12

Packaging fixed. Extension still absent on the 9060.

**Actual probe** (kisak env):

```text
=== [0] AMD Radeon RX 9060 XT (RADV GFX1200) ===
  driverInfo=Mesa 26.2.3 - kisak-mesa PPA
  VK_KHR_performance_query=no  performanceCounterQueryPools=0
=== [1] AMD Ryzen 7 9700X 8-Core Processor (RADV RAPHAEL_MENDOCINO) ===
  driverInfo=Mesa 26.2.3 - kisak-mesa PPA
  VK_KHR_performance_query=yes  performanceCounterQueryPools=1
  qf0 counters=17 (VkResult=0)
```

Not a `csrun` bug: RADV does not advertise the extension on GFX12 in 26.2.3.

---

## 10. The RADV feature gate

`radv_perf_query_supported()` in `radv_physical_device.c`:

**Mesa 26.2.3:**

```c
return (pdev->info.gfx_level == GFX10_3 ||
        (pdev->info.gfx_level >= GFX11 && pdev->info.gfx_level < GFX12)) &&
       !(instance->vk.trace_mode & RADV_TRACE_MODE_RGP);
```

| Chip | `gfx_level` | Allowed? |
|------|-------------|----------|
| Raphael iGPU | GFX10.3 | yes |
| RDNA3 | GFX11 | yes |
| RX 9060 XT | GFX12 | **no** (`< GFX12`) |

**Mesa `main` after 2026-09-10** (*radv: enable VK_KHR_performance_query on GFX12*):

```c
return pdev->info.gfx_level >= GFX10_3 && pdev->info.gfx_level <= GFX12 &&
       !(instance->vk.trace_mode & RADV_TRACE_MODE_RGP);
```

Same gate; one comparison change. “Mesa 26” from kisak is not the same as `main` after that commit.

:::note
RGP / SQTT trace mode also disables perf counters (register conflict). Separate from the GFX12 gate.
:::

---

## 11. Side-by-side Mesa `main`

Desktop stays on kisak 26.2.3. Benchmarks opt into `~/mesa-radv-26`.

```bash
git clone --depth 1 --branch main \
  https://gitlab.freedesktop.org/mesa/mesa.git ~/src/mesa

meson setup ~/src/mesa/build-radv26 ~/src/mesa \
  --prefix="$HOME/mesa-radv-26" --libdir=lib \
  -Dbuildtype=release \
  -Dplatforms= \
  -Dgallium-drivers= \
  -Dvulkan-drivers=amd \
  -Dllvm=disabled \
  -Dgbm=disabled -Degl=disabled -Dglx=disabled

ninja -C ~/src/mesa/build-radv26 -j"$(nproc)"
ninja -C ~/src/mesa/build-radv26 install
```

Gate in this tree (`590bf21`):

```text
62:   return pdev->info.gfx_level >= GFX10_3 && pdev->info.gfx_level <= GFX12 &&
```

Binary:

```text
-rwxr-xr-x … /home/aitr/mesa-radv-26/lib/libvulkan_radeon.so
```

**Actual `csrun`:**

```text
vulkan	0	AMD Radeon RX 9060 XT (RADV GFX1200) [discrete] radv perf_query=yes	(Mesa 26.3.0-devel (git-590bf21d91))
vulkan	1	AMD Ryzen 7 9700X 8-Core Processor (RADV RAPHAEL_MENDOCINO) [integrated] radv perf_query=yes	(Mesa 26.3.0-devel (git-590bf21d91))
```

**Actual probe:**

```text
=== [0] AMD Radeon RX 9060 XT (RADV GFX1200) ===
  driverInfo=Mesa 26.3.0-devel (git-590bf21d91)
  VK_KHR_performance_query=yes  performanceCounterQueryPools=1
  qf0 counters=14 (VkResult=0)
=== [1] AMD Ryzen 7 9700X 8-Core Processor (RADV RAPHAEL_MENDOCINO) ===
  driverInfo=Mesa 26.3.0-devel (git-590bf21d91)
  VK_KHR_performance_query=yes  performanceCounterQueryPools=1
  qf0 counters=17 (VkResult=0)
```

| Device | Extension | qf0 counters |
|--------|-----------|--------------|
| RX 9060 XT | yes | **14** |
| Raphael iGPU | yes | **17** |

`csrun` auto-pick weights `perf_query`, so the 9060 becomes the default counter device once the extension appears.

---

## 12. Env helpers

| Script | Role |
|--------|------|
| `scripts/env-kisak-radv.sh` | Absolute kisak ICD + `/usr` before amdgpu |
| `scripts/env-mesa-main-radv.sh` | `~/mesa-radv-26` + GFX12 counters |
| `scripts/build-mesa26-radv.sh` | Rebuild prefix |

<Tabs>
  <TabItem value="main" label="Mesa main (GFX12 yes)" default>

```bash
source scripts/env-mesa-main-radv.sh
./build/bin/csrun --list-devices
```

```text
vulkan	0	AMD Radeon RX 9060 XT (RADV GFX1200) [discrete] radv perf_query=yes	(Mesa 26.3.0-devel (git-590bf21d91))
vulkan	1	AMD Ryzen 7 9700X 8-Core Processor (RADV RAPHAEL_MENDOCINO) [integrated] radv perf_query=yes	(Mesa 26.3.0-devel (git-590bf21d91))
```

  </TabItem>
  <TabItem value="kisak" label="kisak only (GFX12 still no)">

```bash
source scripts/env-kisak-radv.sh
./build/bin/csrun --list-devices
```

```text
vulkan	1	… RAPHAEL_MENDOCINO … radv perf_query=yes	(Mesa 26.2.3 - kisak-mesa PPA)
vulkan	0	… RX 9060 XT … radv perf_query=no	(Mesa 26.2.3 - kisak-mesa PPA)
```

  </TabItem>
</Tabs>

Until a release backports the GFX12 enable, kisak **26.2.x** = correct version string, wrong feature gate for RDNA4 HW counters.

---

## 13. Decision tree / FAQ

### Decision tree

```text
Q1. Does csrun / vulkaninfo show the Mesa version you installed?
    NO  → relative ICD or /opt/amdgpu winning
          → absolute library_path to the .so you want
          → also check LD_LIBRARY_PATH starts with /usr or your prefix

Q2. After forcing the new .so, did Vulkan devices disappear?
    YES → libdrm_amdgpu mismatch (amdgpu_query_sw_info … failed)
          → prepend /usr/lib/x86_64-linux-gnu (or prefix/lib)

Q3. Mesa version OK, but dGPU still perf_query=no?
    YES → open radv_perf_query_supported for your Mesa tag
          → if gfx_level < GFX12, you need Mesa main ≥ 2026-09-10
             (or a backport). Package "26.x" alone is not enough.

Q4. Both GPUs yes, but wrong GPU picked?
    → csrun prefers perf_query; pass --device-index N if needed
```

### FAQ

**Why did the iGPU work the whole time?**  
Raphael is GFX10.3. Even Mesa 26.2’s gate allows GFX10.3. The discrete card is GFX12 — explicitly excluded until the later commit.

**Is `/opt/amdgpu` the problem?**  
Not inherently — it is useful for ROCm. It hurts when its older RADV/`libdrm` win silently via `ldconfig`.

**Uninstall `/opt/amdgpu` instead?**  
Possible. We used env isolation so HIP/OpenCL could stay; side-by-side Mesa is enough for Vulkan counters.

**Do I need LLVM to build RADV?**  
For this Vulkan-only ACO build, `-Dllvm=disabled` was enough. Your script may enable LLVM if you also want radeonsi OpenGL from the same prefix.

**Will `perf_query=yes` mean every counter is perfect on GFX12?**  
It means the **API is exposed**. Individual counter accuracy / RGP integration can still improve upstream. For tooling, “extension on + non-zero counters” is the unlock.

**Where does the “Agent creation failed / unrecognized id” warning come from?**  
Usually a ROCm/profiler agent sniffing GPUs — noisy, not the ICD bug. Safe to ignore while debugging Vulkan ICDs.

---

## 14. Takeaways

1. **Installed package ≠ loaded driver** — trust the Mesa string from the running process.
2. **ICD file path ≠ `library_path`** — use an absolute path to the `.so` you intend.
3. **RADV and `libdrm_amdgpu` must match** — mismatch → init failure, no Vulkan devices.
4. **Feature gates live in driver source** — `radv_perf_query_supported` excluded GFX12 until Mesa main (2026-09-10).
5. **Side-by-side Mesa** is enough for tooling; no need to replace the desktop stack.
6. **`perf_query=yes/no` in `--list-devices`** makes the capability check reproducible.

| Step | Symptom | Cause |
|------|---------|-------|
| 1 | Still Mesa 25 after upgrade | Relative ICD + `/opt/amdgpu` first |
| 2 | Vulkan gone after absolute ICD | Wrong / old `libdrm_amdgpu` |
| 3 | Mesa 26.2, 9060 still `no` | `gfx_level < GFX12` |
| 4 | Mesa 26.3-devel prefix | Fixed — extension on, 14 counters |

---

## 15. References

- Vulkan: [`VK_KHR_performance_query`](https://registry.khronos.org/vulkan/specs/latest/man/html/VK_KHR_performance_query.html)
- Mesa RADV: `src/amd/vulkan/radv_physical_device.c` (`radv_perf_query_supported`), `radv_perfcounter.c`
- Mesa (2026-09-10): *radv: enable VK_KHR_performance_query on GFX12*
- Loader docs: [`VK_ICD_FILENAMES` / ICD discovery](https://github.com/KhronosGroup/Vulkan-Loader/blob/main/docs/LoaderInterfaceArchitecture.md)
- AMD switchable graphics layer: `DISABLE_LAYER_AMD_SWITCHABLE_GRAPHICS_1`
- CompilerSutra: [GPU · Vulkan](/docs/gpu/platforms/vulkan) · [CompilerSutraPerf](/docs/project/compilersutra-perf/)

:::note Lab note
Re-run on **2026-09-19**. Host: Ubuntu 24.04-class, kernel **7.0.0-31-generic**, dual AMD GPU (Raphael iGPU + RX 9060 XT). Packages: `mesa-vulkan-drivers 26.2.3~kisak1~n`. Also present: AMD `/opt/amdgpu` (RADV **25.2.0-devel** in `ldconfig`). Side-by-side: Mesa **26.3.0-devel** git **`590bf21`**, Vulkan-only RADV, ACO (`-Dllvm=disabled`), prefix `~/mesa-radv-26`. Full command transcripts: [Lab transcript](#lab-transcript-actual-runs-on-this-machine). Helpers: `scripts/env-kisak-radv.sh`, `scripts/env-mesa-main-radv.sh`, `scripts/build-mesa26-radv.sh` in CompilerSutraRun.
:::
