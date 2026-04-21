define i32 @add(i32 %a, i32 %b) {
entry:
  %sum = add i32 %a, %b
  ret i32 %sum
}

define i32 @mul(i32 %a, i32 %b) {
entry:
  %product = mul i32 %a, %b
  ret i32 %product
}

define i32 @main() {
entry:
  %call1 = call i32 @add(i32 2, i32 3)
  %call2 = call i32 @mul(i32 %call1, i32 4)
  ret i32 %call2
}
