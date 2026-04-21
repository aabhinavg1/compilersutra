#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="${SCRIPT_DIR}/build"

if [[ $# -lt 1 ]]; then
  echo "usage: $0 <llvm-build-dir>"
  echo "example: $0 /path/to/llvm-project/build"
  exit 1
fi

LLVM_BUILD_DIR="$1"
LLVM_DIR="${LLVM_BUILD_DIR}/lib/cmake/llvm"
OPT_BIN="${LLVM_BUILD_DIR}/bin/opt"

cmake -S "${SCRIPT_DIR}" -B "${BUILD_DIR}" -DLLVM_DIR="${LLVM_DIR}"
cmake --build "${BUILD_DIR}"

clang -S -emit-llvm "${SCRIPT_DIR}/test.c" -o "${BUILD_DIR}/test.ll"

"${OPT_BIN}" \
  -load-pass-plugin "${BUILD_DIR}/FunctionNamePass.so" \
  -passes=func-name \
  "${BUILD_DIR}/test.ll" \
  -disable-output
