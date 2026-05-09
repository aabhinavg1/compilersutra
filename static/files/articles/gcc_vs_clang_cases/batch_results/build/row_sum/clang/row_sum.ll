; ModuleID = '/home/aitr/compilersutra/FixIt_Compilersutra/static/files/articles/gcc_vs_clang_cases/row_sum.cpp'
source_filename = "/home/aitr/compilersutra/FixIt_Compilersutra/static/files/articles/gcc_vs_clang_cases/row_sum.cpp"
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
  %2 = tail call noalias noundef nonnull dereferenceable(16777216) ptr @_Znwm(i64 noundef 16777216) #5
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
  %21 = icmp eq i64 %20, 4194304
  br i1 %21, label %22, label %3, !llvm.loop !9

22:                                               ; preds = %3, %253
  %23 = phi i64 [ %254, %253 ], [ 0, %3 ]
  %24 = phi double [ %277, %253 ], [ 0.000000e+00, %3 ]
  %25 = shl nuw nsw i64 %23, 11
  %26 = getelementptr float, ptr %2, i64 %25
  br label %256

27:                                               ; preds = %253, %56
  %28 = phi i64 [ %57, %56 ], [ 0, %253 ]
  %29 = phi double [ %53, %56 ], [ %277, %253 ]
  %30 = shl nuw nsw i64 %28, 11
  %31 = getelementptr float, ptr %2, i64 %30
  br label %32

32:                                               ; preds = %32, %27
  %33 = phi i64 [ 0, %27 ], [ %54, %32 ]
  %34 = phi double [ %29, %27 ], [ %53, %32 ]
  %35 = getelementptr float, ptr %31, i64 %33
  %36 = load float, ptr %35, align 4, !tbaa !5
  %37 = fpext float %36 to double
  %38 = fadd double %34, %37
  %39 = or disjoint i64 %33, 1
  %40 = getelementptr float, ptr %31, i64 %39
  %41 = load float, ptr %40, align 4, !tbaa !5
  %42 = fpext float %41 to double
  %43 = fadd double %38, %42
  %44 = or disjoint i64 %33, 2
  %45 = getelementptr float, ptr %31, i64 %44
  %46 = load float, ptr %45, align 4, !tbaa !5
  %47 = fpext float %46 to double
  %48 = fadd double %43, %47
  %49 = or disjoint i64 %33, 3
  %50 = getelementptr float, ptr %31, i64 %49
  %51 = load float, ptr %50, align 4, !tbaa !5
  %52 = fpext float %51 to double
  %53 = fadd double %48, %52
  %54 = add nuw nsw i64 %33, 4
  %55 = icmp eq i64 %54, 2048
  br i1 %55, label %56, label %32, !llvm.loop !13

56:                                               ; preds = %32
  %57 = add nuw nsw i64 %28, 1
  %58 = icmp eq i64 %57, 2048
  br i1 %58, label %59, label %27, !llvm.loop !14

59:                                               ; preds = %56, %88
  %60 = phi i64 [ %89, %88 ], [ 0, %56 ]
  %61 = phi double [ %85, %88 ], [ %53, %56 ]
  %62 = shl nuw nsw i64 %60, 11
  %63 = getelementptr float, ptr %2, i64 %62
  br label %64

64:                                               ; preds = %64, %59
  %65 = phi i64 [ 0, %59 ], [ %86, %64 ]
  %66 = phi double [ %61, %59 ], [ %85, %64 ]
  %67 = getelementptr float, ptr %63, i64 %65
  %68 = load float, ptr %67, align 4, !tbaa !5
  %69 = fpext float %68 to double
  %70 = fadd double %66, %69
  %71 = or disjoint i64 %65, 1
  %72 = getelementptr float, ptr %63, i64 %71
  %73 = load float, ptr %72, align 4, !tbaa !5
  %74 = fpext float %73 to double
  %75 = fadd double %70, %74
  %76 = or disjoint i64 %65, 2
  %77 = getelementptr float, ptr %63, i64 %76
  %78 = load float, ptr %77, align 4, !tbaa !5
  %79 = fpext float %78 to double
  %80 = fadd double %75, %79
  %81 = or disjoint i64 %65, 3
  %82 = getelementptr float, ptr %63, i64 %81
  %83 = load float, ptr %82, align 4, !tbaa !5
  %84 = fpext float %83 to double
  %85 = fadd double %80, %84
  %86 = add nuw nsw i64 %65, 4
  %87 = icmp eq i64 %86, 2048
  br i1 %87, label %88, label %64, !llvm.loop !13

88:                                               ; preds = %64
  %89 = add nuw nsw i64 %60, 1
  %90 = icmp eq i64 %89, 2048
  br i1 %90, label %91, label %59, !llvm.loop !14

91:                                               ; preds = %88, %120
  %92 = phi i64 [ %121, %120 ], [ 0, %88 ]
  %93 = phi double [ %117, %120 ], [ %85, %88 ]
  %94 = shl nuw nsw i64 %92, 11
  %95 = getelementptr float, ptr %2, i64 %94
  br label %96

96:                                               ; preds = %96, %91
  %97 = phi i64 [ 0, %91 ], [ %118, %96 ]
  %98 = phi double [ %93, %91 ], [ %117, %96 ]
  %99 = getelementptr float, ptr %95, i64 %97
  %100 = load float, ptr %99, align 4, !tbaa !5
  %101 = fpext float %100 to double
  %102 = fadd double %98, %101
  %103 = or disjoint i64 %97, 1
  %104 = getelementptr float, ptr %95, i64 %103
  %105 = load float, ptr %104, align 4, !tbaa !5
  %106 = fpext float %105 to double
  %107 = fadd double %102, %106
  %108 = or disjoint i64 %97, 2
  %109 = getelementptr float, ptr %95, i64 %108
  %110 = load float, ptr %109, align 4, !tbaa !5
  %111 = fpext float %110 to double
  %112 = fadd double %107, %111
  %113 = or disjoint i64 %97, 3
  %114 = getelementptr float, ptr %95, i64 %113
  %115 = load float, ptr %114, align 4, !tbaa !5
  %116 = fpext float %115 to double
  %117 = fadd double %112, %116
  %118 = add nuw nsw i64 %97, 4
  %119 = icmp eq i64 %118, 2048
  br i1 %119, label %120, label %96, !llvm.loop !13

120:                                              ; preds = %96
  %121 = add nuw nsw i64 %92, 1
  %122 = icmp eq i64 %121, 2048
  br i1 %122, label %123, label %91, !llvm.loop !14

123:                                              ; preds = %120, %152
  %124 = phi i64 [ %153, %152 ], [ 0, %120 ]
  %125 = phi double [ %149, %152 ], [ %117, %120 ]
  %126 = shl nuw nsw i64 %124, 11
  %127 = getelementptr float, ptr %2, i64 %126
  br label %128

128:                                              ; preds = %128, %123
  %129 = phi i64 [ 0, %123 ], [ %150, %128 ]
  %130 = phi double [ %125, %123 ], [ %149, %128 ]
  %131 = getelementptr float, ptr %127, i64 %129
  %132 = load float, ptr %131, align 4, !tbaa !5
  %133 = fpext float %132 to double
  %134 = fadd double %130, %133
  %135 = or disjoint i64 %129, 1
  %136 = getelementptr float, ptr %127, i64 %135
  %137 = load float, ptr %136, align 4, !tbaa !5
  %138 = fpext float %137 to double
  %139 = fadd double %134, %138
  %140 = or disjoint i64 %129, 2
  %141 = getelementptr float, ptr %127, i64 %140
  %142 = load float, ptr %141, align 4, !tbaa !5
  %143 = fpext float %142 to double
  %144 = fadd double %139, %143
  %145 = or disjoint i64 %129, 3
  %146 = getelementptr float, ptr %127, i64 %145
  %147 = load float, ptr %146, align 4, !tbaa !5
  %148 = fpext float %147 to double
  %149 = fadd double %144, %148
  %150 = add nuw nsw i64 %129, 4
  %151 = icmp eq i64 %150, 2048
  br i1 %151, label %152, label %128, !llvm.loop !13

152:                                              ; preds = %128
  %153 = add nuw nsw i64 %124, 1
  %154 = icmp eq i64 %153, 2048
  br i1 %154, label %155, label %123, !llvm.loop !14

155:                                              ; preds = %152, %184
  %156 = phi i64 [ %185, %184 ], [ 0, %152 ]
  %157 = phi double [ %181, %184 ], [ %149, %152 ]
  %158 = shl nuw nsw i64 %156, 11
  %159 = getelementptr float, ptr %2, i64 %158
  br label %160

160:                                              ; preds = %160, %155
  %161 = phi i64 [ 0, %155 ], [ %182, %160 ]
  %162 = phi double [ %157, %155 ], [ %181, %160 ]
  %163 = getelementptr float, ptr %159, i64 %161
  %164 = load float, ptr %163, align 4, !tbaa !5
  %165 = fpext float %164 to double
  %166 = fadd double %162, %165
  %167 = or disjoint i64 %161, 1
  %168 = getelementptr float, ptr %159, i64 %167
  %169 = load float, ptr %168, align 4, !tbaa !5
  %170 = fpext float %169 to double
  %171 = fadd double %166, %170
  %172 = or disjoint i64 %161, 2
  %173 = getelementptr float, ptr %159, i64 %172
  %174 = load float, ptr %173, align 4, !tbaa !5
  %175 = fpext float %174 to double
  %176 = fadd double %171, %175
  %177 = or disjoint i64 %161, 3
  %178 = getelementptr float, ptr %159, i64 %177
  %179 = load float, ptr %178, align 4, !tbaa !5
  %180 = fpext float %179 to double
  %181 = fadd double %176, %180
  %182 = add nuw nsw i64 %161, 4
  %183 = icmp eq i64 %182, 2048
  br i1 %183, label %184, label %160, !llvm.loop !13

184:                                              ; preds = %160
  %185 = add nuw nsw i64 %156, 1
  %186 = icmp eq i64 %185, 2048
  br i1 %186, label %187, label %155, !llvm.loop !14

187:                                              ; preds = %184, %216
  %188 = phi i64 [ %217, %216 ], [ 0, %184 ]
  %189 = phi double [ %213, %216 ], [ %181, %184 ]
  %190 = shl nuw nsw i64 %188, 11
  %191 = getelementptr float, ptr %2, i64 %190
  br label %192

192:                                              ; preds = %192, %187
  %193 = phi i64 [ 0, %187 ], [ %214, %192 ]
  %194 = phi double [ %189, %187 ], [ %213, %192 ]
  %195 = getelementptr float, ptr %191, i64 %193
  %196 = load float, ptr %195, align 4, !tbaa !5
  %197 = fpext float %196 to double
  %198 = fadd double %194, %197
  %199 = or disjoint i64 %193, 1
  %200 = getelementptr float, ptr %191, i64 %199
  %201 = load float, ptr %200, align 4, !tbaa !5
  %202 = fpext float %201 to double
  %203 = fadd double %198, %202
  %204 = or disjoint i64 %193, 2
  %205 = getelementptr float, ptr %191, i64 %204
  %206 = load float, ptr %205, align 4, !tbaa !5
  %207 = fpext float %206 to double
  %208 = fadd double %203, %207
  %209 = or disjoint i64 %193, 3
  %210 = getelementptr float, ptr %191, i64 %209
  %211 = load float, ptr %210, align 4, !tbaa !5
  %212 = fpext float %211 to double
  %213 = fadd double %208, %212
  %214 = add nuw nsw i64 %193, 4
  %215 = icmp eq i64 %214, 2048
  br i1 %215, label %216, label %192, !llvm.loop !13

216:                                              ; preds = %192
  %217 = add nuw nsw i64 %188, 1
  %218 = icmp eq i64 %217, 2048
  br i1 %218, label %219, label %187, !llvm.loop !14

219:                                              ; preds = %216, %248
  %220 = phi i64 [ %249, %248 ], [ 0, %216 ]
  %221 = phi double [ %245, %248 ], [ %213, %216 ]
  %222 = shl nuw nsw i64 %220, 11
  %223 = getelementptr float, ptr %2, i64 %222
  br label %224

224:                                              ; preds = %224, %219
  %225 = phi i64 [ 0, %219 ], [ %246, %224 ]
  %226 = phi double [ %221, %219 ], [ %245, %224 ]
  %227 = getelementptr float, ptr %223, i64 %225
  %228 = load float, ptr %227, align 4, !tbaa !5
  %229 = fpext float %228 to double
  %230 = fadd double %226, %229
  %231 = or disjoint i64 %225, 1
  %232 = getelementptr float, ptr %223, i64 %231
  %233 = load float, ptr %232, align 4, !tbaa !5
  %234 = fpext float %233 to double
  %235 = fadd double %230, %234
  %236 = or disjoint i64 %225, 2
  %237 = getelementptr float, ptr %223, i64 %236
  %238 = load float, ptr %237, align 4, !tbaa !5
  %239 = fpext float %238 to double
  %240 = fadd double %235, %239
  %241 = or disjoint i64 %225, 3
  %242 = getelementptr float, ptr %223, i64 %241
  %243 = load float, ptr %242, align 4, !tbaa !5
  %244 = fpext float %243 to double
  %245 = fadd double %240, %244
  %246 = add nuw nsw i64 %225, 4
  %247 = icmp eq i64 %246, 2048
  br i1 %247, label %248, label %224, !llvm.loop !13

248:                                              ; preds = %224
  %249 = add nuw nsw i64 %220, 1
  %250 = icmp eq i64 %249, 2048
  br i1 %250, label %251, label %219, !llvm.loop !14

251:                                              ; preds = %248
  %252 = invoke noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo9_M_insertIdEERSoT_(ptr noundef nonnull align 8 dereferenceable(8) @_ZSt4cout, double noundef %245)
          to label %280 unwind label %293

253:                                              ; preds = %256
  %254 = add nuw nsw i64 %23, 1
  %255 = icmp eq i64 %254, 2048
  br i1 %255, label %27, label %22, !llvm.loop !14

256:                                              ; preds = %256, %22
  %257 = phi i64 [ 0, %22 ], [ %278, %256 ]
  %258 = phi double [ %24, %22 ], [ %277, %256 ]
  %259 = getelementptr float, ptr %26, i64 %257
  %260 = load float, ptr %259, align 4, !tbaa !5
  %261 = fpext float %260 to double
  %262 = fadd double %258, %261
  %263 = or disjoint i64 %257, 1
  %264 = getelementptr float, ptr %26, i64 %263
  %265 = load float, ptr %264, align 4, !tbaa !5
  %266 = fpext float %265 to double
  %267 = fadd double %262, %266
  %268 = or disjoint i64 %257, 2
  %269 = getelementptr float, ptr %26, i64 %268
  %270 = load float, ptr %269, align 4, !tbaa !5
  %271 = fpext float %270 to double
  %272 = fadd double %267, %271
  %273 = or disjoint i64 %257, 3
  %274 = getelementptr float, ptr %26, i64 %273
  %275 = load float, ptr %274, align 4, !tbaa !5
  %276 = fpext float %275 to double
  %277 = fadd double %272, %276
  %278 = add nuw nsw i64 %257, 4
  %279 = icmp eq i64 %278, 2048
  br i1 %279, label %253, label %256, !llvm.loop !13

280:                                              ; preds = %251
  call void @llvm.lifetime.start.p0(i64 1, ptr nonnull %1)
  store i8 10, ptr %1, align 1, !tbaa !15
  %281 = load ptr, ptr %252, align 8, !tbaa !16
  %282 = getelementptr i8, ptr %281, i64 -24
  %283 = load i64, ptr %282, align 8
  %284 = getelementptr inbounds i8, ptr %252, i64 %283
  %285 = getelementptr inbounds %"class.std::ios_base", ptr %284, i64 0, i32 2
  %286 = load i64, ptr %285, align 8, !tbaa !18
  %287 = icmp eq i64 %286, 0
  br i1 %287, label %290, label %288

288:                                              ; preds = %280
  %289 = invoke noundef nonnull align 8 dereferenceable(8) ptr @_ZSt16__ostream_insertIcSt11char_traitsIcEERSt13basic_ostreamIT_T0_ES6_PKS3_l(ptr noundef nonnull align 8 dereferenceable(8) %252, ptr noundef nonnull %1, i64 noundef 1)
          to label %292 unwind label %293

290:                                              ; preds = %280
  %291 = invoke noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo3putEc(ptr noundef nonnull align 8 dereferenceable(8) %252, i8 noundef signext 10)
          to label %292 unwind label %293

292:                                              ; preds = %288, %290
  call void @llvm.lifetime.end.p0(i64 1, ptr nonnull %1)
  call void @_ZdlPv(ptr noundef nonnull %2) #6
  ret i32 0

293:                                              ; preds = %290, %288, %251
  %294 = landingpad { ptr, i32 }
          cleanup
  call void @_ZdlPv(ptr noundef nonnull %2) #6
  resume { ptr, i32 } %294
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

declare noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo9_M_insertIdEERSoT_(ptr noundef nonnull align 8 dereferenceable(8), double noundef) local_unnamed_addr #4

declare noundef nonnull align 8 dereferenceable(8) ptr @_ZSt16__ostream_insertIcSt11char_traitsIcEERSt13basic_ostreamIT_T0_ES6_PKS3_l(ptr noundef nonnull align 8 dereferenceable(8), ptr noundef, i64 noundef) local_unnamed_addr #4

declare noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo3putEc(ptr noundef nonnull align 8 dereferenceable(8), i8 noundef signext) local_unnamed_addr #4

attributes #0 = { mustprogress norecurse uwtable "min-legal-vector-width"="0" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #1 = { mustprogress nocallback nofree nosync nounwind willreturn memory(argmem: readwrite) }
attributes #2 = { nobuiltin allocsize(0) "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #3 = { nobuiltin nounwind "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #4 = { "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #5 = { builtin allocsize(0) }
attributes #6 = { builtin nounwind }

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
!15 = !{!7, !7, i64 0}
!16 = !{!17, !17, i64 0}
!17 = !{!"vtable pointer", !8, i64 0}
!18 = !{!19, !20, i64 16}
!19 = !{!"_ZTSSt8ios_base", !20, i64 8, !20, i64 16, !21, i64 24, !22, i64 28, !22, i64 32, !23, i64 40, !24, i64 48, !7, i64 64, !25, i64 192, !23, i64 200, !26, i64 208}
!20 = !{!"long", !7, i64 0}
!21 = !{!"_ZTSSt13_Ios_Fmtflags", !7, i64 0}
!22 = !{!"_ZTSSt12_Ios_Iostate", !7, i64 0}
!23 = !{!"any pointer", !7, i64 0}
!24 = !{!"_ZTSNSt8ios_base6_WordsE", !23, i64 0, !20, i64 8}
!25 = !{!"int", !7, i64 0}
!26 = !{!"_ZTSSt6locale", !23, i64 0}
