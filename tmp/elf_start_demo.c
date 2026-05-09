#include <stdio.h>
#include <stdlib.h>

int global_init = 7;
int global_uninit;
static int static_uninit;
const char *message = "hello from elf demo";

int main(void) {
    int local_value = 42;
    int *heap_value = malloc(sizeof(int));
    *heap_value = global_init + local_value;

    printf("message=%s\n", message);
    printf("&global_init=%p\n", (void *)&global_init);
    printf("&global_uninit=%p\n", (void *)&global_uninit);
    printf("&static_uninit=%p\n", (void *)&static_uninit);
    printf("&message=%p\n", (void *)&message);
    printf("&local_value=%p\n", (void *)&local_value);
    printf("heap_value=%p\n", (void *)heap_value);
    printf("global_uninit=%d static_uninit=%d computed=%d\n",
           global_uninit, static_uninit, *heap_value);

    free(heap_value);
    return 0;
}
