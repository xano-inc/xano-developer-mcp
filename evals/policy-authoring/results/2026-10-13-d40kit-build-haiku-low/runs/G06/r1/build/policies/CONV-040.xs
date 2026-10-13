policy "CONV-040" {
  title = "Endpoints and functions stay short"
  statement = "Every endpoint and function holds at most 30 statements and 3 levels of nesting. Split a long object into functions it calls. Large legacy objects are exempted only by the policy owner."
  severity = "low"
  active = true
  enforcement = "advisory"
  tags = ["code-review"]

  rule {
    check = "stack.size_limit"
    params = { max_statements: 30, max_nesting: 3, object_kinds: ["query", "function"] }
  }
}
