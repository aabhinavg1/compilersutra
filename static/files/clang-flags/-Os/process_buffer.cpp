#include <cstddef>
#include <cstdint>

void process_buffer(std::uint32_t* buffer, std::size_t length) {
    for (std::size_t i = 0; i < length; ++i) {
        buffer[i] = (buffer[i] ^ 0x5A5A5A5Au) + 1u;
    }
}
