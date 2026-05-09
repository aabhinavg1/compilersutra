; ModuleID = '/home/aitr/compilersutra/FixIt_Compilersutra/static/files/articles/gcc_vs_clang_cases/prefix_sum.cpp'
source_filename = "/home/aitr/compilersutra/FixIt_Compilersutra/static/files/articles/gcc_vs_clang_cases/prefix_sum.cpp"
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
  %7 = getelementptr inbounds i32, ptr %6, i64 4
  store <4 x i32> <i32 1, i32 1, i32 1, i32 1>, ptr %6, align 4, !tbaa !5
  store <4 x i32> <i32 1, i32 1, i32 1, i32 1>, ptr %7, align 4, !tbaa !5
  %8 = shl i64 %4, 2
  %9 = or disjoint i64 %8, 32
  %10 = getelementptr inbounds i8, ptr %2, i64 %9
  %11 = getelementptr inbounds i32, ptr %10, i64 4
  store <4 x i32> <i32 1, i32 1, i32 1, i32 1>, ptr %10, align 4, !tbaa !5
  store <4 x i32> <i32 1, i32 1, i32 1, i32 1>, ptr %11, align 4, !tbaa !5
  %12 = shl i64 %4, 2
  %13 = or disjoint i64 %12, 64
  %14 = getelementptr inbounds i8, ptr %2, i64 %13
  %15 = getelementptr inbounds i32, ptr %14, i64 4
  store <4 x i32> <i32 1, i32 1, i32 1, i32 1>, ptr %14, align 4, !tbaa !5
  store <4 x i32> <i32 1, i32 1, i32 1, i32 1>, ptr %15, align 4, !tbaa !5
  %16 = shl i64 %4, 2
  %17 = or disjoint i64 %16, 96
  %18 = getelementptr inbounds i8, ptr %2, i64 %17
  %19 = getelementptr inbounds i32, ptr %18, i64 4
  store <4 x i32> <i32 1, i32 1, i32 1, i32 1>, ptr %18, align 4, !tbaa !5
  store <4 x i32> <i32 1, i32 1, i32 1, i32 1>, ptr %19, align 4, !tbaa !5
  %20 = add nuw nsw i64 %4, 32
  %21 = icmp eq i64 %20, 4194304
  br i1 %21, label %22, label %3, !llvm.loop !9

22:                                               ; preds = %3
  %23 = getelementptr inbounds i32, ptr %2, i64 4194303
  %24 = load i32, ptr %2, align 4
  %25 = getelementptr i32, ptr %2, i64 1
  %26 = getelementptr i32, ptr %2, i64 2
  br label %391

27:                                               ; preds = %391
  %28 = load i32, ptr %23, align 4, !tbaa !5
  %29 = load i32, ptr %2, align 4
  %30 = getelementptr i32, ptr %2, i64 1
  %31 = getelementptr i32, ptr %2, i64 2
  br label %32

32:                                               ; preds = %32, %27
  %33 = phi i32 [ %29, %27 ], [ %46, %32 ]
  %34 = phi i64 [ 1, %27 ], [ %47, %32 ]
  %35 = and i32 %33, 7
  %36 = getelementptr inbounds i32, ptr %2, i64 %34
  %37 = load i32, ptr %36, align 4, !tbaa !5
  %38 = add nsw i32 %37, %35
  store i32 %38, ptr %36, align 4, !tbaa !5
  %39 = and i32 %38, 7
  %40 = getelementptr i32, ptr %30, i64 %34
  %41 = load i32, ptr %40, align 4, !tbaa !5
  %42 = add nsw i32 %41, %39
  store i32 %42, ptr %40, align 4, !tbaa !5
  %43 = and i32 %42, 7
  %44 = getelementptr i32, ptr %31, i64 %34
  %45 = load i32, ptr %44, align 4, !tbaa !5
  %46 = add nsw i32 %45, %43
  store i32 %46, ptr %44, align 4, !tbaa !5
  %47 = add nuw nsw i64 %34, 3
  %48 = icmp eq i64 %47, 4194304
  br i1 %48, label %49, label %32, !llvm.loop !13

49:                                               ; preds = %32
  %50 = sext i32 %28 to i64
  %51 = load i32, ptr %23, align 4, !tbaa !5
  %52 = sext i32 %51 to i64
  %53 = load i32, ptr %2, align 4
  %54 = getelementptr i32, ptr %2, i64 1
  %55 = getelementptr i32, ptr %2, i64 2
  br label %56

56:                                               ; preds = %56, %49
  %57 = phi i32 [ %53, %49 ], [ %70, %56 ]
  %58 = phi i64 [ 1, %49 ], [ %71, %56 ]
  %59 = and i32 %57, 7
  %60 = getelementptr inbounds i32, ptr %2, i64 %58
  %61 = load i32, ptr %60, align 4, !tbaa !5
  %62 = add nsw i32 %61, %59
  store i32 %62, ptr %60, align 4, !tbaa !5
  %63 = and i32 %62, 7
  %64 = getelementptr i32, ptr %54, i64 %58
  %65 = load i32, ptr %64, align 4, !tbaa !5
  %66 = add nsw i32 %65, %63
  store i32 %66, ptr %64, align 4, !tbaa !5
  %67 = and i32 %66, 7
  %68 = getelementptr i32, ptr %55, i64 %58
  %69 = load i32, ptr %68, align 4, !tbaa !5
  %70 = add nsw i32 %69, %67
  store i32 %70, ptr %68, align 4, !tbaa !5
  %71 = add nuw nsw i64 %58, 3
  %72 = icmp eq i64 %71, 4194304
  br i1 %72, label %73, label %56, !llvm.loop !13

73:                                               ; preds = %56
  %74 = add nsw i64 %50, %52
  %75 = load i32, ptr %23, align 4, !tbaa !5
  %76 = sext i32 %75 to i64
  %77 = load i32, ptr %2, align 4
  %78 = getelementptr i32, ptr %2, i64 1
  %79 = getelementptr i32, ptr %2, i64 2
  br label %80

80:                                               ; preds = %80, %73
  %81 = phi i32 [ %77, %73 ], [ %94, %80 ]
  %82 = phi i64 [ 1, %73 ], [ %95, %80 ]
  %83 = and i32 %81, 7
  %84 = getelementptr inbounds i32, ptr %2, i64 %82
  %85 = load i32, ptr %84, align 4, !tbaa !5
  %86 = add nsw i32 %85, %83
  store i32 %86, ptr %84, align 4, !tbaa !5
  %87 = and i32 %86, 7
  %88 = getelementptr i32, ptr %78, i64 %82
  %89 = load i32, ptr %88, align 4, !tbaa !5
  %90 = add nsw i32 %89, %87
  store i32 %90, ptr %88, align 4, !tbaa !5
  %91 = and i32 %90, 7
  %92 = getelementptr i32, ptr %79, i64 %82
  %93 = load i32, ptr %92, align 4, !tbaa !5
  %94 = add nsw i32 %93, %91
  store i32 %94, ptr %92, align 4, !tbaa !5
  %95 = add nuw nsw i64 %82, 3
  %96 = icmp eq i64 %95, 4194304
  br i1 %96, label %97, label %80, !llvm.loop !13

97:                                               ; preds = %80
  %98 = add nsw i64 %74, %76
  %99 = load i32, ptr %23, align 4, !tbaa !5
  %100 = sext i32 %99 to i64
  %101 = load i32, ptr %2, align 4
  %102 = getelementptr i32, ptr %2, i64 1
  %103 = getelementptr i32, ptr %2, i64 2
  br label %104

104:                                              ; preds = %104, %97
  %105 = phi i32 [ %101, %97 ], [ %118, %104 ]
  %106 = phi i64 [ 1, %97 ], [ %119, %104 ]
  %107 = and i32 %105, 7
  %108 = getelementptr inbounds i32, ptr %2, i64 %106
  %109 = load i32, ptr %108, align 4, !tbaa !5
  %110 = add nsw i32 %109, %107
  store i32 %110, ptr %108, align 4, !tbaa !5
  %111 = and i32 %110, 7
  %112 = getelementptr i32, ptr %102, i64 %106
  %113 = load i32, ptr %112, align 4, !tbaa !5
  %114 = add nsw i32 %113, %111
  store i32 %114, ptr %112, align 4, !tbaa !5
  %115 = and i32 %114, 7
  %116 = getelementptr i32, ptr %103, i64 %106
  %117 = load i32, ptr %116, align 4, !tbaa !5
  %118 = add nsw i32 %117, %115
  store i32 %118, ptr %116, align 4, !tbaa !5
  %119 = add nuw nsw i64 %106, 3
  %120 = icmp eq i64 %119, 4194304
  br i1 %120, label %121, label %104, !llvm.loop !13

121:                                              ; preds = %104
  %122 = add nsw i64 %98, %100
  %123 = load i32, ptr %23, align 4, !tbaa !5
  %124 = sext i32 %123 to i64
  %125 = load i32, ptr %2, align 4
  %126 = getelementptr i32, ptr %2, i64 1
  %127 = getelementptr i32, ptr %2, i64 2
  br label %128

128:                                              ; preds = %128, %121
  %129 = phi i32 [ %125, %121 ], [ %142, %128 ]
  %130 = phi i64 [ 1, %121 ], [ %143, %128 ]
  %131 = and i32 %129, 7
  %132 = getelementptr inbounds i32, ptr %2, i64 %130
  %133 = load i32, ptr %132, align 4, !tbaa !5
  %134 = add nsw i32 %133, %131
  store i32 %134, ptr %132, align 4, !tbaa !5
  %135 = and i32 %134, 7
  %136 = getelementptr i32, ptr %126, i64 %130
  %137 = load i32, ptr %136, align 4, !tbaa !5
  %138 = add nsw i32 %137, %135
  store i32 %138, ptr %136, align 4, !tbaa !5
  %139 = and i32 %138, 7
  %140 = getelementptr i32, ptr %127, i64 %130
  %141 = load i32, ptr %140, align 4, !tbaa !5
  %142 = add nsw i32 %141, %139
  store i32 %142, ptr %140, align 4, !tbaa !5
  %143 = add nuw nsw i64 %130, 3
  %144 = icmp eq i64 %143, 4194304
  br i1 %144, label %145, label %128, !llvm.loop !13

145:                                              ; preds = %128
  %146 = add nsw i64 %122, %124
  %147 = load i32, ptr %23, align 4, !tbaa !5
  %148 = sext i32 %147 to i64
  %149 = load i32, ptr %2, align 4
  %150 = getelementptr i32, ptr %2, i64 1
  %151 = getelementptr i32, ptr %2, i64 2
  br label %152

152:                                              ; preds = %152, %145
  %153 = phi i32 [ %149, %145 ], [ %166, %152 ]
  %154 = phi i64 [ 1, %145 ], [ %167, %152 ]
  %155 = and i32 %153, 7
  %156 = getelementptr inbounds i32, ptr %2, i64 %154
  %157 = load i32, ptr %156, align 4, !tbaa !5
  %158 = add nsw i32 %157, %155
  store i32 %158, ptr %156, align 4, !tbaa !5
  %159 = and i32 %158, 7
  %160 = getelementptr i32, ptr %150, i64 %154
  %161 = load i32, ptr %160, align 4, !tbaa !5
  %162 = add nsw i32 %161, %159
  store i32 %162, ptr %160, align 4, !tbaa !5
  %163 = and i32 %162, 7
  %164 = getelementptr i32, ptr %151, i64 %154
  %165 = load i32, ptr %164, align 4, !tbaa !5
  %166 = add nsw i32 %165, %163
  store i32 %166, ptr %164, align 4, !tbaa !5
  %167 = add nuw nsw i64 %154, 3
  %168 = icmp eq i64 %167, 4194304
  br i1 %168, label %169, label %152, !llvm.loop !13

169:                                              ; preds = %152
  %170 = add nsw i64 %146, %148
  %171 = load i32, ptr %23, align 4, !tbaa !5
  %172 = sext i32 %171 to i64
  %173 = load i32, ptr %2, align 4
  %174 = getelementptr i32, ptr %2, i64 1
  %175 = getelementptr i32, ptr %2, i64 2
  br label %176

176:                                              ; preds = %176, %169
  %177 = phi i32 [ %173, %169 ], [ %190, %176 ]
  %178 = phi i64 [ 1, %169 ], [ %191, %176 ]
  %179 = and i32 %177, 7
  %180 = getelementptr inbounds i32, ptr %2, i64 %178
  %181 = load i32, ptr %180, align 4, !tbaa !5
  %182 = add nsw i32 %181, %179
  store i32 %182, ptr %180, align 4, !tbaa !5
  %183 = and i32 %182, 7
  %184 = getelementptr i32, ptr %174, i64 %178
  %185 = load i32, ptr %184, align 4, !tbaa !5
  %186 = add nsw i32 %185, %183
  store i32 %186, ptr %184, align 4, !tbaa !5
  %187 = and i32 %186, 7
  %188 = getelementptr i32, ptr %175, i64 %178
  %189 = load i32, ptr %188, align 4, !tbaa !5
  %190 = add nsw i32 %189, %187
  store i32 %190, ptr %188, align 4, !tbaa !5
  %191 = add nuw nsw i64 %178, 3
  %192 = icmp eq i64 %191, 4194304
  br i1 %192, label %193, label %176, !llvm.loop !13

193:                                              ; preds = %176
  %194 = add nsw i64 %170, %172
  %195 = load i32, ptr %23, align 4, !tbaa !5
  %196 = sext i32 %195 to i64
  %197 = load i32, ptr %2, align 4
  %198 = getelementptr i32, ptr %2, i64 1
  %199 = getelementptr i32, ptr %2, i64 2
  br label %200

200:                                              ; preds = %200, %193
  %201 = phi i32 [ %197, %193 ], [ %214, %200 ]
  %202 = phi i64 [ 1, %193 ], [ %215, %200 ]
  %203 = and i32 %201, 7
  %204 = getelementptr inbounds i32, ptr %2, i64 %202
  %205 = load i32, ptr %204, align 4, !tbaa !5
  %206 = add nsw i32 %205, %203
  store i32 %206, ptr %204, align 4, !tbaa !5
  %207 = and i32 %206, 7
  %208 = getelementptr i32, ptr %198, i64 %202
  %209 = load i32, ptr %208, align 4, !tbaa !5
  %210 = add nsw i32 %209, %207
  store i32 %210, ptr %208, align 4, !tbaa !5
  %211 = and i32 %210, 7
  %212 = getelementptr i32, ptr %199, i64 %202
  %213 = load i32, ptr %212, align 4, !tbaa !5
  %214 = add nsw i32 %213, %211
  store i32 %214, ptr %212, align 4, !tbaa !5
  %215 = add nuw nsw i64 %202, 3
  %216 = icmp eq i64 %215, 4194304
  br i1 %216, label %217, label %200, !llvm.loop !13

217:                                              ; preds = %200
  %218 = add nsw i64 %194, %196
  %219 = load i32, ptr %23, align 4, !tbaa !5
  %220 = sext i32 %219 to i64
  %221 = load i32, ptr %2, align 4
  %222 = getelementptr i32, ptr %2, i64 1
  %223 = getelementptr i32, ptr %2, i64 2
  br label %224

224:                                              ; preds = %224, %217
  %225 = phi i32 [ %221, %217 ], [ %238, %224 ]
  %226 = phi i64 [ 1, %217 ], [ %239, %224 ]
  %227 = and i32 %225, 7
  %228 = getelementptr inbounds i32, ptr %2, i64 %226
  %229 = load i32, ptr %228, align 4, !tbaa !5
  %230 = add nsw i32 %229, %227
  store i32 %230, ptr %228, align 4, !tbaa !5
  %231 = and i32 %230, 7
  %232 = getelementptr i32, ptr %222, i64 %226
  %233 = load i32, ptr %232, align 4, !tbaa !5
  %234 = add nsw i32 %233, %231
  store i32 %234, ptr %232, align 4, !tbaa !5
  %235 = and i32 %234, 7
  %236 = getelementptr i32, ptr %223, i64 %226
  %237 = load i32, ptr %236, align 4, !tbaa !5
  %238 = add nsw i32 %237, %235
  store i32 %238, ptr %236, align 4, !tbaa !5
  %239 = add nuw nsw i64 %226, 3
  %240 = icmp eq i64 %239, 4194304
  br i1 %240, label %241, label %224, !llvm.loop !13

241:                                              ; preds = %224
  %242 = add nsw i64 %218, %220
  %243 = load i32, ptr %23, align 4, !tbaa !5
  %244 = sext i32 %243 to i64
  %245 = load i32, ptr %2, align 4
  %246 = getelementptr i32, ptr %2, i64 1
  %247 = getelementptr i32, ptr %2, i64 2
  br label %248

248:                                              ; preds = %248, %241
  %249 = phi i32 [ %245, %241 ], [ %262, %248 ]
  %250 = phi i64 [ 1, %241 ], [ %263, %248 ]
  %251 = and i32 %249, 7
  %252 = getelementptr inbounds i32, ptr %2, i64 %250
  %253 = load i32, ptr %252, align 4, !tbaa !5
  %254 = add nsw i32 %253, %251
  store i32 %254, ptr %252, align 4, !tbaa !5
  %255 = and i32 %254, 7
  %256 = getelementptr i32, ptr %246, i64 %250
  %257 = load i32, ptr %256, align 4, !tbaa !5
  %258 = add nsw i32 %257, %255
  store i32 %258, ptr %256, align 4, !tbaa !5
  %259 = and i32 %258, 7
  %260 = getelementptr i32, ptr %247, i64 %250
  %261 = load i32, ptr %260, align 4, !tbaa !5
  %262 = add nsw i32 %261, %259
  store i32 %262, ptr %260, align 4, !tbaa !5
  %263 = add nuw nsw i64 %250, 3
  %264 = icmp eq i64 %263, 4194304
  br i1 %264, label %265, label %248, !llvm.loop !13

265:                                              ; preds = %248
  %266 = add nsw i64 %242, %244
  %267 = load i32, ptr %23, align 4, !tbaa !5
  %268 = sext i32 %267 to i64
  %269 = load i32, ptr %2, align 4
  %270 = getelementptr i32, ptr %2, i64 1
  %271 = getelementptr i32, ptr %2, i64 2
  br label %272

272:                                              ; preds = %272, %265
  %273 = phi i32 [ %269, %265 ], [ %286, %272 ]
  %274 = phi i64 [ 1, %265 ], [ %287, %272 ]
  %275 = and i32 %273, 7
  %276 = getelementptr inbounds i32, ptr %2, i64 %274
  %277 = load i32, ptr %276, align 4, !tbaa !5
  %278 = add nsw i32 %277, %275
  store i32 %278, ptr %276, align 4, !tbaa !5
  %279 = and i32 %278, 7
  %280 = getelementptr i32, ptr %270, i64 %274
  %281 = load i32, ptr %280, align 4, !tbaa !5
  %282 = add nsw i32 %281, %279
  store i32 %282, ptr %280, align 4, !tbaa !5
  %283 = and i32 %282, 7
  %284 = getelementptr i32, ptr %271, i64 %274
  %285 = load i32, ptr %284, align 4, !tbaa !5
  %286 = add nsw i32 %285, %283
  store i32 %286, ptr %284, align 4, !tbaa !5
  %287 = add nuw nsw i64 %274, 3
  %288 = icmp eq i64 %287, 4194304
  br i1 %288, label %289, label %272, !llvm.loop !13

289:                                              ; preds = %272
  %290 = add nsw i64 %266, %268
  %291 = load i32, ptr %23, align 4, !tbaa !5
  %292 = sext i32 %291 to i64
  %293 = load i32, ptr %2, align 4
  %294 = getelementptr i32, ptr %2, i64 1
  %295 = getelementptr i32, ptr %2, i64 2
  br label %296

296:                                              ; preds = %296, %289
  %297 = phi i32 [ %293, %289 ], [ %310, %296 ]
  %298 = phi i64 [ 1, %289 ], [ %311, %296 ]
  %299 = and i32 %297, 7
  %300 = getelementptr inbounds i32, ptr %2, i64 %298
  %301 = load i32, ptr %300, align 4, !tbaa !5
  %302 = add nsw i32 %301, %299
  store i32 %302, ptr %300, align 4, !tbaa !5
  %303 = and i32 %302, 7
  %304 = getelementptr i32, ptr %294, i64 %298
  %305 = load i32, ptr %304, align 4, !tbaa !5
  %306 = add nsw i32 %305, %303
  store i32 %306, ptr %304, align 4, !tbaa !5
  %307 = and i32 %306, 7
  %308 = getelementptr i32, ptr %295, i64 %298
  %309 = load i32, ptr %308, align 4, !tbaa !5
  %310 = add nsw i32 %309, %307
  store i32 %310, ptr %308, align 4, !tbaa !5
  %311 = add nuw nsw i64 %298, 3
  %312 = icmp eq i64 %311, 4194304
  br i1 %312, label %313, label %296, !llvm.loop !13

313:                                              ; preds = %296
  %314 = add nsw i64 %290, %292
  %315 = load i32, ptr %23, align 4, !tbaa !5
  %316 = sext i32 %315 to i64
  %317 = load i32, ptr %2, align 4
  %318 = getelementptr i32, ptr %2, i64 1
  %319 = getelementptr i32, ptr %2, i64 2
  br label %320

320:                                              ; preds = %320, %313
  %321 = phi i32 [ %317, %313 ], [ %334, %320 ]
  %322 = phi i64 [ 1, %313 ], [ %335, %320 ]
  %323 = and i32 %321, 7
  %324 = getelementptr inbounds i32, ptr %2, i64 %322
  %325 = load i32, ptr %324, align 4, !tbaa !5
  %326 = add nsw i32 %325, %323
  store i32 %326, ptr %324, align 4, !tbaa !5
  %327 = and i32 %326, 7
  %328 = getelementptr i32, ptr %318, i64 %322
  %329 = load i32, ptr %328, align 4, !tbaa !5
  %330 = add nsw i32 %329, %327
  store i32 %330, ptr %328, align 4, !tbaa !5
  %331 = and i32 %330, 7
  %332 = getelementptr i32, ptr %319, i64 %322
  %333 = load i32, ptr %332, align 4, !tbaa !5
  %334 = add nsw i32 %333, %331
  store i32 %334, ptr %332, align 4, !tbaa !5
  %335 = add nuw nsw i64 %322, 3
  %336 = icmp eq i64 %335, 4194304
  br i1 %336, label %337, label %320, !llvm.loop !13

337:                                              ; preds = %320
  %338 = add nsw i64 %314, %316
  %339 = load i32, ptr %23, align 4, !tbaa !5
  %340 = sext i32 %339 to i64
  %341 = load i32, ptr %2, align 4
  %342 = getelementptr i32, ptr %2, i64 1
  %343 = getelementptr i32, ptr %2, i64 2
  br label %344

344:                                              ; preds = %344, %337
  %345 = phi i32 [ %341, %337 ], [ %358, %344 ]
  %346 = phi i64 [ 1, %337 ], [ %359, %344 ]
  %347 = and i32 %345, 7
  %348 = getelementptr inbounds i32, ptr %2, i64 %346
  %349 = load i32, ptr %348, align 4, !tbaa !5
  %350 = add nsw i32 %349, %347
  store i32 %350, ptr %348, align 4, !tbaa !5
  %351 = and i32 %350, 7
  %352 = getelementptr i32, ptr %342, i64 %346
  %353 = load i32, ptr %352, align 4, !tbaa !5
  %354 = add nsw i32 %353, %351
  store i32 %354, ptr %352, align 4, !tbaa !5
  %355 = and i32 %354, 7
  %356 = getelementptr i32, ptr %343, i64 %346
  %357 = load i32, ptr %356, align 4, !tbaa !5
  %358 = add nsw i32 %357, %355
  store i32 %358, ptr %356, align 4, !tbaa !5
  %359 = add nuw nsw i64 %346, 3
  %360 = icmp eq i64 %359, 4194304
  br i1 %360, label %361, label %344, !llvm.loop !13

361:                                              ; preds = %344
  %362 = add nsw i64 %338, %340
  %363 = load i32, ptr %23, align 4, !tbaa !5
  %364 = sext i32 %363 to i64
  %365 = load i32, ptr %2, align 4
  %366 = getelementptr i32, ptr %2, i64 1
  %367 = getelementptr i32, ptr %2, i64 2
  br label %368

368:                                              ; preds = %368, %361
  %369 = phi i32 [ %365, %361 ], [ %382, %368 ]
  %370 = phi i64 [ 1, %361 ], [ %383, %368 ]
  %371 = and i32 %369, 7
  %372 = getelementptr inbounds i32, ptr %2, i64 %370
  %373 = load i32, ptr %372, align 4, !tbaa !5
  %374 = add nsw i32 %373, %371
  store i32 %374, ptr %372, align 4, !tbaa !5
  %375 = and i32 %374, 7
  %376 = getelementptr i32, ptr %366, i64 %370
  %377 = load i32, ptr %376, align 4, !tbaa !5
  %378 = add nsw i32 %377, %375
  store i32 %378, ptr %376, align 4, !tbaa !5
  %379 = and i32 %378, 7
  %380 = getelementptr i32, ptr %367, i64 %370
  %381 = load i32, ptr %380, align 4, !tbaa !5
  %382 = add nsw i32 %381, %379
  store i32 %382, ptr %380, align 4, !tbaa !5
  %383 = add nuw nsw i64 %370, 3
  %384 = icmp eq i64 %383, 4194304
  br i1 %384, label %385, label %368, !llvm.loop !13

385:                                              ; preds = %368
  %386 = add nsw i64 %362, %364
  %387 = load i32, ptr %23, align 4, !tbaa !5
  %388 = sext i32 %387 to i64
  %389 = add nsw i64 %386, %388
  %390 = invoke noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo9_M_insertIxEERSoT_(ptr noundef nonnull align 8 dereferenceable(8) @_ZSt4cout, i64 noundef %389)
          to label %408 unwind label %421

391:                                              ; preds = %391, %22
  %392 = phi i32 [ %24, %22 ], [ %405, %391 ]
  %393 = phi i64 [ 1, %22 ], [ %406, %391 ]
  %394 = and i32 %392, 7
  %395 = getelementptr inbounds i32, ptr %2, i64 %393
  %396 = load i32, ptr %395, align 4, !tbaa !5
  %397 = add nsw i32 %396, %394
  store i32 %397, ptr %395, align 4, !tbaa !5
  %398 = and i32 %397, 7
  %399 = getelementptr i32, ptr %25, i64 %393
  %400 = load i32, ptr %399, align 4, !tbaa !5
  %401 = add nsw i32 %400, %398
  store i32 %401, ptr %399, align 4, !tbaa !5
  %402 = and i32 %401, 7
  %403 = getelementptr i32, ptr %26, i64 %393
  %404 = load i32, ptr %403, align 4, !tbaa !5
  %405 = add nsw i32 %404, %402
  store i32 %405, ptr %403, align 4, !tbaa !5
  %406 = add nuw nsw i64 %393, 3
  %407 = icmp eq i64 %406, 4194304
  br i1 %407, label %27, label %391, !llvm.loop !13

408:                                              ; preds = %385
  call void @llvm.lifetime.start.p0(i64 1, ptr nonnull %1)
  store i8 10, ptr %1, align 1, !tbaa !14
  %409 = load ptr, ptr %390, align 8, !tbaa !15
  %410 = getelementptr i8, ptr %409, i64 -24
  %411 = load i64, ptr %410, align 8
  %412 = getelementptr inbounds i8, ptr %390, i64 %411
  %413 = getelementptr inbounds %"class.std::ios_base", ptr %412, i64 0, i32 2
  %414 = load i64, ptr %413, align 8, !tbaa !17
  %415 = icmp eq i64 %414, 0
  br i1 %415, label %418, label %416

416:                                              ; preds = %408
  %417 = invoke noundef nonnull align 8 dereferenceable(8) ptr @_ZSt16__ostream_insertIcSt11char_traitsIcEERSt13basic_ostreamIT_T0_ES6_PKS3_l(ptr noundef nonnull align 8 dereferenceable(8) %390, ptr noundef nonnull %1, i64 noundef 1)
          to label %420 unwind label %421

418:                                              ; preds = %408
  %419 = invoke noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo3putEc(ptr noundef nonnull align 8 dereferenceable(8) %390, i8 noundef signext 10)
          to label %420 unwind label %421

420:                                              ; preds = %416, %418
  call void @llvm.lifetime.end.p0(i64 1, ptr nonnull %1)
  call void @_ZdlPv(ptr noundef nonnull %2) #6
  ret i32 0

421:                                              ; preds = %418, %416, %385
  %422 = landingpad { ptr, i32 }
          cleanup
  call void @_ZdlPv(ptr noundef nonnull %2) #6
  resume { ptr, i32 } %422
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
