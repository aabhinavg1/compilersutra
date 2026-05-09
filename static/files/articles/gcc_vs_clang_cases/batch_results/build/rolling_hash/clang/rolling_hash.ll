; ModuleID = '/home/aitr/compilersutra/FixIt_Compilersutra/static/files/articles/gcc_vs_clang_cases/rolling_hash.cpp'
source_filename = "/home/aitr/compilersutra/FixIt_Compilersutra/static/files/articles/gcc_vs_clang_cases/rolling_hash.cpp"
target datalayout = "e-m:e-p270:32:32-p271:32:32-p272:64:64-i64:64-i128:128-f80:128-n8:16:32:64-S128"
target triple = "x86_64-pc-linux-gnu"

module asm ".globl _ZSt21ios_base_library_initv"

%"class.std::basic_ostream" = type { ptr, %"class.std::basic_ios" }
%"class.std::basic_ios" = type { %"class.std::ios_base", ptr, i8, i8, ptr, ptr, ptr, ptr }
%"class.std::ios_base" = type { ptr, i64, i64, i32, i32, i32, ptr, %"struct.std::ios_base::_Words", [8 x %"struct.std::ios_base::_Words"], i32, ptr, %"class.std::locale" }
%"struct.std::ios_base::_Words" = type { ptr, i64 }
%"class.std::locale" = type { ptr }
%"class.std::__cxx11::basic_string" = type { %"struct.std::__cxx11::basic_string<char>::_Alloc_hider", i64, %union.anon }
%"struct.std::__cxx11::basic_string<char>::_Alloc_hider" = type { ptr }
%union.anon = type { i64, [8 x i8] }

@.str = private unnamed_addr constant [26 x i8] c"alpha beta42 gamma_delta \00", align 1
@_ZSt4cout = external global %"class.std::basic_ostream", align 8
@.str.1 = private unnamed_addr constant [21 x i8] c"basic_string::append\00", align 1

; Function Attrs: mustprogress norecurse uwtable
define dso_local noundef i32 @main() local_unnamed_addr #0 personality ptr @__gxx_personality_v0 {
  %1 = alloca i8, align 1
  %2 = alloca %"class.std::__cxx11::basic_string", align 8
  call void @llvm.lifetime.start.p0(i64 32, ptr nonnull %2) #6
  %3 = getelementptr inbounds %"class.std::__cxx11::basic_string", ptr %2, i64 0, i32 2
  store ptr %3, ptr %2, align 8, !tbaa !5
  %4 = getelementptr inbounds %"class.std::__cxx11::basic_string", ptr %2, i64 0, i32 1
  store i64 0, ptr %4, align 8, !tbaa !10
  store i8 0, ptr %3, align 8, !tbaa !13
  invoke void @_ZNSt7__cxx1112basic_stringIcSt11char_traitsIcESaIcEE7reserveEm(ptr noundef nonnull align 8 dereferenceable(32) %2, i64 noundef 4194304)
          to label %18 unwind label %16

5:                                                ; preds = %27
  %6 = load ptr, ptr %2, align 8, !tbaa !14
  %7 = load i64, ptr %4, align 8, !tbaa !10
  %8 = getelementptr inbounds i8, ptr %6, i64 %7
  %9 = icmp eq i64 %7, 0
  br i1 %9, label %34, label %10

10:                                               ; preds = %5
  %11 = add i64 %7, -1
  %12 = and i64 %7, 1
  %13 = icmp eq i64 %11, 0
  br i1 %13, label %376, label %14

14:                                               ; preds = %10
  %15 = and i64 %7, -2
  br label %349

16:                                               ; preds = %0
  %17 = landingpad { ptr, i32 }
          cleanup
  br label %438

18:                                               ; preds = %0, %27
  %19 = phi i32 [ %28, %27 ], [ 0, %0 ]
  %20 = load i64, ptr %4, align 8, !tbaa !10
  %21 = add i64 %20, -4611686018427387879
  %22 = icmp ult i64 %21, 25
  br i1 %22, label %23, label %25

23:                                               ; preds = %18
  invoke void @_ZSt20__throw_length_errorPKc(ptr noundef nonnull @.str.1) #7
          to label %24 unwind label %32

24:                                               ; preds = %23
  unreachable

25:                                               ; preds = %18
  %26 = invoke noundef nonnull align 8 dereferenceable(32) ptr @_ZNSt7__cxx1112basic_stringIcSt11char_traitsIcESaIcEE9_M_appendEPKcm(ptr noundef nonnull align 8 dereferenceable(32) %2, ptr noundef nonnull @.str, i64 noundef 25)
          to label %27 unwind label %30

27:                                               ; preds = %25
  %28 = add nuw nsw i32 %19, 1
  %29 = icmp eq i32 %28, 262144
  br i1 %29, label %5, label %18, !llvm.loop !15

30:                                               ; preds = %25
  %31 = landingpad { ptr, i32 }
          cleanup
  br label %438

32:                                               ; preds = %23
  %33 = landingpad { ptr, i32 }
          cleanup
  br label %438

34:                                               ; preds = %318, %324, %5
  %35 = phi i64 [ 0, %5 ], [ %319, %318 ], [ %346, %324 ]
  %36 = invoke noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo9_M_insertImEERSoT_(ptr noundef nonnull align 8 dereferenceable(8) @_ZSt4cout, i64 noundef %35)
          to label %416 unwind label %436

37:                                               ; preds = %409, %37
  %38 = phi i64 [ %59, %37 ], [ %412, %409 ]
  %39 = phi i32 [ %57, %37 ], [ %413, %409 ]
  %40 = phi ptr [ %60, %37 ], [ %414, %409 ]
  %41 = load i8, ptr %40, align 1, !tbaa !13
  %42 = zext i8 %41 to i32
  %43 = xor i32 %39, %42
  %44 = mul i32 %43, 16777619
  %45 = icmp eq i8 %41, 32
  %46 = zext i32 %44 to i64
  %47 = select i1 %45, i32 -2128831035, i32 %44
  %48 = select i1 %45, i64 %46, i64 0
  %49 = add i64 %48, %38
  %50 = getelementptr inbounds i8, ptr %40, i64 1
  %51 = load i8, ptr %50, align 1, !tbaa !13
  %52 = zext i8 %51 to i32
  %53 = xor i32 %47, %52
  %54 = mul i32 %53, 16777619
  %55 = icmp eq i8 %51, 32
  %56 = zext i32 %54 to i64
  %57 = select i1 %55, i32 -2128831035, i32 %54
  %58 = select i1 %55, i64 %56, i64 0
  %59 = add i64 %58, %49
  %60 = getelementptr inbounds i8, ptr %40, i64 2
  %61 = icmp eq ptr %60, %8
  br i1 %61, label %62, label %37

62:                                               ; preds = %37, %409
  %63 = phi i32 [ %410, %409 ], [ %57, %37 ]
  %64 = phi i64 [ %411, %409 ], [ %59, %37 ]
  %65 = and i64 %7, 1
  %66 = icmp eq i64 %65, 0
  br i1 %66, label %78, label %67

67:                                               ; preds = %62
  %68 = load i8, ptr %6, align 1, !tbaa !13
  %69 = zext i8 %68 to i32
  %70 = xor i32 %63, %69
  %71 = mul i32 %70, 16777619
  %72 = icmp eq i8 %68, 32
  %73 = zext i32 %71 to i64
  %74 = select i1 %72, i32 -2128831035, i32 %71
  %75 = select i1 %72, i64 %73, i64 0
  %76 = add i64 %75, %64
  %77 = getelementptr inbounds i8, ptr %6, i64 1
  br label %78

78:                                               ; preds = %67, %62
  %79 = phi i32 [ undef, %62 ], [ %74, %67 ]
  %80 = phi i64 [ undef, %62 ], [ %76, %67 ]
  %81 = phi i64 [ %64, %62 ], [ %76, %67 ]
  %82 = phi i32 [ %63, %62 ], [ %74, %67 ]
  %83 = phi ptr [ %6, %62 ], [ %77, %67 ]
  %84 = icmp eq i64 %11, 0
  br i1 %84, label %110, label %85

85:                                               ; preds = %78, %85
  %86 = phi i64 [ %107, %85 ], [ %81, %78 ]
  %87 = phi i32 [ %105, %85 ], [ %82, %78 ]
  %88 = phi ptr [ %108, %85 ], [ %83, %78 ]
  %89 = load i8, ptr %88, align 1, !tbaa !13
  %90 = zext i8 %89 to i32
  %91 = xor i32 %87, %90
  %92 = mul i32 %91, 16777619
  %93 = icmp eq i8 %89, 32
  %94 = zext i32 %92 to i64
  %95 = select i1 %93, i32 -2128831035, i32 %92
  %96 = select i1 %93, i64 %94, i64 0
  %97 = add i64 %96, %86
  %98 = getelementptr inbounds i8, ptr %88, i64 1
  %99 = load i8, ptr %98, align 1, !tbaa !13
  %100 = zext i8 %99 to i32
  %101 = xor i32 %95, %100
  %102 = mul i32 %101, 16777619
  %103 = icmp eq i8 %99, 32
  %104 = zext i32 %102 to i64
  %105 = select i1 %103, i32 -2128831035, i32 %102
  %106 = select i1 %103, i64 %104, i64 0
  %107 = add i64 %106, %97
  %108 = getelementptr inbounds i8, ptr %88, i64 2
  %109 = icmp eq ptr %108, %8
  br i1 %109, label %110, label %85

110:                                              ; preds = %85, %78
  %111 = phi i32 [ %79, %78 ], [ %105, %85 ]
  %112 = phi i64 [ %80, %78 ], [ %107, %85 ]
  %113 = and i64 %7, 1
  %114 = icmp eq i64 %113, 0
  br i1 %114, label %126, label %115

115:                                              ; preds = %110
  %116 = load i8, ptr %6, align 1, !tbaa !13
  %117 = zext i8 %116 to i32
  %118 = xor i32 %111, %117
  %119 = mul i32 %118, 16777619
  %120 = icmp eq i8 %116, 32
  %121 = zext i32 %119 to i64
  %122 = select i1 %120, i32 -2128831035, i32 %119
  %123 = select i1 %120, i64 %121, i64 0
  %124 = add i64 %123, %112
  %125 = getelementptr inbounds i8, ptr %6, i64 1
  br label %126

126:                                              ; preds = %115, %110
  %127 = phi i32 [ undef, %110 ], [ %122, %115 ]
  %128 = phi i64 [ undef, %110 ], [ %124, %115 ]
  %129 = phi i64 [ %112, %110 ], [ %124, %115 ]
  %130 = phi i32 [ %111, %110 ], [ %122, %115 ]
  %131 = phi ptr [ %6, %110 ], [ %125, %115 ]
  %132 = icmp eq i64 %11, 0
  br i1 %132, label %158, label %133

133:                                              ; preds = %126, %133
  %134 = phi i64 [ %155, %133 ], [ %129, %126 ]
  %135 = phi i32 [ %153, %133 ], [ %130, %126 ]
  %136 = phi ptr [ %156, %133 ], [ %131, %126 ]
  %137 = load i8, ptr %136, align 1, !tbaa !13
  %138 = zext i8 %137 to i32
  %139 = xor i32 %135, %138
  %140 = mul i32 %139, 16777619
  %141 = icmp eq i8 %137, 32
  %142 = zext i32 %140 to i64
  %143 = select i1 %141, i32 -2128831035, i32 %140
  %144 = select i1 %141, i64 %142, i64 0
  %145 = add i64 %144, %134
  %146 = getelementptr inbounds i8, ptr %136, i64 1
  %147 = load i8, ptr %146, align 1, !tbaa !13
  %148 = zext i8 %147 to i32
  %149 = xor i32 %143, %148
  %150 = mul i32 %149, 16777619
  %151 = icmp eq i8 %147, 32
  %152 = zext i32 %150 to i64
  %153 = select i1 %151, i32 -2128831035, i32 %150
  %154 = select i1 %151, i64 %152, i64 0
  %155 = add i64 %154, %145
  %156 = getelementptr inbounds i8, ptr %136, i64 2
  %157 = icmp eq ptr %156, %8
  br i1 %157, label %158, label %133

158:                                              ; preds = %133, %126
  %159 = phi i32 [ %127, %126 ], [ %153, %133 ]
  %160 = phi i64 [ %128, %126 ], [ %155, %133 ]
  %161 = and i64 %7, 1
  %162 = icmp eq i64 %161, 0
  br i1 %162, label %174, label %163

163:                                              ; preds = %158
  %164 = load i8, ptr %6, align 1, !tbaa !13
  %165 = zext i8 %164 to i32
  %166 = xor i32 %159, %165
  %167 = mul i32 %166, 16777619
  %168 = icmp eq i8 %164, 32
  %169 = zext i32 %167 to i64
  %170 = select i1 %168, i32 -2128831035, i32 %167
  %171 = select i1 %168, i64 %169, i64 0
  %172 = add i64 %171, %160
  %173 = getelementptr inbounds i8, ptr %6, i64 1
  br label %174

174:                                              ; preds = %163, %158
  %175 = phi i32 [ undef, %158 ], [ %170, %163 ]
  %176 = phi i64 [ undef, %158 ], [ %172, %163 ]
  %177 = phi i64 [ %160, %158 ], [ %172, %163 ]
  %178 = phi i32 [ %159, %158 ], [ %170, %163 ]
  %179 = phi ptr [ %6, %158 ], [ %173, %163 ]
  %180 = icmp eq i64 %11, 0
  br i1 %180, label %206, label %181

181:                                              ; preds = %174, %181
  %182 = phi i64 [ %203, %181 ], [ %177, %174 ]
  %183 = phi i32 [ %201, %181 ], [ %178, %174 ]
  %184 = phi ptr [ %204, %181 ], [ %179, %174 ]
  %185 = load i8, ptr %184, align 1, !tbaa !13
  %186 = zext i8 %185 to i32
  %187 = xor i32 %183, %186
  %188 = mul i32 %187, 16777619
  %189 = icmp eq i8 %185, 32
  %190 = zext i32 %188 to i64
  %191 = select i1 %189, i32 -2128831035, i32 %188
  %192 = select i1 %189, i64 %190, i64 0
  %193 = add i64 %192, %182
  %194 = getelementptr inbounds i8, ptr %184, i64 1
  %195 = load i8, ptr %194, align 1, !tbaa !13
  %196 = zext i8 %195 to i32
  %197 = xor i32 %191, %196
  %198 = mul i32 %197, 16777619
  %199 = icmp eq i8 %195, 32
  %200 = zext i32 %198 to i64
  %201 = select i1 %199, i32 -2128831035, i32 %198
  %202 = select i1 %199, i64 %200, i64 0
  %203 = add i64 %202, %193
  %204 = getelementptr inbounds i8, ptr %184, i64 2
  %205 = icmp eq ptr %204, %8
  br i1 %205, label %206, label %181

206:                                              ; preds = %181, %174
  %207 = phi i32 [ %175, %174 ], [ %201, %181 ]
  %208 = phi i64 [ %176, %174 ], [ %203, %181 ]
  %209 = and i64 %7, 1
  %210 = icmp eq i64 %209, 0
  br i1 %210, label %222, label %211

211:                                              ; preds = %206
  %212 = load i8, ptr %6, align 1, !tbaa !13
  %213 = zext i8 %212 to i32
  %214 = xor i32 %207, %213
  %215 = mul i32 %214, 16777619
  %216 = icmp eq i8 %212, 32
  %217 = zext i32 %215 to i64
  %218 = select i1 %216, i32 -2128831035, i32 %215
  %219 = select i1 %216, i64 %217, i64 0
  %220 = add i64 %219, %208
  %221 = getelementptr inbounds i8, ptr %6, i64 1
  br label %222

222:                                              ; preds = %211, %206
  %223 = phi i32 [ undef, %206 ], [ %218, %211 ]
  %224 = phi i64 [ undef, %206 ], [ %220, %211 ]
  %225 = phi i64 [ %208, %206 ], [ %220, %211 ]
  %226 = phi i32 [ %207, %206 ], [ %218, %211 ]
  %227 = phi ptr [ %6, %206 ], [ %221, %211 ]
  %228 = icmp eq i64 %11, 0
  br i1 %228, label %254, label %229

229:                                              ; preds = %222, %229
  %230 = phi i64 [ %251, %229 ], [ %225, %222 ]
  %231 = phi i32 [ %249, %229 ], [ %226, %222 ]
  %232 = phi ptr [ %252, %229 ], [ %227, %222 ]
  %233 = load i8, ptr %232, align 1, !tbaa !13
  %234 = zext i8 %233 to i32
  %235 = xor i32 %231, %234
  %236 = mul i32 %235, 16777619
  %237 = icmp eq i8 %233, 32
  %238 = zext i32 %236 to i64
  %239 = select i1 %237, i32 -2128831035, i32 %236
  %240 = select i1 %237, i64 %238, i64 0
  %241 = add i64 %240, %230
  %242 = getelementptr inbounds i8, ptr %232, i64 1
  %243 = load i8, ptr %242, align 1, !tbaa !13
  %244 = zext i8 %243 to i32
  %245 = xor i32 %239, %244
  %246 = mul i32 %245, 16777619
  %247 = icmp eq i8 %243, 32
  %248 = zext i32 %246 to i64
  %249 = select i1 %247, i32 -2128831035, i32 %246
  %250 = select i1 %247, i64 %248, i64 0
  %251 = add i64 %250, %241
  %252 = getelementptr inbounds i8, ptr %232, i64 2
  %253 = icmp eq ptr %252, %8
  br i1 %253, label %254, label %229

254:                                              ; preds = %229, %222
  %255 = phi i32 [ %223, %222 ], [ %249, %229 ]
  %256 = phi i64 [ %224, %222 ], [ %251, %229 ]
  %257 = and i64 %7, 1
  %258 = icmp eq i64 %257, 0
  br i1 %258, label %270, label %259

259:                                              ; preds = %254
  %260 = load i8, ptr %6, align 1, !tbaa !13
  %261 = zext i8 %260 to i32
  %262 = xor i32 %255, %261
  %263 = mul i32 %262, 16777619
  %264 = icmp eq i8 %260, 32
  %265 = zext i32 %263 to i64
  %266 = select i1 %264, i32 -2128831035, i32 %263
  %267 = select i1 %264, i64 %265, i64 0
  %268 = add i64 %267, %256
  %269 = getelementptr inbounds i8, ptr %6, i64 1
  br label %270

270:                                              ; preds = %259, %254
  %271 = phi i32 [ undef, %254 ], [ %266, %259 ]
  %272 = phi i64 [ undef, %254 ], [ %268, %259 ]
  %273 = phi i64 [ %256, %254 ], [ %268, %259 ]
  %274 = phi i32 [ %255, %254 ], [ %266, %259 ]
  %275 = phi ptr [ %6, %254 ], [ %269, %259 ]
  %276 = icmp eq i64 %11, 0
  br i1 %276, label %302, label %277

277:                                              ; preds = %270, %277
  %278 = phi i64 [ %299, %277 ], [ %273, %270 ]
  %279 = phi i32 [ %297, %277 ], [ %274, %270 ]
  %280 = phi ptr [ %300, %277 ], [ %275, %270 ]
  %281 = load i8, ptr %280, align 1, !tbaa !13
  %282 = zext i8 %281 to i32
  %283 = xor i32 %279, %282
  %284 = mul i32 %283, 16777619
  %285 = icmp eq i8 %281, 32
  %286 = zext i32 %284 to i64
  %287 = select i1 %285, i32 -2128831035, i32 %284
  %288 = select i1 %285, i64 %286, i64 0
  %289 = add i64 %288, %278
  %290 = getelementptr inbounds i8, ptr %280, i64 1
  %291 = load i8, ptr %290, align 1, !tbaa !13
  %292 = zext i8 %291 to i32
  %293 = xor i32 %287, %292
  %294 = mul i32 %293, 16777619
  %295 = icmp eq i8 %291, 32
  %296 = zext i32 %294 to i64
  %297 = select i1 %295, i32 -2128831035, i32 %294
  %298 = select i1 %295, i64 %296, i64 0
  %299 = add i64 %298, %289
  %300 = getelementptr inbounds i8, ptr %280, i64 2
  %301 = icmp eq ptr %300, %8
  br i1 %301, label %302, label %277

302:                                              ; preds = %277, %270
  %303 = phi i32 [ %271, %270 ], [ %297, %277 ]
  %304 = phi i64 [ %272, %270 ], [ %299, %277 ]
  %305 = and i64 %7, 1
  %306 = icmp eq i64 %305, 0
  br i1 %306, label %318, label %307

307:                                              ; preds = %302
  %308 = load i8, ptr %6, align 1, !tbaa !13
  %309 = zext i8 %308 to i32
  %310 = xor i32 %303, %309
  %311 = mul i32 %310, 16777619
  %312 = icmp eq i8 %308, 32
  %313 = zext i32 %311 to i64
  %314 = select i1 %312, i32 -2128831035, i32 %311
  %315 = select i1 %312, i64 %313, i64 0
  %316 = add i64 %315, %304
  %317 = getelementptr inbounds i8, ptr %6, i64 1
  br label %318

318:                                              ; preds = %307, %302
  %319 = phi i64 [ undef, %302 ], [ %316, %307 ]
  %320 = phi i64 [ %304, %302 ], [ %316, %307 ]
  %321 = phi i32 [ %303, %302 ], [ %314, %307 ]
  %322 = phi ptr [ %6, %302 ], [ %317, %307 ]
  %323 = icmp eq i64 %11, 0
  br i1 %323, label %34, label %324

324:                                              ; preds = %318, %324
  %325 = phi i64 [ %346, %324 ], [ %320, %318 ]
  %326 = phi i32 [ %344, %324 ], [ %321, %318 ]
  %327 = phi ptr [ %347, %324 ], [ %322, %318 ]
  %328 = load i8, ptr %327, align 1, !tbaa !13
  %329 = zext i8 %328 to i32
  %330 = xor i32 %326, %329
  %331 = mul i32 %330, 16777619
  %332 = icmp eq i8 %328, 32
  %333 = zext i32 %331 to i64
  %334 = select i1 %332, i32 -2128831035, i32 %331
  %335 = select i1 %332, i64 %333, i64 0
  %336 = add i64 %335, %325
  %337 = getelementptr inbounds i8, ptr %327, i64 1
  %338 = load i8, ptr %337, align 1, !tbaa !13
  %339 = zext i8 %338 to i32
  %340 = xor i32 %334, %339
  %341 = mul i32 %340, 16777619
  %342 = icmp eq i8 %338, 32
  %343 = zext i32 %341 to i64
  %344 = select i1 %342, i32 -2128831035, i32 %341
  %345 = select i1 %342, i64 %343, i64 0
  %346 = add i64 %345, %336
  %347 = getelementptr inbounds i8, ptr %327, i64 2
  %348 = icmp eq ptr %347, %8
  br i1 %348, label %34, label %324

349:                                              ; preds = %349, %14
  %350 = phi i64 [ 0, %14 ], [ %372, %349 ]
  %351 = phi i32 [ -2128831035, %14 ], [ %370, %349 ]
  %352 = phi ptr [ %6, %14 ], [ %373, %349 ]
  %353 = phi i64 [ 0, %14 ], [ %374, %349 ]
  %354 = load i8, ptr %352, align 1, !tbaa !13
  %355 = zext i8 %354 to i32
  %356 = xor i32 %351, %355
  %357 = mul i32 %356, 16777619
  %358 = icmp eq i8 %354, 32
  %359 = zext i32 %357 to i64
  %360 = select i1 %358, i32 -2128831035, i32 %357
  %361 = select i1 %358, i64 %359, i64 0
  %362 = add i64 %361, %350
  %363 = getelementptr inbounds i8, ptr %352, i64 1
  %364 = load i8, ptr %363, align 1, !tbaa !13
  %365 = zext i8 %364 to i32
  %366 = xor i32 %360, %365
  %367 = mul i32 %366, 16777619
  %368 = icmp eq i8 %364, 32
  %369 = zext i32 %367 to i64
  %370 = select i1 %368, i32 -2128831035, i32 %367
  %371 = select i1 %368, i64 %369, i64 0
  %372 = add i64 %371, %362
  %373 = getelementptr inbounds i8, ptr %352, i64 2
  %374 = add i64 %353, 2
  %375 = icmp eq i64 %374, %15
  br i1 %375, label %376, label %349

376:                                              ; preds = %349, %10
  %377 = phi i32 [ undef, %10 ], [ %370, %349 ]
  %378 = phi i64 [ undef, %10 ], [ %372, %349 ]
  %379 = phi i64 [ 0, %10 ], [ %372, %349 ]
  %380 = phi i32 [ -2128831035, %10 ], [ %370, %349 ]
  %381 = phi ptr [ %6, %10 ], [ %373, %349 ]
  %382 = icmp eq i64 %12, 0
  br i1 %382, label %393, label %383

383:                                              ; preds = %376
  %384 = load i8, ptr %381, align 1, !tbaa !13
  %385 = zext i8 %384 to i32
  %386 = xor i32 %380, %385
  %387 = mul i32 %386, 16777619
  %388 = icmp eq i8 %384, 32
  %389 = zext i32 %387 to i64
  %390 = select i1 %388, i32 -2128831035, i32 %387
  %391 = select i1 %388, i64 %389, i64 0
  %392 = add i64 %391, %379
  br label %393

393:                                              ; preds = %376, %383
  %394 = phi i32 [ %377, %376 ], [ %390, %383 ]
  %395 = phi i64 [ %378, %376 ], [ %392, %383 ]
  %396 = and i64 %7, 1
  %397 = icmp eq i64 %396, 0
  br i1 %397, label %409, label %398

398:                                              ; preds = %393
  %399 = load i8, ptr %6, align 1, !tbaa !13
  %400 = zext i8 %399 to i32
  %401 = xor i32 %394, %400
  %402 = mul i32 %401, 16777619
  %403 = icmp eq i8 %399, 32
  %404 = zext i32 %402 to i64
  %405 = select i1 %403, i32 -2128831035, i32 %402
  %406 = select i1 %403, i64 %404, i64 0
  %407 = add i64 %406, %395
  %408 = getelementptr inbounds i8, ptr %6, i64 1
  br label %409

409:                                              ; preds = %398, %393
  %410 = phi i32 [ undef, %393 ], [ %405, %398 ]
  %411 = phi i64 [ undef, %393 ], [ %407, %398 ]
  %412 = phi i64 [ %395, %393 ], [ %407, %398 ]
  %413 = phi i32 [ %394, %393 ], [ %405, %398 ]
  %414 = phi ptr [ %6, %393 ], [ %408, %398 ]
  %415 = icmp eq i64 %11, 0
  br i1 %415, label %62, label %37

416:                                              ; preds = %34
  call void @llvm.lifetime.start.p0(i64 1, ptr nonnull %1)
  store i8 10, ptr %1, align 1, !tbaa !13
  %417 = load ptr, ptr %36, align 8, !tbaa !17
  %418 = getelementptr i8, ptr %417, i64 -24
  %419 = load i64, ptr %418, align 8
  %420 = getelementptr inbounds i8, ptr %36, i64 %419
  %421 = getelementptr inbounds %"class.std::ios_base", ptr %420, i64 0, i32 2
  %422 = load i64, ptr %421, align 8, !tbaa !19
  %423 = icmp eq i64 %422, 0
  br i1 %423, label %426, label %424

424:                                              ; preds = %416
  %425 = invoke noundef nonnull align 8 dereferenceable(8) ptr @_ZSt16__ostream_insertIcSt11char_traitsIcEERSt13basic_ostreamIT_T0_ES6_PKS3_l(ptr noundef nonnull align 8 dereferenceable(8) %36, ptr noundef nonnull %1, i64 noundef 1)
          to label %428 unwind label %436

426:                                              ; preds = %416
  %427 = invoke noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo3putEc(ptr noundef nonnull align 8 dereferenceable(8) %36, i8 noundef signext 10)
          to label %428 unwind label %436

428:                                              ; preds = %424, %426
  call void @llvm.lifetime.end.p0(i64 1, ptr nonnull %1)
  %429 = load ptr, ptr %2, align 8, !tbaa !14
  %430 = icmp eq ptr %429, %3
  br i1 %430, label %431, label %434

431:                                              ; preds = %428
  %432 = load i64, ptr %4, align 8, !tbaa !10
  %433 = icmp ult i64 %432, 16
  call void @llvm.assume(i1 %433)
  br label %435

434:                                              ; preds = %428
  call void @_ZdlPv(ptr noundef %429) #8
  br label %435

435:                                              ; preds = %431, %434
  call void @llvm.lifetime.end.p0(i64 32, ptr nonnull %2) #6
  ret i32 0

436:                                              ; preds = %426, %424, %34
  %437 = landingpad { ptr, i32 }
          cleanup
  br label %438

438:                                              ; preds = %30, %32, %436, %16
  %439 = phi { ptr, i32 } [ %437, %436 ], [ %17, %16 ], [ %31, %30 ], [ %33, %32 ]
  %440 = load ptr, ptr %2, align 8, !tbaa !14
  %441 = icmp eq ptr %440, %3
  br i1 %441, label %442, label %445

442:                                              ; preds = %438
  %443 = load i64, ptr %4, align 8, !tbaa !10
  %444 = icmp ult i64 %443, 16
  call void @llvm.assume(i1 %444)
  br label %446

445:                                              ; preds = %438
  call void @_ZdlPv(ptr noundef %440) #8
  br label %446

446:                                              ; preds = %442, %445
  call void @llvm.lifetime.end.p0(i64 32, ptr nonnull %2) #6
  resume { ptr, i32 } %439
}

; Function Attrs: mustprogress nocallback nofree nosync nounwind willreturn memory(argmem: readwrite)
declare void @llvm.lifetime.start.p0(i64 immarg, ptr nocapture) #1

declare void @_ZNSt7__cxx1112basic_stringIcSt11char_traitsIcESaIcEE7reserveEm(ptr noundef nonnull align 8 dereferenceable(32), i64 noundef) local_unnamed_addr #2

declare i32 @__gxx_personality_v0(...)

; Function Attrs: mustprogress nocallback nofree nosync nounwind willreturn memory(argmem: readwrite)
declare void @llvm.lifetime.end.p0(i64 immarg, ptr nocapture) #1

; Function Attrs: nobuiltin nounwind
declare void @_ZdlPv(ptr noundef) local_unnamed_addr #3

declare noundef nonnull align 8 dereferenceable(32) ptr @_ZNSt7__cxx1112basic_stringIcSt11char_traitsIcESaIcEE9_M_appendEPKcm(ptr noundef nonnull align 8 dereferenceable(32), ptr noundef, i64 noundef) local_unnamed_addr #2

; Function Attrs: noreturn
declare void @_ZSt20__throw_length_errorPKc(ptr noundef) local_unnamed_addr #4

declare noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo9_M_insertImEERSoT_(ptr noundef nonnull align 8 dereferenceable(8), i64 noundef) local_unnamed_addr #2

declare noundef nonnull align 8 dereferenceable(8) ptr @_ZSt16__ostream_insertIcSt11char_traitsIcEERSt13basic_ostreamIT_T0_ES6_PKS3_l(ptr noundef nonnull align 8 dereferenceable(8), ptr noundef, i64 noundef) local_unnamed_addr #2

declare noundef nonnull align 8 dereferenceable(8) ptr @_ZNSo3putEc(ptr noundef nonnull align 8 dereferenceable(8), i8 noundef signext) local_unnamed_addr #2

; Function Attrs: nocallback nofree nosync nounwind willreturn memory(inaccessiblemem: write)
declare void @llvm.assume(i1 noundef) #5

attributes #0 = { mustprogress norecurse uwtable "min-legal-vector-width"="0" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #1 = { mustprogress nocallback nofree nosync nounwind willreturn memory(argmem: readwrite) }
attributes #2 = { "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #3 = { nobuiltin nounwind "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #4 = { noreturn "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #5 = { nocallback nofree nosync nounwind willreturn memory(inaccessiblemem: write) }
attributes #6 = { nounwind }
attributes #7 = { noreturn }
attributes #8 = { builtin nounwind }

!llvm.module.flags = !{!0, !1, !2, !3}
!llvm.ident = !{!4}

!0 = !{i32 1, !"wchar_size", i32 4}
!1 = !{i32 8, !"PIC Level", i32 2}
!2 = !{i32 7, !"PIE Level", i32 2}
!3 = !{i32 7, !"uwtable", i32 2}
!4 = !{!"Ubuntu clang version 18.1.3 (1ubuntu1)"}
!5 = !{!6, !7, i64 0}
!6 = !{!"_ZTSNSt7__cxx1112basic_stringIcSt11char_traitsIcESaIcEE12_Alloc_hiderE", !7, i64 0}
!7 = !{!"any pointer", !8, i64 0}
!8 = !{!"omnipotent char", !9, i64 0}
!9 = !{!"Simple C++ TBAA"}
!10 = !{!11, !12, i64 8}
!11 = !{!"_ZTSNSt7__cxx1112basic_stringIcSt11char_traitsIcESaIcEEE", !6, i64 0, !12, i64 8, !8, i64 16}
!12 = !{!"long", !8, i64 0}
!13 = !{!8, !8, i64 0}
!14 = !{!11, !7, i64 0}
!15 = distinct !{!15, !16}
!16 = !{!"llvm.loop.mustprogress"}
!17 = !{!18, !18, i64 0}
!18 = !{!"vtable pointer", !9, i64 0}
!19 = !{!20, !12, i64 16}
!20 = !{!"_ZTSSt8ios_base", !12, i64 8, !12, i64 16, !21, i64 24, !22, i64 28, !22, i64 32, !7, i64 40, !23, i64 48, !8, i64 64, !24, i64 192, !7, i64 200, !25, i64 208}
!21 = !{!"_ZTSSt13_Ios_Fmtflags", !8, i64 0}
!22 = !{!"_ZTSSt12_Ios_Iostate", !8, i64 0}
!23 = !{!"_ZTSNSt8ios_base6_WordsE", !7, i64 0, !12, i64 8}
!24 = !{!"int", !8, i64 0}
!25 = !{!"_ZTSSt6locale", !7, i64 0}
