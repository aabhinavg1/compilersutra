; ModuleID = 'process_buffer.cpp'
source_filename = "process_buffer.cpp"
target datalayout = "e-m:e-p270:32:32-p271:32:32-p272:64:64-i64:64-i128:128-f80:128-n8:16:32:64-S128"
target triple = "x86_64-pc-linux-gnu"

; Function Attrs: mustprogress nofree norecurse nosync nounwind memory(argmem: readwrite) uwtable
define dso_local void @_Z14process_bufferPjm(ptr nocapture noundef %0, i64 noundef %1) local_unnamed_addr #0 {
  %3 = icmp eq i64 %1, 0
  br i1 %3, label %24, label %4

4:                                                ; preds = %2
  %5 = icmp ult i64 %1, 8
  br i1 %5, label %22, label %6

6:                                                ; preds = %4
  %7 = and i64 %1, -8
  br label %8

8:                                                ; preds = %8, %6
  %9 = phi i64 [ 0, %6 ], [ %18, %8 ]
  %10 = getelementptr inbounds i32, ptr %0, i64 %9
  %11 = getelementptr inbounds i32, ptr %10, i64 4
  %12 = load <4 x i32>, ptr %10, align 4, !tbaa !5
  %13 = load <4 x i32>, ptr %11, align 4, !tbaa !5
  %14 = xor <4 x i32> %12, <i32 1515870810, i32 1515870810, i32 1515870810, i32 1515870810>
  %15 = xor <4 x i32> %13, <i32 1515870810, i32 1515870810, i32 1515870810, i32 1515870810>
  %16 = add <4 x i32> %14, <i32 1, i32 1, i32 1, i32 1>
  %17 = add <4 x i32> %15, <i32 1, i32 1, i32 1, i32 1>
  store <4 x i32> %16, ptr %10, align 4, !tbaa !5
  store <4 x i32> %17, ptr %11, align 4, !tbaa !5
  %18 = add nuw i64 %9, 8
  %19 = icmp eq i64 %18, %7
  br i1 %19, label %20, label %8, !llvm.loop !9

20:                                               ; preds = %8
  %21 = icmp eq i64 %7, %1
  br i1 %21, label %24, label %22

22:                                               ; preds = %4, %20
  %23 = phi i64 [ 0, %4 ], [ %7, %20 ]
  br label %25

24:                                               ; preds = %25, %20, %2
  ret void

25:                                               ; preds = %22, %25
  %26 = phi i64 [ %31, %25 ], [ %23, %22 ]
  %27 = getelementptr inbounds i32, ptr %0, i64 %26
  %28 = load i32, ptr %27, align 4, !tbaa !5
  %29 = xor i32 %28, 1515870810
  %30 = add i32 %29, 1
  store i32 %30, ptr %27, align 4, !tbaa !5
  %31 = add nuw i64 %26, 1
  %32 = icmp eq i64 %31, %1
  br i1 %32, label %24, label %25, !llvm.loop !13
}

attributes #0 = { mustprogress nofree norecurse nosync nounwind memory(argmem: readwrite) uwtable "min-legal-vector-width"="0" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }

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
!13 = distinct !{!13, !10, !12, !11}
