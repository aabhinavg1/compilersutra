; ModuleID = '/home/aitr/compilersutra/FixIt_Compilersutra/static/files/articles/gcc_vs_clang_cases/bit_mix.cpp'
source_filename = "/home/aitr/compilersutra/FixIt_Compilersutra/static/files/articles/gcc_vs_clang_cases/bit_mix.cpp"
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
define dso_local noundef i32 @main() local_unnamed_addr #0 {
  %1 = alloca i8, align 1
  br label %198

2:                                                ; preds = %189
  %3 = call noundef nonnull align 8 dereferenceable(8) ptr @_ZSt16__ostream_insertIcSt11char_traitsIcEERSt13basic_ostreamIT_T0_ES6_PKS3_l(ptr noundef nonnull align 8 dereferenceable(8) %190, ptr noundef nonnull %1, i64 noundef 1)
  br label %6

4:                                                ; preds = %189
  %5 = tail call noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo3putEc(ptr noundef nonnull align 8 dereferenceable(8) %190, i8 noundef signext 10)
  br label %6

6:                                                ; preds = %2, %4
  call void @llvm.lifetime.end.p0(i64 1, ptr nonnull %1)
  ret i32 0

7:                                                ; preds = %198, %7
  %8 = phi i64 [ %31, %7 ], [ 0, %198 ]
  %9 = phi i64 [ %30, %7 ], [ %221, %198 ]
  %10 = add i64 %8, %9
  %11 = lshr i64 %10, 33
  %12 = xor i64 %11, %10
  %13 = mul i64 %12, -49064778989728563
  %14 = lshr i64 %13, 33
  %15 = xor i64 %14, %13
  %16 = mul i64 %15, -4265267296055464877
  %17 = lshr i64 %16, 33
  %18 = xor i64 %17, %16
  %19 = add i64 %18, %9
  %20 = or disjoint i64 %8, 1
  %21 = add i64 %20, %19
  %22 = lshr i64 %21, 33
  %23 = xor i64 %22, %21
  %24 = mul i64 %23, -49064778989728563
  %25 = lshr i64 %24, 33
  %26 = xor i64 %25, %24
  %27 = mul i64 %26, -4265267296055464877
  %28 = lshr i64 %27, 33
  %29 = xor i64 %28, %27
  %30 = add i64 %29, %19
  %31 = add nuw nsw i64 %8, 2
  %32 = icmp eq i64 %31, 16777216
  br i1 %32, label %33, label %7, !llvm.loop !5

33:                                               ; preds = %7, %33
  %34 = phi i64 [ %57, %33 ], [ 0, %7 ]
  %35 = phi i64 [ %56, %33 ], [ %30, %7 ]
  %36 = add i64 %34, %35
  %37 = lshr i64 %36, 33
  %38 = xor i64 %37, %36
  %39 = mul i64 %38, -49064778989728563
  %40 = lshr i64 %39, 33
  %41 = xor i64 %40, %39
  %42 = mul i64 %41, -4265267296055464877
  %43 = lshr i64 %42, 33
  %44 = xor i64 %43, %42
  %45 = add i64 %44, %35
  %46 = or disjoint i64 %34, 1
  %47 = add i64 %46, %45
  %48 = lshr i64 %47, 33
  %49 = xor i64 %48, %47
  %50 = mul i64 %49, -49064778989728563
  %51 = lshr i64 %50, 33
  %52 = xor i64 %51, %50
  %53 = mul i64 %52, -4265267296055464877
  %54 = lshr i64 %53, 33
  %55 = xor i64 %54, %53
  %56 = add i64 %55, %45
  %57 = add nuw nsw i64 %34, 2
  %58 = icmp eq i64 %57, 16777216
  br i1 %58, label %59, label %33, !llvm.loop !5

59:                                               ; preds = %33, %59
  %60 = phi i64 [ %83, %59 ], [ 0, %33 ]
  %61 = phi i64 [ %82, %59 ], [ %56, %33 ]
  %62 = add i64 %60, %61
  %63 = lshr i64 %62, 33
  %64 = xor i64 %63, %62
  %65 = mul i64 %64, -49064778989728563
  %66 = lshr i64 %65, 33
  %67 = xor i64 %66, %65
  %68 = mul i64 %67, -4265267296055464877
  %69 = lshr i64 %68, 33
  %70 = xor i64 %69, %68
  %71 = add i64 %70, %61
  %72 = or disjoint i64 %60, 1
  %73 = add i64 %72, %71
  %74 = lshr i64 %73, 33
  %75 = xor i64 %74, %73
  %76 = mul i64 %75, -49064778989728563
  %77 = lshr i64 %76, 33
  %78 = xor i64 %77, %76
  %79 = mul i64 %78, -4265267296055464877
  %80 = lshr i64 %79, 33
  %81 = xor i64 %80, %79
  %82 = add i64 %81, %71
  %83 = add nuw nsw i64 %60, 2
  %84 = icmp eq i64 %83, 16777216
  br i1 %84, label %85, label %59, !llvm.loop !5

85:                                               ; preds = %59, %85
  %86 = phi i64 [ %109, %85 ], [ 0, %59 ]
  %87 = phi i64 [ %108, %85 ], [ %82, %59 ]
  %88 = add i64 %86, %87
  %89 = lshr i64 %88, 33
  %90 = xor i64 %89, %88
  %91 = mul i64 %90, -49064778989728563
  %92 = lshr i64 %91, 33
  %93 = xor i64 %92, %91
  %94 = mul i64 %93, -4265267296055464877
  %95 = lshr i64 %94, 33
  %96 = xor i64 %95, %94
  %97 = add i64 %96, %87
  %98 = or disjoint i64 %86, 1
  %99 = add i64 %98, %97
  %100 = lshr i64 %99, 33
  %101 = xor i64 %100, %99
  %102 = mul i64 %101, -49064778989728563
  %103 = lshr i64 %102, 33
  %104 = xor i64 %103, %102
  %105 = mul i64 %104, -4265267296055464877
  %106 = lshr i64 %105, 33
  %107 = xor i64 %106, %105
  %108 = add i64 %107, %97
  %109 = add nuw nsw i64 %86, 2
  %110 = icmp eq i64 %109, 16777216
  br i1 %110, label %111, label %85, !llvm.loop !5

111:                                              ; preds = %85, %111
  %112 = phi i64 [ %135, %111 ], [ 0, %85 ]
  %113 = phi i64 [ %134, %111 ], [ %108, %85 ]
  %114 = add i64 %112, %113
  %115 = lshr i64 %114, 33
  %116 = xor i64 %115, %114
  %117 = mul i64 %116, -49064778989728563
  %118 = lshr i64 %117, 33
  %119 = xor i64 %118, %117
  %120 = mul i64 %119, -4265267296055464877
  %121 = lshr i64 %120, 33
  %122 = xor i64 %121, %120
  %123 = add i64 %122, %113
  %124 = or disjoint i64 %112, 1
  %125 = add i64 %124, %123
  %126 = lshr i64 %125, 33
  %127 = xor i64 %126, %125
  %128 = mul i64 %127, -49064778989728563
  %129 = lshr i64 %128, 33
  %130 = xor i64 %129, %128
  %131 = mul i64 %130, -4265267296055464877
  %132 = lshr i64 %131, 33
  %133 = xor i64 %132, %131
  %134 = add i64 %133, %123
  %135 = add nuw nsw i64 %112, 2
  %136 = icmp eq i64 %135, 16777216
  br i1 %136, label %137, label %111, !llvm.loop !5

137:                                              ; preds = %111, %137
  %138 = phi i64 [ %161, %137 ], [ 0, %111 ]
  %139 = phi i64 [ %160, %137 ], [ %134, %111 ]
  %140 = add i64 %138, %139
  %141 = lshr i64 %140, 33
  %142 = xor i64 %141, %140
  %143 = mul i64 %142, -49064778989728563
  %144 = lshr i64 %143, 33
  %145 = xor i64 %144, %143
  %146 = mul i64 %145, -4265267296055464877
  %147 = lshr i64 %146, 33
  %148 = xor i64 %147, %146
  %149 = add i64 %148, %139
  %150 = or disjoint i64 %138, 1
  %151 = add i64 %150, %149
  %152 = lshr i64 %151, 33
  %153 = xor i64 %152, %151
  %154 = mul i64 %153, -49064778989728563
  %155 = lshr i64 %154, 33
  %156 = xor i64 %155, %154
  %157 = mul i64 %156, -4265267296055464877
  %158 = lshr i64 %157, 33
  %159 = xor i64 %158, %157
  %160 = add i64 %159, %149
  %161 = add nuw nsw i64 %138, 2
  %162 = icmp eq i64 %161, 16777216
  br i1 %162, label %163, label %137, !llvm.loop !5

163:                                              ; preds = %137, %163
  %164 = phi i64 [ %187, %163 ], [ 0, %137 ]
  %165 = phi i64 [ %186, %163 ], [ %160, %137 ]
  %166 = add i64 %164, %165
  %167 = lshr i64 %166, 33
  %168 = xor i64 %167, %166
  %169 = mul i64 %168, -49064778989728563
  %170 = lshr i64 %169, 33
  %171 = xor i64 %170, %169
  %172 = mul i64 %171, -4265267296055464877
  %173 = lshr i64 %172, 33
  %174 = xor i64 %173, %172
  %175 = add i64 %174, %165
  %176 = or disjoint i64 %164, 1
  %177 = add i64 %176, %175
  %178 = lshr i64 %177, 33
  %179 = xor i64 %178, %177
  %180 = mul i64 %179, -49064778989728563
  %181 = lshr i64 %180, 33
  %182 = xor i64 %181, %180
  %183 = mul i64 %182, -4265267296055464877
  %184 = lshr i64 %183, 33
  %185 = xor i64 %184, %183
  %186 = add i64 %185, %175
  %187 = add nuw nsw i64 %164, 2
  %188 = icmp eq i64 %187, 16777216
  br i1 %188, label %189, label %163, !llvm.loop !5

189:                                              ; preds = %163
  %190 = tail call noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo9_M_insertImEERSoT_(ptr noundef nonnull align 8 dereferenceable(8) @_ZSt4cout, i64 noundef %186)
  call void @llvm.lifetime.start.p0(i64 1, ptr nonnull %1)
  store i8 10, ptr %1, align 1, !tbaa !7
  %191 = load ptr, ptr %190, align 8, !tbaa !10
  %192 = getelementptr i8, ptr %191, i64 -24
  %193 = load i64, ptr %192, align 8
  %194 = getelementptr inbounds i8, ptr %190, i64 %193
  %195 = getelementptr inbounds %"class.std::ios_base", ptr %194, i64 0, i32 2
  %196 = load i64, ptr %195, align 8, !tbaa !12
  %197 = icmp eq i64 %196, 0
  br i1 %197, label %4, label %2

198:                                              ; preds = %198, %0
  %199 = phi i64 [ 0, %0 ], [ %222, %198 ]
  %200 = phi i64 [ 1311768467463790320, %0 ], [ %221, %198 ]
  %201 = add i64 %199, %200
  %202 = lshr i64 %201, 33
  %203 = xor i64 %202, %201
  %204 = mul i64 %203, -49064778989728563
  %205 = lshr i64 %204, 33
  %206 = xor i64 %205, %204
  %207 = mul i64 %206, -4265267296055464877
  %208 = lshr i64 %207, 33
  %209 = xor i64 %208, %207
  %210 = add i64 %209, %200
  %211 = or disjoint i64 %199, 1
  %212 = add i64 %211, %210
  %213 = lshr i64 %212, 33
  %214 = xor i64 %213, %212
  %215 = mul i64 %214, -49064778989728563
  %216 = lshr i64 %215, 33
  %217 = xor i64 %216, %215
  %218 = mul i64 %217, -4265267296055464877
  %219 = lshr i64 %218, 33
  %220 = xor i64 %219, %218
  %221 = add i64 %220, %210
  %222 = add nuw nsw i64 %199, 2
  %223 = icmp eq i64 %222, 16777216
  br i1 %223, label %7, label %198, !llvm.loop !5
}

declare noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo9_M_insertImEERSoT_(ptr noundef nonnull align 8 dereferenceable(8), i64 noundef) local_unnamed_addr #1

declare noundef nonnull align 8 dereferenceable(8) ptr @_ZSt16__ostream_insertIcSt11char_traitsIcEERSt13basic_ostreamIT_T0_ES6_PKS3_l(ptr noundef nonnull align 8 dereferenceable(8), ptr noundef, i64 noundef) local_unnamed_addr #1

declare noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo3putEc(ptr noundef nonnull align 8 dereferenceable(8), i8 noundef signext) local_unnamed_addr #1

; Function Attrs: nocallback nofree nosync nounwind willreturn memory(argmem: readwrite)
declare void @llvm.lifetime.start.p0(i64 immarg, ptr nocapture) #2

; Function Attrs: nocallback nofree nosync nounwind willreturn memory(argmem: readwrite)
declare void @llvm.lifetime.end.p0(i64 immarg, ptr nocapture) #2

attributes #0 = { mustprogress norecurse uwtable "min-legal-vector-width"="0" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #1 = { "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #2 = { nocallback nofree nosync nounwind willreturn memory(argmem: readwrite) }

!llvm.module.flags = !{!0, !1, !2, !3}
!llvm.ident = !{!4}

!0 = !{i32 1, !"wchar_size", i32 4}
!1 = !{i32 8, !"PIC Level", i32 2}
!2 = !{i32 7, !"PIE Level", i32 2}
!3 = !{i32 7, !"uwtable", i32 2}
!4 = !{!"Ubuntu clang version 18.1.3 (1ubuntu1)"}
!5 = distinct !{!5, !6}
!6 = !{!"llvm.loop.mustprogress"}
!7 = !{!8, !8, i64 0}
!8 = !{!"omnipotent char", !9, i64 0}
!9 = !{!"Simple C++ TBAA"}
!10 = !{!11, !11, i64 0}
!11 = !{!"vtable pointer", !9, i64 0}
!12 = !{!13, !14, i64 16}
!13 = !{!"_ZTSSt8ios_base", !14, i64 8, !14, i64 16, !15, i64 24, !16, i64 28, !16, i64 32, !17, i64 40, !18, i64 48, !8, i64 64, !19, i64 192, !17, i64 200, !20, i64 208}
!14 = !{!"long", !8, i64 0}
!15 = !{!"_ZTSSt13_Ios_Fmtflags", !8, i64 0}
!16 = !{!"_ZTSSt12_Ios_Iostate", !8, i64 0}
!17 = !{!"any pointer", !8, i64 0}
!18 = !{!"_ZTSNSt8ios_base6_WordsE", !17, i64 0, !14, i64 8}
!19 = !{!"int", !8, i64 0}
!20 = !{!"_ZTSSt6locale", !17, i64 0}
