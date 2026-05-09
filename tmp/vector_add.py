import torch
import triton
import triton.language as tl


@triton.jit
def vector_add_kernel(a_ptr, b_ptr, c_ptr, n_elements, BLOCK: tl.constexpr):
    pid = tl.program_id(axis=0)
    block_start = pid * BLOCK
    offsets = block_start + tl.arange(0, BLOCK)
    mask = offsets < n_elements
    a = tl.load(a_ptr + offsets, mask=mask)
    b = tl.load(b_ptr + offsets, mask=mask)
    c = a + b
    tl.store(c_ptr + offsets, c, mask=mask)


def main():
    n = 1024
    block = 1024
    device = "cuda:0"

    a = torch.randn(n, device=device)
    b = torch.randn(n, device=device)
    out = torch.empty_like(a)

    grid = lambda meta: (triton.cdiv(n, meta["BLOCK"]),)
    compiled = vector_add_kernel.warmup(a, b, out, n, BLOCK=block, grid=grid)
    vector_add_kernel[grid](a, b, out, n, BLOCK=block)
    torch.cuda.synchronize()

    ref = a + b
    print("Max error:", (out - ref).abs().max().item())

    asm = compiled.asm
    print("Available stages:", sorted(asm.keys()))

    with open("stage1_ttir.txt", "w") as f:
        f.write(asm.get("ttir", "not available"))
    with open("stage2_ttgir.txt", "w") as f:
        f.write(asm.get("ttgir", "not available"))
    with open("stage3_llir.txt", "w") as f:
        f.write(asm.get("llir", "not available"))
    with open("stage4_amdgcn.txt", "w") as f:
        f.write(asm.get("amdgcn", "not available"))
    with open("stage5_hsaco.bin", "wb") as f:
        hsaco = asm.get("hsaco", b"")
        if isinstance(hsaco, str):
            hsaco = hsaco.encode()
        f.write(hsaco)


if __name__ == "__main__":
    main()
