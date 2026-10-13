policy "CONV-040" {
  title = "Endpoints and functions stay short"
  statement = "Every endpoint and function holds at most 30 statements and 3 levels of nesting. Split a long stack into named functions, and stop early instead of nesting further. Legacy objects that cannot be split yet are tagged legacy and exempted by the policy owner."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    check = "stack.size_limit"
    params = {max_statements: 30, max_nesting: 3, object_kinds: ["query", "function"]}
  }
}
