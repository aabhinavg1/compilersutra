; ModuleID = '/home/aitr/compilersutra/FixIt_Compilersutra/static/files/articles/gcc_vs_clang_cases/column_sum.cpp'
source_filename = "/home/aitr/compilersutra/FixIt_Compilersutra/static/files/articles/gcc_vs_clang_cases/column_sum.cpp"
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

22:                                               ; preds = %3, %273
  %23 = phi i64 [ %274, %273 ], [ 0, %3 ]
  %24 = phi double [ %301, %273 ], [ 0.000000e+00, %3 ]
  %25 = getelementptr float, ptr %2, i64 %23
  br label %276

26:                                               ; preds = %273, %58
  %27 = phi i64 [ %59, %58 ], [ 0, %273 ]
  %28 = phi double [ %55, %58 ], [ %301, %273 ]
  %29 = getelementptr float, ptr %2, i64 %27
  br label %30

30:                                               ; preds = %30, %26
  %31 = phi i64 [ 0, %26 ], [ %56, %30 ]
  %32 = phi double [ %28, %26 ], [ %55, %30 ]
  %33 = shl nuw nsw i64 %31, 11
  %34 = getelementptr float, ptr %29, i64 %33
  %35 = load float, ptr %34, align 4, !tbaa !5
  %36 = fpext float %35 to double
  %37 = fadd double %32, %36
  %38 = shl i64 %31, 11
  %39 = or disjoint i64 %38, 2048
  %40 = getelementptr float, ptr %29, i64 %39
  %41 = load float, ptr %40, align 4, !tbaa !5
  %42 = fpext float %41 to double
  %43 = fadd double %37, %42
  %44 = shl i64 %31, 11
  %45 = or disjoint i64 %44, 4096
  %46 = getelementptr float, ptr %29, i64 %45
  %47 = load float, ptr %46, align 4, !tbaa !5
  %48 = fpext float %47 to double
  %49 = fadd double %43, %48
  %50 = shl i64 %31, 11
  %51 = or disjoint i64 %50, 6144
  %52 = getelementptr float, ptr %29, i64 %51
  %53 = load float, ptr %52, align 4, !tbaa !5
  %54 = fpext float %53 to double
  %55 = fadd double %49, %54
  %56 = add nuw nsw i64 %31, 4
  %57 = icmp eq i64 %56, 2048
  br i1 %57, label %58, label %30, !llvm.loop !13

58:                                               ; preds = %30
  %59 = add nuw nsw i64 %27, 1
  %60 = icmp eq i64 %59, 2048
  br i1 %60, label %61, label %26, !llvm.loop !14

61:                                               ; preds = %58, %93
  %62 = phi i64 [ %94, %93 ], [ 0, %58 ]
  %63 = phi double [ %90, %93 ], [ %55, %58 ]
  %64 = getelementptr float, ptr %2, i64 %62
  br label %65

65:                                               ; preds = %65, %61
  %66 = phi i64 [ 0, %61 ], [ %91, %65 ]
  %67 = phi double [ %63, %61 ], [ %90, %65 ]
  %68 = shl nuw nsw i64 %66, 11
  %69 = getelementptr float, ptr %64, i64 %68
  %70 = load float, ptr %69, align 4, !tbaa !5
  %71 = fpext float %70 to double
  %72 = fadd double %67, %71
  %73 = shl i64 %66, 11
  %74 = or disjoint i64 %73, 2048
  %75 = getelementptr float, ptr %64, i64 %74
  %76 = load float, ptr %75, align 4, !tbaa !5
  %77 = fpext float %76 to double
  %78 = fadd double %72, %77
  %79 = shl i64 %66, 11
  %80 = or disjoint i64 %79, 4096
  %81 = getelementptr float, ptr %64, i64 %80
  %82 = load float, ptr %81, align 4, !tbaa !5
  %83 = fpext float %82 to double
  %84 = fadd double %78, %83
  %85 = shl i64 %66, 11
  %86 = or disjoint i64 %85, 6144
  %87 = getelementptr float, ptr %64, i64 %86
  %88 = load float, ptr %87, align 4, !tbaa !5
  %89 = fpext float %88 to double
  %90 = fadd double %84, %89
  %91 = add nuw nsw i64 %66, 4
  %92 = icmp eq i64 %91, 2048
  br i1 %92, label %93, label %65, !llvm.loop !13

93:                                               ; preds = %65
  %94 = add nuw nsw i64 %62, 1
  %95 = icmp eq i64 %94, 2048
  br i1 %95, label %96, label %61, !llvm.loop !14

96:                                               ; preds = %93, %128
  %97 = phi i64 [ %129, %128 ], [ 0, %93 ]
  %98 = phi double [ %125, %128 ], [ %90, %93 ]
  %99 = getelementptr float, ptr %2, i64 %97
  br label %100

100:                                              ; preds = %100, %96
  %101 = phi i64 [ 0, %96 ], [ %126, %100 ]
  %102 = phi double [ %98, %96 ], [ %125, %100 ]
  %103 = shl nuw nsw i64 %101, 11
  %104 = getelementptr float, ptr %99, i64 %103
  %105 = load float, ptr %104, align 4, !tbaa !5
  %106 = fpext float %105 to double
  %107 = fadd double %102, %106
  %108 = shl i64 %101, 11
  %109 = or disjoint i64 %108, 2048
  %110 = getelementptr float, ptr %99, i64 %109
  %111 = load float, ptr %110, align 4, !tbaa !5
  %112 = fpext float %111 to double
  %113 = fadd double %107, %112
  %114 = shl i64 %101, 11
  %115 = or disjoint i64 %114, 4096
  %116 = getelementptr float, ptr %99, i64 %115
  %117 = load float, ptr %116, align 4, !tbaa !5
  %118 = fpext float %117 to double
  %119 = fadd double %113, %118
  %120 = shl i64 %101, 11
  %121 = or disjoint i64 %120, 6144
  %122 = getelementptr float, ptr %99, i64 %121
  %123 = load float, ptr %122, align 4, !tbaa !5
  %124 = fpext float %123 to double
  %125 = fadd double %119, %124
  %126 = add nuw nsw i64 %101, 4
  %127 = icmp eq i64 %126, 2048
  br i1 %127, label %128, label %100, !llvm.loop !13

128:                                              ; preds = %100
  %129 = add nuw nsw i64 %97, 1
  %130 = icmp eq i64 %129, 2048
  br i1 %130, label %131, label %96, !llvm.loop !14

131:                                              ; preds = %128, %163
  %132 = phi i64 [ %164, %163 ], [ 0, %128 ]
  %133 = phi double [ %160, %163 ], [ %125, %128 ]
  %134 = getelementptr float, ptr %2, i64 %132
  br label %135

135:                                              ; preds = %135, %131
  %136 = phi i64 [ 0, %131 ], [ %161, %135 ]
  %137 = phi double [ %133, %131 ], [ %160, %135 ]
  %138 = shl nuw nsw i64 %136, 11
  %139 = getelementptr float, ptr %134, i64 %138
  %140 = load float, ptr %139, align 4, !tbaa !5
  %141 = fpext float %140 to double
  %142 = fadd double %137, %141
  %143 = shl i64 %136, 11
  %144 = or disjoint i64 %143, 2048
  %145 = getelementptr float, ptr %134, i64 %144
  %146 = load float, ptr %145, align 4, !tbaa !5
  %147 = fpext float %146 to double
  %148 = fadd double %142, %147
  %149 = shl i64 %136, 11
  %150 = or disjoint i64 %149, 4096
  %151 = getelementptr float, ptr %134, i64 %150
  %152 = load float, ptr %151, align 4, !tbaa !5
  %153 = fpext float %152 to double
  %154 = fadd double %148, %153
  %155 = shl i64 %136, 11
  %156 = or disjoint i64 %155, 6144
  %157 = getelementptr float, ptr %134, i64 %156
  %158 = load float, ptr %157, align 4, !tbaa !5
  %159 = fpext float %158 to double
  %160 = fadd double %154, %159
  %161 = add nuw nsw i64 %136, 4
  %162 = icmp eq i64 %161, 2048
  br i1 %162, label %163, label %135, !llvm.loop !13

163:                                              ; preds = %135
  %164 = add nuw nsw i64 %132, 1
  %165 = icmp eq i64 %164, 2048
  br i1 %165, label %166, label %131, !llvm.loop !14

166:                                              ; preds = %163, %198
  %167 = phi i64 [ %199, %198 ], [ 0, %163 ]
  %168 = phi double [ %195, %198 ], [ %160, %163 ]
  %169 = getelementptr float, ptr %2, i64 %167
  br label %170

170:                                              ; preds = %170, %166
  %171 = phi i64 [ 0, %166 ], [ %196, %170 ]
  %172 = phi double [ %168, %166 ], [ %195, %170 ]
  %173 = shl nuw nsw i64 %171, 11
  %174 = getelementptr float, ptr %169, i64 %173
  %175 = load float, ptr %174, align 4, !tbaa !5
  %176 = fpext float %175 to double
  %177 = fadd double %172, %176
  %178 = shl i64 %171, 11
  %179 = or disjoint i64 %178, 2048
  %180 = getelementptr float, ptr %169, i64 %179
  %181 = load float, ptr %180, align 4, !tbaa !5
  %182 = fpext float %181 to double
  %183 = fadd double %177, %182
  %184 = shl i64 %171, 11
  %185 = or disjoint i64 %184, 4096
  %186 = getelementptr float, ptr %169, i64 %185
  %187 = load float, ptr %186, align 4, !tbaa !5
  %188 = fpext float %187 to double
  %189 = fadd double %183, %188
  %190 = shl i64 %171, 11
  %191 = or disjoint i64 %190, 6144
  %192 = getelementptr float, ptr %169, i64 %191
  %193 = load float, ptr %192, align 4, !tbaa !5
  %194 = fpext float %193 to double
  %195 = fadd double %189, %194
  %196 = add nuw nsw i64 %171, 4
  %197 = icmp eq i64 %196, 2048
  br i1 %197, label %198, label %170, !llvm.loop !13

198:                                              ; preds = %170
  %199 = add nuw nsw i64 %167, 1
  %200 = icmp eq i64 %199, 2048
  br i1 %200, label %201, label %166, !llvm.loop !14

201:                                              ; preds = %198, %233
  %202 = phi i64 [ %234, %233 ], [ 0, %198 ]
  %203 = phi double [ %230, %233 ], [ %195, %198 ]
  %204 = getelementptr float, ptr %2, i64 %202
  br label %205

205:                                              ; preds = %205, %201
  %206 = phi i64 [ 0, %201 ], [ %231, %205 ]
  %207 = phi double [ %203, %201 ], [ %230, %205 ]
  %208 = shl nuw nsw i64 %206, 11
  %209 = getelementptr float, ptr %204, i64 %208
  %210 = load float, ptr %209, align 4, !tbaa !5
  %211 = fpext float %210 to double
  %212 = fadd double %207, %211
  %213 = shl i64 %206, 11
  %214 = or disjoint i64 %213, 2048
  %215 = getelementptr float, ptr %204, i64 %214
  %216 = load float, ptr %215, align 4, !tbaa !5
  %217 = fpext float %216 to double
  %218 = fadd double %212, %217
  %219 = shl i64 %206, 11
  %220 = or disjoint i64 %219, 4096
  %221 = getelementptr float, ptr %204, i64 %220
  %222 = load float, ptr %221, align 4, !tbaa !5
  %223 = fpext float %222 to double
  %224 = fadd double %218, %223
  %225 = shl i64 %206, 11
  %226 = or disjoint i64 %225, 6144
  %227 = getelementptr float, ptr %204, i64 %226
  %228 = load float, ptr %227, align 4, !tbaa !5
  %229 = fpext float %228 to double
  %230 = fadd double %224, %229
  %231 = add nuw nsw i64 %206, 4
  %232 = icmp eq i64 %231, 2048
  br i1 %232, label %233, label %205, !llvm.loop !13

233:                                              ; preds = %205
  %234 = add nuw nsw i64 %202, 1
  %235 = icmp eq i64 %234, 2048
  br i1 %235, label %236, label %201, !llvm.loop !14

236:                                              ; preds = %233, %268
  %237 = phi i64 [ %269, %268 ], [ 0, %233 ]
  %238 = phi double [ %265, %268 ], [ %230, %233 ]
  %239 = getelementptr float, ptr %2, i64 %237
  br label %240

240:                                              ; preds = %240, %236
  %241 = phi i64 [ 0, %236 ], [ %266, %240 ]
  %242 = phi double [ %238, %236 ], [ %265, %240 ]
  %243 = shl nuw nsw i64 %241, 11
  %244 = getelementptr float, ptr %239, i64 %243
  %245 = load float, ptr %244, align 4, !tbaa !5
  %246 = fpext float %245 to double
  %247 = fadd double %242, %246
  %248 = shl i64 %241, 11
  %249 = or disjoint i64 %248, 2048
  %250 = getelementptr float, ptr %239, i64 %249
  %251 = load float, ptr %250, align 4, !tbaa !5
  %252 = fpext float %251 to double
  %253 = fadd double %247, %252
  %254 = shl i64 %241, 11
  %255 = or disjoint i64 %254, 4096
  %256 = getelementptr float, ptr %239, i64 %255
  %257 = load float, ptr %256, align 4, !tbaa !5
  %258 = fpext float %257 to double
  %259 = fadd double %253, %258
  %260 = shl i64 %241, 11
  %261 = or disjoint i64 %260, 6144
  %262 = getelementptr float, ptr %239, i64 %261
  %263 = load float, ptr %262, align 4, !tbaa !5
  %264 = fpext float %263 to double
  %265 = fadd double %259, %264
  %266 = add nuw nsw i64 %241, 4
  %267 = icmp eq i64 %266, 2048
  br i1 %267, label %268, label %240, !llvm.loop !13

268:                                              ; preds = %240
  %269 = add nuw nsw i64 %237, 1
  %270 = icmp eq i64 %269, 2048
  br i1 %270, label %271, label %236, !llvm.loop !14

271:                                              ; preds = %268
  %272 = invoke noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo9_M_insertIdEERSoT_(ptr noundef nonnull align 8 dereferenceable(8) @_ZSt4cout, double noundef %265)
          to label %304 unwind label %317

273:                                              ; preds = %276
  %274 = add nuw nsw i64 %23, 1
  %275 = icmp eq i64 %274, 2048
  br i1 %275, label %26, label %22, !llvm.loop !14

276:                                              ; preds = %276, %22
  %277 = phi i64 [ 0, %22 ], [ %302, %276 ]
  %278 = phi double [ %24, %22 ], [ %301, %276 ]
  %279 = shl nuw nsw i64 %277, 11
  %280 = getelementptr float, ptr %25, i64 %279
  %281 = load float, ptr %280, align 4, !tbaa !5
  %282 = fpext float %281 to double
  %283 = fadd double %278, %282
  %284 = shl i64 %277, 11
  %285 = or disjoint i64 %284, 2048
  %286 = getelementptr float, ptr %25, i64 %285
  %287 = load float, ptr %286, align 4, !tbaa !5
  %288 = fpext float %287 to double
  %289 = fadd double %283, %288
  %290 = shl i64 %277, 11
  %291 = or disjoint i64 %290, 4096
  %292 = getelementptr float, ptr %25, i64 %291
  %293 = load float, ptr %292, align 4, !tbaa !5
  %294 = fpext float %293 to double
  %295 = fadd double %289, %294
  %296 = shl i64 %277, 11
  %297 = or disjoint i64 %296, 6144
  %298 = getelementptr float, ptr %25, i64 %297
  %299 = load float, ptr %298, align 4, !tbaa !5
  %300 = fpext float %299 to double
  %301 = fadd double %295, %300
  %302 = add nuw nsw i64 %277, 4
  %303 = icmp eq i64 %302, 2048
  br i1 %303, label %273, label %276, !llvm.loop !13

304:                                              ; preds = %271
  call void @llvm.lifetime.start.p0(i64 1, ptr nonnull %1)
  store i8 10, ptr %1, align 1, !tbaa !15
  %305 = load ptr, ptr %272, align 8, !tbaa !16
  %306 = getelementptr i8, ptr %305, i64 -24
  %307 = load i64, ptr %306, align 8
  %308 = getelementptr inbounds i8, ptr %272, i64 %307
  %309 = getelementptr inbounds %"class.std::ios_base", ptr %308, i64 0, i32 2
  %310 = load i64, ptr %309, align 8, !tbaa !18
  %311 = icmp eq i64 %310, 0
  br i1 %311, label %314, label %312

312:                                              ; preds = %304
  %313 = invoke noundef nonnull align 8 dereferenceable(8) ptr @_ZSt16__ostream_insertIcSt11char_traitsIcEERSt13basic_ostreamIT_T0_ES6_PKS3_l(ptr noundef nonnull align 8 dereferenceable(8) %272, ptr noundef nonnull %1, i64 noundef 1)
          to label %316 unwind label %317

314:                                              ; preds = %304
  %315 = invoke noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo3putEc(ptr noundef nonnull align 8 dereferenceable(8) %272, i8 noundef signext 10)
          to label %316 unwind label %317

316:                                              ; preds = %312, %314
  call void @llvm.lifetime.end.p0(i64 1, ptr nonnull %1)
  call void @_ZdlPv(ptr noundef nonnull %2) #6
  ret i32 0

317:                                              ; preds = %314, %312, %271
  %318 = landingpad { ptr, i32 }
          cleanup
  call void @_ZdlPv(ptr noundef nonnull %2) #6
  resume { ptr, i32 } %318
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
