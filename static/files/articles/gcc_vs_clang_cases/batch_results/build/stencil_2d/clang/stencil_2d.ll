; ModuleID = '/home/aitr/compilersutra/FixIt_Compilersutra/static/files/articles/gcc_vs_clang_cases/stencil_2d.cpp'
source_filename = "/home/aitr/compilersutra/FixIt_Compilersutra/static/files/articles/gcc_vs_clang_cases/stencil_2d.cpp"
target datalayout = "e-m:e-p270:32:32-p271:32:32-p272:64:64-i64:64-i128:128-f80:128-n8:16:32:64-S128"
target triple = "x86_64-pc-linux-gnu"

module asm ".globl _ZSt21ios_base_library_initv"

%"class.std::basic_ostream" = type { ptr, %"class.std::basic_ios" }
%"class.std::basic_ios" = type { %"class.std::ios_base", ptr, i8, i8, ptr, ptr, ptr, ptr }
%"class.std::ios_base" = type { ptr, i64, i64, i32, i32, i32, ptr, %"struct.std::ios_base::_Words", [8 x %"struct.std::ios_base::_Words"], i32, ptr, %"class.std::locale" }
%"struct.std::ios_base::_Words" = type { ptr, i64 }
%"class.std::locale" = type { ptr }

@_ZSt4cout = external global %"class.std::basic_ostream", align 8

; Function Attrs: mustprogress norecurse uwtable
define dso_local noundef i32 @main() local_unnamed_addr #0 personality ptr @__gxx_personality_v0 {
  %1 = alloca i8, align 1
  %2 = tail call noalias noundef nonnull dereferenceable(4194304) ptr @_Znwm(i64 noundef 4194304) #7
  br label %3

3:                                                ; preds = %3, %0
  %4 = phi i64 [ 0, %0 ], [ %20, %3 ]
  %5 = shl i64 %4, 2
  %6 = getelementptr inbounds i8, ptr %2, i64 %5
  %7 = getelementptr inbounds float, ptr %6, i64 4
  store <4 x float> <float 1.000000e+00, float 1.000000e+00, float 1.000000e+00, float 1.000000e+00>, ptr %6, align 4, !tbaa !5
  store <4 x float> <float 1.000000e+00, float 1.000000e+00, float 1.000000e+00, float 1.000000e+00>, ptr %7, align 4, !tbaa !5
  %8 = shl i64 %4, 2
  %9 = or disjoint i64 %8, 32
  %10 = getelementptr inbounds i8, ptr %2, i64 %9
  %11 = getelementptr inbounds float, ptr %10, i64 4
  store <4 x float> <float 1.000000e+00, float 1.000000e+00, float 1.000000e+00, float 1.000000e+00>, ptr %10, align 4, !tbaa !5
  store <4 x float> <float 1.000000e+00, float 1.000000e+00, float 1.000000e+00, float 1.000000e+00>, ptr %11, align 4, !tbaa !5
  %12 = shl i64 %4, 2
  %13 = or disjoint i64 %12, 64
  %14 = getelementptr inbounds i8, ptr %2, i64 %13
  %15 = getelementptr inbounds float, ptr %14, i64 4
  store <4 x float> <float 1.000000e+00, float 1.000000e+00, float 1.000000e+00, float 1.000000e+00>, ptr %14, align 4, !tbaa !5
  store <4 x float> <float 1.000000e+00, float 1.000000e+00, float 1.000000e+00, float 1.000000e+00>, ptr %15, align 4, !tbaa !5
  %16 = shl i64 %4, 2
  %17 = or disjoint i64 %16, 96
  %18 = getelementptr inbounds i8, ptr %2, i64 %17
  %19 = getelementptr inbounds float, ptr %18, i64 4
  store <4 x float> <float 1.000000e+00, float 1.000000e+00, float 1.000000e+00, float 1.000000e+00>, ptr %18, align 4, !tbaa !5
  store <4 x float> <float 1.000000e+00, float 1.000000e+00, float 1.000000e+00, float 1.000000e+00>, ptr %19, align 4, !tbaa !5
  %20 = add nuw nsw i64 %4, 32
  %21 = icmp eq i64 %20, 1048576
  br i1 %21, label %22, label %3, !llvm.loop !9

22:                                               ; preds = %3
  %23 = invoke noalias noundef nonnull dereferenceable(4194304) ptr @_Znwm(i64 noundef 4194304) #7
          to label %24 unwind label %32

24:                                               ; preds = %22
  tail call void @llvm.memset.p0.i64(ptr noundef nonnull align 4 dereferenceable(4194304) %23, i8 0, i64 4194304, i1 false), !tbaa !5
  br label %25

25:                                               ; preds = %24, %42
  %26 = phi i32 [ %43, %42 ], [ 0, %24 ]
  %27 = phi double [ %71, %42 ], [ 0.000000e+00, %24 ]
  %28 = phi ptr [ %29, %42 ], [ %2, %24 ]
  %29 = phi ptr [ %28, %42 ], [ %23, %24 ]
  br label %37

30:                                               ; preds = %42
  %31 = invoke noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo9_M_insertIdEERSoT_(ptr noundef nonnull align 8 dereferenceable(8) @_ZSt4cout, double noundef %71)
          to label %74 unwind label %87

32:                                               ; preds = %22
  %33 = landingpad { ptr, i32 }
          cleanup
  br label %89

34:                                               ; preds = %45
  %35 = add nuw nsw i64 %38, 1
  %36 = icmp eq i64 %35, 1024
  br i1 %36, label %42, label %37, !llvm.loop !13

37:                                               ; preds = %25, %34
  %38 = phi i64 [ 2, %25 ], [ %35, %34 ]
  %39 = phi i64 [ 1, %25 ], [ %38, %34 ]
  %40 = phi double [ %27, %25 ], [ %71, %34 ]
  %41 = shl i64 %39, 10
  br label %45

42:                                               ; preds = %34
  %43 = add nuw nsw i32 %26, 1
  %44 = icmp eq i32 %43, 12
  br i1 %44, label %30, label %25, !llvm.loop !14

45:                                               ; preds = %37, %45
  %46 = phi i64 [ 2, %37 ], [ %72, %45 ]
  %47 = phi i64 [ 1, %37 ], [ %46, %45 ]
  %48 = phi double [ %40, %37 ], [ %71, %45 ]
  %49 = add nuw nsw i64 %47, %41
  %50 = getelementptr inbounds float, ptr %28, i64 %49
  %51 = load float, ptr %50, align 4, !tbaa !5
  %52 = add nsw i64 %49, -1
  %53 = getelementptr inbounds float, ptr %28, i64 %52
  %54 = load float, ptr %53, align 4, !tbaa !5
  %55 = add nuw nsw i64 %49, 1
  %56 = getelementptr inbounds float, ptr %28, i64 %55
  %57 = load float, ptr %56, align 4, !tbaa !5
  %58 = fadd float %54, %57
  %59 = add nsw i64 %49, -1024
  %60 = getelementptr inbounds float, ptr %28, i64 %59
  %61 = load float, ptr %60, align 4, !tbaa !5
  %62 = fadd float %58, %61
  %63 = add nuw nsw i64 %49, 1024
  %64 = getelementptr inbounds float, ptr %28, i64 %63
  %65 = load float, ptr %64, align 4, !tbaa !5
  %66 = fadd float %62, %65
  %67 = fmul float %66, 1.250000e-01
  %68 = tail call float @llvm.fmuladd.f32(float %51, float 5.000000e-01, float %67)
  %69 = getelementptr inbounds float, ptr %29, i64 %49
  store float %68, ptr %69, align 4, !tbaa !5
  %70 = fpext float %68 to double
  %71 = fadd double %48, %70
  %72 = add nuw nsw i64 %46, 1
  %73 = icmp eq i64 %72, 1024
  br i1 %73, label %34, label %45, !llvm.loop !15

74:                                               ; preds = %30
  call void @llvm.lifetime.start.p0(i64 1, ptr nonnull %1)
  store i8 10, ptr %1, align 1, !tbaa !16
  %75 = load ptr, ptr %31, align 8, !tbaa !17
  %76 = getelementptr i8, ptr %75, i64 -24
  %77 = load i64, ptr %76, align 8
  %78 = getelementptr inbounds i8, ptr %31, i64 %77
  %79 = getelementptr inbounds %"class.std::ios_base", ptr %78, i64 0, i32 2
  %80 = load i64, ptr %79, align 8, !tbaa !19
  %81 = icmp eq i64 %80, 0
  br i1 %81, label %84, label %82

82:                                               ; preds = %74
  %83 = invoke noundef nonnull align 8 dereferenceable(8) ptr @_ZSt16__ostream_insertIcSt11char_traitsIcEERSt13basic_ostreamIT_T0_ES6_PKS3_l(ptr noundef nonnull align 8 dereferenceable(8) %31, ptr noundef nonnull %1, i64 noundef 1)
          to label %86 unwind label %87

84:                                               ; preds = %74
  %85 = invoke noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo3putEc(ptr noundef nonnull align 8 dereferenceable(8) %31, i8 noundef signext 10)
          to label %86 unwind label %87

86:                                               ; preds = %82, %84
  call void @llvm.lifetime.end.p0(i64 1, ptr nonnull %1)
  call void @_ZdlPv(ptr noundef nonnull %28) #8
  call void @_ZdlPv(ptr noundef nonnull %29) #8
  ret i32 0

87:                                               ; preds = %84, %82, %30
  %88 = landingpad { ptr, i32 }
          cleanup
  call void @_ZdlPv(ptr noundef nonnull %28) #8
  br label %89

89:                                               ; preds = %32, %87
  %90 = phi { ptr, i32 } [ %33, %32 ], [ %88, %87 ]
  %91 = phi ptr [ %2, %32 ], [ %29, %87 ]
  call void @_ZdlPv(ptr noundef nonnull %91) #8
  resume { ptr, i32 } %90
}

; Function Attrs: mustprogress nocallback nofree nosync nounwind willreturn memory(argmem: readwrite)
declare void @llvm.lifetime.start.p0(i64 immarg, ptr nocapture) #1

declare i32 @__gxx_personality_v0(...)

; Function Attrs: mustprogress nocallback nofree nosync nounwind willreturn memory(argmem: readwrite)
declare void @llvm.lifetime.end.p0(i64 immarg, ptr nocapture) #1

; Function Attrs: mustprogress nocallback nofree nosync nounwind speculatable willreturn memory(none)
declare float @llvm.fmuladd.f32(float, float, float) #2

; Function Attrs: nobuiltin allocsize(0)
declare noundef nonnull ptr @_Znwm(i64 noundef) local_unnamed_addr #3

; Function Attrs: nobuiltin nounwind
declare void @_ZdlPv(ptr noundef) local_unnamed_addr #4

declare noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo9_M_insertIdEERSoT_(ptr noundef nonnull align 8 dereferenceable(8), double noundef) local_unnamed_addr #5

declare noundef nonnull align 8 dereferenceable(8) ptr @_ZSt16__ostream_insertIcSt11char_traitsIcEERSt13basic_ostreamIT_T0_ES6_PKS3_l(ptr noundef nonnull align 8 dereferenceable(8), ptr noundef, i64 noundef) local_unnamed_addr #5

declare noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo3putEc(ptr noundef nonnull align 8 dereferenceable(8), i8 noundef signext) local_unnamed_addr #5

; Function Attrs: nocallback nofree nounwind willreturn memory(argmem: write)
declare void @llvm.memset.p0.i64(ptr nocapture writeonly, i8, i64, i1 immarg) #6

attributes #0 = { mustprogress norecurse uwtable "min-legal-vector-width"="0" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #1 = { mustprogress nocallback nofree nosync nounwind willreturn memory(argmem: readwrite) }
attributes #2 = { mustprogress nocallback nofree nosync nounwind speculatable willreturn memory(none) }
attributes #3 = { nobuiltin allocsize(0) "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #4 = { nobuiltin nounwind "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #5 = { "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #6 = { nocallback nofree nounwind willreturn memory(argmem: write) }
attributes #7 = { builtin allocsize(0) }
attributes #8 = { builtin nounwind }

!llvm.module.flags = !{!0, !1, !2, !3}
!llvm.ident = !{!4}

!0 = !{i32 1, !"wchar_size", i32 4}
!1 = !{i32 8, !"PIC Level", i32 2}
!2 = !{i32 7, !"PIE Level", i32 2}
!3 = !{i32 7, !"uwtable", i32 2}
!4 = !{!"Ubuntu clang version 18.1.3 (1ubuntu1)"}
!5 = !{!6, !6, i64 0}
!6 = !{!"float", !7, i64 0}
!7 = !{!"omnipotent char", !8, i64 0}
!8 = !{!"Simple C++ TBAA"}
!9 = distinct !{!9, !10, !11, !12}
!10 = !{!"llvm.loop.mustprogress"}
!11 = !{!"llvm.loop.isvectorized", i32 1}
!12 = !{!"llvm.loop.unroll.runtime.disable"}
!13 = distinct !{!13, !10}
!14 = distinct !{!14, !10}
!15 = distinct !{!15, !10}
!16 = !{!7, !7, i64 0}
!17 = !{!18, !18, i64 0}
!18 = !{!"vtable pointer", !8, i64 0}
!19 = !{!20, !21, i64 16}
!20 = !{!"_ZTSSt8ios_base", !21, i64 8, !21, i64 16, !22, i64 24, !23, i64 28, !23, i64 32, !24, i64 40, !25, i64 48, !7, i64 64, !26, i64 192, !24, i64 200, !27, i64 208}
!21 = !{!"long", !7, i64 0}
!22 = !{!"_ZTSSt13_Ios_Fmtflags", !7, i64 0}
!23 = !{!"_ZTSSt12_Ios_Iostate", !7, i64 0}
!24 = !{!"any pointer", !7, i64 0}
!25 = !{!"_ZTSNSt8ios_base6_WordsE", !24, i64 0, !21, i64 8}
!26 = !{!"int", !7, i64 0}
!27 = !{!"_ZTSSt6locale", !24, i64 0}
