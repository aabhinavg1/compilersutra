; ModuleID = '/home/aitr/compilersutra/FixIt_Compilersutra/static/files/articles/gcc_vs_clang_cases/branch_threshold.cpp'
source_filename = "/home/aitr/compilersutra/FixIt_Compilersutra/static/files/articles/gcc_vs_clang_cases/branch_threshold.cpp"
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
  %2 = tail call noalias noundef nonnull dereferenceable(4194304) ptr @_Znwm(i64 noundef 4194304) #6
  tail call void @llvm.memset.p0.i64(ptr noundef nonnull align 4 dereferenceable(4194304) %2, i8 0, i64 4194304, i1 false)
  br label %3

3:                                                ; preds = %3, %0
  %4 = phi i64 [ 0, %0 ], [ %14, %3 ]
  %5 = phi <4 x i32> [ <i32 0, i32 1, i32 2, i32 3>, %0 ], [ %15, %3 ]
  %6 = mul nuw nsw <4 x i32> %5, <i32 17, i32 17, i32 17, i32 17>
  %7 = mul <4 x i32> %5, <i32 17, i32 17, i32 17, i32 17>
  %8 = add nuw nsw <4 x i32> %6, <i32 23, i32 23, i32 23, i32 23>
  %9 = add <4 x i32> %7, <i32 91, i32 91, i32 91, i32 91>
  %10 = urem <4 x i32> %8, <i32 101, i32 101, i32 101, i32 101>
  %11 = urem <4 x i32> %9, <i32 101, i32 101, i32 101, i32 101>
  %12 = getelementptr inbounds i32, ptr %2, i64 %4
  %13 = getelementptr inbounds i32, ptr %12, i64 4
  store <4 x i32> %10, ptr %12, align 4, !tbaa !5
  store <4 x i32> %11, ptr %13, align 4, !tbaa !5
  %14 = add nuw i64 %4, 8
  %15 = add <4 x i32> %5, <i32 8, i32 8, i32 8, i32 8>
  %16 = icmp eq i64 %14, 1048576
  br i1 %16, label %17, label %3, !llvm.loop !9

17:                                               ; preds = %3, %22
  %18 = phi i32 [ %23, %22 ], [ 0, %3 ]
  %19 = phi i64 [ %46, %22 ], [ 0, %3 ]
  br label %25

20:                                               ; preds = %22
  %21 = invoke noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo9_M_insertIxEERSoT_(ptr noundef nonnull align 8 dereferenceable(8) @_ZSt4cout, i64 noundef %46)
          to label %49 unwind label %62

22:                                               ; preds = %45
  %23 = add nuw nsw i32 %18, 1
  %24 = icmp eq i32 %23, 32
  br i1 %24, label %20, label %17, !llvm.loop !13

25:                                               ; preds = %17, %45
  %26 = phi i64 [ %19, %17 ], [ %46, %45 ]
  %27 = phi i64 [ 0, %17 ], [ %47, %45 ]
  %28 = getelementptr inbounds i8, ptr %2, i64 %27
  %29 = load i32, ptr %28, align 4, !tbaa !5
  %30 = icmp slt i32 %29, 20
  br i1 %30, label %31, label %35

31:                                               ; preds = %25
  %32 = mul nsw i32 %29, 3
  %33 = sext i32 %32 to i64
  %34 = add nsw i64 %26, %33
  br label %45

35:                                               ; preds = %25
  %36 = icmp ult i32 %29, 70
  br i1 %36, label %37, label %42

37:                                               ; preds = %35
  %38 = shl nuw nsw i32 %29, 1
  %39 = add nsw i32 %38, -7
  %40 = zext nneg i32 %39 to i64
  %41 = add nsw i64 %26, %40
  br label %45

42:                                               ; preds = %35
  %43 = zext nneg i32 %29 to i64
  %44 = sub nsw i64 %26, %43
  br label %45

45:                                               ; preds = %37, %42, %31
  %46 = phi i64 [ %34, %31 ], [ %41, %37 ], [ %44, %42 ]
  %47 = add nuw nsw i64 %27, 4
  %48 = icmp eq i64 %47, 4194304
  br i1 %48, label %22, label %25

49:                                               ; preds = %20
  call void @llvm.lifetime.start.p0(i64 1, ptr nonnull %1)
  store i8 10, ptr %1, align 1, !tbaa !14
  %50 = load ptr, ptr %21, align 8, !tbaa !15
  %51 = getelementptr i8, ptr %50, i64 -24
  %52 = load i64, ptr %51, align 8
  %53 = getelementptr inbounds i8, ptr %21, i64 %52
  %54 = getelementptr inbounds %"class.std::ios_base", ptr %53, i64 0, i32 2
  %55 = load i64, ptr %54, align 8, !tbaa !17
  %56 = icmp eq i64 %55, 0
  br i1 %56, label %59, label %57

57:                                               ; preds = %49
  %58 = invoke noundef nonnull align 8 dereferenceable(8) ptr @_ZSt16__ostream_insertIcSt11char_traitsIcEERSt13basic_ostreamIT_T0_ES6_PKS3_l(ptr noundef nonnull align 8 dereferenceable(8) %21, ptr noundef nonnull %1, i64 noundef 1)
          to label %61 unwind label %62

59:                                               ; preds = %49
  %60 = invoke noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo3putEc(ptr noundef nonnull align 8 dereferenceable(8) %21, i8 noundef signext 10)
          to label %61 unwind label %62

61:                                               ; preds = %57, %59
  call void @llvm.lifetime.end.p0(i64 1, ptr nonnull %1)
  call void @_ZdlPv(ptr noundef nonnull %2) #7
  ret i32 0

62:                                               ; preds = %59, %57, %20
  %63 = landingpad { ptr, i32 }
          cleanup
  call void @_ZdlPv(ptr noundef nonnull %2) #7
  resume { ptr, i32 } %63
}

; Function Attrs: mustprogress nocallback nofree nosync nounwind willreturn memory(argmem: readwrite)
declare void @llvm.lifetime.start.p0(i64 immarg, ptr nocapture) #1

declare i32 @__gxx_personality_v0(...)

; Function Attrs: mustprogress nocallback nofree nosync nounwind willreturn memory(argmem: readwrite)
declare void @llvm.lifetime.end.p0(i64 immarg, ptr nocapture) #1

; Function Attrs: nobuiltin allocsize(0)
declare noundef nonnull ptr @_Znwm(i64 noundef) local_unnamed_addr #2

; Function Attrs: nobuiltin nounwind
declare void @_ZdlPv(ptr noundef) local_unnamed_addr #3

declare noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo9_M_insertIxEERSoT_(ptr noundef nonnull align 8 dereferenceable(8), i64 noundef) local_unnamed_addr #4

declare noundef nonnull align 8 dereferenceable(8) ptr @_ZSt16__ostream_insertIcSt11char_traitsIcEERSt13basic_ostreamIT_T0_ES6_PKS3_l(ptr noundef nonnull align 8 dereferenceable(8), ptr noundef, i64 noundef) local_unnamed_addr #4

declare noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo3putEc(ptr noundef nonnull align 8 dereferenceable(8), i8 noundef signext) local_unnamed_addr #4

; Function Attrs: nocallback nofree nounwind willreturn memory(argmem: write)
declare void @llvm.memset.p0.i64(ptr nocapture writeonly, i8, i64, i1 immarg) #5

attributes #0 = { mustprogress norecurse uwtable "min-legal-vector-width"="0" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #1 = { mustprogress nocallback nofree nosync nounwind willreturn memory(argmem: readwrite) }
attributes #2 = { nobuiltin allocsize(0) "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #3 = { nobuiltin nounwind "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #4 = { "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #5 = { nocallback nofree nounwind willreturn memory(argmem: write) }
attributes #6 = { builtin allocsize(0) }
attributes #7 = { builtin nounwind }

!llvm.module.flags = !{!0, !1, !2, !3}
!llvm.ident = !{!4}

!0 = !{i32 1, !"wchar_size", i32 4}
!1 = !{i32 8, !"PIC Level", i32 2}
!2 = !{i32 7, !"PIE Level", i32 2}
!3 = !{i32 7, !"uwtable", i32 2}
!4 = !{!"Ubuntu clang version 18.1.3 (1ubuntu1)"}
!5 = !{!6, !6, i64 0}
!6 = !{!"int", !7, i64 0}
!7 = !{!"omnipotent char", !8, i64 0}
!8 = !{!"Simple C++ TBAA"}
!9 = distinct !{!9, !10, !11, !12}
!10 = !{!"llvm.loop.mustprogress"}
!11 = !{!"llvm.loop.isvectorized", i32 1}
!12 = !{!"llvm.loop.unroll.runtime.disable"}
!13 = distinct !{!13, !10}
!14 = !{!7, !7, i64 0}
!15 = !{!16, !16, i64 0}
!16 = !{!"vtable pointer", !8, i64 0}
!17 = !{!18, !19, i64 16}
!18 = !{!"_ZTSSt8ios_base", !19, i64 8, !19, i64 16, !20, i64 24, !21, i64 28, !21, i64 32, !22, i64 40, !23, i64 48, !7, i64 64, !6, i64 192, !22, i64 200, !24, i64 208}
!19 = !{!"long", !7, i64 0}
!20 = !{!"_ZTSSt13_Ios_Fmtflags", !7, i64 0}
!21 = !{!"_ZTSSt12_Ios_Iostate", !7, i64 0}
!22 = !{!"any pointer", !7, i64 0}
!23 = !{!"_ZTSNSt8ios_base6_WordsE", !22, i64 0, !19, i64 8}
!24 = !{!"_ZTSSt6locale", !22, i64 0}
