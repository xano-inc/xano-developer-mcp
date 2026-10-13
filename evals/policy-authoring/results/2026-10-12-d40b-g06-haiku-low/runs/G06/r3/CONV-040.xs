policy "CONV-040" {
  title = "Endpoints and functions stay short"
  statement = "Every endpoint and function holds at most 30 statements and 3 levels of nesting. Split a coherent part of a long stack into a function and call it, and stop early instead of nesting further. Large legacy objects need their owner's sign-off before they are exempted."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    check = "stack.size_limit"
    params = { max_statements: 30, max_nesting: 3, object_kinds: ["query", "function"] }
  }
}
