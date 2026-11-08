#include <cstddef>
#include <cstdint>
#include <iostream>
#include <vector>

namespace {

constexpr std::size_t kLength = 1u << 22;  // 4M elements
constexpr int kPasses = 24;

__attribute__((noinline)) void process_buffer(std::uint32_t* buffer, std::size_t length) {
    for (std::size_t i = 0; i < length; ++i) {
        buffer[i] = (buffer[i] ^ 0x5A5A5A5Au) + 1u;
    }
}

}  // namespace

int main() {
    std::vector<std::uint32_t> buffer(kLength);
    for (std::size_t i = 0; i < kLength; ++i) {
        buffer[i] = static_cast<std::uint32_t>(i * 2654435761u);
    }
    std::uint64_t checksum = 0;
    for (int pass = 0; pass < kPasses; ++pass) {
        process_buffer(buffer.data(), buffer.size());
        checksum += buffer[pass & 1023] ^ buffer[(pass * 17) & (kLength - 1)];
    }
    std::cout << checksum << '\n';
    return 0;
}
