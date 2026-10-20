	.text
	.intel_syntax noprefix
	.file	"process_buffer.cpp"
	.globl	_Z14process_bufferPjm           # -- Begin function _Z14process_bufferPjm
	.type	_Z14process_bufferPjm,@function
_Z14process_bufferPjm:                  # @_Z14process_bufferPjm
	.cfi_startproc
# %bb.0:
	test	rsi, rsi
	je	.LBB0_3
# %bb.1:
	xor	eax, eax
	mov	ecx, 1515870810
.LBB0_2:                                # =>This Inner Loop Header: Depth=1
	mov	edx, dword ptr [rdi + 4*rax]
	xor	edx, ecx
	inc	edx
	mov	dword ptr [rdi + 4*rax], edx
	inc	rax
	cmp	rsi, rax
	jne	.LBB0_2
.LBB0_3:
	ret
.Lfunc_end0:
	.size	_Z14process_bufferPjm, .Lfunc_end0-_Z14process_bufferPjm
	.cfi_endproc
                                        # -- End function
	.ident	"Ubuntu clang version 18.1.3 (1ubuntu1)"
	.section	".note.GNU-stack","",@progbits
	.addrsig
