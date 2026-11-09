/* Tiny pthread workload for -pthread vs non-threaded baseline comparison. */
#include <pthread.h>
#include <stdint.h>
#include <stdlib.h>

enum { N = 8000000 };

struct Arg {
  long start;
  long end;
  uint64_t out;
};

static void *worker(void *p) {
  struct Arg *a = (struct Arg *)p;
  uint64_t s = 0;
  for (long i = a->start; i < a->end; ++i)
    s += (uint64_t)(i * 3);
  a->out = s;
  return NULL;
}

int main(int argc, char **argv) {
  int threads = argc > 1 ? atoi(argv[1]) : 4;
  if (threads < 1)
    threads = 1;
  if (threads > 16)
    threads = 16;

  pthread_t tids[16];
  struct Arg args[16];
  long chunk = N / threads;
  for (int t = 0; t < threads; ++t) {
    args[t].start = (long)t * chunk;
    args[t].end = (t == threads - 1) ? N : args[t].start + chunk;
    args[t].out = 0;
    if (pthread_create(&tids[t], NULL, worker, &args[t]) != 0)
      return 1;
  }
  uint64_t total = 0;
  for (int t = 0; t < threads; ++t) {
    pthread_join(tids[t], NULL);
    total += args[t].out;
  }
  return total == 0 ? 1 : 0;
}
