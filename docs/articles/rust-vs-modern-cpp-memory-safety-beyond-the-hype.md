---
title: "Rust vs Modern C++: Memory Safety Beyond the Hype"
description: "A practical comparison of Rust and modern C++ memory safety using one running cache example, sanitizer-based debugging, and compile-time enforcement."
keywords:
  - rust vs modern c++ memory safety
  - modern c++ memory safety
  - rust borrow checker
  - c++ sanitizers addresssanitizer threadsanitizer
  - use after free c++
  - buffer overflow c++
  - data race detection
  - rust unsafe keyword
  - c++ core guidelines ownership
  - memory safety engineering comparison
  - rust vs c++ systems programming
  - sanitizer vs borrow checker
  - safe systems programming
  - modern c++ smart pointers
  - compiler sutra rust c++
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Head from '@docusaurus/Head';

<Head>
  <meta name="description" content="A practical engineering comparison of Rust and modern C++ memory safety using one cache example, sanitizer reports, and compile-time enforcement." />
</Head>

# Rust vs Modern C++: Memory Safety Beyond the Hype

## Table of Contents

- [0. Abstract](#0-abstract)
- [1. Why This Comparison Matters Now](#1-why-this-comparison-matters-now)
- [2. Why Undefined Behavior Exists in C++](#2-why-undefined-behavior-exists-in-c)
- [3. Running Example: A Concurrent In-Memory Cache](#3-running-example-a-concurrent-in-memory-cache)
- [4. Use-After-Free](#4-use-after-free)
- [Memory Leak vs Use-After-Free](#memory-leak-vs-use-after-free)
- [5. Buffer Overflow](#5-buffer-overflow)
- [6. Null Pointer Dereference](#6-null-pointer-dereference)
- [7. Data Race](#7-data-race)
- [8. Unsafe Escape Hatches](#8-unsafe-escape-hatches)
- [Where the Borrow Checker Hurts](#where-the-borrow-checker-hurts)
- [Common Myths](#common-myths)
- [9. Toolchain Stack and Safety Profiles](#9-toolchain-stack-and-safety-profiles)
- [10. Safety in Large C++ Codebases](#10-safety-in-large-c-codebases)
- [11. Aggregate Summary](#11-aggregate-summary)
- [12. Benchmark Methodology](#12-benchmark-methodology)
- [13. Local Performance Snapshot](#13-local-performance-snapshot)
- [14. Decision Matrix](#14-decision-matrix)
- [15. Limits of This Comparison](#15-limits-of-this-comparison)
- [16. References](#16-references)

:::note
Roadmap: Traditional C++ -> memory bugs -> sanitizers and safer APIs -> modern C++ -> Rust safe code -> unsafe boundary
:::

:::note
Bug index: [use-after-free](#4-use-after-free), [buffer overflow](#5-buffer-overflow), [null pointer dereference](#6-null-pointer-dereference), [data race](#7-data-race), [memory leak](#memory-leak-vs-use-after-free)
:::

## 0. Abstract

This article compares Rust and modern C++ on one concrete system: a concurrent in-memory cache with a background eviction thread. It measures the kinds of failures that matter in native code, not raw speed: [use-after-free](#4-use-after-free), [buffer overflow](#5-buffer-overflow), [null pointer dereference](#6-null-pointer-dereference), and [data races](#7-data-race). For each case, it shows the bug in traditional C++, the kind of signal a sanitizer can give you, the modern C++ fix, and the Rust shape that often prevents the bug from compiling in safe code. The article does not claim that Rust eliminates all bugs, that modern C++ cannot be made safer, or that one language always wins. It is meant to help the reader decide when compile-time enforcement is worth the migration cost, when toolchain hardening is enough, and when the safer default should be a language choice rather than a build flag.

## 1. Why This Comparison Matters Now

Memory safety is not a niche concern. Microsoft has said roughly 70% of the CVEs it assigns each year are memory-safety issues [Microsoft MSRC](https://www.microsoft.com/en-us/msrc/blog/2019/07/we-need-a-safer-systems-programming-language/). Chromium reports that around 70% of its serious security bugs are memory-safety problems, and says a large share of those are use-after-free bugs [Chromium memory safety](https://www.chromium.org/Home/chromium-security/memory-safety).

Google and Android have made the same strategic shift. Android’s memory-safety documentation says native code written in C, C++, and assembly is a major part of the platform’s vulnerability surface [Android memory safety](https://source.android.com/docs/security/test/memory-safety). Google also documented its use of Rust for new Android native code as a memory-safe alternative to C/C++ [Android 13 Rust update](https://security.googleblog.com/2022/12/memory-safe-languages-in-android-13.html).

That is the context for this comparison. The question is not whether C++ can be written carefully. The question is whether modern C++ plus tooling gives you the same failure-prevention model as Rust in practice.

:::note
Memory safety means that loads, stores, and pointer operations stay within the rules the language can define and verify. Managed languages usually get there with automatic memory management, but systems languages often avoid a heavy runtime like a garbage collector, so they recover safety through ownership rules, safer APIs, and tooling instead.
:::

## 2. Why Undefined Behavior Exists in C++

Undefined behavior is not an accident. It is part of how C and C++ keep low-level code fast and expressive. If the compiler has to assume that every pointer may be invalid, every integer may overflow, and every alias may exist, it loses room for optimization. UB gives the optimizer stronger assumptions.

A simple example is enough to show the idea:

```cpp
int safe_increment(int x) {
  return x + 1;
}

bool is_increasing(int x) {
  return x + 1 > x;
}
```

If `x` is `INT_MAX`, then `x + 1` overflows, which is undefined behavior. The compiler is allowed to assume the overflow case does not happen. Under that assumption, `x + 1 > x` can be treated as always true. A debug build may appear to work while an optimized build folds the comparison away.

The same general rule is what makes pointer-based code tricky. Once the program steps outside the language rules, the optimizer is allowed to make aggressive choices. This is why modern C++ safety is not just about syntax; it is also about using APIs and tooling that keep the program inside defined behavior.

:::note
This is the real cost model behind C++: performance headroom comes from strong compiler assumptions, and safety has to be rebuilt with library design, guidelines, and tools.
:::

## 3. Running Example: A Concurrent In-Memory Cache

We use one cache throughout: a key-value store with expiration and a background eviction thread.

<Tabs groupId="language" queryString="language">
  <TabItem value="cpp" label="C++">

```cpp
#include <chrono>
#include <mutex>
#include <string>
#include <thread>
#include <unordered_map>

struct Entry {
  std::string value;
  std::chrono::steady_clock::time_point expires_at;
};

class Cache {
 public:
  void put(std::string key, std::string value);
  std::string* get(const std::string& key);
  void evict_expired();

 private:
  std::mutex mu_;
  std::unordered_map<std::string, Entry> map_;
  bool stop_ = false;
  std::thread evictor_;
};
```

  </TabItem>
  <TabItem value="rust" label="Rust">

```rust
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::Instant;

struct Entry {
    value: String,
    expires_at: Instant,
}

struct Cache {
    map: Mutex<HashMap<String, Entry>>,
    stop: std::sync::atomic::AtomicBool,
}
```

  </TabItem>
</Tabs>

This is a good comparison vehicle because it naturally exercises the failures that matter in systems code:

- ownership confusion when cache entries are handed out
- invalidation when eviction runs in the background
- iterator and reference lifetime problems
- unsynchronized shared state across threads

The cache declaration shows an `evictor_` thread because the full lifecycle matters here. The constructor and destructor plumbing are omitted in this snippet for readability, but later examples show the thread start/join path explicitly.

:::note
Iterator invalidation is a real C++ footgun: if you mutate a container while holding an iterator or reference into it, the iterator can become invalid. Rust prevents that class of bug by refusing to let you mutate through one alias while another live borrow still exists.

```cpp
std::vector<int> v = {1, 2, 3};
auto it = v.begin();
v.push_back(4);  // it may now be invalid
std::cout << *it;  // undefined behavior
```
:::

Modern C++ also has better non-owning types for APIs, including `std::span` and `std::string_view`, which make ownership and size more explicit. That helps, but it does not change the fact that C++ still relies on the programmer to keep the lifetime and threading rules intact.

:::note
The rest of the article keeps returning to this same cache so the comparison stays concrete instead of drifting into abstract language theory.
:::

## 4. Use-After-Free

We are trying to show how a pointer can outlive the storage it points to, why that becomes a security bug, how ASan catches it at runtime, how modern C++ can reduce the risk with ownership types, and why Rust turns the lifetime mistake into a compile-time error in safe code.

<Tabs groupId="uaf-steps-1" queryString="uaf-steps-1">
  <TabItem value="step1" label="Step 1: Break it">

The classic use-after-free mistake is keeping a pointer after the backing storage has been deleted or otherwise invalidated. The code still compiles, and the pointer still has a value, but the object it points to is no longer alive. Reading through that pointer is undefined behavior.

```cpp
int* p = new int[4]{1, 2, 3, 4};
delete[] p;
std::cout << p[2] << "\n";  // use-after-free
```

This compiles cleanly. The bug appears later when the freed memory is read.

  </TabItem>
  <TabItem value="step2" label="Step 2: Observe it">

Actual ASan output from a local run:

```bash
$ clang++ -fsanitize=address -g uaf2.cpp -o uaf2_asan && ./uaf2_asan
=================================================================
==178582==ERROR: AddressSanitizer: heap-use-after-free on address 0x502000000018 at pc 0x5a0867ac7ce5 bp 0x7ffef23d7210 sp 0x7ffef23d7208
READ of size 4 at 0x502000000018 thread T0
    #0 0x5a0867ac7ce4 in main /tmp/cs_memsafe_demo/uaf2.cpp:6:16
    #1 0x788154e2a1c9 in __libc_start_call_main csu/../sysdeps/nptl/libc_start_call_main.h:58:16
    #2 0x788154e2a28a in __libc_start_main csu/../csu/libc-start.c:360:3
    #3 0x5a08679ec364 in _start (/tmp/cs_memsafe_demo/uaf2_asan+0x2c364) (BuildId: 0a4f754dfd79f806e658b6a652e6ca475675ffc3)

0x502000000018 is located 8 bytes inside of 16-byte region [0x502000000010,0x502000000020)
freed by thread T0 here:
    #0 0x5a0867ac6151 in operator delete[](void*) (/tmp/cs_memsafe_demo/uaf2_asan+0x106151) (BuildId: 0a4f754dfd79f806e658b6a652e6ca475675ffc3)
    #1 0x5a0867ac7ca3 in main /tmp/cs_memsafe_demo/uaf2.cpp:5:3
    #2 0x788154e2a1c9 in __libc_start_call_main csu/../sysdeps/nptl/libc_start_call_main.h:58:16
    #3 0x788154e2a28a in __libc_start_main csu/../csu/libc-start.c:360:3
    #4 0x5a08679ec364 in _start (/tmp/cs_memsafe_demo/uaf2_asan+0x2c364) (BuildId: 0a4f754dfd79f806e658b6a652e6ca475675ffc3)

previously allocated by thread T0 here:
    #0 0x5a0867ac58f1 in operator new[](unsigned long) (/tmp/cs_memsafe_demo/uaf2_asan+0x1058f1) (BuildId: 0a4f754dfd79f806e658b6a652e6ca475675ffc3)
    #1 0x5a0867ac7b68 in main /tmp/cs_memsafe_demo/uaf2.cpp:4:12
    #2 0x788154e2a1c9 in __libc_start_call_main csu/../sysdeps/nptl/libc_start_call_main.h:58:16
    #3 0x788154e2a28a in __libc_start_main csu/../csu/libc-start.c:360:3
    #4 0x5a08679ec364 in _start (/tmp/cs_memsafe_demo/uaf2_asan+0x2c364) (BuildId: 0a4f754dfd79f806e658b6a652e6ca475675ffc3)

SUMMARY: AddressSanitizer: heap-use-after-free /tmp/cs_memsafe_demo/uaf2.cpp:6:16 in main
Shadow bytes around the buggy address:
  0x501ffffffd80: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
  0x501ffffffe00: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
  0x501ffffffe80: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
  0x501fffffff00: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
  0x501fffffff80: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
=>0x502000000000: fa fa fd[fd]fa fa fa fa fa fa fa fa fa fa fa fa
  0x502000000080: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
Shadow byte legend (one shadow byte represents 8 application bytes):
  Addressable:           00
  Partially addressable: 01 02 03 04 05 06 07
  Heap left redzone:       fa
  Heap freed region:       fd
==178582==ABORTING
```

ASan is useful here, but only if you build and run with it.

  </TabItem>
</Tabs>

### Memory Leak vs Use-After-Free

A memory leak is memory that was allocated but is no longer reachable, so the program can no longer free it or reuse it. The process may keep running, but its memory usage grows over time. That is different from use-after-free: in a leak the memory is still allocated, while in use-after-free the program keeps touching memory after it has already been freed.

A tiny example:

```cpp
int* p = new int(42);
p = nullptr;  // leak: the allocated int is now unreachable
```

```text
allocated object --> p --> overwritten
        |
        └── no live pointer left, so the allocation leaks
```

Leaking memory is usually not an immediate crash, but it can still become a security and reliability issue. In a server, a leak can slowly consume memory until the process is killed or becomes unstable. In a long-running service, that can become a denial-of-service problem.

<Tabs groupId="uaf-steps-2" queryString="uaf-steps-2">
  <TabItem value="step3" label="Step 3: Fix it in Modern C++">

<Tabs groupId="uaf-fix-impl" queryString="uaf-fix-impl">
  <TabItem value="cpp" label="C++">

```cpp
struct Entry {
  std::shared_ptr<std::string> value;
  std::chrono::steady_clock::time_point expires_at;
};

std::shared_ptr<std::string> Cache::get(const std::string& key) {
  std::lock_guard<std::mutex> lock(mu_);
  auto it = map_.find(key);
  if (it == map_.end()) return {};
  return it->second.value;
}
```

  </TabItem>
  <TabItem value="rust" label="Rust">

```rust
impl Cache {
    fn get(&self, key: &str) -> Option<String> {
        let map = self.map.lock().unwrap();
        map.get(key).map(|entry| entry.value.clone())
    }
}
```

  </TabItem>
</Tabs>

That is better, but it is not free of failure modes. A `shared_ptr` cycle leaks memory, and sanitizers do not prove ownership correctness.

:::caution
`shared_ptr` can prevent dangling references and still leave you with a memory leak if the ownership graph has a cycle.
:::

  </TabItem>
  <TabItem value="step4" label="Step 4: Rust's answer">

Actual rustc output from a local run:

```text
error[E0515]: cannot return value referencing local variable `map`
  --> /tmp/cs_memsafe_demo/borrow.rs:15:9
   |
15 |         map.get(key).map(|entry| &entry.value)
   |         ---^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   |         |
   |         returns a value referencing data owned by the current function
   |         `map` is borrowed here

error: aborting due to 1 previous error

For more information about this error, try `rustc --explain E0515`.
```

The exact line numbers will vary, but the structure is the point: Rust forces you to confront the lifetime problem instead of hiding it behind a pointer.

  </TabItem>
  <TabItem value="step5" label="Step 5: Experiment data">

| Variant | Detects bug? | When? | Notes |
|---|---|---|---|
| Traditional C++ | No | Never | Undefined behavior |
| Modern C++ (smart pointers) | Partial | Runtime with ASan | Cycles still leak |
| Rust | Yes | Compile time | Hard reject in safe code |

  </TabItem>
</Tabs>

## 5. Buffer Overflow

We are trying to show how a single out-of-bounds write can corrupt nearby memory, why ASan catches it at runtime, how modern C++ can reduce the risk with checked containers and spans, and how Rust makes the safe path explicit through slices and bounds checks.

<Tabs groupId="overflow-steps" queryString="overflow-steps">
  <TabItem value="step1" label="Step 1: Break it">

```cpp
void write_slot(char* buf, std::size_t n) {
  buf[n] = 'X';  // off-by-one write
}

int main() {
  char buf[4] = {'a', 'b', 'c', '\0'};
  write_slot(buf, 4);
}
```

The call site is the trigger: `main` passes `n = 4` into a 4-byte buffer, so the write lands one byte past the end.

  </TabItem>
  <TabItem value="step2" label="Step 2: Observe it">

Actual output from the local run:

```bash
$ clang++ -fsanitize=address,undefined -g overflow.cpp -o overflow_san && ./overflow_san
=================================================================
==177938==ERROR: AddressSanitizer: stack-buffer-overflow on address 0x7a4203100024 at pc 0x5703d74cfbff bp 0x7ffc75572fd0 sp 0x7ffc75572fc8
WRITE of size 1 at 0x7a4203100024 thread T0
    #0 0x5703d74cfbfe in write_slot(char*, unsigned long) /tmp/cs_memsafe_demo/overflow.cpp:5:10
    #1 0x5703d74cfcfa in main /tmp/cs_memsafe_demo/overflow.cpp:10:3
    #2 0x7a420522a1c9 in __libc_start_call_main csu/../sysdeps/nptl/libc_start_call_main.h:58:16
    #3 0x7a420522a28a in __libc_start_main csu/../csu/libc-start.c:360:3
    #4 0x5703d73f4354 in _start (/tmp/cs_memsafe_demo/overflow_san+0x2c354) (BuildId: af06d9f8e4dcd665da9036e3edb90bbc5876066b)

Address 0x7a4203100024 is located in stack of thread T0 at offset 36 in frame
    #0 0x5703d74cfc27 in main /tmp/cs_memsafe_demo/overflow.cpp:8

  This frame has 1 object(s):
    [32, 36) 'buf' (line 9) <== Memory access at offset 36 overflows this variable
SUMMARY: AddressSanitizer: stack-buffer-overflow /tmp/cs_memsafe_demo/overflow.cpp:5:10 in write_slot(char*, unsigned long)
Shadow bytes around the buggy address:
  0x7a42030ffd80: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
  0x7a42030ffe00: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
  0x7a42030ffe80: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
  0x7a42030fff00: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
  0x7a42030fff80: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
=>0x7a4203100000: f1 f1 f1 f1[04]f3 f3 f3 00 00 00 00 00 00 00 00
Shadow byte legend (one shadow byte represents 8 application bytes):
  Addressable:           00
  Partially addressable: 01 02 03 04 05 06 07
  Heap left redzone:       fa
  Stack left redzone:       f1
  Stack right redzone:       f3
==177938==ABORTING
```

  </TabItem>
  <TabItem value="step3" label="Step 3: Fix it in Modern C++">

<Tabs groupId="overflow-fix" queryString="overflow-fix">
  <TabItem value="cpp" label="C++">

```cpp
std::vector<char> buf(16);
buf.at(15) = 'X';  // checked access

std::span<char> view(buf);
```

`std::span` is especially useful when the function should not own the buffer but still needs the size alongside it. The key point is that modern C++ gives you better vocabulary for safe APIs, but it still does not enforce checked access automatically.

  </TabItem>
  <TabItem value="rust" label="Rust">

```rust
fn write_slot(buf: &mut [u8], n: usize) {
    if let Some(slot) = buf.get_mut(n) {
        *slot = b'X';
    }
}
```

If `n` is out of bounds, the safe version can also panic if you use direct indexing. The checked `get_mut` path is the non-panicking version.

  </TabItem>
</Tabs>

:::caution
Modern C++ reduces the chance of an overflow. It does not remove the need to make the checked path the default path.
:::

  </TabItem>
  <TabItem value="step4" label="Step 4: Rust's answer">

Rust keeps the safe path explicit. Direct indexing on a slice can panic at runtime, while `get_mut` returns an `Option` that the caller must handle. For example:

```rust
let mut buf = [b'a', b'b', b'c', 0];
println!("{:?}", buf.get_mut(4)); // None
// buf[4] = b'X'; // runtime panic if executed
```

  </TabItem>
  <TabItem value="step5" label="Step 5: Experiment data">

| Variant | Detects bug? | When? | Notes |
|---|---|---|---|
| Traditional C++ | No | Never | Silent memory corruption |
| Modern C++ | Partial | Runtime with `.at()` or ASan | Checked access is opt-in |
| Rust | Yes | Compile time for shape, runtime for bounds | Safe APIs are the default |

  </TabItem>
</Tabs>

## 6. Null Pointer Dereference

We are trying to show how a null pointer dereference reaches a crash, why the crash is usually immediate, how modern C++ can make absence explicit with `std::optional`, and how Rust forces `Option<T>` handling before the code compiles cleanly.

<Tabs groupId="null-steps" queryString="null-steps">
  <TabItem value="step1" label="Step 1: Break it">

```cpp
const std::string* find_user(Cache& cache, const std::string& key) {
  return cache.get(key);  // may return nullptr
}

std::cout << find_user(cache, "missing")->size() << "\n";
```

This bug is simple in shape but common in practice: the dereference site is valid syntax, yet the pointer itself is not valid at runtime.

  </TabItem>
  <TabItem value="step2" label="Step 2: Observe it">

Null dereferences usually show up as a plain crash rather than a rich sanitizer report.

```bash
$ ./null
Segmentation fault (core dumped)

$ clang++ -fsanitize=address -g /tmp/cs_memsafe_demo/null.cpp -o /tmp/cs_memsafe_demo/null_asan && /tmp/cs_memsafe_demo/null_asan
AddressSanitizer:DEADLYSIGNAL
=================================================================
==178224==ERROR: AddressSanitizer: SEGV on unknown address 0x000000000000 (pc 0x7587aef68d14 bp 0x7ffec92974d0 sp 0x7ffec92974b8 T0)
==178224==The signal is caused by a READ memory access.
==178224==Hint: address points to the zero page.
    #0 0x7587aef68d14 in std::__cxx11::basic_string<char, std::char_traits<char>, std::allocator<char>>::size() const (/lib/x86_64-linux-gnu/libstdc++.so.6+0x168d14) (BuildId: 753c6c8608b61d4e67be8f0c890e03e0aa046b8b)
    #1 0x5d0f9723bb7f in main /tmp/cs_memsafe_demo/null.cpp:6:19
    #2 0x7587aea2a1c9 in __libc_start_call_main csu/../sysdeps/nptl/libc_start_call_main.h:58:16
    #3 0x7587aea2a28a in __libc_start_main csu/../csu/libc-start.c:360:3
    #4 0x5d0f97160374 in _start (/tmp/cs_memsafe_demo/null_asan+0x2c374) (BuildId: f9ddb3378c05a59ef7b8c935c85147993d118563)

AddressSanitizer can not provide additional info.
SUMMARY: AddressSanitizer: SEGV (/lib/x86_64-linux-gnu/libstdc++.so.6+0x168d14) (BuildId: 753c6c8608b61d4e67be8f0c890e03e0aa046b8b) in std::__cxx11::basic_string<char, std::char_traits<char>, std::allocator<char>>::size() const
==178224==ABORTING
```

This crash trace points directly to the dereference site. The immediate fix is to check for null before dereferencing. A better long-term fix is to redesign the API so absence is explicit with `std::optional` in C++ or `Option<T>` in Rust.

  </TabItem>
  <TabItem value="step3" label="Step 3: Fix it in Modern C++">

<Tabs groupId="null-fix" queryString="null-fix">
  <TabItem value="cpp" label="C++">

```cpp
std::optional<std::string> Cache::get_value(const std::string& key) {
  std::lock_guard<std::mutex> lock(mu_);
  auto it = map_.find(key);
  if (it == map_.end()) return std::nullopt;
  return it->second.value;
}
```

  </TabItem>
  <TabItem value="rust" label="Rust">

```rust
fn get_value(&self, key: &str) -> Option<String> {
    let map = self.map.lock().unwrap();
    map.get(key).map(|entry| entry.value.clone())
}
```

  </TabItem>
</Tabs>

This is better API design, but it is still a design decision. C++ does not force the caller to deal with absence unless you expose absence explicitly.

  </TabItem>
  <TabItem value="step4" label="Step 4: Rust's answer">

Rust keeps the absence case explicit at the call site. In practice, that means the compiler pushes you toward a `match`, `if let`, or `?`-based path instead of letting the code silently assume the value exists. For example:

```rust
match get_value() {
    Some(v) => println!("{}", v),
    None => println!("missing"),
}
```

  </TabItem>
  <TabItem value="step5" label="Step 5: Experiment data">

| Variant | Detects bug? | When? | Notes |
|---|---|---|---|
| Traditional C++ | No | Runtime crash or UB | Null checks are manual |
| Modern C++ | Better | Runtime or API design time | `optional` makes absence explicit |
| Rust | Yes | Compile time in the caller flow | Explicit handling is enforced |

  </TabItem>
</Tabs>

## 7. Data Race

We are trying to show how two threads can mutate shared state at the same time, why TSan catches the race only when it is enabled, how modern C++ fixes it with explicit locking, and how Rust constrains sharing rules with `Send` and `Sync`.

<Tabs groupId="race-steps" queryString="race-steps">
  <TabItem value="step1" label="Step 1: Break it">

```cpp
int hits = 0;

void record_hit() {
  ++hits;  // no synchronization
}
```

In the cache, the same bug shows up when eviction, reads, and writes touch the same state without a lock.

  </TabItem>
  <TabItem value="step2" label="Step 2: Observe it">

TSan reports the race only when you run with TSan enabled. Actual local output:

```bash
$ clang++ -fsanitize=thread -g race.cpp -o race_tsan && ./race_tsan
==================
WARNING: ThreadSanitizer: data race (pid=178170)
  Write of size 4 at 0x555556a63ae8 by thread T2:
    #0 bump() /tmp/cs_memsafe_demo/race.cpp:8:5 (race_tsan+0xe1b3c) (BuildId: e9356f86e9074953fc856bc776ad7260d8de1179)
    #1 void std::__invoke_impl<void, void (*)()>(std::__invoke_other, void (*&&)()) /usr/bin/../lib/gcc/x86_64-linux-gnu/13/../../../../include/c++/13/bits/invoke.h:61:14 (race_tsan+0xe2492) (BuildId: e9356f86e9074953fc856bc776ad7260d8de1179)
    #2 std::__invoke_result<void (*)()>::type std::__invoke<void (*)()>(void (*&&)()) /usr/bin/../lib/gcc/x86_64-linux-gnu/13/../../../../include/c++/13/bits/invoke.h:96:14 (race_tsan+0xe23f5) (BuildId: e9356f86e9074953fc856bc776ad7260d8de1179)
    #3 void std::thread::_Invoker<std::tuple<void (*)()>>::_M_invoke<0ul>(std::_Index_tuple<0ul>) /usr/bin/../lib/gcc/x86_64-linux-gnu/13/../../../../include/c++/13/bits/std_thread.h:292:13 (race_tsan+0xe23ad) (BuildId: e9356f86e9074953fc856bc776ad7260d8de1179)
    #4 std::thread::_Invoker<std::tuple<void (*)()>>::operator()() /usr/bin/../lib/gcc/x86_64-linux-gnu/13/../../../../include/c++/13/bits/std_thread.h:299:11 (race_tsan+0xe2355) (BuildId: e9356f86e9074953fc856bc776ad7260d8de1179)
    #5 std::thread::_State_impl<std::thread::_Invoker<std::tuple<void (*)()>>>::_M_run() /usr/bin/../lib/gcc/x86_64-linux-gnu/13/../../../../include/c++/13/bits/std_thread.h:244:13 (race_tsan+0xe21c9) (BuildId: e9356f86e9074953fc856bc776ad7260d8de1179)
    #6 <null> <null> (libstdc++.so.6+0xecdb3) (BuildId: 753c6c8608b61d4e67be8f0c890e03e0aa046b8b)

  Previous write of size 4 at 0x555556a63ae8 by thread T1:
    #0 bump() /tmp/cs_memsafe_demo/race.cpp:8:5 (race_tsan+0xe1b3c) (BuildId: e9356f86e9074953fc856bc776ad7260d8de1179)
    #1 void std::__invoke_impl<void, void (*)()>(std::__invoke_other, void (*&&)()) /usr/bin/../lib/gcc/x86_64-linux-gnu/13/../../../../include/c++/13/bits/invoke.h:61:14 (race_tsan+0xe2492) (BuildId: e9356f86e9074953fc856bc776ad7260d8de1179)
    #2 std::__invoke_result<void (*)()>::type std::__invoke<void (*)()>(void (*&&)()) /usr/bin/../lib/gcc/x86_64-linux-gnu/13/../../../../include/c++/13/bits/invoke.h:96:14 (race_tsan+0xe23f5) (BuildId: e9356f86e9074953fc856bc776ad7260d8de1179)
    #3 void std::thread::_Invoker<std::tuple<void (*)()>>::_M_invoke<0ul>(std::_Index_tuple<0ul>) /usr/bin/../lib/gcc/x86_64-linux-gnu/13/../../../../include/c++/13/bits/std_thread.h:292:13 (race_tsan+0xe23ad) (BuildId: e9356f86e9074953fc856bc776ad7260d8de1179)
    #4 std::thread::_Invoker<std::tuple<void (*)()>>::operator()() /usr/bin/../lib/gcc/x86_64-linux-gnu/13/../../../../include/c++/13/bits/std_thread.h:299:11 (race_tsan+0xe2355) (BuildId: e9356f86e9074953fc856bc776ad7260d8de1179)
    #5 std::thread::_State_impl<std::thread::_Invoker<std::tuple<void (*)()>>>::_M_run() /usr/bin/../lib/gcc/x86_64-linux-gnu/13/../../../../include/c++/13/bits/std_thread.h:244:13 (race_tsan+0xe21c9) (BuildId: e9356f86e9074953fc856bc776ad7260d8de1179)
    #6 <null> <null> (libstdc++.so.6+0xecdb3) (BuildId: 753c6c8608b61d4e67be8f0c890e03e0aa046b8b)

  Location is global 'hits' of size 4 at 0x555556a63ae8 (race_tsan+0x150fae8)

SUMMARY: ThreadSanitizer: data race /tmp/cs_memsafe_demo/race.cpp:8:5 in bump()
==================
160392
ThreadSanitizer: reported 1 warnings
```

  </TabItem>
  <TabItem value="step3" label="Step 3: Fix it in Modern C++">

<Tabs groupId="race-fix" queryString="race-fix">
  <TabItem value="cpp" label="C++">

```cpp
std::mutex mu;
int hits = 0;

void record_hit() {
  std::lock_guard<std::mutex> lock(mu);
  ++hits;
}
```

  </TabItem>
  <TabItem value="rust" label="Rust">

```rust
use std::sync::Mutex;

struct Counter {
    hits: Mutex<u64>,
}
```

  </TabItem>
</Tabs>

This is correct, but it is still convention-based. The compiler does not enforce the locking discipline everywhere.

:::important
The difference here is not speed or syntax. The difference is enforcement model: C++ depends on discipline plus tooling; Rust encodes more of the discipline in the type system.
:::

  </TabItem>
  <TabItem value="step4" label="Step 4: Rust's answer">

Rust can reject the sharing pattern outright. A typical error looks like this:

```text
error[E0277]: `Rc<RefCell<Counter>>` cannot be sent between threads safely
  --> src/main.rs:12:19
   |
12 |     std::thread::spawn(move || {
   |                   ^^^^^ `Rc<RefCell<Counter>>` cannot be sent between threads safely
   |
   = help: within `Counter`, the trait `Send` is not implemented for `Rc<RefCell<Counter>>`
   = note: required because it appears within the type `Counter`
   = note: required by a bound in `spawn`
```

  </TabItem>
  <TabItem value="step5" label="Step 5: Experiment data">

| Variant | Detects bug? | When? | Notes |
|---|---|---|---|
| Traditional C++ | No | Never, unless unlucky | Silent corruption |
| Modern C++ | Partial | Runtime with TSan | Locking is manual |
| Rust | Yes | Compile time for sharing rules | `Send` / `Sync` constrain the design |

  </TabItem>
</Tabs>

## 8. Unsafe Escape Hatches

Rust is not "no unsafe code." It is "safe code by default, unsafe only where needed."

The Rust Book says `unsafe` allows five things that safe Rust does not, including dereferencing raw pointers and calling unsafe functions [Rust Book: Unsafe Rust](https://doc.rust-lang.org/stable/book/ch20-01-unsafe-rust.html). The Rust Reference says unsafe code is where the compiler cannot prove the safety contract itself [Rust Reference: unsafe keyword](https://doc.rust-lang.org/stable/reference/unsafe-keyword.html).

A small practical example is enough:

<Tabs groupId="unsafe-example" queryString="unsafe-example">
  <TabItem value="cpp" label="C++">

```cpp
int read_first(const int* ptr) {
  return *ptr;
}
```

C++ lets the raw pointer stay in the normal language surface. If `ptr` is invalid, null, or dangling, the bug is still there.

  </TabItem>
  <TabItem value="rust" label="Rust">

```rust
fn read_first(ptr: *const i32) -> i32 {
    unsafe {
        // We promise ptr is valid, aligned, and points to initialized memory.
        *ptr
    }
}
```

  </TabItem>
</Tabs>

That code is not automatically wrong. It is wrong if the safety contract is false. The point of `unsafe` is to make that contract explicit and localized.

That is the honest comparison:

- Rust safe code versus the specific `unsafe` boundary
- modern C++ versus the entire language and library surface

The C++ Core Guidelines take a different route. They recommend RAII, non-owning raw pointers for interfaces only, and `unique_ptr` over `shared_ptr` unless sharing is truly needed [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/). That is good guidance, but it remains guidance. The compiler does not enforce it.

:::note
This is where the practical difference becomes clearest. Rust narrows the unsafe surface. C++ asks teams to manage it.
:::

## Where the Borrow Checker Hurts

Not every pattern fits Rust's ownership model. A doubly-linked list or graph with back-references is the classic example.

<Tabs groupId="borrow-pain" queryString="borrow-pain">
  <TabItem value="cpp" label="C++ (straightforward)">

```cpp
struct Node {
    int value;
    Node* prev;
    Node* next;
};
// Works directly, but lifecycle management is manual.
```

  </TabItem>
  <TabItem value="rust" label="Rust (painful)">

```rust
struct Node {
    value: i32,
    prev: *mut Node,  // raw pointer
    next: *mut Node,  // raw pointer
}
// This pushes the module toward unsafe for mutation-heavy operations.
```

  </TabItem>
</Tabs>

The Rust workarounds each have costs:

| Approach | Cost |
|---|---|
| Indices (`Vec` + indices instead of pointers) | Runtime bounds checks, indirect access |
| `Rc<RefCell<T>>` | Reference counting, runtime borrow checks, possible panics |
| `unsafe` + raw pointers | You lose Rust's safety guarantees in that module |
| Arena allocator | More complex design, still needs careful lifetime management |

The honest take: for graphs, linked structures, and self-referential types, Rust often forces a redesign or an `unsafe` boundary. C++ lets you write the obvious pointer code immediately, but then the safety verification sits with you.

## Common Myths

| Myth | Reality |
|---|---|
| "Rust has no unsafe code" | `unsafe` exists and is used in the standard library, including low-level collection internals. |
| "Modern C++ has no memory bugs" | Smart pointers help, but use-after-free, races, and iterator invalidation still exist. |
| "Rust is always faster than C++" | Often close, but bounds checks and lock contention can change the result. |
| "C++ can't be memory safe" | With sanitizers, fuzzing, and discipline, it can be very safe, just not provably so by default. |
| "Rust eliminates all crashes" | Rust programs can still panic on out-of-bounds indexing or `None` unwraps. |

## 9. Toolchain Stack and Safety Profiles

| Concern | C++ tool | Default? | Rust mechanism | Default? |
|---|---|---|---|---|
| Use-after-free | AddressSanitizer | No, opt-in | Borrow checker | Yes |
| Data race | ThreadSanitizer | No, opt-in | `Send` / `Sync` | Yes |
| UB detection | UBSan | No, opt-in | Language design | Yes |
| Buffer overflow | ASan / `.at()` / `std::span` | No, opt-in | Bounds checks | Yes |
| Null deref | Static analysis | No, opt-in | `Option<T>` | Yes |
| Coding style | clang-tidy, Core Guidelines, banned APIs | No, opt-in | clippy | Optional |

<Tabs groupId="toolchain-stack" queryString="toolchain-stack">
  <TabItem value="cpp" label="C++">

```bash
clang++ -O2 -Wall -Wextra cache.cpp
clang++ -fsanitize=address,undefined -g cache.cpp
clang++ -fsanitize=thread -g cache.cpp
clang-tidy cache.cpp --checks='cppcoreguidelines-*'
```

  </TabItem>
  <TabItem value="rust" label="Rust">

```bash
cargo build
cargo build --release
cargo clippy
cargo test
```

  </TabItem>
</Tabs>

The C++ stack is strong, but it is not the default. Rust’s core safety model is.

## 10. Safety in Large C++ Codebases

Modern C++ safety at scale is not just about one compiler flag. Large codebases usually combine multiple layers:

- sanitizers in CI
- fuzzing with libFuzzer or OSS-Fuzz
- static analysis with clang-tidy or commercial tools
- code review rules that ban raw ownership by default
- API policies that prefer `span`, `string_view`, `optional`, `unique_ptr`, and `not_null`-style wrappers where appropriate

That is the real production story. A disciplined C++ team can be very safe, but the safety posture comes from process plus tooling, not from the language default alone.

Rust teams still use CI, fuzzing, and tests, but the compiler removes a large class of memory errors before those tools need to find them.

:::caution
A strong C++ safety program is real engineering work. It is not a shortcut, and it is not free.
:::

## 11. Aggregate Summary

| Experiment | Traditional C++ | Modern C++ | C++ + Sanitizers | Rust |
|---|---|---|---|---|
| Use-after-free | Silent UB | Partial | Runtime catch | Compile-time reject |
| Buffer overflow | Silent UB | Better with checked APIs | Runtime catch | Runtime panic or compile-time-shape rejection |
| Null deref | Crash or UB | Better with `optional` | Runtime catch | Compile-time handling of `Option` |
| Data race | Silent corruption | Convention-based | Runtime catch with TSan | Compile-time reject |

## 12. Benchmark Methodology

This comparison should be read like an engineering note, not a universal benchmark.

:::note
The example logs below were captured locally on this machine. The quoted sanitizer overhead numbers come from the published papers, because the local runs in this article are about correctness and reproducibility of the failure modes, not a controlled benchmark campaign.
:::

The local commands used to capture the example output were:

- `clang++ -fsanitize=address -g /tmp/cs_memsafe_demo/uaf2.cpp -o /tmp/cs_memsafe_demo/uaf2_asan && /tmp/cs_memsafe_demo/uaf2_asan`
- `clang++ -fsanitize=address,undefined -g /tmp/cs_memsafe_demo/overflow.cpp -o /tmp/cs_memsafe_demo/overflow_san && /tmp/cs_memsafe_demo/overflow_san`
- `clang++ -fsanitize=thread -g /tmp/cs_memsafe_demo/race.cpp -o /tmp/cs_memsafe_demo/race_tsan && /tmp/cs_memsafe_demo/race_tsan`
- `rustc /tmp/cs_memsafe_demo/borrow.rs -o /tmp/cs_memsafe_demo/borrow_bin`

Published baseline figures from the sanitizer literature are useful context:

- AddressSanitizer reports an average slowdown of 73% on SPEC CPU2006 and average memory usage increase of 3.37x in the paper [AddressSanitizer paper](https://www.usenix.org/system/files/conference/atc12/atc12-final39.pdf)
- ThreadSanitizer reports a memory overhead of about 3x to 4x on average Google unit tests and an average slowdown under 30x compared to native runs in the paper [ThreadSanitizer paper](https://research.google.com/pubs/archive/35604.pdf)

Limitations:

- synthetic workload
- one machine
- not representative of all access patterns
- not a throughput or latency study
- the exact runtime overhead of sanitizers depends heavily on workload and build flags

:::caution
Do not overgeneralize the numbers from tiny examples into claims about whole codebases.
:::

## 13. Local Performance Snapshot

This is a local throughput snapshot from the same cache shape used throughout the article. It is intentionally narrow: 1,000,000 total cache lookups, 8 reader threads, 1 eviction thread, and 5 repetitions averaged on this machine.

The benchmark binaries were compiled locally with:

- `clang++ -O3 -DNDEBUG -std=c++20 -pthread /tmp/cs_memsafe_perf/cache_bench.cpp -o /tmp/cs_memsafe_perf/cache_bench_cpp`
- `rustc -O /tmp/cs_memsafe_perf/cache_bench.rs -o /tmp/cs_memsafe_perf/cache_bench_rust`

The measured outputs were:

| Metric | C++ | Rust | Delta | Reproducibility |
|---|---|---|---|---|
| Average wall time | 0.0794 s | 0.1034 s | Rust was 30.1% slower in this run | This machine only |
| Throughput | 12.59 million ops/sec | 9.67 million ops/sec | C++ was 30.1% faster in this run | This machine only |
| Stripped binary size | 23,088 bytes | 421,240 bytes | C++ binary was smaller in this build | Linkage and packaging differ |

:::danger
Do not generalize this single number. This is one mutex-heavy workload on one machine. Real-world performance varies by workload, optimization flags, implementation choices, and build strategy. Run your own benchmarks for your use case.
:::

That is not a universal verdict. It is a local snapshot of one mutex-heavy cache implementation under one build configuration. The point is to show the cost of the same workload shape, not to declare a winner for all systems code. Rust's larger binary reflects static linking of the standard library; size-optimized builds with `lto = true` and `opt-level = "z"` produce significantly smaller outputs. The binary-size gap here is mostly a build artifact, while the C++ build is smaller in this environment.

## 14. Decision Matrix

| Situation | Recommendation | Risk if you get it wrong | Reasoning |
|---|---|---|---|
| New greenfield system, performance-critical, long maintenance horizon | Rust | Late-stage memory-safety bug or future CVE | Borrow checker catches bugs that often appear in year 2 or 3 |
| Large existing C++ codebase, experienced C++ team | Modern C++ + sanitizers + clang-tidy | Silent corruption if tooling is skipped | Migration cost may be too high; harden what exists |
| Safety-critical / regulated industry | Evaluate toolchain and certification requirements | Audit failure or non-compliant deployment | MISRA C++, SPARK Ada, or Rust may fit depending on constraints |
| Team new to systems programming, with mentorship | Rust | Developer friction during onboarding | The compiler rejects bad patterns early and teaches the model of ownership |
| Team new to systems programming, without mentorship | Small project first, either language | Both languages can be unforgiving without guidance | Start with a narrow scope and a strong code review loop |
| Embedding in a larger C++ ecosystem | C++ with gradual safe patterns | Interop bugs or duplicated abstractions | Interop cost may dominate |

That is the right shape of the decision: environment, constraints, and team capability matter as much as language choice.

## 15. Limits of This Comparison

These examples are intentionally small. Real codebases are larger, older, and messier.

- Rust still has `unsafe`
- disciplined C++ teams with sanitizers in CI can be very safe
- tooling quality matters
- ecosystem maturity matters
- team expertise matters
- this article does not turn the local performance snapshot into a universal benchmark
- this article does not measure compile time, tail latency across many workloads, or all binary-size tradeoffs

:::important
The point is not to simplify the world. The point is to choose the default that makes the dangerous path harder to take by accident.
:::

Modern C++ and Rust are converging toward the same operational goal: reducing catastrophic memory failures in systems software. The difference is where the enforcement lives. Modern C++ relies on increasingly sophisticated tooling, safer APIs, code review discipline, and organizational process. Rust moves more of that enforcement into the compiler and type system itself. Neither approach removes engineering tradeoffs, but they change when and where failures are discovered.

## 16. References

1. Konstantin Serebryany et al., "AddressSanitizer: A Fast Address Sanity Checker" (USENIX ATC 2012), [USENIX](https://www.usenix.org/conference/atc12/technical-sessions/presentation/serebryany)
2. Konstantin Serebryany and Timur Iskhodzhanov, "ThreadSanitizer - data race detection in practice," [Google Research](https://research.google/pubs/threadsanitizer-data-race-detection-in-practice/)
3. Microsoft Security Response Center, "We need a safer systems programming language," [MSRC blog](https://www.microsoft.com/en-us/msrc/blog/2019/07/we-need-a-safer-systems-programming-language/)
4. Chromium Project, "Memory safety," [chromium.org](https://www.chromium.org/Home/chromium-security/memory-safety)
5. Android Open Source Project, "Memory safety," [source.android.com](https://source.android.com/docs/security/test/memory-safety)
6. Jeff Vander Stoep, "Memory Safe Languages in Android 13," [Google Security Blog](https://security.googleblog.com/2022/12/memory-safe-languages-in-android-13.html)
7. Google Security Blog, "Eliminating Memory Safety Vulnerabilities at the Source," [security.googleblog.com](https://security.googleblog.com/2024/09/eliminating-memory-safety-vulnerabilities-Android.html)
8. Rust Book, "Unsafe Rust," [doc.rust-lang.org](https://doc.rust-lang.org/stable/book/ch20-01-unsafe-rust.html)
9. Rust Reference, "The unsafe keyword," [doc.rust-lang.org](https://doc.rust-lang.org/stable/reference/unsafe-keyword.html)
10. Rust Reference, "Unsafety," [doc.rust-lang.org](https://doc.rust-lang.org/stable/reference/unsafety.html)
11. C++ Core Guidelines, [isocpp.github.io](https://isocpp.github.io/CppCoreGuidelines/)
12. The LLVM Project, "LLVM: A Compilation Framework for Lifelong Program Analysis & Transformation" (CGO 2004), [DOI](https://doi.org/10.1109/CGO.2004.1281665)


