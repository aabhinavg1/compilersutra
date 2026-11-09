	.text
	.intel_syntax noprefix
	.file	"process_buffer.cpp"
	.section	.rodata.cst16,"aM",@progbits,16
	.p2align	4, 0x0                          # -- Begin function _Z14process_bufferPjm
.LCPI0_0:
	.zero	16,90
	.text
	.globl	_Z14process_bufferPjm
	.p2align	4, 0x90
	.type	_Z14process_bufferPjm,@function
_Z14process_bufferPjm:                  # @_Z14process_bufferPjm
	.cfi_startproc
# %bb.0:
	test	rsi, rsi
	je	.LBB0_8
# %bb.1:
	cmp	rsi, 8
	jae	.LBB0_3
# %bb.2:
	xor	eax, eax
	jmp	.LBB0_6
.LBB0_3:
	mov	rax, rsi
	and	rax, -8
	xor	ecx, ecx
	movdqa	xmm0, xmmword ptr [rip + .LCPI0_0] # xmm0 = [1515870810,1515870810,1515870810,1515870810]
	pcmpeqd	xmm1, xmm1
	.p2align	4, 0x90
.LBB0_4:                                # =>This Inner Loop Header: Depth=1
	movdqu	xmm2, xmmword ptr [rdi + 4*rcx]
	movdqu	xmm3, xmmword ptr [rdi + 4*rcx + 16]
	pxor	xmm2, xmm0
	pxor	xmm3, xmm0
	psubd	xmm2, xmm1
	psubd	xmm3, xmm1
	movdqu	xmmword ptr [rdi + 4*rcx], xmm2
	movdqu	xmmword ptr [rdi + 4*rcx + 16], xmm3
	add	rcx, 8
	cmp	rax, rcx
	jne	.LBB0_4
# %bb.5:
	cmp	rax, rsi
	je	.LBB0_8
.LBB0_6:
	mov	ecx, 1515870810
	.p2align	4, 0x90
.LBB0_7:                                # =>This Inner Loop Header: Depth=1
	mov	edx, dword ptr [rdi + 4*rax]
	xor	edx, ecx
	inc	edx
	mov	dword ptr [rdi + 4*rax], edx
	inc	rax
	cmp	rsi, rax
	jne	.LBB0_7
.LBB0_8:
	ret
.Lfunc_end0:
	.size	_Z14process_bufferPjm, .Lfunc_end0-_Z14process_bufferPjm
	.cfi_endproc
                                        # -- End function
	.ident	"Ubuntu clang version 18.1.3 (1ubuntu1)"
	.section	".note.GNU-stack","",@progbits
	.addrsig
