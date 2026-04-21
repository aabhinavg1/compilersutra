#include "llvm/IR/Function.h"
#include "llvm/Passes/PassBuilder.h"
#include "llvm/Passes/PassPlugin.h"
#include "llvm/Support/raw_ostream.h"

using namespace llvm;

namespace {

class FunctionNamePass : public PassInfoMixin<FunctionNamePass> {
public:
  PreservedAnalyses run(Function &F, FunctionAnalysisManager &) {
    if (!F.isDeclaration()) {
      errs() << F.getName() << "\n";
    }
    return PreservedAnalyses::all();
  }
};

} // namespace

extern "C" LLVM_ATTRIBUTE_WEAK PassPluginLibraryInfo llvmGetPassPluginInfo() {
  return {
      LLVM_PLUGIN_API_VERSION,
      "FunctionNamePass",
      LLVM_VERSION_STRING,
      [](PassBuilder &PB) {
        PB.registerPipelineParsingCallback(
            [](StringRef Name, FunctionPassManager &FPM,
               ArrayRef<PassBuilder::PipelineElement>) {
              if (Name == "func-name") {
                FPM.addPass(FunctionNamePass());
                return true;
              }
              return false;
            });
      }};
}
