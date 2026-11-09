/* Allocation-heavy loop for AddressSanitizer overhead checks. */
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

enum { N = 200000 };

int main(void) {
  volatile uint64_t sink = 0;
  for (int r = 0; r < 40; ++r) {
    int *p = (int *)malloc((size_t)N * sizeof(int));
    if (!p)
      return 1;
    for (int i = 0; i < N; ++i)
      p[i] = i ^ r;
    for (int i = 0; i < N; ++i)
      sink += (uint64_t)p[i];
    free(p);
  }
  return sink == 0 ? 1 : 0;
}
