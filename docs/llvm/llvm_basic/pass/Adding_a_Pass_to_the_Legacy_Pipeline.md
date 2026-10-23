---  
title: " Adding_a_Pass_to_the_Legacy_Pipeline" 
description: "Detailed discussion on adding the pass in the legacy pass pipeline with a concrete example"
keywords:
- Pass
- PassManager 
- LLVM API 
- PassRegistry
- PassInfo
- INITIALIZE_PASS
- Legacy Pass Manager
- Pass ID
- initialize###Mypassname###Pass(...)
- LLVM Pass registration. 
tags: 
- LLVM Pass Manager
- Compiler Development
- Legacy Pass Manager
- Pass Registration
---





## Modern opt is New PM (PassBuilder, plugins). LPM is for in-tree legacy passes and -enable-legacy-pass-manager / old tools. The plugin article already covers NPM. 

> **Scope:** This article focuses on LLVM's Legacy Pass Manager (LPM).

> **LLVM version:** This guide was checked against LLVM **23.0.0git**.


# LLVM PASS : 
LLVM is heavily based on the Passes that are used to analyze, transform, optimize LLVM-IR at different levels and different scopes.The Pass class is the base class for implementing most of the passes.  
The Pass does the following things : 
i. Pass perform  Analysis, Transformation or Optimization on LLVM IR.
ii. Specify the dependencies that are required while executing custom pass on LLVM IR.
iii. Maintain the scope of the custom pass according to its requirements. The Derived Pass class provides different scopes to manipulate the IR(such as ModulePass, FunctionPass, LoopPass...). 
For each IR scope, LLVM Provides a different pass class that serves as the base class for inheritance.(format to use them as class YourPassName:YYYPass{}  and YYY is scopes in IR mentioned below). 

The IR scopes available for passes are : **Module, CallGraphSCC, Function, Loop, region**

# PassManager : (LPM, NPM)

These passes are registered, scheduled, managed  by the PassManager within the LLVM infrastructure. Historically LLVM primarily used the LegacyPassManager(LPM). But now modern LLVM has transitioned to the NewPassManager(). 
PassManager has simple objective : Give me the IR unit I will execute the passes sequentially that are added in the queue.

PassManager fulfills the work of : 
i. Provide the proper way to write the Pass of specific scope with that specific PassManager. 
ii. It will make sure that dependencies that mentioned in the custom pass will execute before the pass itself. 
iii. It preserves, invalidate the IR according to the behaviour declared by the Pass.

**The Pass Manager  not only maintains the scope but also an order of execution on the nested structure of IR from child to parent(nested loop, function , callgraphscc component, ...).**

Supported Scope and API of PM : ![Supported Scope and Related API of PM](/img/llvm/legacy-pm/_001_Scope_API_In_PM.png)
 

# Innerworking of PassManager : 
Understand two points, first why PM needed to (re)run specific dependencies which are analyses or optimization passes and second will our pass preserved the IR. 
Ask just three questions and you will done with most of the work : 
1. Check whether required analyses have been computed if not rerun to compute it. 
2. Run the Pass on IR that has been feed through run(...) method from PassManager. 
3. Check whether the pass modifies the IR is yes check whether IR-unit is preserved or invalidate.(there are function provided by the AnalysisUsage &AU object)  


# Legacy Pass Manager : 
LPM follows the standard template for implementing the passes. Developer inherit from the appropriate YYYPass class, assign unique pass ID, declare analyses dependencies, implement runOnYYY() method, register the pass with PassRegistry and finally execute it.

LPM image of the standard template : ![Standard_Template_For_LPM](/img/llvm/legacy-pm/_002_Standard_Template_For_LPM.png) 
```cpp
#include "llvm/Pass.h"
#include "llvm/IR/Function.h"
#include "llvm/Analysis/LoopInfo.h"
#include "llvm/Analysis/DominatorTree.h"
#include "llvm/Support/raw_ostream.h"
#include "llvm/IR/LegacyPassManager.h"
//will explore this above lib in coming time..... 

using namespace llvm;

// If IN-TREE  → put this in InitializePasses.h instead of here
// If OUT-OF-TREE → put it right here, before the macros below
namespace llvm {
    void initializeMyOptimPass(PassRegistry &);
    //   ↑                  ↑   ↑
    //   "initialize"   class  macro always appends "Pass"
    //   Note: NOT "initializeMyOptimPassPass" — class is "MyOptim"
    //   not "MyOptimPass" so we get "initializeMyOptimPass" = correct
}

class MyOptim : public FunctionPass {

    //  declare inside class — value doesn't matter
    static char ID;

public:
    // pass ID to parent — the ADDRESS of ID is what matters
    MyOptim() : FunctionPass(ID) {

        // OUT-OF-TREE : register from constructor
        // (less recommended — better to call from main)
        // initializeMyOptimPass(*PassRegistry::getPassRegistry());
    }

    // Declare what analyses you need this are the dependencies of pass 
    void getAnalysisUsage(AnalysisUsage &AU) const override {
        AU.addRequired<DominatorTreeWrapperPass>(); // needs DomTree
        AU.addRequired<LoopInfoWrapperPass>();      // needs LoopInfo
        AU.setPreservesCFG();                      // we don't change CFG
    }

    bool runOnFunction(Function &F) override {
        DominatorTree &DT =
            getAnalysis<DominatorTreeWrapperPass>().getDomTree();
        LoopInfo &LI =
            getAnalysis<LoopInfoWrapperPass>().getLoopInfo();

        bool Changed = false;
        // ... your optimization logic ...
        return Changed; // true = modified IR, false = untouched
    }
};

// initialize ID outside class 
// Value 0 is convention — any value works — only ADDRESS matters
char MyOptim::ID = 0;

// The macros that GENERATE initializeMyOptimPass──
// Place these at the end of the file, after the class definition
// Must match dependencies declared in getAnalysisUsage addRequired<>
INITIALIZE_PASS_BEGIN(
    MyOptim,               // C++ class name
    "my_optim",            // CLI flag:  opt -my-optim input.ll
    "My Optimization",     // human name in -debug-pass output
    false,                 // isCFGOnly: false = we look at more than CFG
    false                  // isAnalysis: false = we transform, not analyse
)
INITIALIZE_PASS_DEPENDENCY(DominatorTreeWrapperPass) // matches addRequired
INITIALIZE_PASS_DEPENDENCY(LoopInfoWrapperPass)      // matches addRequired with the specific order written in Pass 
INITIALIZE_PASS_END(
    MyOptim,
    "my_optim",
    "My Optimization",
    false,
    false
)

```

# Adding Pass in the LLVM pipeline(MACRO EXPANSION) : 
As beginner while following this standard you will see at last there are three macros that are used, they mainly do the half of the work of adding pass into the pipeline. 
Let's deep dive into the macro expansion into a function, how to manipulate that function for the adding custom pass to our LLVM pass pipeline. 

![Macro_Used_In_Pass_Pipeline_of_LPM](/img/llvm/legacy-pm/_003_Macro_Adding_Pass_In_Pipeline.png) 

1. INITIALIZE_PASS_BEGIN(<class name of pass>, <cli name for opt>, <name using while debugging>, <cfg is used or not, bool value>, <is this analysis pass only, bool value>) 
As described these are the parameters passes to the macro. 
2. INITIALIZE_PASS_DEPENDENCY(<name of analyses with WrapperPass as suffix>) 
**One rule: How many dependencies used in the pass with AU.addrequired<..>() function inside getAnalysisUsage(...) function write that much time this macro with the same sequence name.**
So this will help to register the dependencies that our pass required before registering the pass. This solves one of the critical problems. 
3. INITIALIZE_PASS_END(......) 
Same parameter as BEGIN macro. Now onwards when we run this pass this macro expands to the one specific function mentioned in the pass that is, 
initialize###MyPassName###Pass(PassRegistry &) 

# What does initialize###PassName###Pass(PassRegistry &Registry) do ? 
![Macro_And_Function_Explanation](/img/llvm/legacy-pm/_004_Macro_Expansion_Function_Explanation.png). 

This function is expansion of the macro : 
Now in our example the PassName is MyOptim so our macro function name would be ----> initializeMyOptimPass(PassRegistry &).
Now focus on the parameter passed in the function that is PassRegistry object which is the global singleton object for mapping the pass in the LLVM structure automatically. 

The PassRegistry object first checks whether the required dependencies have already been registered. If not, register them by invoking their corresponding initialization functions. After registering all the dependencies, the function creates a PassInfo object, whose primary responsibility is to gather all info of  the custom pass(MyOptim in this ex.) as mentioned below. 

```cpp
PassInfo *PI = new PassInfo(
        "My Optimization",  // ← the 'name' argument = human readable
        "my_optim",         // ← the 'arg'  argument = command-line flag
        &MyOptim::ID,       // ← address of static char ID = unique key
        PassInfo::NormalCtor_t(callDefaultCtor<MyOptim>), // how to create
        false,              // isCFGOnly
        false               // isAnalysis
    );
```

Now we have our PassInfo object ready which knows our custom pass information. Final task is to register it in the PassRegistry so that or PM would know our pass exists and can be scheduled when used with the CLI opt command. 
So the function Registry.registerPass(* PI, true) will do final registration and done we have done 90% of the work of adding pass to the pipeline.


## But from where we need to call this function of initializer so our pass will ready to run ? 
-> If we never call this function our pass will never ever run in the LLVM. It fails simply ! 
Depends on the condition we are writing the pass we will call this function in the code as below : 
1. Inside the llvm tree ---->   If we are writing the pass inside the llvm-project we should do the three things mainly 
i. Add the initializer function, in our case <initializeMyOptimPass(PassRegistry &)> function inside InitializePasses.h(llvm-project/llvm/include/llvm/InitializePasses.h) file. 
ii. Now we have add the function in llvm tree but from where we will call so use the umbrella folder and its .cpp file to add the function call for it.

![Umbrella_Function_And_Directory_Name_API](/img/llvm/legacy-pm/_005_Umbrella_Function_Uses.png)
 
In our case assume we have written the Scalar pass so the scenario would like below,
```cpp
// File: llvm/lib/Transforms/Scalar/Scalar.cpp
// (this file already exists — you just add one line to it)

void llvm::initializeScalarOpts(PassRegistry &Registry) {
    initializeADCELegacyPassPass(Registry);
    initializeAggressiveDCELegacyPassPass(Registry);
    initializeBDCELegacyPassPass(Registry);
    initializeConstantPropagationPass(Registry);
    // ... dozens of existing passes ...

---> initializeMyOptimPass(Registry);  // ← YOU ADD THIS ONE LINE
}
```


iii. Add the MyOptim.cpp file in the CMakeList.txt file exists in the current directory where we have stored the Pass. For our example it looks like 
 File: llvm/lib/Transforms/Scalar/CMakeLists.txt (already exists — you add your file name to it)
```
add_llvm_component_library(LLVMScalarOpts
  ADCE.cpp
  AggressiveDCE.cpp
  ConstantProp.cpp
  # ... existing files ...

  MyOptim.cpp    # ← YOU ADD THIS LINE
  # Without this, your .cpp is never compiled
  # → function body never exists → linker error
)
```

2. Outside the llvm source tree ---> if we are writing the pass in our own project using the llvm API we need to call the initializer function from the its main() or from its constructor to execute at run time. 
calling from the constructor is less principled and most time we skip this way and call it from the main. As example below we can see it. 

```cpp
// File: main.cpp   (your own tool — not inside LLVM)

#include "llvm/IR/LLVMContext.h"
#include "llvm/IR/Module.h"
#include "llvm/IR/LegacyPassManager.h"
#include "llvm/IR/PassRegistry.h"
#include "llvm/Support/InitLLVM.h"
#include "llvm/Support/TargetSelect.h"

int main(int argc, char **argv) {

    // getPassRegistry() always returns the same object — the same one
    // the pass manager internally uses. Never create your own.
    llvm::PassRegistry *PR = llvm::PassRegistry::getPassRegistry();

    // If your pass uses DominatorTree, LoopInfo etc, these must be
    // registered BEFORE your pass. LLVM provides umbrella calls for them:
    llvm::initializeCore(*PR);          // core IR passes
    llvm::initializeAnalysis(*PR);      // analysis passes (DomTree, etc)
    llvm::initializeScalarOpts(*PR);    // scalar optimizations
    // You only need the ones your pass actually depends on

    // This is the call the book says you MUST make.
    // It runs the function body the INITIALIZE_PASS macros generated.
    // After this: PassRegistry knows MyOptim exists.

    llvm::initializeMyOptimPass(*PR);   // Most imp line 

    llvm::legacy::PassManager PM;
    PM.add(new MyOptim());   // PM can now find + schedule MyOptim
    PM.run(*TheModule);     // run all passes in PM on this IR unit TheModule. 

    return 0;
}
```
Why this is recommended: Everything is registered before anything runs. No ordering surprises. If another pass later needs MyOptim as a dependency, it is already in the registry.

## Call from Constructor Less Principled :
```cpp 
// File: MyOptim.cpp

class MyOptim : public FunctionPass {
    static char ID;
public:
    MyOptim() : FunctionPass(ID) {

        // Register yourself the moment someone creates you
        llvm::initializeMyOptimPass(
            *llvm::PassRegistry::getPassRegistry());

        // ⚠ The book's exact warning:
        // "this means that something must know that this pass EXISTS
        //  to be able to register it"
        // In other words — if nobody creates MyOptim first,
        // nobody can find MyOptim. Circular dependency risk.
    }
};
```

Now last add the .cpp file in the CMakeList.txt file so that it will compile with project. 

![FLow_For_Pass_Pipeline](../img/llvm/legacy-pm/_006_Flow_Pass_Pipeline.png)
i
**Everything was a Pass. FunctionPass, ModulePas, LoopPass, RegionPass, Even analyses were passes.** 
---
Example:
- DominatorTreeWrapperPass
- LoopInfoWrapperPass
- ScalarEvolutionWrapperPass
---
Yeah you have done with the basics of Adding the Own Pass to the Pipeline in Legacy Pass Manager. As summary upto this point you have done with the following things :
i. Pass and PassManager objective, work and importance. 
ii. Common methods and steps in the innerworking of the both PM. 
iii. Standard template of Legacy PM for the beginner level student. 
iv. Macro expansion of inside the LPM, function that is generated after the expansion. 
v. PassRegistry object, PassInfo object and final registration 
vi. Depend on the structure what where we need to call the initalizer function declare its prototype inside the registery 
v. Done with the registration inside LPM pass pipeline. 

# Verification in LPM :

``bin/opt --help | grep my_optim`` 

If registration succeeded, you should see something like:

``--my_optim    My Optimization``

# Writing runOnFunction is not enough. The pass is not in the pipeline until initializeMyOptimPass runs and PassRegistry has a PassInfo for it.
# Remember "Everything inside LPM is pass becuase LPM working is based on inherit from the Pass class" 
Analyses or Optimization or Tranformation are all Passes, as per requirement we extract result from the Pass e.g auto &DT = getAnalysis<LoopInfoWrapperPass>.getLoopInfo() so this is concrete example that this analyses treat as pass and from that pass (LoopInforapper Pass) we have extracted the result. 

**Now from this POV the NPM have transtioned to totally different phase where analyses and transformation pass are differentiated using the CRTP method, Let's gooooo explore it.**

