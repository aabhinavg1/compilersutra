; ModuleID = '/home/aitr/compilersutra/FixIt_Compilersutra/static/files/articles/gcc_vs_clang_cases/small_sort.cpp'
source_filename = "/home/aitr/compilersutra/FixIt_Compilersutra/static/files/articles/gcc_vs_clang_cases/small_sort.cpp"
target datalayout = "e-m:e-p270:32:32-p271:32:32-p272:64:64-i64:64-i128:128-f80:128-n8:16:32:64-S128"
target triple = "x86_64-pc-linux-gnu"

module asm ".globl _ZSt21ios_base_library_initv"

%"class.std::basic_ostream" = type { ptr, %"class.std::basic_ios" }
%"class.std::basic_ios" = type { %"class.std::ios_base", ptr, i8, i8, ptr, ptr, ptr, ptr }
%"class.std::ios_base" = type { ptr, i64, i64, i32, i32, i32, ptr, %"struct.std::ios_base::_Words", [8 x %"struct.std::ios_base::_Words"], i32, ptr, %"class.std::locale" }
%"struct.std::ios_base::_Words" = type { ptr, i64 }
%"class.std::locale" = type { ptr }
%"struct.__gnu_cxx::__ops::_Iter_less_iter" = type { i8 }

$_ZSt16__introsort_loopIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEElNS0_5__ops15_Iter_less_iterEEvT_S9_T0_T1_ = comdat any

$_ZSt22__final_insertion_sortIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEENS0_5__ops15_Iter_less_iterEEvT_S9_T0_ = comdat any

$_ZSt11__make_heapIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEENS0_5__ops15_Iter_less_iterEEvT_S9_RT0_ = comdat any

$_ZNSt3_V28__rotateIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEEEET_S8_S8_S8_St26random_access_iterator_tag = comdat any

@_ZSt4cout = external global %"class.std::basic_ostream", align 8

; Function Attrs: mustprogress norecurse uwtable
define dso_local noundef i32 @main() local_unnamed_addr #0 personality ptr @__gxx_personality_v0 {
  %1 = alloca i8, align 1
  %2 = tail call noalias noundef nonnull dereferenceable(1048576) ptr @_Znwm(i64 noundef 1048576) #8
  tail call void @llvm.memset.p0.i64(ptr noundef nonnull align 4 dereferenceable(1048576) %2, i8 0, i64 1048576, i1 false)
  br label %3

3:                                                ; preds = %3, %0
  %4 = phi i64 [ 0, %0 ], [ %14, %3 ]
  %5 = phi <4 x i32> [ <i32 0, i32 1, i32 2, i32 3>, %0 ], [ %15, %3 ]
  %6 = mul <4 x i32> %5, <i32 12996205, i32 12996205, i32 12996205, i32 12996205>
  %7 = mul <4 x i32> %5, <i32 12996205, i32 12996205, i32 12996205, i32 12996205>
  %8 = add <4 x i32> %6, <i32 12345, i32 12345, i32 12345, i32 12345>
  %9 = add <4 x i32> %7, <i32 1665517, i32 1665517, i32 1665517, i32 1665517>
  %10 = and <4 x i32> %8, <i32 16777215, i32 16777215, i32 16777215, i32 16777215>
  %11 = and <4 x i32> %9, <i32 16777215, i32 16777215, i32 16777215, i32 16777215>
  %12 = getelementptr inbounds i32, ptr %2, i64 %4
  %13 = getelementptr inbounds i32, ptr %12, i64 4
  store <4 x i32> %10, ptr %12, align 4, !tbaa !5
  store <4 x i32> %11, ptr %13, align 4, !tbaa !5
  %14 = add nuw i64 %4, 8
  %15 = add <4 x i32> %5, <i32 8, i32 8, i32 8, i32 8>
  %16 = icmp eq i64 %14, 262144
  br i1 %16, label %17, label %3, !llvm.loop !9

17:                                               ; preds = %3
  %18 = getelementptr inbounds i32, ptr %2, i64 262144
  %19 = getelementptr inbounds i32, ptr %2, i64 87381
  %20 = getelementptr inbounds i32, ptr %2, i64 131072
  %21 = getelementptr inbounds i32, ptr %2, i64 174762
  %22 = getelementptr inbounds i32, ptr %2, i64 1024
  invoke void @_ZSt16__introsort_loopIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEElNS0_5__ops15_Iter_less_iterEEvT_S9_T0_T1_(ptr nonnull %2, ptr nonnull %18, i64 noundef 36)
          to label %23 unwind label %111

23:                                               ; preds = %17
  invoke void @_ZSt22__final_insertion_sortIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEENS0_5__ops15_Iter_less_iterEEvT_S9_T0_(ptr nonnull %2, ptr nonnull %18)
          to label %24 unwind label %111

24:                                               ; preds = %23
  %25 = load i32, ptr %19, align 4, !tbaa !5
  %26 = load i32, ptr %20, align 4, !tbaa !5
  %27 = load i32, ptr %21, align 4, !tbaa !5
  %28 = invoke ptr @_ZNSt3_V28__rotateIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEEEET_S8_S8_S8_St26random_access_iterator_tag(ptr nonnull %2, ptr nonnull %22, ptr nonnull %18)
          to label %29 unwind label %113

29:                                               ; preds = %24
  %30 = add i32 %26, %25
  %31 = add i32 %30, %27
  %32 = zext i32 %31 to i64
  invoke void @_ZSt16__introsort_loopIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEElNS0_5__ops15_Iter_less_iterEEvT_S9_T0_T1_(ptr nonnull %2, ptr nonnull %18, i64 noundef 36)
          to label %33 unwind label %111

33:                                               ; preds = %29
  invoke void @_ZSt22__final_insertion_sortIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEENS0_5__ops15_Iter_less_iterEEvT_S9_T0_(ptr nonnull %2, ptr nonnull %18)
          to label %34 unwind label %111

34:                                               ; preds = %33
  %35 = load i32, ptr %19, align 4, !tbaa !5
  %36 = load i32, ptr %20, align 4, !tbaa !5
  %37 = load i32, ptr %21, align 4, !tbaa !5
  %38 = invoke ptr @_ZNSt3_V28__rotateIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEEEET_S8_S8_S8_St26random_access_iterator_tag(ptr nonnull %2, ptr nonnull %22, ptr nonnull %18)
          to label %39 unwind label %113

39:                                               ; preds = %34
  %40 = add i32 %36, %35
  %41 = add i32 %40, %37
  %42 = zext i32 %41 to i64
  %43 = add nuw nsw i64 %32, %42
  invoke void @_ZSt16__introsort_loopIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEElNS0_5__ops15_Iter_less_iterEEvT_S9_T0_T1_(ptr nonnull %2, ptr nonnull %18, i64 noundef 36)
          to label %44 unwind label %111

44:                                               ; preds = %39
  invoke void @_ZSt22__final_insertion_sortIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEENS0_5__ops15_Iter_less_iterEEvT_S9_T0_(ptr nonnull %2, ptr nonnull %18)
          to label %45 unwind label %111

45:                                               ; preds = %44
  %46 = load i32, ptr %19, align 4, !tbaa !5
  %47 = load i32, ptr %20, align 4, !tbaa !5
  %48 = load i32, ptr %21, align 4, !tbaa !5
  %49 = invoke ptr @_ZNSt3_V28__rotateIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEEEET_S8_S8_S8_St26random_access_iterator_tag(ptr nonnull %2, ptr nonnull %22, ptr nonnull %18)
          to label %50 unwind label %113

50:                                               ; preds = %45
  %51 = add i32 %47, %46
  %52 = add i32 %51, %48
  %53 = zext i32 %52 to i64
  %54 = add nuw nsw i64 %43, %53
  invoke void @_ZSt16__introsort_loopIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEElNS0_5__ops15_Iter_less_iterEEvT_S9_T0_T1_(ptr nonnull %2, ptr nonnull %18, i64 noundef 36)
          to label %55 unwind label %111

55:                                               ; preds = %50
  invoke void @_ZSt22__final_insertion_sortIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEENS0_5__ops15_Iter_less_iterEEvT_S9_T0_(ptr nonnull %2, ptr nonnull %18)
          to label %56 unwind label %111

56:                                               ; preds = %55
  %57 = load i32, ptr %19, align 4, !tbaa !5
  %58 = load i32, ptr %20, align 4, !tbaa !5
  %59 = load i32, ptr %21, align 4, !tbaa !5
  %60 = invoke ptr @_ZNSt3_V28__rotateIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEEEET_S8_S8_S8_St26random_access_iterator_tag(ptr nonnull %2, ptr nonnull %22, ptr nonnull %18)
          to label %61 unwind label %113

61:                                               ; preds = %56
  %62 = add i32 %58, %57
  %63 = add i32 %62, %59
  %64 = zext i32 %63 to i64
  %65 = add nuw nsw i64 %54, %64
  invoke void @_ZSt16__introsort_loopIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEElNS0_5__ops15_Iter_less_iterEEvT_S9_T0_T1_(ptr nonnull %2, ptr nonnull %18, i64 noundef 36)
          to label %66 unwind label %111

66:                                               ; preds = %61
  invoke void @_ZSt22__final_insertion_sortIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEENS0_5__ops15_Iter_less_iterEEvT_S9_T0_(ptr nonnull %2, ptr nonnull %18)
          to label %67 unwind label %111

67:                                               ; preds = %66
  %68 = load i32, ptr %19, align 4, !tbaa !5
  %69 = load i32, ptr %20, align 4, !tbaa !5
  %70 = load i32, ptr %21, align 4, !tbaa !5
  %71 = invoke ptr @_ZNSt3_V28__rotateIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEEEET_S8_S8_S8_St26random_access_iterator_tag(ptr nonnull %2, ptr nonnull %22, ptr nonnull %18)
          to label %72 unwind label %113

72:                                               ; preds = %67
  %73 = add i32 %69, %68
  %74 = add i32 %73, %70
  %75 = zext i32 %74 to i64
  %76 = add nuw nsw i64 %65, %75
  invoke void @_ZSt16__introsort_loopIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEElNS0_5__ops15_Iter_less_iterEEvT_S9_T0_T1_(ptr nonnull %2, ptr nonnull %18, i64 noundef 36)
          to label %77 unwind label %111

77:                                               ; preds = %72
  invoke void @_ZSt22__final_insertion_sortIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEENS0_5__ops15_Iter_less_iterEEvT_S9_T0_(ptr nonnull %2, ptr nonnull %18)
          to label %78 unwind label %111

78:                                               ; preds = %77
  %79 = load i32, ptr %19, align 4, !tbaa !5
  %80 = load i32, ptr %20, align 4, !tbaa !5
  %81 = load i32, ptr %21, align 4, !tbaa !5
  %82 = invoke ptr @_ZNSt3_V28__rotateIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEEEET_S8_S8_S8_St26random_access_iterator_tag(ptr nonnull %2, ptr nonnull %22, ptr nonnull %18)
          to label %83 unwind label %113

83:                                               ; preds = %78
  %84 = add i32 %80, %79
  %85 = add i32 %84, %81
  %86 = zext i32 %85 to i64
  %87 = add nuw nsw i64 %76, %86
  invoke void @_ZSt16__introsort_loopIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEElNS0_5__ops15_Iter_less_iterEEvT_S9_T0_T1_(ptr nonnull %2, ptr nonnull %18, i64 noundef 36)
          to label %88 unwind label %111

88:                                               ; preds = %83
  invoke void @_ZSt22__final_insertion_sortIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEENS0_5__ops15_Iter_less_iterEEvT_S9_T0_(ptr nonnull %2, ptr nonnull %18)
          to label %89 unwind label %111

89:                                               ; preds = %88
  %90 = load i32, ptr %19, align 4, !tbaa !5
  %91 = load i32, ptr %20, align 4, !tbaa !5
  %92 = load i32, ptr %21, align 4, !tbaa !5
  %93 = invoke ptr @_ZNSt3_V28__rotateIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEEEET_S8_S8_S8_St26random_access_iterator_tag(ptr nonnull %2, ptr nonnull %22, ptr nonnull %18)
          to label %94 unwind label %113

94:                                               ; preds = %89
  %95 = add i32 %91, %90
  %96 = add i32 %95, %92
  %97 = zext i32 %96 to i64
  %98 = add nuw nsw i64 %87, %97
  invoke void @_ZSt16__introsort_loopIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEElNS0_5__ops15_Iter_less_iterEEvT_S9_T0_T1_(ptr nonnull %2, ptr nonnull %18, i64 noundef 36)
          to label %99 unwind label %111

99:                                               ; preds = %94
  invoke void @_ZSt22__final_insertion_sortIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEENS0_5__ops15_Iter_less_iterEEvT_S9_T0_(ptr nonnull %2, ptr nonnull %18)
          to label %100 unwind label %111

100:                                              ; preds = %99
  %101 = load i32, ptr %19, align 4, !tbaa !5
  %102 = load i32, ptr %20, align 4, !tbaa !5
  %103 = load i32, ptr %21, align 4, !tbaa !5
  %104 = invoke ptr @_ZNSt3_V28__rotateIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEEEET_S8_S8_S8_St26random_access_iterator_tag(ptr nonnull %2, ptr nonnull %22, ptr nonnull %18)
          to label %105 unwind label %113

105:                                              ; preds = %100
  %106 = add i32 %102, %101
  %107 = add i32 %106, %103
  %108 = zext i32 %107 to i64
  %109 = add nuw nsw i64 %98, %108
  %110 = invoke noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo9_M_insertImEERSoT_(ptr noundef nonnull align 8 dereferenceable(8) @_ZSt4cout, i64 noundef %109)
          to label %115 unwind label %128

111:                                              ; preds = %99, %94, %88, %83, %77, %72, %66, %61, %55, %50, %44, %39, %33, %29, %23, %17
  %112 = landingpad { ptr, i32 }
          cleanup
  br label %130

113:                                              ; preds = %100, %89, %78, %67, %56, %45, %34, %24
  %114 = landingpad { ptr, i32 }
          cleanup
  br label %130

115:                                              ; preds = %105
  call void @llvm.lifetime.start.p0(i64 1, ptr nonnull %1)
  store i8 10, ptr %1, align 1, !tbaa !13
  %116 = load ptr, ptr %110, align 8, !tbaa !14
  %117 = getelementptr i8, ptr %116, i64 -24
  %118 = load i64, ptr %117, align 8
  %119 = getelementptr inbounds i8, ptr %110, i64 %118
  %120 = getelementptr inbounds %"class.std::ios_base", ptr %119, i64 0, i32 2
  %121 = load i64, ptr %120, align 8, !tbaa !16
  %122 = icmp eq i64 %121, 0
  br i1 %122, label %125, label %123

123:                                              ; preds = %115
  %124 = invoke noundef nonnull align 8 dereferenceable(8) ptr @_ZSt16__ostream_insertIcSt11char_traitsIcEERSt13basic_ostreamIT_T0_ES6_PKS3_l(ptr noundef nonnull align 8 dereferenceable(8) %110, ptr noundef nonnull %1, i64 noundef 1)
          to label %127 unwind label %128

125:                                              ; preds = %115
  %126 = invoke noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo3putEc(ptr noundef nonnull align 8 dereferenceable(8) %110, i8 noundef signext 10)
          to label %127 unwind label %128

127:                                              ; preds = %123, %125
  call void @llvm.lifetime.end.p0(i64 1, ptr nonnull %1)
  call void @_ZdlPv(ptr noundef nonnull %2) #9
  ret i32 0

128:                                              ; preds = %125, %123, %105
  %129 = landingpad { ptr, i32 }
          cleanup
  br label %130

130:                                              ; preds = %111, %113, %128
  %131 = phi { ptr, i32 } [ %129, %128 ], [ %114, %113 ], [ %112, %111 ]
  call void @_ZdlPv(ptr noundef nonnull %2) #9
  resume { ptr, i32 } %131
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

; Function Attrs: mustprogress uwtable
define linkonce_odr dso_local void @_ZSt16__introsort_loopIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEElNS0_5__ops15_Iter_less_iterEEvT_S9_T0_T1_(ptr %0, ptr %1, i64 noundef %2) local_unnamed_addr #4 comdat {
  %4 = alloca %"struct.__gnu_cxx::__ops::_Iter_less_iter", align 1
  %5 = ptrtoint ptr %0 to i64
  %6 = ptrtoint ptr %1 to i64
  %7 = sub i64 %6, %5
  %8 = ashr exact i64 %7, 2
  %9 = icmp sgt i64 %8, 16
  br i1 %9, label %10, label %125

10:                                               ; preds = %3
  %11 = getelementptr inbounds i32, ptr %0, i64 1
  br label %12

12:                                               ; preds = %10, %120
  %13 = phi i64 [ %8, %10 ], [ %123, %120 ]
  %14 = phi i64 [ %2, %10 ], [ %76, %120 ]
  %15 = phi ptr [ %1, %10 ], [ %108, %120 ]
  %16 = icmp eq i64 %14, 0
  br i1 %16, label %17, label %75

17:                                               ; preds = %12
  call void @llvm.lifetime.start.p0(i64 1, ptr nonnull %4)
  call void @_ZSt11__make_heapIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEENS0_5__ops15_Iter_less_iterEEvT_S9_RT0_(ptr %0, ptr %15, ptr noundef nonnull align 1 dereferenceable(1) %4)
  call void @llvm.lifetime.end.p0(i64 1, ptr nonnull %4)
  br label %18

18:                                               ; preds = %17, %71
  %19 = phi ptr [ %20, %71 ], [ %15, %17 ]
  %20 = getelementptr inbounds i32, ptr %19, i64 -1
  %21 = load i32, ptr %20, align 4, !tbaa !5
  %22 = load i32, ptr %0, align 4, !tbaa !5
  store i32 %22, ptr %20, align 4, !tbaa !5
  %23 = ptrtoint ptr %20 to i64
  %24 = sub i64 %23, %5
  %25 = ashr exact i64 %24, 2
  %26 = add nsw i64 %25, -1
  %27 = sdiv i64 %26, 2
  %28 = icmp sgt i64 %25, 2
  br i1 %28, label %29, label %44

29:                                               ; preds = %18, %29
  %30 = phi i64 [ %39, %29 ], [ 0, %18 ]
  %31 = shl i64 %30, 1
  %32 = add i64 %31, 2
  %33 = getelementptr inbounds i32, ptr %0, i64 %32
  %34 = or disjoint i64 %31, 1
  %35 = getelementptr inbounds i32, ptr %0, i64 %34
  %36 = load i32, ptr %33, align 4, !tbaa !5
  %37 = load i32, ptr %35, align 4, !tbaa !5
  %38 = icmp ult i32 %36, %37
  %39 = select i1 %38, i64 %34, i64 %32
  %40 = getelementptr inbounds i32, ptr %0, i64 %39
  %41 = load i32, ptr %40, align 4, !tbaa !5
  %42 = getelementptr inbounds i32, ptr %0, i64 %30
  store i32 %41, ptr %42, align 4, !tbaa !5
  %43 = icmp slt i64 %39, %27
  br i1 %43, label %29, label %44, !llvm.loop !24

44:                                               ; preds = %29, %18
  %45 = phi i64 [ 0, %18 ], [ %39, %29 ]
  %46 = and i64 %24, 4
  %47 = icmp eq i64 %46, 0
  br i1 %47, label %48, label %58

48:                                               ; preds = %44
  %49 = add nsw i64 %25, -2
  %50 = ashr exact i64 %49, 1
  %51 = icmp eq i64 %45, %50
  br i1 %51, label %52, label %58

52:                                               ; preds = %48
  %53 = shl nsw i64 %45, 1
  %54 = or disjoint i64 %53, 1
  %55 = getelementptr inbounds i32, ptr %0, i64 %54
  %56 = load i32, ptr %55, align 4, !tbaa !5
  %57 = getelementptr inbounds i32, ptr %0, i64 %45
  store i32 %56, ptr %57, align 4, !tbaa !5
  br label %58

58:                                               ; preds = %52, %48, %44
  %59 = phi i64 [ %54, %52 ], [ %45, %48 ], [ %45, %44 ]
  %60 = icmp sgt i64 %59, 0
  br i1 %60, label %61, label %71

61:                                               ; preds = %58, %68
  %62 = phi i64 [ %64, %68 ], [ %59, %58 ]
  %63 = add nsw i64 %62, -1
  %64 = lshr i64 %63, 1
  %65 = getelementptr inbounds i32, ptr %0, i64 %64
  %66 = load i32, ptr %65, align 4, !tbaa !5
  %67 = icmp ult i32 %66, %21
  br i1 %67, label %68, label %71

68:                                               ; preds = %61
  %69 = getelementptr inbounds i32, ptr %0, i64 %62
  store i32 %66, ptr %69, align 4, !tbaa !5
  %70 = icmp ult i64 %63, 2
  br i1 %70, label %71, label %61, !llvm.loop !25

71:                                               ; preds = %68, %61, %58
  %72 = phi i64 [ %59, %58 ], [ %62, %61 ], [ 0, %68 ]
  %73 = getelementptr inbounds i32, ptr %0, i64 %72
  store i32 %21, ptr %73, align 4, !tbaa !5
  %74 = icmp sgt i64 %24, 4
  br i1 %74, label %18, label %125, !llvm.loop !26

75:                                               ; preds = %12
  %76 = add nsw i64 %14, -1
  %77 = lshr i64 %13, 1
  %78 = getelementptr inbounds i32, ptr %0, i64 %77
  %79 = getelementptr inbounds i32, ptr %15, i64 -1
  %80 = load i32, ptr %11, align 4, !tbaa !5
  %81 = load i32, ptr %78, align 4, !tbaa !5
  %82 = icmp ult i32 %80, %81
  %83 = load i32, ptr %79, align 4, !tbaa !5
  br i1 %82, label %84, label %93

84:                                               ; preds = %75
  %85 = icmp ult i32 %81, %83
  br i1 %85, label %86, label %88

86:                                               ; preds = %84
  %87 = load i32, ptr %0, align 4, !tbaa !5
  store i32 %81, ptr %0, align 4, !tbaa !5
  store i32 %87, ptr %78, align 4, !tbaa !5
  br label %102

88:                                               ; preds = %84
  %89 = icmp ult i32 %80, %83
  %90 = load i32, ptr %0, align 4, !tbaa !5
  br i1 %89, label %91, label %92

91:                                               ; preds = %88
  store i32 %83, ptr %0, align 4, !tbaa !5
  store i32 %90, ptr %79, align 4, !tbaa !5
  br label %102

92:                                               ; preds = %88
  store i32 %80, ptr %0, align 4, !tbaa !5
  store i32 %90, ptr %11, align 4, !tbaa !5
  br label %102

93:                                               ; preds = %75
  %94 = icmp ult i32 %80, %83
  br i1 %94, label %95, label %97

95:                                               ; preds = %93
  %96 = load i32, ptr %0, align 4, !tbaa !5
  store i32 %80, ptr %0, align 4, !tbaa !5
  store i32 %96, ptr %11, align 4, !tbaa !5
  br label %102

97:                                               ; preds = %93
  %98 = icmp ult i32 %81, %83
  %99 = load i32, ptr %0, align 4, !tbaa !5
  br i1 %98, label %100, label %101

100:                                              ; preds = %97
  store i32 %83, ptr %0, align 4, !tbaa !5
  store i32 %99, ptr %79, align 4, !tbaa !5
  br label %102

101:                                              ; preds = %97
  store i32 %81, ptr %0, align 4, !tbaa !5
  store i32 %99, ptr %78, align 4, !tbaa !5
  br label %102

102:                                              ; preds = %101, %100, %95, %92, %91, %86
  br label %103

103:                                              ; preds = %102, %119
  %104 = phi ptr [ %111, %119 ], [ %11, %102 ]
  %105 = phi ptr [ %114, %119 ], [ %15, %102 ]
  %106 = load i32, ptr %0, align 4, !tbaa !5
  br label %107

107:                                              ; preds = %107, %103
  %108 = phi ptr [ %104, %103 ], [ %111, %107 ]
  %109 = load i32, ptr %108, align 4, !tbaa !5
  %110 = icmp ult i32 %109, %106
  %111 = getelementptr inbounds i32, ptr %108, i64 1
  br i1 %110, label %107, label %112, !llvm.loop !27

112:                                              ; preds = %107, %112
  %113 = phi ptr [ %114, %112 ], [ %105, %107 ]
  %114 = getelementptr inbounds i32, ptr %113, i64 -1
  %115 = load i32, ptr %114, align 4, !tbaa !5
  %116 = icmp ult i32 %106, %115
  br i1 %116, label %112, label %117, !llvm.loop !28

117:                                              ; preds = %112
  %118 = icmp ult ptr %108, %114
  br i1 %118, label %119, label %120

119:                                              ; preds = %117
  store i32 %115, ptr %108, align 4, !tbaa !5
  store i32 %109, ptr %114, align 4, !tbaa !5
  br label %103, !llvm.loop !29

120:                                              ; preds = %117
  tail call void @_ZSt16__introsort_loopIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEElNS0_5__ops15_Iter_less_iterEEvT_S9_T0_T1_(ptr nonnull %108, ptr %15, i64 noundef %76)
  %121 = ptrtoint ptr %108 to i64
  %122 = sub i64 %121, %5
  %123 = ashr exact i64 %122, 2
  %124 = icmp sgt i64 %123, 16
  br i1 %124, label %12, label %125, !llvm.loop !30

125:                                              ; preds = %120, %71, %3
  ret void
}

; Function Attrs: mustprogress uwtable
define linkonce_odr dso_local void @_ZSt22__final_insertion_sortIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEENS0_5__ops15_Iter_less_iterEEvT_S9_T0_(ptr %0, ptr %1) local_unnamed_addr #4 comdat {
  %3 = ptrtoint ptr %1 to i64
  %4 = ptrtoint ptr %0 to i64
  %5 = sub i64 %3, %4
  %6 = icmp sgt i64 %5, 64
  br i1 %6, label %7, label %55

7:                                                ; preds = %2
  %8 = getelementptr i8, ptr %0, i64 4
  br label %9

9:                                                ; preds = %31, %7
  %10 = phi i64 [ 4, %7 ], [ %33, %31 ]
  %11 = phi ptr [ %0, %7 ], [ %12, %31 ]
  %12 = getelementptr inbounds i8, ptr %0, i64 %10
  %13 = load i32, ptr %12, align 4, !tbaa !5
  %14 = load i32, ptr %0, align 4, !tbaa !5
  %15 = icmp ult i32 %13, %14
  br i1 %15, label %16, label %21

16:                                               ; preds = %9
  %17 = icmp ugt i64 %10, 4
  br i1 %17, label %18, label %19, !prof !31

18:                                               ; preds = %16
  tail call void @llvm.memmove.p0.p0.i64(ptr noundef nonnull align 4 dereferenceable(1) %8, ptr noundef nonnull align 4 dereferenceable(1) %0, i64 %10, i1 false)
  br label %31

19:                                               ; preds = %16
  %20 = getelementptr inbounds i32, ptr %11, i64 1
  store i32 %14, ptr %20, align 4, !tbaa !5
  br label %31

21:                                               ; preds = %9
  %22 = load i32, ptr %11, align 4, !tbaa !5
  %23 = icmp ult i32 %13, %22
  br i1 %23, label %24, label %31

24:                                               ; preds = %21, %24
  %25 = phi i32 [ %29, %24 ], [ %22, %21 ]
  %26 = phi ptr [ %28, %24 ], [ %11, %21 ]
  %27 = phi ptr [ %26, %24 ], [ %12, %21 ]
  store i32 %25, ptr %27, align 4, !tbaa !5
  %28 = getelementptr inbounds i32, ptr %26, i64 -1
  %29 = load i32, ptr %28, align 4, !tbaa !5
  %30 = icmp ult i32 %13, %29
  br i1 %30, label %24, label %31, !llvm.loop !32

31:                                               ; preds = %24, %21, %19, %18
  %32 = phi ptr [ %0, %18 ], [ %0, %19 ], [ %12, %21 ], [ %26, %24 ]
  store i32 %13, ptr %32, align 4, !tbaa !5
  %33 = add nuw nsw i64 %10, 4
  %34 = icmp eq i64 %33, 64
  br i1 %34, label %35, label %9, !llvm.loop !33

35:                                               ; preds = %31
  %36 = getelementptr inbounds i32, ptr %0, i64 16
  %37 = icmp eq ptr %36, %1
  br i1 %37, label %93, label %38

38:                                               ; preds = %35, %51
  %39 = phi ptr [ %53, %51 ], [ %36, %35 ]
  %40 = load i32, ptr %39, align 4, !tbaa !5
  %41 = getelementptr inbounds i32, ptr %39, i64 -1
  %42 = load i32, ptr %41, align 4, !tbaa !5
  %43 = icmp ult i32 %40, %42
  br i1 %43, label %44, label %51

44:                                               ; preds = %38, %44
  %45 = phi i32 [ %49, %44 ], [ %42, %38 ]
  %46 = phi ptr [ %48, %44 ], [ %41, %38 ]
  %47 = phi ptr [ %46, %44 ], [ %39, %38 ]
  store i32 %45, ptr %47, align 4, !tbaa !5
  %48 = getelementptr inbounds i32, ptr %46, i64 -1
  %49 = load i32, ptr %48, align 4, !tbaa !5
  %50 = icmp ult i32 %40, %49
  br i1 %50, label %44, label %51, !llvm.loop !32

51:                                               ; preds = %44, %38
  %52 = phi ptr [ %39, %38 ], [ %46, %44 ]
  store i32 %40, ptr %52, align 4, !tbaa !5
  %53 = getelementptr inbounds i32, ptr %39, i64 1
  %54 = icmp eq ptr %53, %1
  br i1 %54, label %93, label %38, !llvm.loop !34

55:                                               ; preds = %2
  %56 = icmp eq ptr %0, %1
  %57 = getelementptr inbounds i32, ptr %0, i64 1
  %58 = icmp eq ptr %57, %1
  %59 = select i1 %56, i1 true, i1 %58
  br i1 %59, label %93, label %60

60:                                               ; preds = %55, %89
  %61 = phi ptr [ %91, %89 ], [ %57, %55 ]
  %62 = phi ptr [ %61, %89 ], [ %0, %55 ]
  %63 = load i32, ptr %61, align 4, !tbaa !5
  %64 = load i32, ptr %0, align 4, !tbaa !5
  %65 = icmp ult i32 %63, %64
  br i1 %65, label %66, label %79

66:                                               ; preds = %60
  %67 = ptrtoint ptr %61 to i64
  %68 = sub i64 %67, %4
  %69 = ashr exact i64 %68, 2
  %70 = icmp sgt i64 %69, 1
  br i1 %70, label %71, label %75, !prof !31

71:                                               ; preds = %66
  %72 = getelementptr inbounds i32, ptr %62, i64 2
  %73 = sub nsw i64 0, %69
  %74 = getelementptr inbounds i32, ptr %72, i64 %73
  tail call void @llvm.memmove.p0.p0.i64(ptr noundef nonnull align 4 dereferenceable(1) %74, ptr noundef nonnull align 4 dereferenceable(1) %0, i64 %68, i1 false)
  br label %89

75:                                               ; preds = %66
  %76 = icmp eq i64 %68, 4
  br i1 %76, label %77, label %89

77:                                               ; preds = %75
  %78 = getelementptr inbounds i32, ptr %62, i64 1
  store i32 %64, ptr %78, align 4, !tbaa !5
  br label %89

79:                                               ; preds = %60
  %80 = load i32, ptr %62, align 4, !tbaa !5
  %81 = icmp ult i32 %63, %80
  br i1 %81, label %82, label %89

82:                                               ; preds = %79, %82
  %83 = phi i32 [ %87, %82 ], [ %80, %79 ]
  %84 = phi ptr [ %86, %82 ], [ %62, %79 ]
  %85 = phi ptr [ %84, %82 ], [ %61, %79 ]
  store i32 %83, ptr %85, align 4, !tbaa !5
  %86 = getelementptr inbounds i32, ptr %84, i64 -1
  %87 = load i32, ptr %86, align 4, !tbaa !5
  %88 = icmp ult i32 %63, %87
  br i1 %88, label %82, label %89, !llvm.loop !32

89:                                               ; preds = %82, %79, %77, %75, %71
  %90 = phi ptr [ %0, %71 ], [ %0, %75 ], [ %0, %77 ], [ %61, %79 ], [ %84, %82 ]
  store i32 %63, ptr %90, align 4, !tbaa !5
  %91 = getelementptr inbounds i32, ptr %61, i64 1
  %92 = icmp eq ptr %91, %1
  br i1 %92, label %93, label %60, !llvm.loop !33

93:                                               ; preds = %89, %51, %55, %35
  ret void
}

; Function Attrs: mustprogress uwtable
define linkonce_odr dso_local void @_ZSt11__make_heapIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEENS0_5__ops15_Iter_less_iterEEvT_S9_RT0_(ptr %0, ptr %1, ptr noundef nonnull align 1 dereferenceable(1) %2) local_unnamed_addr #4 comdat {
  %4 = ptrtoint ptr %1 to i64
  %5 = ptrtoint ptr %0 to i64
  %6 = sub i64 %4, %5
  %7 = freeze i64 %6
  %8 = ashr exact i64 %7, 2
  %9 = icmp slt i64 %8, 2
  br i1 %9, label %102, label %10

10:                                               ; preds = %3
  %11 = add nsw i64 %8, -2
  %12 = lshr i64 %11, 1
  %13 = add nsw i64 %8, -1
  %14 = lshr i64 %13, 1
  %15 = and i64 %7, 4
  %16 = icmp eq i64 %15, 0
  %17 = lshr exact i64 %11, 1
  br i1 %16, label %18, label %22

18:                                               ; preds = %10
  %19 = or disjoint i64 %11, 1
  %20 = getelementptr inbounds i32, ptr %0, i64 %19
  %21 = getelementptr inbounds i32, ptr %0, i64 %17
  br label %59

22:                                               ; preds = %10, %54
  %23 = phi i64 [ %58, %54 ], [ %12, %10 ]
  %24 = getelementptr inbounds i32, ptr %0, i64 %23
  %25 = load i32, ptr %24, align 4, !tbaa !5
  %26 = icmp sgt i64 %14, %23
  br i1 %26, label %27, label %54

27:                                               ; preds = %22, %27
  %28 = phi i64 [ %37, %27 ], [ %23, %22 ]
  %29 = shl i64 %28, 1
  %30 = add i64 %29, 2
  %31 = getelementptr inbounds i32, ptr %0, i64 %30
  %32 = or disjoint i64 %29, 1
  %33 = getelementptr inbounds i32, ptr %0, i64 %32
  %34 = load i32, ptr %31, align 4, !tbaa !5
  %35 = load i32, ptr %33, align 4, !tbaa !5
  %36 = icmp ult i32 %34, %35
  %37 = select i1 %36, i64 %32, i64 %30
  %38 = getelementptr inbounds i32, ptr %0, i64 %37
  %39 = load i32, ptr %38, align 4, !tbaa !5
  %40 = getelementptr inbounds i32, ptr %0, i64 %28
  store i32 %39, ptr %40, align 4, !tbaa !5
  %41 = icmp slt i64 %37, %14
  br i1 %41, label %27, label %42, !llvm.loop !24

42:                                               ; preds = %27
  %43 = icmp sgt i64 %37, %23
  br i1 %43, label %44, label %54

44:                                               ; preds = %42, %51
  %45 = phi i64 [ %47, %51 ], [ %37, %42 ]
  %46 = add nsw i64 %45, -1
  %47 = sdiv i64 %46, 2
  %48 = getelementptr inbounds i32, ptr %0, i64 %47
  %49 = load i32, ptr %48, align 4, !tbaa !5
  %50 = icmp ult i32 %49, %25
  br i1 %50, label %51, label %54

51:                                               ; preds = %44
  %52 = getelementptr inbounds i32, ptr %0, i64 %45
  store i32 %49, ptr %52, align 4, !tbaa !5
  %53 = icmp sgt i64 %47, %23
  br i1 %53, label %44, label %54, !llvm.loop !25

54:                                               ; preds = %44, %51, %22, %42
  %55 = phi i64 [ %37, %42 ], [ %23, %22 ], [ %47, %51 ], [ %45, %44 ]
  %56 = getelementptr inbounds i32, ptr %0, i64 %55
  store i32 %25, ptr %56, align 4, !tbaa !5
  %57 = icmp eq i64 %23, 0
  %58 = add nsw i64 %23, -1
  br i1 %57, label %102, label %22, !llvm.loop !35

59:                                               ; preds = %18, %97
  %60 = phi i64 [ %101, %97 ], [ %12, %18 ]
  %61 = getelementptr inbounds i32, ptr %0, i64 %60
  %62 = load i32, ptr %61, align 4, !tbaa !5
  %63 = icmp sgt i64 %14, %60
  br i1 %63, label %64, label %79

64:                                               ; preds = %59, %64
  %65 = phi i64 [ %74, %64 ], [ %60, %59 ]
  %66 = shl i64 %65, 1
  %67 = add i64 %66, 2
  %68 = getelementptr inbounds i32, ptr %0, i64 %67
  %69 = or disjoint i64 %66, 1
  %70 = getelementptr inbounds i32, ptr %0, i64 %69
  %71 = load i32, ptr %68, align 4, !tbaa !5
  %72 = load i32, ptr %70, align 4, !tbaa !5
  %73 = icmp ult i32 %71, %72
  %74 = select i1 %73, i64 %69, i64 %67
  %75 = getelementptr inbounds i32, ptr %0, i64 %74
  %76 = load i32, ptr %75, align 4, !tbaa !5
  %77 = getelementptr inbounds i32, ptr %0, i64 %65
  store i32 %76, ptr %77, align 4, !tbaa !5
  %78 = icmp slt i64 %74, %14
  br i1 %78, label %64, label %79, !llvm.loop !24

79:                                               ; preds = %64, %59
  %80 = phi i64 [ %60, %59 ], [ %74, %64 ]
  %81 = icmp eq i64 %80, %17
  br i1 %81, label %82, label %84

82:                                               ; preds = %79
  %83 = load i32, ptr %20, align 4, !tbaa !5
  store i32 %83, ptr %21, align 4, !tbaa !5
  br label %84

84:                                               ; preds = %82, %79
  %85 = phi i64 [ %19, %82 ], [ %80, %79 ]
  %86 = icmp sgt i64 %85, %60
  br i1 %86, label %87, label %97

87:                                               ; preds = %84, %94
  %88 = phi i64 [ %90, %94 ], [ %85, %84 ]
  %89 = add nsw i64 %88, -1
  %90 = sdiv i64 %89, 2
  %91 = getelementptr inbounds i32, ptr %0, i64 %90
  %92 = load i32, ptr %91, align 4, !tbaa !5
  %93 = icmp ult i32 %92, %62
  br i1 %93, label %94, label %97

94:                                               ; preds = %87
  %95 = getelementptr inbounds i32, ptr %0, i64 %88
  store i32 %92, ptr %95, align 4, !tbaa !5
  %96 = icmp sgt i64 %90, %60
  br i1 %96, label %87, label %97, !llvm.loop !25

97:                                               ; preds = %87, %94, %84
  %98 = phi i64 [ %85, %84 ], [ %90, %94 ], [ %88, %87 ]
  %99 = getelementptr inbounds i32, ptr %0, i64 %98
  store i32 %62, ptr %99, align 4, !tbaa !5
  %100 = icmp eq i64 %60, 0
  %101 = add nsw i64 %60, -1
  br i1 %100, label %102, label %59, !llvm.loop !35

102:                                              ; preds = %54, %97, %3
  ret void
}

; Function Attrs: mustprogress nocallback nofree nounwind willreturn memory(argmem: readwrite)
declare void @llvm.memmove.p0.p0.i64(ptr nocapture writeonly, ptr nocapture readonly, i64, i1 immarg) #5

; Function Attrs: mustprogress uwtable
define linkonce_odr dso_local ptr @_ZNSt3_V28__rotateIN9__gnu_cxx17__normal_iteratorIPjSt6vectorIjSaIjEEEEEET_S8_S8_S8_St26random_access_iterator_tag(ptr %0, ptr %1, ptr %2) local_unnamed_addr #4 comdat {
  %4 = icmp eq ptr %0, %1
  br i1 %4, label %274, label %5

5:                                                ; preds = %3
  %6 = icmp eq ptr %2, %1
  br i1 %6, label %274, label %7

7:                                                ; preds = %5
  %8 = ptrtoint ptr %2 to i64
  %9 = ptrtoint ptr %0 to i64
  %10 = sub i64 %8, %9
  %11 = ashr exact i64 %10, 2
  %12 = ptrtoint ptr %1 to i64
  %13 = sub i64 %12, %9
  %14 = ashr exact i64 %13, 2
  %15 = sub nsw i64 %11, %14
  %16 = icmp eq i64 %14, %15
  br i1 %16, label %17, label %66

17:                                               ; preds = %7
  %18 = add i64 %12, -4
  %19 = sub i64 %18, %9
  %20 = lshr i64 %19, 2
  %21 = add nuw nsw i64 %20, 1
  %22 = icmp ult i64 %19, 60
  br i1 %22, label %55, label %23

23:                                               ; preds = %17
  %24 = add i64 %12, -4
  %25 = sub i64 %24, %9
  %26 = and i64 %25, -4
  %27 = add i64 %26, 4
  %28 = getelementptr i8, ptr %0, i64 %27
  %29 = getelementptr i8, ptr %1, i64 %27
  %30 = icmp ugt ptr %29, %0
  %31 = icmp ugt ptr %28, %1
  %32 = and i1 %30, %31
  br i1 %32, label %55, label %33

33:                                               ; preds = %23
  %34 = and i64 %21, 9223372036854775800
  %35 = shl i64 %34, 2
  %36 = getelementptr i8, ptr %1, i64 %35
  %37 = shl i64 %34, 2
  %38 = getelementptr i8, ptr %0, i64 %37
  br label %39

39:                                               ; preds = %39, %33
  %40 = phi i64 [ 0, %33 ], [ %51, %39 ]
  %41 = shl i64 %40, 2
  %42 = getelementptr i8, ptr %1, i64 %41
  %43 = shl i64 %40, 2
  %44 = getelementptr i8, ptr %0, i64 %43
  %45 = getelementptr i32, ptr %44, i64 4
  %46 = load <4 x i32>, ptr %44, align 4, !tbaa !5, !alias.scope !36, !noalias !39
  %47 = load <4 x i32>, ptr %45, align 4, !tbaa !5, !alias.scope !36, !noalias !39
  %48 = getelementptr i32, ptr %42, i64 4
  %49 = load <4 x i32>, ptr %42, align 4, !tbaa !5, !alias.scope !39
  %50 = load <4 x i32>, ptr %48, align 4, !tbaa !5, !alias.scope !39
  store <4 x i32> %49, ptr %44, align 4, !tbaa !5, !alias.scope !36, !noalias !39
  store <4 x i32> %50, ptr %45, align 4, !tbaa !5, !alias.scope !36, !noalias !39
  store <4 x i32> %46, ptr %42, align 4, !tbaa !5, !alias.scope !39
  store <4 x i32> %47, ptr %48, align 4, !tbaa !5, !alias.scope !39
  %51 = add nuw i64 %40, 8
  %52 = icmp eq i64 %51, %34
  br i1 %52, label %53, label %39, !llvm.loop !41

53:                                               ; preds = %39
  %54 = icmp eq i64 %21, %34
  br i1 %54, label %274, label %55

55:                                               ; preds = %23, %17, %53
  %56 = phi ptr [ %1, %23 ], [ %1, %17 ], [ %36, %53 ]
  %57 = phi ptr [ %0, %23 ], [ %0, %17 ], [ %38, %53 ]
  br label %58

58:                                               ; preds = %55, %58
  %59 = phi ptr [ %64, %58 ], [ %56, %55 ]
  %60 = phi ptr [ %63, %58 ], [ %57, %55 ]
  %61 = load i32, ptr %60, align 4, !tbaa !5
  %62 = load i32, ptr %59, align 4, !tbaa !5
  store i32 %62, ptr %60, align 4, !tbaa !5
  store i32 %61, ptr %59, align 4, !tbaa !5
  %63 = getelementptr inbounds i32, ptr %60, i64 1
  %64 = getelementptr inbounds i32, ptr %59, i64 1
  %65 = icmp eq ptr %63, %1
  br i1 %65, label %274, label %58, !llvm.loop !42

66:                                               ; preds = %7
  %67 = sub i64 %8, %12
  %68 = getelementptr inbounds i8, ptr %0, i64 %67
  br label %69

69:                                               ; preds = %248, %66
  %70 = phi ptr [ %0, %66 ], [ %249, %248 ]
  %71 = phi i64 [ %14, %66 ], [ %250, %248 ]
  %72 = phi i64 [ %11, %66 ], [ %251, %248 ]
  %73 = sub nsw i64 %72, %71
  %74 = icmp slt i64 %71, %73
  br i1 %74, label %75, label %147

75:                                               ; preds = %69
  %76 = icmp eq i64 %71, 1
  br i1 %76, label %77, label %91

77:                                               ; preds = %75
  %78 = load i32, ptr %70, align 4, !tbaa !5
  %79 = getelementptr inbounds i32, ptr %70, i64 1
  %80 = getelementptr inbounds i32, ptr %70, i64 %72
  %81 = shl nsw i64 %72, 2
  %82 = add nsw i64 %81, -4
  %83 = icmp sgt i64 %72, 2
  br i1 %83, label %84, label %85, !prof !31

84:                                               ; preds = %77
  tail call void @llvm.memmove.p0.p0.i64(ptr nonnull align 4 %70, ptr nonnull align 4 %79, i64 %82, i1 false)
  br label %89

85:                                               ; preds = %77
  %86 = icmp eq i64 %82, 4
  br i1 %86, label %87, label %89

87:                                               ; preds = %85
  %88 = load i32, ptr %79, align 4, !tbaa !5
  store i32 %88, ptr %70, align 4, !tbaa !5
  br label %89

89:                                               ; preds = %84, %85, %87
  %90 = getelementptr inbounds i32, ptr %80, i64 -1
  store i32 %78, ptr %90, align 4, !tbaa !5
  br label %274

91:                                               ; preds = %75
  %92 = icmp sgt i64 %73, 0
  br i1 %92, label %93, label %131

93:                                               ; preds = %91
  %94 = getelementptr i32, ptr %70, i64 %71
  %95 = icmp ult i64 %73, 8
  br i1 %95, label %127, label %96

96:                                               ; preds = %93
  %97 = shl i64 %72, 2
  %98 = sub i64 %72, %71
  %99 = shl i64 %98, 2
  %100 = getelementptr i8, ptr %70, i64 %99
  %101 = getelementptr i8, ptr %70, i64 %97
  %102 = icmp ult ptr %70, %101
  %103 = icmp ult ptr %94, %100
  %104 = and i1 %102, %103
  br i1 %104, label %127, label %105

105:                                              ; preds = %96
  %106 = and i64 %73, 9223372036854775800
  %107 = shl i64 %106, 2
  %108 = getelementptr i8, ptr %70, i64 %107
  %109 = shl i64 %106, 2
  %110 = getelementptr i8, ptr %94, i64 %109
  br label %111

111:                                              ; preds = %111, %105
  %112 = phi i64 [ 0, %105 ], [ %123, %111 ]
  %113 = shl i64 %112, 2
  %114 = getelementptr i8, ptr %70, i64 %113
  %115 = shl i64 %112, 2
  %116 = getelementptr i8, ptr %94, i64 %115
  %117 = getelementptr i32, ptr %114, i64 4
  %118 = load <4 x i32>, ptr %114, align 4, !tbaa !5, !alias.scope !43, !noalias !46
  %119 = load <4 x i32>, ptr %117, align 4, !tbaa !5, !alias.scope !43, !noalias !46
  %120 = getelementptr i32, ptr %116, i64 4
  %121 = load <4 x i32>, ptr %116, align 4, !tbaa !5, !alias.scope !46
  %122 = load <4 x i32>, ptr %120, align 4, !tbaa !5, !alias.scope !46
  store <4 x i32> %121, ptr %114, align 4, !tbaa !5, !alias.scope !43, !noalias !46
  store <4 x i32> %122, ptr %117, align 4, !tbaa !5, !alias.scope !43, !noalias !46
  store <4 x i32> %118, ptr %116, align 4, !tbaa !5, !alias.scope !46
  store <4 x i32> %119, ptr %120, align 4, !tbaa !5, !alias.scope !46
  %123 = add nuw i64 %112, 8
  %124 = icmp eq i64 %123, %106
  br i1 %124, label %125, label %111, !llvm.loop !48

125:                                              ; preds = %111
  %126 = icmp eq i64 %73, %106
  br i1 %126, label %131, label %127

127:                                              ; preds = %96, %93, %125
  %128 = phi i64 [ 0, %96 ], [ 0, %93 ], [ %106, %125 ]
  %129 = phi ptr [ %70, %96 ], [ %70, %93 ], [ %108, %125 ]
  %130 = phi ptr [ %94, %96 ], [ %94, %93 ], [ %110, %125 ]
  br label %135

131:                                              ; preds = %135, %125, %91
  %132 = phi ptr [ %70, %91 ], [ %108, %125 ], [ %141, %135 ]
  %133 = srem i64 %72, %71
  %134 = icmp eq i64 %133, 0
  br i1 %134, label %274, label %145

135:                                              ; preds = %127, %135
  %136 = phi i64 [ %143, %135 ], [ %128, %127 ]
  %137 = phi ptr [ %141, %135 ], [ %129, %127 ]
  %138 = phi ptr [ %142, %135 ], [ %130, %127 ]
  %139 = load i32, ptr %137, align 4, !tbaa !5
  %140 = load i32, ptr %138, align 4, !tbaa !5
  store i32 %140, ptr %137, align 4, !tbaa !5
  store i32 %139, ptr %138, align 4, !tbaa !5
  %141 = getelementptr inbounds i32, ptr %137, i64 1
  %142 = getelementptr inbounds i32, ptr %138, i64 1
  %143 = add nuw nsw i64 %136, 1
  %144 = icmp eq i64 %143, %73
  br i1 %144, label %131, label %135, !llvm.loop !49

145:                                              ; preds = %131
  %146 = sub nsw i64 %71, %133
  br label %248

147:                                              ; preds = %69
  %148 = icmp eq i64 %73, 1
  %149 = getelementptr i32, ptr %70, i64 %72
  br i1 %148, label %150, label %166

150:                                              ; preds = %147
  %151 = getelementptr inbounds i32, ptr %149, i64 -1
  %152 = load i32, ptr %151, align 4, !tbaa !5
  %153 = ptrtoint ptr %151 to i64
  %154 = ptrtoint ptr %70 to i64
  %155 = sub i64 %153, %154
  %156 = ashr exact i64 %155, 2
  %157 = icmp sgt i64 %156, 1
  br i1 %157, label %158, label %161, !prof !31

158:                                              ; preds = %150
  %159 = sub nsw i64 0, %156
  %160 = getelementptr inbounds i32, ptr %149, i64 %159
  tail call void @llvm.memmove.p0.p0.i64(ptr nonnull align 4 %160, ptr nonnull align 4 %70, i64 %155, i1 false)
  br label %165

161:                                              ; preds = %150
  %162 = icmp eq i64 %155, 4
  br i1 %162, label %163, label %165

163:                                              ; preds = %161
  %164 = load i32, ptr %70, align 4, !tbaa !5
  store i32 %164, ptr %151, align 4, !tbaa !5
  br label %165

165:                                              ; preds = %158, %161, %163
  store i32 %152, ptr %70, align 4, !tbaa !5
  br label %274

166:                                              ; preds = %147
  %167 = sub i64 0, %73
  %168 = getelementptr i32, ptr %149, i64 %167
  %169 = icmp sgt i64 %71, 0
  br i1 %169, label %170, label %244

170:                                              ; preds = %166
  %171 = icmp ult i64 %71, 32
  br i1 %171, label %220, label %172

172:                                              ; preds = %170
  %173 = add nsw i64 %71, -1
  %174 = getelementptr i8, ptr %70, i64 -4
  %175 = shl i64 %71, 2
  %176 = getelementptr i8, ptr %174, i64 %175
  %177 = mul i64 %173, -4
  %178 = getelementptr i8, ptr %176, i64 %177
  %179 = icmp ugt ptr %178, %176
  %180 = getelementptr i8, ptr %70, i64 -4
  %181 = shl i64 %72, 2
  %182 = getelementptr i8, ptr %180, i64 %181
  %183 = mul i64 %173, -4
  %184 = icmp ugt i64 %173, 4611686018427387903
  %185 = getelementptr i8, ptr %182, i64 %183
  %186 = icmp ugt ptr %185, %182
  %187 = or i1 %186, %184
  %188 = or i1 %179, %187
  br i1 %188, label %220, label %189

189:                                              ; preds = %172
  %190 = sub i64 %72, %71
  %191 = shl i64 %190, 2
  %192 = getelementptr i8, ptr %70, i64 %191
  %193 = icmp ult ptr %70, %149
  %194 = icmp ult ptr %192, %168
  %195 = and i1 %193, %194
  br i1 %195, label %220, label %196

196:                                              ; preds = %189
  %197 = and i64 %71, 9223372036854775800
  %198 = mul i64 %197, -4
  %199 = getelementptr i8, ptr %149, i64 %198
  %200 = mul i64 %197, -4
  %201 = getelementptr i8, ptr %168, i64 %200
  br label %202

202:                                              ; preds = %202, %196
  %203 = phi i64 [ 0, %196 ], [ %216, %202 ]
  %204 = mul i64 %203, -4
  %205 = getelementptr i8, ptr %149, i64 %204
  %206 = mul i64 %203, -4
  %207 = getelementptr i8, ptr %168, i64 %206
  %208 = getelementptr inbounds i32, ptr %207, i64 -4
  %209 = getelementptr inbounds i32, ptr %207, i64 -8
  %210 = load <4 x i32>, ptr %208, align 4, !tbaa !5, !alias.scope !50, !noalias !53
  %211 = load <4 x i32>, ptr %209, align 4, !tbaa !5, !alias.scope !50, !noalias !53
  %212 = getelementptr inbounds i32, ptr %205, i64 -4
  %213 = getelementptr inbounds i32, ptr %205, i64 -8
  %214 = load <4 x i32>, ptr %212, align 4, !tbaa !5, !alias.scope !53
  %215 = load <4 x i32>, ptr %213, align 4, !tbaa !5, !alias.scope !53
  store <4 x i32> %214, ptr %208, align 4, !tbaa !5, !alias.scope !50, !noalias !53
  store <4 x i32> %215, ptr %209, align 4, !tbaa !5, !alias.scope !50, !noalias !53
  store <4 x i32> %210, ptr %212, align 4, !tbaa !5, !alias.scope !53
  store <4 x i32> %211, ptr %213, align 4, !tbaa !5, !alias.scope !53
  %216 = add nuw i64 %203, 8
  %217 = icmp eq i64 %216, %197
  br i1 %217, label %218, label %202, !llvm.loop !55

218:                                              ; preds = %202
  %219 = icmp eq i64 %71, %197
  br i1 %219, label %244, label %220

220:                                              ; preds = %189, %172, %170, %218
  %221 = phi i64 [ 0, %189 ], [ 0, %172 ], [ 0, %170 ], [ %197, %218 ]
  %222 = phi ptr [ %149, %189 ], [ %149, %172 ], [ %149, %170 ], [ %199, %218 ]
  %223 = phi ptr [ %168, %189 ], [ %168, %172 ], [ %168, %170 ], [ %201, %218 ]
  %224 = and i64 %71, 3
  %225 = icmp eq i64 %224, 0
  br i1 %225, label %238, label %226

226:                                              ; preds = %220, %226
  %227 = phi i64 [ %235, %226 ], [ %221, %220 ]
  %228 = phi ptr [ %232, %226 ], [ %222, %220 ]
  %229 = phi ptr [ %231, %226 ], [ %223, %220 ]
  %230 = phi i64 [ %236, %226 ], [ 0, %220 ]
  %231 = getelementptr inbounds i32, ptr %229, i64 -1
  %232 = getelementptr inbounds i32, ptr %228, i64 -1
  %233 = load i32, ptr %231, align 4, !tbaa !5
  %234 = load i32, ptr %232, align 4, !tbaa !5
  store i32 %234, ptr %231, align 4, !tbaa !5
  store i32 %233, ptr %232, align 4, !tbaa !5
  %235 = add nuw nsw i64 %227, 1
  %236 = add i64 %230, 1
  %237 = icmp eq i64 %236, %224
  br i1 %237, label %238, label %226, !llvm.loop !56

238:                                              ; preds = %226, %220
  %239 = phi i64 [ %221, %220 ], [ %235, %226 ]
  %240 = phi ptr [ %222, %220 ], [ %232, %226 ]
  %241 = phi ptr [ %223, %220 ], [ %231, %226 ]
  %242 = sub nsw i64 %221, %71
  %243 = icmp ugt i64 %242, -4
  br i1 %243, label %244, label %252

244:                                              ; preds = %238, %252, %218, %166
  %245 = phi ptr [ %168, %166 ], [ %70, %218 ], [ %70, %252 ], [ %70, %238 ]
  %246 = srem i64 %72, %73
  %247 = icmp eq i64 %246, 0
  br i1 %247, label %274, label %248

248:                                              ; preds = %244, %145
  %249 = phi ptr [ %132, %145 ], [ %245, %244 ]
  %250 = phi i64 [ %146, %145 ], [ %246, %244 ]
  %251 = phi i64 [ %71, %145 ], [ %73, %244 ]
  br label %69, !llvm.loop !58

252:                                              ; preds = %238, %252
  %253 = phi i64 [ %272, %252 ], [ %239, %238 ]
  %254 = phi ptr [ %269, %252 ], [ %240, %238 ]
  %255 = phi ptr [ %268, %252 ], [ %241, %238 ]
  %256 = getelementptr inbounds i32, ptr %255, i64 -1
  %257 = getelementptr inbounds i32, ptr %254, i64 -1
  %258 = load i32, ptr %256, align 4, !tbaa !5
  %259 = load i32, ptr %257, align 4, !tbaa !5
  store i32 %259, ptr %256, align 4, !tbaa !5
  store i32 %258, ptr %257, align 4, !tbaa !5
  %260 = getelementptr inbounds i32, ptr %255, i64 -2
  %261 = getelementptr inbounds i32, ptr %254, i64 -2
  %262 = load i32, ptr %260, align 4, !tbaa !5
  %263 = load i32, ptr %261, align 4, !tbaa !5
  store i32 %263, ptr %260, align 4, !tbaa !5
  store i32 %262, ptr %261, align 4, !tbaa !5
  %264 = getelementptr inbounds i32, ptr %255, i64 -3
  %265 = getelementptr inbounds i32, ptr %254, i64 -3
  %266 = load i32, ptr %264, align 4, !tbaa !5
  %267 = load i32, ptr %265, align 4, !tbaa !5
  store i32 %267, ptr %264, align 4, !tbaa !5
  store i32 %266, ptr %265, align 4, !tbaa !5
  %268 = getelementptr inbounds i32, ptr %255, i64 -4
  %269 = getelementptr inbounds i32, ptr %254, i64 -4
  %270 = load i32, ptr %268, align 4, !tbaa !5
  %271 = load i32, ptr %269, align 4, !tbaa !5
  store i32 %271, ptr %268, align 4, !tbaa !5
  store i32 %270, ptr %269, align 4, !tbaa !5
  %272 = add nuw nsw i64 %253, 4
  %273 = icmp eq i64 %272, %71
  br i1 %273, label %244, label %252, !llvm.loop !59

274:                                              ; preds = %244, %131, %58, %53, %165, %89, %5, %3
  %275 = phi ptr [ %2, %3 ], [ %0, %5 ], [ %68, %165 ], [ %68, %89 ], [ %1, %53 ], [ %1, %58 ], [ %68, %131 ], [ %68, %244 ]
  ret ptr %275
}

declare noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo9_M_insertImEERSoT_(ptr noundef nonnull align 8 dereferenceable(8), i64 noundef) local_unnamed_addr #6

declare noundef nonnull align 8 dereferenceable(8) ptr @_ZSt16__ostream_insertIcSt11char_traitsIcEERSt13basic_ostreamIT_T0_ES6_PKS3_l(ptr noundef nonnull align 8 dereferenceable(8), ptr noundef, i64 noundef) local_unnamed_addr #6

declare noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo3putEc(ptr noundef nonnull align 8 dereferenceable(8), i8 noundef signext) local_unnamed_addr #6

; Function Attrs: nocallback nofree nounwind willreturn memory(argmem: write)
declare void @llvm.memset.p0.i64(ptr nocapture writeonly, i8, i64, i1 immarg) #7

attributes #0 = { mustprogress norecurse uwtable "min-legal-vector-width"="0" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #1 = { mustprogress nocallback nofree nosync nounwind willreturn memory(argmem: readwrite) }
attributes #2 = { nobuiltin allocsize(0) "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #3 = { nobuiltin nounwind "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #4 = { mustprogress uwtable "min-legal-vector-width"="0" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #5 = { mustprogress nocallback nofree nounwind willreturn memory(argmem: readwrite) }
attributes #6 = { "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #7 = { nocallback nofree nounwind willreturn memory(argmem: write) }
attributes #8 = { builtin allocsize(0) }
attributes #9 = { builtin nounwind }

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
!13 = !{!7, !7, i64 0}
!14 = !{!15, !15, i64 0}
!15 = !{!"vtable pointer", !8, i64 0}
!16 = !{!17, !18, i64 16}
!17 = !{!"_ZTSSt8ios_base", !18, i64 8, !18, i64 16, !19, i64 24, !20, i64 28, !20, i64 32, !21, i64 40, !22, i64 48, !7, i64 64, !6, i64 192, !21, i64 200, !23, i64 208}
!18 = !{!"long", !7, i64 0}
!19 = !{!"_ZTSSt13_Ios_Fmtflags", !7, i64 0}
!20 = !{!"_ZTSSt12_Ios_Iostate", !7, i64 0}
!21 = !{!"any pointer", !7, i64 0}
!22 = !{!"_ZTSNSt8ios_base6_WordsE", !21, i64 0, !18, i64 8}
!23 = !{!"_ZTSSt6locale", !21, i64 0}
!24 = distinct !{!24, !10}
!25 = distinct !{!25, !10}
!26 = distinct !{!26, !10}
!27 = distinct !{!27, !10}
!28 = distinct !{!28, !10}
!29 = distinct !{!29, !10}
!30 = distinct !{!30, !10}
!31 = !{!"branch_weights", i32 2000, i32 1}
!32 = distinct !{!32, !10}
!33 = distinct !{!33, !10}
!34 = distinct !{!34, !10}
!35 = distinct !{!35, !10}
!36 = !{!37}
!37 = distinct !{!37, !38}
!38 = distinct !{!38, !"LVerDomain"}
!39 = !{!40}
!40 = distinct !{!40, !38}
!41 = distinct !{!41, !10, !11, !12}
!42 = distinct !{!42, !10, !11}
!43 = !{!44}
!44 = distinct !{!44, !45}
!45 = distinct !{!45, !"LVerDomain"}
!46 = !{!47}
!47 = distinct !{!47, !45}
!48 = distinct !{!48, !10, !11, !12}
!49 = distinct !{!49, !10, !11}
!50 = !{!51}
!51 = distinct !{!51, !52}
!52 = distinct !{!52, !"LVerDomain"}
!53 = !{!54}
!54 = distinct !{!54, !52}
!55 = distinct !{!55, !10, !11, !12}
!56 = distinct !{!56, !57}
!57 = !{!"llvm.loop.unroll.disable"}
!58 = distinct !{!58, !10}
!59 = distinct !{!59, !10, !11}
