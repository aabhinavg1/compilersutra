_Z14process_bufferPjm:                  # @_Z14process_bufferPjm
	.cfi_startproc
# %bb.0:
	xor	eax, eax
	mov	ecx, 1515870810
.LBB0_1:                                # =>This Inner Loop Header: Depth=1
	cmp	rsi, rax
	je	.LBB0_2
# %bb.3:                                #   in Loop: Header=BB0_1 Depth=1
	mov	edx, dword ptr [rdi + 4*rax]
	xor	edx, ecx
	inc	edx
	mov	dword ptr [rdi + 4*rax], edx
	inc	rax
	jmp	.LBB0_1
.LBB0_2:
	ret
