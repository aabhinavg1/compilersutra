# FunctionName LLVM Pass Plugin Example

This is the runnable example used by the article:

- Source: `FunctionName.cpp`
- Build file: `CMakeLists.txt`
- Test script: `run.sh`
- Input files: `test.c`, `test.ll`

Run it with:

```bash
chmod +x run.sh
./run.sh /path/to/llvm-project/build
```

The script configures the plugin build, compiles the shared library, generates LLVM IR from `test.c`, and runs the plugin with `opt`.
