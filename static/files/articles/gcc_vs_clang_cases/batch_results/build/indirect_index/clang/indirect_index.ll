; ModuleID = '/home/aitr/compilersutra/FixIt_Compilersutra/static/files/articles/gcc_vs_clang_cases/indirect_index.cpp'
source_filename = "/home/aitr/compilersutra/FixIt_Compilersutra/static/files/articles/gcc_vs_clang_cases/indirect_index.cpp"
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
  %23 = invoke noalias noundef nonnull dereferenceable(4194304) ptr @_Znwm(i64 noundef 4194304) #6
          to label %24 unwind label %39

24:                                               ; preds = %22
  tail call void @llvm.memset.p0.i64(ptr noundef nonnull align 4 dereferenceable(4194304) %23, i8 0, i64 4194304, i1 false)
  br label %25

25:                                               ; preds = %25, %24
  %26 = phi i64 [ 0, %24 ], [ %36, %25 ]
  %27 = phi <4 x i32> [ <i32 0, i32 1, i32 2, i32 3>, %24 ], [ %37, %25 ]
  %28 = mul <4 x i32> %27, <i32 48271, i32 48271, i32 48271, i32 48271>
  %29 = mul <4 x i32> %27, <i32 48271, i32 48271, i32 48271, i32 48271>
  %30 = add <4 x i32> %28, <i32 17, i32 17, i32 17, i32 17>
  %31 = add <4 x i32> %29, <i32 193101, i32 193101, i32 193101, i32 193101>
  %32 = and <4 x i32> %30, <i32 1048575, i32 1048575, i32 1048575, i32 1048575>
  %33 = and <4 x i32> %31, <i32 1048575, i32 1048575, i32 1048575, i32 1048575>
  %34 = getelementptr inbounds i32, ptr %23, i64 %26
  %35 = getelementptr inbounds i32, ptr %34, i64 4
  store <4 x i32> %32, ptr %34, align 4, !tbaa !13
  store <4 x i32> %33, ptr %35, align 4, !tbaa !13
  %36 = add nuw i64 %26, 8
  %37 = add <4 x i32> %27, <i32 8, i32 8, i32 8, i32 8>
  %38 = icmp eq i64 %36, 1048576
  br i1 %38, label %1159, label %25, !llvm.loop !15

39:                                               ; preds = %22
  %40 = landingpad { ptr, i32 }
          cleanup
  br label %1210

41:                                               ; preds = %1159, %41
  %42 = phi i64 [ %75, %41 ], [ 0, %1159 ]
  %43 = phi double [ %74, %41 ], [ %1192, %1159 ]
  %44 = getelementptr inbounds i32, ptr %23, i64 %42
  %45 = load i32, ptr %44, align 4, !tbaa !13
  %46 = zext i32 %45 to i64
  %47 = getelementptr inbounds float, ptr %2, i64 %46
  %48 = load float, ptr %47, align 4, !tbaa !5
  %49 = fpext float %48 to double
  %50 = fadd double %43, %49
  %51 = or disjoint i64 %42, 1
  %52 = getelementptr inbounds i32, ptr %23, i64 %51
  %53 = load i32, ptr %52, align 4, !tbaa !13
  %54 = zext i32 %53 to i64
  %55 = getelementptr inbounds float, ptr %2, i64 %54
  %56 = load float, ptr %55, align 4, !tbaa !5
  %57 = fpext float %56 to double
  %58 = fadd double %50, %57
  %59 = or disjoint i64 %42, 2
  %60 = getelementptr inbounds i32, ptr %23, i64 %59
  %61 = load i32, ptr %60, align 4, !tbaa !13
  %62 = zext i32 %61 to i64
  %63 = getelementptr inbounds float, ptr %2, i64 %62
  %64 = load float, ptr %63, align 4, !tbaa !5
  %65 = fpext float %64 to double
  %66 = fadd double %58, %65
  %67 = or disjoint i64 %42, 3
  %68 = getelementptr inbounds i32, ptr %23, i64 %67
  %69 = load i32, ptr %68, align 4, !tbaa !13
  %70 = zext i32 %69 to i64
  %71 = getelementptr inbounds float, ptr %2, i64 %70
  %72 = load float, ptr %71, align 4, !tbaa !5
  %73 = fpext float %72 to double
  %74 = fadd double %66, %73
  %75 = add nuw nsw i64 %42, 4
  %76 = icmp eq i64 %75, 1048576
  br i1 %76, label %77, label %41, !llvm.loop !16

77:                                               ; preds = %41, %77
  %78 = phi i64 [ %111, %77 ], [ 0, %41 ]
  %79 = phi double [ %110, %77 ], [ %74, %41 ]
  %80 = getelementptr inbounds i32, ptr %23, i64 %78
  %81 = load i32, ptr %80, align 4, !tbaa !13
  %82 = zext i32 %81 to i64
  %83 = getelementptr inbounds float, ptr %2, i64 %82
  %84 = load float, ptr %83, align 4, !tbaa !5
  %85 = fpext float %84 to double
  %86 = fadd double %79, %85
  %87 = or disjoint i64 %78, 1
  %88 = getelementptr inbounds i32, ptr %23, i64 %87
  %89 = load i32, ptr %88, align 4, !tbaa !13
  %90 = zext i32 %89 to i64
  %91 = getelementptr inbounds float, ptr %2, i64 %90
  %92 = load float, ptr %91, align 4, !tbaa !5
  %93 = fpext float %92 to double
  %94 = fadd double %86, %93
  %95 = or disjoint i64 %78, 2
  %96 = getelementptr inbounds i32, ptr %23, i64 %95
  %97 = load i32, ptr %96, align 4, !tbaa !13
  %98 = zext i32 %97 to i64
  %99 = getelementptr inbounds float, ptr %2, i64 %98
  %100 = load float, ptr %99, align 4, !tbaa !5
  %101 = fpext float %100 to double
  %102 = fadd double %94, %101
  %103 = or disjoint i64 %78, 3
  %104 = getelementptr inbounds i32, ptr %23, i64 %103
  %105 = load i32, ptr %104, align 4, !tbaa !13
  %106 = zext i32 %105 to i64
  %107 = getelementptr inbounds float, ptr %2, i64 %106
  %108 = load float, ptr %107, align 4, !tbaa !5
  %109 = fpext float %108 to double
  %110 = fadd double %102, %109
  %111 = add nuw nsw i64 %78, 4
  %112 = icmp eq i64 %111, 1048576
  br i1 %112, label %113, label %77, !llvm.loop !16

113:                                              ; preds = %77, %113
  %114 = phi i64 [ %147, %113 ], [ 0, %77 ]
  %115 = phi double [ %146, %113 ], [ %110, %77 ]
  %116 = getelementptr inbounds i32, ptr %23, i64 %114
  %117 = load i32, ptr %116, align 4, !tbaa !13
  %118 = zext i32 %117 to i64
  %119 = getelementptr inbounds float, ptr %2, i64 %118
  %120 = load float, ptr %119, align 4, !tbaa !5
  %121 = fpext float %120 to double
  %122 = fadd double %115, %121
  %123 = or disjoint i64 %114, 1
  %124 = getelementptr inbounds i32, ptr %23, i64 %123
  %125 = load i32, ptr %124, align 4, !tbaa !13
  %126 = zext i32 %125 to i64
  %127 = getelementptr inbounds float, ptr %2, i64 %126
  %128 = load float, ptr %127, align 4, !tbaa !5
  %129 = fpext float %128 to double
  %130 = fadd double %122, %129
  %131 = or disjoint i64 %114, 2
  %132 = getelementptr inbounds i32, ptr %23, i64 %131
  %133 = load i32, ptr %132, align 4, !tbaa !13
  %134 = zext i32 %133 to i64
  %135 = getelementptr inbounds float, ptr %2, i64 %134
  %136 = load float, ptr %135, align 4, !tbaa !5
  %137 = fpext float %136 to double
  %138 = fadd double %130, %137
  %139 = or disjoint i64 %114, 3
  %140 = getelementptr inbounds i32, ptr %23, i64 %139
  %141 = load i32, ptr %140, align 4, !tbaa !13
  %142 = zext i32 %141 to i64
  %143 = getelementptr inbounds float, ptr %2, i64 %142
  %144 = load float, ptr %143, align 4, !tbaa !5
  %145 = fpext float %144 to double
  %146 = fadd double %138, %145
  %147 = add nuw nsw i64 %114, 4
  %148 = icmp eq i64 %147, 1048576
  br i1 %148, label %149, label %113, !llvm.loop !16

149:                                              ; preds = %113, %149
  %150 = phi i64 [ %183, %149 ], [ 0, %113 ]
  %151 = phi double [ %182, %149 ], [ %146, %113 ]
  %152 = getelementptr inbounds i32, ptr %23, i64 %150
  %153 = load i32, ptr %152, align 4, !tbaa !13
  %154 = zext i32 %153 to i64
  %155 = getelementptr inbounds float, ptr %2, i64 %154
  %156 = load float, ptr %155, align 4, !tbaa !5
  %157 = fpext float %156 to double
  %158 = fadd double %151, %157
  %159 = or disjoint i64 %150, 1
  %160 = getelementptr inbounds i32, ptr %23, i64 %159
  %161 = load i32, ptr %160, align 4, !tbaa !13
  %162 = zext i32 %161 to i64
  %163 = getelementptr inbounds float, ptr %2, i64 %162
  %164 = load float, ptr %163, align 4, !tbaa !5
  %165 = fpext float %164 to double
  %166 = fadd double %158, %165
  %167 = or disjoint i64 %150, 2
  %168 = getelementptr inbounds i32, ptr %23, i64 %167
  %169 = load i32, ptr %168, align 4, !tbaa !13
  %170 = zext i32 %169 to i64
  %171 = getelementptr inbounds float, ptr %2, i64 %170
  %172 = load float, ptr %171, align 4, !tbaa !5
  %173 = fpext float %172 to double
  %174 = fadd double %166, %173
  %175 = or disjoint i64 %150, 3
  %176 = getelementptr inbounds i32, ptr %23, i64 %175
  %177 = load i32, ptr %176, align 4, !tbaa !13
  %178 = zext i32 %177 to i64
  %179 = getelementptr inbounds float, ptr %2, i64 %178
  %180 = load float, ptr %179, align 4, !tbaa !5
  %181 = fpext float %180 to double
  %182 = fadd double %174, %181
  %183 = add nuw nsw i64 %150, 4
  %184 = icmp eq i64 %183, 1048576
  br i1 %184, label %185, label %149, !llvm.loop !16

185:                                              ; preds = %149, %185
  %186 = phi i64 [ %219, %185 ], [ 0, %149 ]
  %187 = phi double [ %218, %185 ], [ %182, %149 ]
  %188 = getelementptr inbounds i32, ptr %23, i64 %186
  %189 = load i32, ptr %188, align 4, !tbaa !13
  %190 = zext i32 %189 to i64
  %191 = getelementptr inbounds float, ptr %2, i64 %190
  %192 = load float, ptr %191, align 4, !tbaa !5
  %193 = fpext float %192 to double
  %194 = fadd double %187, %193
  %195 = or disjoint i64 %186, 1
  %196 = getelementptr inbounds i32, ptr %23, i64 %195
  %197 = load i32, ptr %196, align 4, !tbaa !13
  %198 = zext i32 %197 to i64
  %199 = getelementptr inbounds float, ptr %2, i64 %198
  %200 = load float, ptr %199, align 4, !tbaa !5
  %201 = fpext float %200 to double
  %202 = fadd double %194, %201
  %203 = or disjoint i64 %186, 2
  %204 = getelementptr inbounds i32, ptr %23, i64 %203
  %205 = load i32, ptr %204, align 4, !tbaa !13
  %206 = zext i32 %205 to i64
  %207 = getelementptr inbounds float, ptr %2, i64 %206
  %208 = load float, ptr %207, align 4, !tbaa !5
  %209 = fpext float %208 to double
  %210 = fadd double %202, %209
  %211 = or disjoint i64 %186, 3
  %212 = getelementptr inbounds i32, ptr %23, i64 %211
  %213 = load i32, ptr %212, align 4, !tbaa !13
  %214 = zext i32 %213 to i64
  %215 = getelementptr inbounds float, ptr %2, i64 %214
  %216 = load float, ptr %215, align 4, !tbaa !5
  %217 = fpext float %216 to double
  %218 = fadd double %210, %217
  %219 = add nuw nsw i64 %186, 4
  %220 = icmp eq i64 %219, 1048576
  br i1 %220, label %221, label %185, !llvm.loop !16

221:                                              ; preds = %185, %221
  %222 = phi i64 [ %255, %221 ], [ 0, %185 ]
  %223 = phi double [ %254, %221 ], [ %218, %185 ]
  %224 = getelementptr inbounds i32, ptr %23, i64 %222
  %225 = load i32, ptr %224, align 4, !tbaa !13
  %226 = zext i32 %225 to i64
  %227 = getelementptr inbounds float, ptr %2, i64 %226
  %228 = load float, ptr %227, align 4, !tbaa !5
  %229 = fpext float %228 to double
  %230 = fadd double %223, %229
  %231 = or disjoint i64 %222, 1
  %232 = getelementptr inbounds i32, ptr %23, i64 %231
  %233 = load i32, ptr %232, align 4, !tbaa !13
  %234 = zext i32 %233 to i64
  %235 = getelementptr inbounds float, ptr %2, i64 %234
  %236 = load float, ptr %235, align 4, !tbaa !5
  %237 = fpext float %236 to double
  %238 = fadd double %230, %237
  %239 = or disjoint i64 %222, 2
  %240 = getelementptr inbounds i32, ptr %23, i64 %239
  %241 = load i32, ptr %240, align 4, !tbaa !13
  %242 = zext i32 %241 to i64
  %243 = getelementptr inbounds float, ptr %2, i64 %242
  %244 = load float, ptr %243, align 4, !tbaa !5
  %245 = fpext float %244 to double
  %246 = fadd double %238, %245
  %247 = or disjoint i64 %222, 3
  %248 = getelementptr inbounds i32, ptr %23, i64 %247
  %249 = load i32, ptr %248, align 4, !tbaa !13
  %250 = zext i32 %249 to i64
  %251 = getelementptr inbounds float, ptr %2, i64 %250
  %252 = load float, ptr %251, align 4, !tbaa !5
  %253 = fpext float %252 to double
  %254 = fadd double %246, %253
  %255 = add nuw nsw i64 %222, 4
  %256 = icmp eq i64 %255, 1048576
  br i1 %256, label %257, label %221, !llvm.loop !16

257:                                              ; preds = %221, %257
  %258 = phi i64 [ %291, %257 ], [ 0, %221 ]
  %259 = phi double [ %290, %257 ], [ %254, %221 ]
  %260 = getelementptr inbounds i32, ptr %23, i64 %258
  %261 = load i32, ptr %260, align 4, !tbaa !13
  %262 = zext i32 %261 to i64
  %263 = getelementptr inbounds float, ptr %2, i64 %262
  %264 = load float, ptr %263, align 4, !tbaa !5
  %265 = fpext float %264 to double
  %266 = fadd double %259, %265
  %267 = or disjoint i64 %258, 1
  %268 = getelementptr inbounds i32, ptr %23, i64 %267
  %269 = load i32, ptr %268, align 4, !tbaa !13
  %270 = zext i32 %269 to i64
  %271 = getelementptr inbounds float, ptr %2, i64 %270
  %272 = load float, ptr %271, align 4, !tbaa !5
  %273 = fpext float %272 to double
  %274 = fadd double %266, %273
  %275 = or disjoint i64 %258, 2
  %276 = getelementptr inbounds i32, ptr %23, i64 %275
  %277 = load i32, ptr %276, align 4, !tbaa !13
  %278 = zext i32 %277 to i64
  %279 = getelementptr inbounds float, ptr %2, i64 %278
  %280 = load float, ptr %279, align 4, !tbaa !5
  %281 = fpext float %280 to double
  %282 = fadd double %274, %281
  %283 = or disjoint i64 %258, 3
  %284 = getelementptr inbounds i32, ptr %23, i64 %283
  %285 = load i32, ptr %284, align 4, !tbaa !13
  %286 = zext i32 %285 to i64
  %287 = getelementptr inbounds float, ptr %2, i64 %286
  %288 = load float, ptr %287, align 4, !tbaa !5
  %289 = fpext float %288 to double
  %290 = fadd double %282, %289
  %291 = add nuw nsw i64 %258, 4
  %292 = icmp eq i64 %291, 1048576
  br i1 %292, label %293, label %257, !llvm.loop !16

293:                                              ; preds = %257, %293
  %294 = phi i64 [ %327, %293 ], [ 0, %257 ]
  %295 = phi double [ %326, %293 ], [ %290, %257 ]
  %296 = getelementptr inbounds i32, ptr %23, i64 %294
  %297 = load i32, ptr %296, align 4, !tbaa !13
  %298 = zext i32 %297 to i64
  %299 = getelementptr inbounds float, ptr %2, i64 %298
  %300 = load float, ptr %299, align 4, !tbaa !5
  %301 = fpext float %300 to double
  %302 = fadd double %295, %301
  %303 = or disjoint i64 %294, 1
  %304 = getelementptr inbounds i32, ptr %23, i64 %303
  %305 = load i32, ptr %304, align 4, !tbaa !13
  %306 = zext i32 %305 to i64
  %307 = getelementptr inbounds float, ptr %2, i64 %306
  %308 = load float, ptr %307, align 4, !tbaa !5
  %309 = fpext float %308 to double
  %310 = fadd double %302, %309
  %311 = or disjoint i64 %294, 2
  %312 = getelementptr inbounds i32, ptr %23, i64 %311
  %313 = load i32, ptr %312, align 4, !tbaa !13
  %314 = zext i32 %313 to i64
  %315 = getelementptr inbounds float, ptr %2, i64 %314
  %316 = load float, ptr %315, align 4, !tbaa !5
  %317 = fpext float %316 to double
  %318 = fadd double %310, %317
  %319 = or disjoint i64 %294, 3
  %320 = getelementptr inbounds i32, ptr %23, i64 %319
  %321 = load i32, ptr %320, align 4, !tbaa !13
  %322 = zext i32 %321 to i64
  %323 = getelementptr inbounds float, ptr %2, i64 %322
  %324 = load float, ptr %323, align 4, !tbaa !5
  %325 = fpext float %324 to double
  %326 = fadd double %318, %325
  %327 = add nuw nsw i64 %294, 4
  %328 = icmp eq i64 %327, 1048576
  br i1 %328, label %329, label %293, !llvm.loop !16

329:                                              ; preds = %293, %329
  %330 = phi i64 [ %363, %329 ], [ 0, %293 ]
  %331 = phi double [ %362, %329 ], [ %326, %293 ]
  %332 = getelementptr inbounds i32, ptr %23, i64 %330
  %333 = load i32, ptr %332, align 4, !tbaa !13
  %334 = zext i32 %333 to i64
  %335 = getelementptr inbounds float, ptr %2, i64 %334
  %336 = load float, ptr %335, align 4, !tbaa !5
  %337 = fpext float %336 to double
  %338 = fadd double %331, %337
  %339 = or disjoint i64 %330, 1
  %340 = getelementptr inbounds i32, ptr %23, i64 %339
  %341 = load i32, ptr %340, align 4, !tbaa !13
  %342 = zext i32 %341 to i64
  %343 = getelementptr inbounds float, ptr %2, i64 %342
  %344 = load float, ptr %343, align 4, !tbaa !5
  %345 = fpext float %344 to double
  %346 = fadd double %338, %345
  %347 = or disjoint i64 %330, 2
  %348 = getelementptr inbounds i32, ptr %23, i64 %347
  %349 = load i32, ptr %348, align 4, !tbaa !13
  %350 = zext i32 %349 to i64
  %351 = getelementptr inbounds float, ptr %2, i64 %350
  %352 = load float, ptr %351, align 4, !tbaa !5
  %353 = fpext float %352 to double
  %354 = fadd double %346, %353
  %355 = or disjoint i64 %330, 3
  %356 = getelementptr inbounds i32, ptr %23, i64 %355
  %357 = load i32, ptr %356, align 4, !tbaa !13
  %358 = zext i32 %357 to i64
  %359 = getelementptr inbounds float, ptr %2, i64 %358
  %360 = load float, ptr %359, align 4, !tbaa !5
  %361 = fpext float %360 to double
  %362 = fadd double %354, %361
  %363 = add nuw nsw i64 %330, 4
  %364 = icmp eq i64 %363, 1048576
  br i1 %364, label %365, label %329, !llvm.loop !16

365:                                              ; preds = %329, %365
  %366 = phi i64 [ %399, %365 ], [ 0, %329 ]
  %367 = phi double [ %398, %365 ], [ %362, %329 ]
  %368 = getelementptr inbounds i32, ptr %23, i64 %366
  %369 = load i32, ptr %368, align 4, !tbaa !13
  %370 = zext i32 %369 to i64
  %371 = getelementptr inbounds float, ptr %2, i64 %370
  %372 = load float, ptr %371, align 4, !tbaa !5
  %373 = fpext float %372 to double
  %374 = fadd double %367, %373
  %375 = or disjoint i64 %366, 1
  %376 = getelementptr inbounds i32, ptr %23, i64 %375
  %377 = load i32, ptr %376, align 4, !tbaa !13
  %378 = zext i32 %377 to i64
  %379 = getelementptr inbounds float, ptr %2, i64 %378
  %380 = load float, ptr %379, align 4, !tbaa !5
  %381 = fpext float %380 to double
  %382 = fadd double %374, %381
  %383 = or disjoint i64 %366, 2
  %384 = getelementptr inbounds i32, ptr %23, i64 %383
  %385 = load i32, ptr %384, align 4, !tbaa !13
  %386 = zext i32 %385 to i64
  %387 = getelementptr inbounds float, ptr %2, i64 %386
  %388 = load float, ptr %387, align 4, !tbaa !5
  %389 = fpext float %388 to double
  %390 = fadd double %382, %389
  %391 = or disjoint i64 %366, 3
  %392 = getelementptr inbounds i32, ptr %23, i64 %391
  %393 = load i32, ptr %392, align 4, !tbaa !13
  %394 = zext i32 %393 to i64
  %395 = getelementptr inbounds float, ptr %2, i64 %394
  %396 = load float, ptr %395, align 4, !tbaa !5
  %397 = fpext float %396 to double
  %398 = fadd double %390, %397
  %399 = add nuw nsw i64 %366, 4
  %400 = icmp eq i64 %399, 1048576
  br i1 %400, label %401, label %365, !llvm.loop !16

401:                                              ; preds = %365, %401
  %402 = phi i64 [ %435, %401 ], [ 0, %365 ]
  %403 = phi double [ %434, %401 ], [ %398, %365 ]
  %404 = getelementptr inbounds i32, ptr %23, i64 %402
  %405 = load i32, ptr %404, align 4, !tbaa !13
  %406 = zext i32 %405 to i64
  %407 = getelementptr inbounds float, ptr %2, i64 %406
  %408 = load float, ptr %407, align 4, !tbaa !5
  %409 = fpext float %408 to double
  %410 = fadd double %403, %409
  %411 = or disjoint i64 %402, 1
  %412 = getelementptr inbounds i32, ptr %23, i64 %411
  %413 = load i32, ptr %412, align 4, !tbaa !13
  %414 = zext i32 %413 to i64
  %415 = getelementptr inbounds float, ptr %2, i64 %414
  %416 = load float, ptr %415, align 4, !tbaa !5
  %417 = fpext float %416 to double
  %418 = fadd double %410, %417
  %419 = or disjoint i64 %402, 2
  %420 = getelementptr inbounds i32, ptr %23, i64 %419
  %421 = load i32, ptr %420, align 4, !tbaa !13
  %422 = zext i32 %421 to i64
  %423 = getelementptr inbounds float, ptr %2, i64 %422
  %424 = load float, ptr %423, align 4, !tbaa !5
  %425 = fpext float %424 to double
  %426 = fadd double %418, %425
  %427 = or disjoint i64 %402, 3
  %428 = getelementptr inbounds i32, ptr %23, i64 %427
  %429 = load i32, ptr %428, align 4, !tbaa !13
  %430 = zext i32 %429 to i64
  %431 = getelementptr inbounds float, ptr %2, i64 %430
  %432 = load float, ptr %431, align 4, !tbaa !5
  %433 = fpext float %432 to double
  %434 = fadd double %426, %433
  %435 = add nuw nsw i64 %402, 4
  %436 = icmp eq i64 %435, 1048576
  br i1 %436, label %437, label %401, !llvm.loop !16

437:                                              ; preds = %401, %437
  %438 = phi i64 [ %471, %437 ], [ 0, %401 ]
  %439 = phi double [ %470, %437 ], [ %434, %401 ]
  %440 = getelementptr inbounds i32, ptr %23, i64 %438
  %441 = load i32, ptr %440, align 4, !tbaa !13
  %442 = zext i32 %441 to i64
  %443 = getelementptr inbounds float, ptr %2, i64 %442
  %444 = load float, ptr %443, align 4, !tbaa !5
  %445 = fpext float %444 to double
  %446 = fadd double %439, %445
  %447 = or disjoint i64 %438, 1
  %448 = getelementptr inbounds i32, ptr %23, i64 %447
  %449 = load i32, ptr %448, align 4, !tbaa !13
  %450 = zext i32 %449 to i64
  %451 = getelementptr inbounds float, ptr %2, i64 %450
  %452 = load float, ptr %451, align 4, !tbaa !5
  %453 = fpext float %452 to double
  %454 = fadd double %446, %453
  %455 = or disjoint i64 %438, 2
  %456 = getelementptr inbounds i32, ptr %23, i64 %455
  %457 = load i32, ptr %456, align 4, !tbaa !13
  %458 = zext i32 %457 to i64
  %459 = getelementptr inbounds float, ptr %2, i64 %458
  %460 = load float, ptr %459, align 4, !tbaa !5
  %461 = fpext float %460 to double
  %462 = fadd double %454, %461
  %463 = or disjoint i64 %438, 3
  %464 = getelementptr inbounds i32, ptr %23, i64 %463
  %465 = load i32, ptr %464, align 4, !tbaa !13
  %466 = zext i32 %465 to i64
  %467 = getelementptr inbounds float, ptr %2, i64 %466
  %468 = load float, ptr %467, align 4, !tbaa !5
  %469 = fpext float %468 to double
  %470 = fadd double %462, %469
  %471 = add nuw nsw i64 %438, 4
  %472 = icmp eq i64 %471, 1048576
  br i1 %472, label %473, label %437, !llvm.loop !16

473:                                              ; preds = %437, %473
  %474 = phi i64 [ %507, %473 ], [ 0, %437 ]
  %475 = phi double [ %506, %473 ], [ %470, %437 ]
  %476 = getelementptr inbounds i32, ptr %23, i64 %474
  %477 = load i32, ptr %476, align 4, !tbaa !13
  %478 = zext i32 %477 to i64
  %479 = getelementptr inbounds float, ptr %2, i64 %478
  %480 = load float, ptr %479, align 4, !tbaa !5
  %481 = fpext float %480 to double
  %482 = fadd double %475, %481
  %483 = or disjoint i64 %474, 1
  %484 = getelementptr inbounds i32, ptr %23, i64 %483
  %485 = load i32, ptr %484, align 4, !tbaa !13
  %486 = zext i32 %485 to i64
  %487 = getelementptr inbounds float, ptr %2, i64 %486
  %488 = load float, ptr %487, align 4, !tbaa !5
  %489 = fpext float %488 to double
  %490 = fadd double %482, %489
  %491 = or disjoint i64 %474, 2
  %492 = getelementptr inbounds i32, ptr %23, i64 %491
  %493 = load i32, ptr %492, align 4, !tbaa !13
  %494 = zext i32 %493 to i64
  %495 = getelementptr inbounds float, ptr %2, i64 %494
  %496 = load float, ptr %495, align 4, !tbaa !5
  %497 = fpext float %496 to double
  %498 = fadd double %490, %497
  %499 = or disjoint i64 %474, 3
  %500 = getelementptr inbounds i32, ptr %23, i64 %499
  %501 = load i32, ptr %500, align 4, !tbaa !13
  %502 = zext i32 %501 to i64
  %503 = getelementptr inbounds float, ptr %2, i64 %502
  %504 = load float, ptr %503, align 4, !tbaa !5
  %505 = fpext float %504 to double
  %506 = fadd double %498, %505
  %507 = add nuw nsw i64 %474, 4
  %508 = icmp eq i64 %507, 1048576
  br i1 %508, label %509, label %473, !llvm.loop !16

509:                                              ; preds = %473, %509
  %510 = phi i64 [ %543, %509 ], [ 0, %473 ]
  %511 = phi double [ %542, %509 ], [ %506, %473 ]
  %512 = getelementptr inbounds i32, ptr %23, i64 %510
  %513 = load i32, ptr %512, align 4, !tbaa !13
  %514 = zext i32 %513 to i64
  %515 = getelementptr inbounds float, ptr %2, i64 %514
  %516 = load float, ptr %515, align 4, !tbaa !5
  %517 = fpext float %516 to double
  %518 = fadd double %511, %517
  %519 = or disjoint i64 %510, 1
  %520 = getelementptr inbounds i32, ptr %23, i64 %519
  %521 = load i32, ptr %520, align 4, !tbaa !13
  %522 = zext i32 %521 to i64
  %523 = getelementptr inbounds float, ptr %2, i64 %522
  %524 = load float, ptr %523, align 4, !tbaa !5
  %525 = fpext float %524 to double
  %526 = fadd double %518, %525
  %527 = or disjoint i64 %510, 2
  %528 = getelementptr inbounds i32, ptr %23, i64 %527
  %529 = load i32, ptr %528, align 4, !tbaa !13
  %530 = zext i32 %529 to i64
  %531 = getelementptr inbounds float, ptr %2, i64 %530
  %532 = load float, ptr %531, align 4, !tbaa !5
  %533 = fpext float %532 to double
  %534 = fadd double %526, %533
  %535 = or disjoint i64 %510, 3
  %536 = getelementptr inbounds i32, ptr %23, i64 %535
  %537 = load i32, ptr %536, align 4, !tbaa !13
  %538 = zext i32 %537 to i64
  %539 = getelementptr inbounds float, ptr %2, i64 %538
  %540 = load float, ptr %539, align 4, !tbaa !5
  %541 = fpext float %540 to double
  %542 = fadd double %534, %541
  %543 = add nuw nsw i64 %510, 4
  %544 = icmp eq i64 %543, 1048576
  br i1 %544, label %545, label %509, !llvm.loop !16

545:                                              ; preds = %509, %545
  %546 = phi i64 [ %579, %545 ], [ 0, %509 ]
  %547 = phi double [ %578, %545 ], [ %542, %509 ]
  %548 = getelementptr inbounds i32, ptr %23, i64 %546
  %549 = load i32, ptr %548, align 4, !tbaa !13
  %550 = zext i32 %549 to i64
  %551 = getelementptr inbounds float, ptr %2, i64 %550
  %552 = load float, ptr %551, align 4, !tbaa !5
  %553 = fpext float %552 to double
  %554 = fadd double %547, %553
  %555 = or disjoint i64 %546, 1
  %556 = getelementptr inbounds i32, ptr %23, i64 %555
  %557 = load i32, ptr %556, align 4, !tbaa !13
  %558 = zext i32 %557 to i64
  %559 = getelementptr inbounds float, ptr %2, i64 %558
  %560 = load float, ptr %559, align 4, !tbaa !5
  %561 = fpext float %560 to double
  %562 = fadd double %554, %561
  %563 = or disjoint i64 %546, 2
  %564 = getelementptr inbounds i32, ptr %23, i64 %563
  %565 = load i32, ptr %564, align 4, !tbaa !13
  %566 = zext i32 %565 to i64
  %567 = getelementptr inbounds float, ptr %2, i64 %566
  %568 = load float, ptr %567, align 4, !tbaa !5
  %569 = fpext float %568 to double
  %570 = fadd double %562, %569
  %571 = or disjoint i64 %546, 3
  %572 = getelementptr inbounds i32, ptr %23, i64 %571
  %573 = load i32, ptr %572, align 4, !tbaa !13
  %574 = zext i32 %573 to i64
  %575 = getelementptr inbounds float, ptr %2, i64 %574
  %576 = load float, ptr %575, align 4, !tbaa !5
  %577 = fpext float %576 to double
  %578 = fadd double %570, %577
  %579 = add nuw nsw i64 %546, 4
  %580 = icmp eq i64 %579, 1048576
  br i1 %580, label %581, label %545, !llvm.loop !16

581:                                              ; preds = %545, %581
  %582 = phi i64 [ %615, %581 ], [ 0, %545 ]
  %583 = phi double [ %614, %581 ], [ %578, %545 ]
  %584 = getelementptr inbounds i32, ptr %23, i64 %582
  %585 = load i32, ptr %584, align 4, !tbaa !13
  %586 = zext i32 %585 to i64
  %587 = getelementptr inbounds float, ptr %2, i64 %586
  %588 = load float, ptr %587, align 4, !tbaa !5
  %589 = fpext float %588 to double
  %590 = fadd double %583, %589
  %591 = or disjoint i64 %582, 1
  %592 = getelementptr inbounds i32, ptr %23, i64 %591
  %593 = load i32, ptr %592, align 4, !tbaa !13
  %594 = zext i32 %593 to i64
  %595 = getelementptr inbounds float, ptr %2, i64 %594
  %596 = load float, ptr %595, align 4, !tbaa !5
  %597 = fpext float %596 to double
  %598 = fadd double %590, %597
  %599 = or disjoint i64 %582, 2
  %600 = getelementptr inbounds i32, ptr %23, i64 %599
  %601 = load i32, ptr %600, align 4, !tbaa !13
  %602 = zext i32 %601 to i64
  %603 = getelementptr inbounds float, ptr %2, i64 %602
  %604 = load float, ptr %603, align 4, !tbaa !5
  %605 = fpext float %604 to double
  %606 = fadd double %598, %605
  %607 = or disjoint i64 %582, 3
  %608 = getelementptr inbounds i32, ptr %23, i64 %607
  %609 = load i32, ptr %608, align 4, !tbaa !13
  %610 = zext i32 %609 to i64
  %611 = getelementptr inbounds float, ptr %2, i64 %610
  %612 = load float, ptr %611, align 4, !tbaa !5
  %613 = fpext float %612 to double
  %614 = fadd double %606, %613
  %615 = add nuw nsw i64 %582, 4
  %616 = icmp eq i64 %615, 1048576
  br i1 %616, label %617, label %581, !llvm.loop !16

617:                                              ; preds = %581, %617
  %618 = phi i64 [ %651, %617 ], [ 0, %581 ]
  %619 = phi double [ %650, %617 ], [ %614, %581 ]
  %620 = getelementptr inbounds i32, ptr %23, i64 %618
  %621 = load i32, ptr %620, align 4, !tbaa !13
  %622 = zext i32 %621 to i64
  %623 = getelementptr inbounds float, ptr %2, i64 %622
  %624 = load float, ptr %623, align 4, !tbaa !5
  %625 = fpext float %624 to double
  %626 = fadd double %619, %625
  %627 = or disjoint i64 %618, 1
  %628 = getelementptr inbounds i32, ptr %23, i64 %627
  %629 = load i32, ptr %628, align 4, !tbaa !13
  %630 = zext i32 %629 to i64
  %631 = getelementptr inbounds float, ptr %2, i64 %630
  %632 = load float, ptr %631, align 4, !tbaa !5
  %633 = fpext float %632 to double
  %634 = fadd double %626, %633
  %635 = or disjoint i64 %618, 2
  %636 = getelementptr inbounds i32, ptr %23, i64 %635
  %637 = load i32, ptr %636, align 4, !tbaa !13
  %638 = zext i32 %637 to i64
  %639 = getelementptr inbounds float, ptr %2, i64 %638
  %640 = load float, ptr %639, align 4, !tbaa !5
  %641 = fpext float %640 to double
  %642 = fadd double %634, %641
  %643 = or disjoint i64 %618, 3
  %644 = getelementptr inbounds i32, ptr %23, i64 %643
  %645 = load i32, ptr %644, align 4, !tbaa !13
  %646 = zext i32 %645 to i64
  %647 = getelementptr inbounds float, ptr %2, i64 %646
  %648 = load float, ptr %647, align 4, !tbaa !5
  %649 = fpext float %648 to double
  %650 = fadd double %642, %649
  %651 = add nuw nsw i64 %618, 4
  %652 = icmp eq i64 %651, 1048576
  br i1 %652, label %653, label %617, !llvm.loop !16

653:                                              ; preds = %617, %653
  %654 = phi i64 [ %687, %653 ], [ 0, %617 ]
  %655 = phi double [ %686, %653 ], [ %650, %617 ]
  %656 = getelementptr inbounds i32, ptr %23, i64 %654
  %657 = load i32, ptr %656, align 4, !tbaa !13
  %658 = zext i32 %657 to i64
  %659 = getelementptr inbounds float, ptr %2, i64 %658
  %660 = load float, ptr %659, align 4, !tbaa !5
  %661 = fpext float %660 to double
  %662 = fadd double %655, %661
  %663 = or disjoint i64 %654, 1
  %664 = getelementptr inbounds i32, ptr %23, i64 %663
  %665 = load i32, ptr %664, align 4, !tbaa !13
  %666 = zext i32 %665 to i64
  %667 = getelementptr inbounds float, ptr %2, i64 %666
  %668 = load float, ptr %667, align 4, !tbaa !5
  %669 = fpext float %668 to double
  %670 = fadd double %662, %669
  %671 = or disjoint i64 %654, 2
  %672 = getelementptr inbounds i32, ptr %23, i64 %671
  %673 = load i32, ptr %672, align 4, !tbaa !13
  %674 = zext i32 %673 to i64
  %675 = getelementptr inbounds float, ptr %2, i64 %674
  %676 = load float, ptr %675, align 4, !tbaa !5
  %677 = fpext float %676 to double
  %678 = fadd double %670, %677
  %679 = or disjoint i64 %654, 3
  %680 = getelementptr inbounds i32, ptr %23, i64 %679
  %681 = load i32, ptr %680, align 4, !tbaa !13
  %682 = zext i32 %681 to i64
  %683 = getelementptr inbounds float, ptr %2, i64 %682
  %684 = load float, ptr %683, align 4, !tbaa !5
  %685 = fpext float %684 to double
  %686 = fadd double %678, %685
  %687 = add nuw nsw i64 %654, 4
  %688 = icmp eq i64 %687, 1048576
  br i1 %688, label %689, label %653, !llvm.loop !16

689:                                              ; preds = %653, %689
  %690 = phi i64 [ %723, %689 ], [ 0, %653 ]
  %691 = phi double [ %722, %689 ], [ %686, %653 ]
  %692 = getelementptr inbounds i32, ptr %23, i64 %690
  %693 = load i32, ptr %692, align 4, !tbaa !13
  %694 = zext i32 %693 to i64
  %695 = getelementptr inbounds float, ptr %2, i64 %694
  %696 = load float, ptr %695, align 4, !tbaa !5
  %697 = fpext float %696 to double
  %698 = fadd double %691, %697
  %699 = or disjoint i64 %690, 1
  %700 = getelementptr inbounds i32, ptr %23, i64 %699
  %701 = load i32, ptr %700, align 4, !tbaa !13
  %702 = zext i32 %701 to i64
  %703 = getelementptr inbounds float, ptr %2, i64 %702
  %704 = load float, ptr %703, align 4, !tbaa !5
  %705 = fpext float %704 to double
  %706 = fadd double %698, %705
  %707 = or disjoint i64 %690, 2
  %708 = getelementptr inbounds i32, ptr %23, i64 %707
  %709 = load i32, ptr %708, align 4, !tbaa !13
  %710 = zext i32 %709 to i64
  %711 = getelementptr inbounds float, ptr %2, i64 %710
  %712 = load float, ptr %711, align 4, !tbaa !5
  %713 = fpext float %712 to double
  %714 = fadd double %706, %713
  %715 = or disjoint i64 %690, 3
  %716 = getelementptr inbounds i32, ptr %23, i64 %715
  %717 = load i32, ptr %716, align 4, !tbaa !13
  %718 = zext i32 %717 to i64
  %719 = getelementptr inbounds float, ptr %2, i64 %718
  %720 = load float, ptr %719, align 4, !tbaa !5
  %721 = fpext float %720 to double
  %722 = fadd double %714, %721
  %723 = add nuw nsw i64 %690, 4
  %724 = icmp eq i64 %723, 1048576
  br i1 %724, label %725, label %689, !llvm.loop !16

725:                                              ; preds = %689, %725
  %726 = phi i64 [ %759, %725 ], [ 0, %689 ]
  %727 = phi double [ %758, %725 ], [ %722, %689 ]
  %728 = getelementptr inbounds i32, ptr %23, i64 %726
  %729 = load i32, ptr %728, align 4, !tbaa !13
  %730 = zext i32 %729 to i64
  %731 = getelementptr inbounds float, ptr %2, i64 %730
  %732 = load float, ptr %731, align 4, !tbaa !5
  %733 = fpext float %732 to double
  %734 = fadd double %727, %733
  %735 = or disjoint i64 %726, 1
  %736 = getelementptr inbounds i32, ptr %23, i64 %735
  %737 = load i32, ptr %736, align 4, !tbaa !13
  %738 = zext i32 %737 to i64
  %739 = getelementptr inbounds float, ptr %2, i64 %738
  %740 = load float, ptr %739, align 4, !tbaa !5
  %741 = fpext float %740 to double
  %742 = fadd double %734, %741
  %743 = or disjoint i64 %726, 2
  %744 = getelementptr inbounds i32, ptr %23, i64 %743
  %745 = load i32, ptr %744, align 4, !tbaa !13
  %746 = zext i32 %745 to i64
  %747 = getelementptr inbounds float, ptr %2, i64 %746
  %748 = load float, ptr %747, align 4, !tbaa !5
  %749 = fpext float %748 to double
  %750 = fadd double %742, %749
  %751 = or disjoint i64 %726, 3
  %752 = getelementptr inbounds i32, ptr %23, i64 %751
  %753 = load i32, ptr %752, align 4, !tbaa !13
  %754 = zext i32 %753 to i64
  %755 = getelementptr inbounds float, ptr %2, i64 %754
  %756 = load float, ptr %755, align 4, !tbaa !5
  %757 = fpext float %756 to double
  %758 = fadd double %750, %757
  %759 = add nuw nsw i64 %726, 4
  %760 = icmp eq i64 %759, 1048576
  br i1 %760, label %761, label %725, !llvm.loop !16

761:                                              ; preds = %725, %761
  %762 = phi i64 [ %795, %761 ], [ 0, %725 ]
  %763 = phi double [ %794, %761 ], [ %758, %725 ]
  %764 = getelementptr inbounds i32, ptr %23, i64 %762
  %765 = load i32, ptr %764, align 4, !tbaa !13
  %766 = zext i32 %765 to i64
  %767 = getelementptr inbounds float, ptr %2, i64 %766
  %768 = load float, ptr %767, align 4, !tbaa !5
  %769 = fpext float %768 to double
  %770 = fadd double %763, %769
  %771 = or disjoint i64 %762, 1
  %772 = getelementptr inbounds i32, ptr %23, i64 %771
  %773 = load i32, ptr %772, align 4, !tbaa !13
  %774 = zext i32 %773 to i64
  %775 = getelementptr inbounds float, ptr %2, i64 %774
  %776 = load float, ptr %775, align 4, !tbaa !5
  %777 = fpext float %776 to double
  %778 = fadd double %770, %777
  %779 = or disjoint i64 %762, 2
  %780 = getelementptr inbounds i32, ptr %23, i64 %779
  %781 = load i32, ptr %780, align 4, !tbaa !13
  %782 = zext i32 %781 to i64
  %783 = getelementptr inbounds float, ptr %2, i64 %782
  %784 = load float, ptr %783, align 4, !tbaa !5
  %785 = fpext float %784 to double
  %786 = fadd double %778, %785
  %787 = or disjoint i64 %762, 3
  %788 = getelementptr inbounds i32, ptr %23, i64 %787
  %789 = load i32, ptr %788, align 4, !tbaa !13
  %790 = zext i32 %789 to i64
  %791 = getelementptr inbounds float, ptr %2, i64 %790
  %792 = load float, ptr %791, align 4, !tbaa !5
  %793 = fpext float %792 to double
  %794 = fadd double %786, %793
  %795 = add nuw nsw i64 %762, 4
  %796 = icmp eq i64 %795, 1048576
  br i1 %796, label %797, label %761, !llvm.loop !16

797:                                              ; preds = %761, %797
  %798 = phi i64 [ %831, %797 ], [ 0, %761 ]
  %799 = phi double [ %830, %797 ], [ %794, %761 ]
  %800 = getelementptr inbounds i32, ptr %23, i64 %798
  %801 = load i32, ptr %800, align 4, !tbaa !13
  %802 = zext i32 %801 to i64
  %803 = getelementptr inbounds float, ptr %2, i64 %802
  %804 = load float, ptr %803, align 4, !tbaa !5
  %805 = fpext float %804 to double
  %806 = fadd double %799, %805
  %807 = or disjoint i64 %798, 1
  %808 = getelementptr inbounds i32, ptr %23, i64 %807
  %809 = load i32, ptr %808, align 4, !tbaa !13
  %810 = zext i32 %809 to i64
  %811 = getelementptr inbounds float, ptr %2, i64 %810
  %812 = load float, ptr %811, align 4, !tbaa !5
  %813 = fpext float %812 to double
  %814 = fadd double %806, %813
  %815 = or disjoint i64 %798, 2
  %816 = getelementptr inbounds i32, ptr %23, i64 %815
  %817 = load i32, ptr %816, align 4, !tbaa !13
  %818 = zext i32 %817 to i64
  %819 = getelementptr inbounds float, ptr %2, i64 %818
  %820 = load float, ptr %819, align 4, !tbaa !5
  %821 = fpext float %820 to double
  %822 = fadd double %814, %821
  %823 = or disjoint i64 %798, 3
  %824 = getelementptr inbounds i32, ptr %23, i64 %823
  %825 = load i32, ptr %824, align 4, !tbaa !13
  %826 = zext i32 %825 to i64
  %827 = getelementptr inbounds float, ptr %2, i64 %826
  %828 = load float, ptr %827, align 4, !tbaa !5
  %829 = fpext float %828 to double
  %830 = fadd double %822, %829
  %831 = add nuw nsw i64 %798, 4
  %832 = icmp eq i64 %831, 1048576
  br i1 %832, label %833, label %797, !llvm.loop !16

833:                                              ; preds = %797, %833
  %834 = phi i64 [ %867, %833 ], [ 0, %797 ]
  %835 = phi double [ %866, %833 ], [ %830, %797 ]
  %836 = getelementptr inbounds i32, ptr %23, i64 %834
  %837 = load i32, ptr %836, align 4, !tbaa !13
  %838 = zext i32 %837 to i64
  %839 = getelementptr inbounds float, ptr %2, i64 %838
  %840 = load float, ptr %839, align 4, !tbaa !5
  %841 = fpext float %840 to double
  %842 = fadd double %835, %841
  %843 = or disjoint i64 %834, 1
  %844 = getelementptr inbounds i32, ptr %23, i64 %843
  %845 = load i32, ptr %844, align 4, !tbaa !13
  %846 = zext i32 %845 to i64
  %847 = getelementptr inbounds float, ptr %2, i64 %846
  %848 = load float, ptr %847, align 4, !tbaa !5
  %849 = fpext float %848 to double
  %850 = fadd double %842, %849
  %851 = or disjoint i64 %834, 2
  %852 = getelementptr inbounds i32, ptr %23, i64 %851
  %853 = load i32, ptr %852, align 4, !tbaa !13
  %854 = zext i32 %853 to i64
  %855 = getelementptr inbounds float, ptr %2, i64 %854
  %856 = load float, ptr %855, align 4, !tbaa !5
  %857 = fpext float %856 to double
  %858 = fadd double %850, %857
  %859 = or disjoint i64 %834, 3
  %860 = getelementptr inbounds i32, ptr %23, i64 %859
  %861 = load i32, ptr %860, align 4, !tbaa !13
  %862 = zext i32 %861 to i64
  %863 = getelementptr inbounds float, ptr %2, i64 %862
  %864 = load float, ptr %863, align 4, !tbaa !5
  %865 = fpext float %864 to double
  %866 = fadd double %858, %865
  %867 = add nuw nsw i64 %834, 4
  %868 = icmp eq i64 %867, 1048576
  br i1 %868, label %869, label %833, !llvm.loop !16

869:                                              ; preds = %833, %869
  %870 = phi i64 [ %903, %869 ], [ 0, %833 ]
  %871 = phi double [ %902, %869 ], [ %866, %833 ]
  %872 = getelementptr inbounds i32, ptr %23, i64 %870
  %873 = load i32, ptr %872, align 4, !tbaa !13
  %874 = zext i32 %873 to i64
  %875 = getelementptr inbounds float, ptr %2, i64 %874
  %876 = load float, ptr %875, align 4, !tbaa !5
  %877 = fpext float %876 to double
  %878 = fadd double %871, %877
  %879 = or disjoint i64 %870, 1
  %880 = getelementptr inbounds i32, ptr %23, i64 %879
  %881 = load i32, ptr %880, align 4, !tbaa !13
  %882 = zext i32 %881 to i64
  %883 = getelementptr inbounds float, ptr %2, i64 %882
  %884 = load float, ptr %883, align 4, !tbaa !5
  %885 = fpext float %884 to double
  %886 = fadd double %878, %885
  %887 = or disjoint i64 %870, 2
  %888 = getelementptr inbounds i32, ptr %23, i64 %887
  %889 = load i32, ptr %888, align 4, !tbaa !13
  %890 = zext i32 %889 to i64
  %891 = getelementptr inbounds float, ptr %2, i64 %890
  %892 = load float, ptr %891, align 4, !tbaa !5
  %893 = fpext float %892 to double
  %894 = fadd double %886, %893
  %895 = or disjoint i64 %870, 3
  %896 = getelementptr inbounds i32, ptr %23, i64 %895
  %897 = load i32, ptr %896, align 4, !tbaa !13
  %898 = zext i32 %897 to i64
  %899 = getelementptr inbounds float, ptr %2, i64 %898
  %900 = load float, ptr %899, align 4, !tbaa !5
  %901 = fpext float %900 to double
  %902 = fadd double %894, %901
  %903 = add nuw nsw i64 %870, 4
  %904 = icmp eq i64 %903, 1048576
  br i1 %904, label %905, label %869, !llvm.loop !16

905:                                              ; preds = %869, %905
  %906 = phi i64 [ %939, %905 ], [ 0, %869 ]
  %907 = phi double [ %938, %905 ], [ %902, %869 ]
  %908 = getelementptr inbounds i32, ptr %23, i64 %906
  %909 = load i32, ptr %908, align 4, !tbaa !13
  %910 = zext i32 %909 to i64
  %911 = getelementptr inbounds float, ptr %2, i64 %910
  %912 = load float, ptr %911, align 4, !tbaa !5
  %913 = fpext float %912 to double
  %914 = fadd double %907, %913
  %915 = or disjoint i64 %906, 1
  %916 = getelementptr inbounds i32, ptr %23, i64 %915
  %917 = load i32, ptr %916, align 4, !tbaa !13
  %918 = zext i32 %917 to i64
  %919 = getelementptr inbounds float, ptr %2, i64 %918
  %920 = load float, ptr %919, align 4, !tbaa !5
  %921 = fpext float %920 to double
  %922 = fadd double %914, %921
  %923 = or disjoint i64 %906, 2
  %924 = getelementptr inbounds i32, ptr %23, i64 %923
  %925 = load i32, ptr %924, align 4, !tbaa !13
  %926 = zext i32 %925 to i64
  %927 = getelementptr inbounds float, ptr %2, i64 %926
  %928 = load float, ptr %927, align 4, !tbaa !5
  %929 = fpext float %928 to double
  %930 = fadd double %922, %929
  %931 = or disjoint i64 %906, 3
  %932 = getelementptr inbounds i32, ptr %23, i64 %931
  %933 = load i32, ptr %932, align 4, !tbaa !13
  %934 = zext i32 %933 to i64
  %935 = getelementptr inbounds float, ptr %2, i64 %934
  %936 = load float, ptr %935, align 4, !tbaa !5
  %937 = fpext float %936 to double
  %938 = fadd double %930, %937
  %939 = add nuw nsw i64 %906, 4
  %940 = icmp eq i64 %939, 1048576
  br i1 %940, label %941, label %905, !llvm.loop !16

941:                                              ; preds = %905, %941
  %942 = phi i64 [ %975, %941 ], [ 0, %905 ]
  %943 = phi double [ %974, %941 ], [ %938, %905 ]
  %944 = getelementptr inbounds i32, ptr %23, i64 %942
  %945 = load i32, ptr %944, align 4, !tbaa !13
  %946 = zext i32 %945 to i64
  %947 = getelementptr inbounds float, ptr %2, i64 %946
  %948 = load float, ptr %947, align 4, !tbaa !5
  %949 = fpext float %948 to double
  %950 = fadd double %943, %949
  %951 = or disjoint i64 %942, 1
  %952 = getelementptr inbounds i32, ptr %23, i64 %951
  %953 = load i32, ptr %952, align 4, !tbaa !13
  %954 = zext i32 %953 to i64
  %955 = getelementptr inbounds float, ptr %2, i64 %954
  %956 = load float, ptr %955, align 4, !tbaa !5
  %957 = fpext float %956 to double
  %958 = fadd double %950, %957
  %959 = or disjoint i64 %942, 2
  %960 = getelementptr inbounds i32, ptr %23, i64 %959
  %961 = load i32, ptr %960, align 4, !tbaa !13
  %962 = zext i32 %961 to i64
  %963 = getelementptr inbounds float, ptr %2, i64 %962
  %964 = load float, ptr %963, align 4, !tbaa !5
  %965 = fpext float %964 to double
  %966 = fadd double %958, %965
  %967 = or disjoint i64 %942, 3
  %968 = getelementptr inbounds i32, ptr %23, i64 %967
  %969 = load i32, ptr %968, align 4, !tbaa !13
  %970 = zext i32 %969 to i64
  %971 = getelementptr inbounds float, ptr %2, i64 %970
  %972 = load float, ptr %971, align 4, !tbaa !5
  %973 = fpext float %972 to double
  %974 = fadd double %966, %973
  %975 = add nuw nsw i64 %942, 4
  %976 = icmp eq i64 %975, 1048576
  br i1 %976, label %977, label %941, !llvm.loop !16

977:                                              ; preds = %941, %977
  %978 = phi i64 [ %1011, %977 ], [ 0, %941 ]
  %979 = phi double [ %1010, %977 ], [ %974, %941 ]
  %980 = getelementptr inbounds i32, ptr %23, i64 %978
  %981 = load i32, ptr %980, align 4, !tbaa !13
  %982 = zext i32 %981 to i64
  %983 = getelementptr inbounds float, ptr %2, i64 %982
  %984 = load float, ptr %983, align 4, !tbaa !5
  %985 = fpext float %984 to double
  %986 = fadd double %979, %985
  %987 = or disjoint i64 %978, 1
  %988 = getelementptr inbounds i32, ptr %23, i64 %987
  %989 = load i32, ptr %988, align 4, !tbaa !13
  %990 = zext i32 %989 to i64
  %991 = getelementptr inbounds float, ptr %2, i64 %990
  %992 = load float, ptr %991, align 4, !tbaa !5
  %993 = fpext float %992 to double
  %994 = fadd double %986, %993
  %995 = or disjoint i64 %978, 2
  %996 = getelementptr inbounds i32, ptr %23, i64 %995
  %997 = load i32, ptr %996, align 4, !tbaa !13
  %998 = zext i32 %997 to i64
  %999 = getelementptr inbounds float, ptr %2, i64 %998
  %1000 = load float, ptr %999, align 4, !tbaa !5
  %1001 = fpext float %1000 to double
  %1002 = fadd double %994, %1001
  %1003 = or disjoint i64 %978, 3
  %1004 = getelementptr inbounds i32, ptr %23, i64 %1003
  %1005 = load i32, ptr %1004, align 4, !tbaa !13
  %1006 = zext i32 %1005 to i64
  %1007 = getelementptr inbounds float, ptr %2, i64 %1006
  %1008 = load float, ptr %1007, align 4, !tbaa !5
  %1009 = fpext float %1008 to double
  %1010 = fadd double %1002, %1009
  %1011 = add nuw nsw i64 %978, 4
  %1012 = icmp eq i64 %1011, 1048576
  br i1 %1012, label %1013, label %977, !llvm.loop !16

1013:                                             ; preds = %977, %1013
  %1014 = phi i64 [ %1047, %1013 ], [ 0, %977 ]
  %1015 = phi double [ %1046, %1013 ], [ %1010, %977 ]
  %1016 = getelementptr inbounds i32, ptr %23, i64 %1014
  %1017 = load i32, ptr %1016, align 4, !tbaa !13
  %1018 = zext i32 %1017 to i64
  %1019 = getelementptr inbounds float, ptr %2, i64 %1018
  %1020 = load float, ptr %1019, align 4, !tbaa !5
  %1021 = fpext float %1020 to double
  %1022 = fadd double %1015, %1021
  %1023 = or disjoint i64 %1014, 1
  %1024 = getelementptr inbounds i32, ptr %23, i64 %1023
  %1025 = load i32, ptr %1024, align 4, !tbaa !13
  %1026 = zext i32 %1025 to i64
  %1027 = getelementptr inbounds float, ptr %2, i64 %1026
  %1028 = load float, ptr %1027, align 4, !tbaa !5
  %1029 = fpext float %1028 to double
  %1030 = fadd double %1022, %1029
  %1031 = or disjoint i64 %1014, 2
  %1032 = getelementptr inbounds i32, ptr %23, i64 %1031
  %1033 = load i32, ptr %1032, align 4, !tbaa !13
  %1034 = zext i32 %1033 to i64
  %1035 = getelementptr inbounds float, ptr %2, i64 %1034
  %1036 = load float, ptr %1035, align 4, !tbaa !5
  %1037 = fpext float %1036 to double
  %1038 = fadd double %1030, %1037
  %1039 = or disjoint i64 %1014, 3
  %1040 = getelementptr inbounds i32, ptr %23, i64 %1039
  %1041 = load i32, ptr %1040, align 4, !tbaa !13
  %1042 = zext i32 %1041 to i64
  %1043 = getelementptr inbounds float, ptr %2, i64 %1042
  %1044 = load float, ptr %1043, align 4, !tbaa !5
  %1045 = fpext float %1044 to double
  %1046 = fadd double %1038, %1045
  %1047 = add nuw nsw i64 %1014, 4
  %1048 = icmp eq i64 %1047, 1048576
  br i1 %1048, label %1049, label %1013, !llvm.loop !16

1049:                                             ; preds = %1013, %1049
  %1050 = phi i64 [ %1083, %1049 ], [ 0, %1013 ]
  %1051 = phi double [ %1082, %1049 ], [ %1046, %1013 ]
  %1052 = getelementptr inbounds i32, ptr %23, i64 %1050
  %1053 = load i32, ptr %1052, align 4, !tbaa !13
  %1054 = zext i32 %1053 to i64
  %1055 = getelementptr inbounds float, ptr %2, i64 %1054
  %1056 = load float, ptr %1055, align 4, !tbaa !5
  %1057 = fpext float %1056 to double
  %1058 = fadd double %1051, %1057
  %1059 = or disjoint i64 %1050, 1
  %1060 = getelementptr inbounds i32, ptr %23, i64 %1059
  %1061 = load i32, ptr %1060, align 4, !tbaa !13
  %1062 = zext i32 %1061 to i64
  %1063 = getelementptr inbounds float, ptr %2, i64 %1062
  %1064 = load float, ptr %1063, align 4, !tbaa !5
  %1065 = fpext float %1064 to double
  %1066 = fadd double %1058, %1065
  %1067 = or disjoint i64 %1050, 2
  %1068 = getelementptr inbounds i32, ptr %23, i64 %1067
  %1069 = load i32, ptr %1068, align 4, !tbaa !13
  %1070 = zext i32 %1069 to i64
  %1071 = getelementptr inbounds float, ptr %2, i64 %1070
  %1072 = load float, ptr %1071, align 4, !tbaa !5
  %1073 = fpext float %1072 to double
  %1074 = fadd double %1066, %1073
  %1075 = or disjoint i64 %1050, 3
  %1076 = getelementptr inbounds i32, ptr %23, i64 %1075
  %1077 = load i32, ptr %1076, align 4, !tbaa !13
  %1078 = zext i32 %1077 to i64
  %1079 = getelementptr inbounds float, ptr %2, i64 %1078
  %1080 = load float, ptr %1079, align 4, !tbaa !5
  %1081 = fpext float %1080 to double
  %1082 = fadd double %1074, %1081
  %1083 = add nuw nsw i64 %1050, 4
  %1084 = icmp eq i64 %1083, 1048576
  br i1 %1084, label %1085, label %1049, !llvm.loop !16

1085:                                             ; preds = %1049, %1085
  %1086 = phi i64 [ %1119, %1085 ], [ 0, %1049 ]
  %1087 = phi double [ %1118, %1085 ], [ %1082, %1049 ]
  %1088 = getelementptr inbounds i32, ptr %23, i64 %1086
  %1089 = load i32, ptr %1088, align 4, !tbaa !13
  %1090 = zext i32 %1089 to i64
  %1091 = getelementptr inbounds float, ptr %2, i64 %1090
  %1092 = load float, ptr %1091, align 4, !tbaa !5
  %1093 = fpext float %1092 to double
  %1094 = fadd double %1087, %1093
  %1095 = or disjoint i64 %1086, 1
  %1096 = getelementptr inbounds i32, ptr %23, i64 %1095
  %1097 = load i32, ptr %1096, align 4, !tbaa !13
  %1098 = zext i32 %1097 to i64
  %1099 = getelementptr inbounds float, ptr %2, i64 %1098
  %1100 = load float, ptr %1099, align 4, !tbaa !5
  %1101 = fpext float %1100 to double
  %1102 = fadd double %1094, %1101
  %1103 = or disjoint i64 %1086, 2
  %1104 = getelementptr inbounds i32, ptr %23, i64 %1103
  %1105 = load i32, ptr %1104, align 4, !tbaa !13
  %1106 = zext i32 %1105 to i64
  %1107 = getelementptr inbounds float, ptr %2, i64 %1106
  %1108 = load float, ptr %1107, align 4, !tbaa !5
  %1109 = fpext float %1108 to double
  %1110 = fadd double %1102, %1109
  %1111 = or disjoint i64 %1086, 3
  %1112 = getelementptr inbounds i32, ptr %23, i64 %1111
  %1113 = load i32, ptr %1112, align 4, !tbaa !13
  %1114 = zext i32 %1113 to i64
  %1115 = getelementptr inbounds float, ptr %2, i64 %1114
  %1116 = load float, ptr %1115, align 4, !tbaa !5
  %1117 = fpext float %1116 to double
  %1118 = fadd double %1110, %1117
  %1119 = add nuw nsw i64 %1086, 4
  %1120 = icmp eq i64 %1119, 1048576
  br i1 %1120, label %1121, label %1085, !llvm.loop !16

1121:                                             ; preds = %1085, %1121
  %1122 = phi i64 [ %1155, %1121 ], [ 0, %1085 ]
  %1123 = phi double [ %1154, %1121 ], [ %1118, %1085 ]
  %1124 = getelementptr inbounds i32, ptr %23, i64 %1122
  %1125 = load i32, ptr %1124, align 4, !tbaa !13
  %1126 = zext i32 %1125 to i64
  %1127 = getelementptr inbounds float, ptr %2, i64 %1126
  %1128 = load float, ptr %1127, align 4, !tbaa !5
  %1129 = fpext float %1128 to double
  %1130 = fadd double %1123, %1129
  %1131 = or disjoint i64 %1122, 1
  %1132 = getelementptr inbounds i32, ptr %23, i64 %1131
  %1133 = load i32, ptr %1132, align 4, !tbaa !13
  %1134 = zext i32 %1133 to i64
  %1135 = getelementptr inbounds float, ptr %2, i64 %1134
  %1136 = load float, ptr %1135, align 4, !tbaa !5
  %1137 = fpext float %1136 to double
  %1138 = fadd double %1130, %1137
  %1139 = or disjoint i64 %1122, 2
  %1140 = getelementptr inbounds i32, ptr %23, i64 %1139
  %1141 = load i32, ptr %1140, align 4, !tbaa !13
  %1142 = zext i32 %1141 to i64
  %1143 = getelementptr inbounds float, ptr %2, i64 %1142
  %1144 = load float, ptr %1143, align 4, !tbaa !5
  %1145 = fpext float %1144 to double
  %1146 = fadd double %1138, %1145
  %1147 = or disjoint i64 %1122, 3
  %1148 = getelementptr inbounds i32, ptr %23, i64 %1147
  %1149 = load i32, ptr %1148, align 4, !tbaa !13
  %1150 = zext i32 %1149 to i64
  %1151 = getelementptr inbounds float, ptr %2, i64 %1150
  %1152 = load float, ptr %1151, align 4, !tbaa !5
  %1153 = fpext float %1152 to double
  %1154 = fadd double %1146, %1153
  %1155 = add nuw nsw i64 %1122, 4
  %1156 = icmp eq i64 %1155, 1048576
  br i1 %1156, label %1157, label %1121, !llvm.loop !16

1157:                                             ; preds = %1121
  %1158 = invoke noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo9_M_insertIdEERSoT_(ptr noundef nonnull align 8 dereferenceable(8) @_ZSt4cout, double noundef %1154)
          to label %1195 unwind label %1208

1159:                                             ; preds = %25, %1159
  %1160 = phi i64 [ %1193, %1159 ], [ 0, %25 ]
  %1161 = phi double [ %1192, %1159 ], [ 0.000000e+00, %25 ]
  %1162 = getelementptr inbounds i32, ptr %23, i64 %1160
  %1163 = load i32, ptr %1162, align 4, !tbaa !13
  %1164 = zext i32 %1163 to i64
  %1165 = getelementptr inbounds float, ptr %2, i64 %1164
  %1166 = load float, ptr %1165, align 4, !tbaa !5
  %1167 = fpext float %1166 to double
  %1168 = fadd double %1161, %1167
  %1169 = or disjoint i64 %1160, 1
  %1170 = getelementptr inbounds i32, ptr %23, i64 %1169
  %1171 = load i32, ptr %1170, align 4, !tbaa !13
  %1172 = zext i32 %1171 to i64
  %1173 = getelementptr inbounds float, ptr %2, i64 %1172
  %1174 = load float, ptr %1173, align 4, !tbaa !5
  %1175 = fpext float %1174 to double
  %1176 = fadd double %1168, %1175
  %1177 = or disjoint i64 %1160, 2
  %1178 = getelementptr inbounds i32, ptr %23, i64 %1177
  %1179 = load i32, ptr %1178, align 4, !tbaa !13
  %1180 = zext i32 %1179 to i64
  %1181 = getelementptr inbounds float, ptr %2, i64 %1180
  %1182 = load float, ptr %1181, align 4, !tbaa !5
  %1183 = fpext float %1182 to double
  %1184 = fadd double %1176, %1183
  %1185 = or disjoint i64 %1160, 3
  %1186 = getelementptr inbounds i32, ptr %23, i64 %1185
  %1187 = load i32, ptr %1186, align 4, !tbaa !13
  %1188 = zext i32 %1187 to i64
  %1189 = getelementptr inbounds float, ptr %2, i64 %1188
  %1190 = load float, ptr %1189, align 4, !tbaa !5
  %1191 = fpext float %1190 to double
  %1192 = fadd double %1184, %1191
  %1193 = add nuw nsw i64 %1160, 4
  %1194 = icmp eq i64 %1193, 1048576
  br i1 %1194, label %41, label %1159, !llvm.loop !16

1195:                                             ; preds = %1157
  call void @llvm.lifetime.start.p0(i64 1, ptr nonnull %1)
  store i8 10, ptr %1, align 1, !tbaa !17
  %1196 = load ptr, ptr %1158, align 8, !tbaa !18
  %1197 = getelementptr i8, ptr %1196, i64 -24
  %1198 = load i64, ptr %1197, align 8
  %1199 = getelementptr inbounds i8, ptr %1158, i64 %1198
  %1200 = getelementptr inbounds %"class.std::ios_base", ptr %1199, i64 0, i32 2
  %1201 = load i64, ptr %1200, align 8, !tbaa !20
  %1202 = icmp eq i64 %1201, 0
  br i1 %1202, label %1205, label %1203

1203:                                             ; preds = %1195
  %1204 = invoke noundef nonnull align 8 dereferenceable(8) ptr @_ZSt16__ostream_insertIcSt11char_traitsIcEERSt13basic_ostreamIT_T0_ES6_PKS3_l(ptr noundef nonnull align 8 dereferenceable(8) %1158, ptr noundef nonnull %1, i64 noundef 1)
          to label %1207 unwind label %1208

1205:                                             ; preds = %1195
  %1206 = invoke noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo3putEc(ptr noundef nonnull align 8 dereferenceable(8) %1158, i8 noundef signext 10)
          to label %1207 unwind label %1208

1207:                                             ; preds = %1203, %1205
  call void @llvm.lifetime.end.p0(i64 1, ptr nonnull %1)
  call void @_ZdlPv(ptr noundef nonnull %23) #7
  call void @_ZdlPv(ptr noundef nonnull %2) #7
  ret i32 0

1208:                                             ; preds = %1205, %1203, %1157
  %1209 = landingpad { ptr, i32 }
          cleanup
  call void @_ZdlPv(ptr noundef nonnull %23) #7
  br label %1210

1210:                                             ; preds = %1208, %39
  %1211 = phi { ptr, i32 } [ %1209, %1208 ], [ %40, %39 ]
  call void @_ZdlPv(ptr noundef nonnull %2) #7
  resume { ptr, i32 } %1211
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
!6 = !{!"float", !7, i64 0}
!7 = !{!"omnipotent char", !8, i64 0}
!8 = !{!"Simple C++ TBAA"}
!9 = distinct !{!9, !10, !11, !12}
!10 = !{!"llvm.loop.mustprogress"}
!11 = !{!"llvm.loop.isvectorized", i32 1}
!12 = !{!"llvm.loop.unroll.runtime.disable"}
!13 = !{!14, !14, i64 0}
!14 = !{!"int", !7, i64 0}
!15 = distinct !{!15, !10, !11, !12}
!16 = distinct !{!16, !10}
!17 = !{!7, !7, i64 0}
!18 = !{!19, !19, i64 0}
!19 = !{!"vtable pointer", !8, i64 0}
!20 = !{!21, !22, i64 16}
!21 = !{!"_ZTSSt8ios_base", !22, i64 8, !22, i64 16, !23, i64 24, !24, i64 28, !24, i64 32, !25, i64 40, !26, i64 48, !7, i64 64, !14, i64 192, !25, i64 200, !27, i64 208}
!22 = !{!"long", !7, i64 0}
!23 = !{!"_ZTSSt13_Ios_Fmtflags", !7, i64 0}
!24 = !{!"_ZTSSt12_Ios_Iostate", !7, i64 0}
!25 = !{!"any pointer", !7, i64 0}
!26 = !{!"_ZTSNSt8ios_base6_WordsE", !25, i64 0, !22, i64 8}
!27 = !{!"_ZTSSt6locale", !25, i64 0}
