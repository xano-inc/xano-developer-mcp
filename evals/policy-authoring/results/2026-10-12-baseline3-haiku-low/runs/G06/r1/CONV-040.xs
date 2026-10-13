policy "CONV-040" {
  title = "Endpoints and functions stay short"
  statement = "Endpoints and functions hold at most 30 statements and 3 levels of nesting; the logic lives in functions that are called from the stack. An object that cannot be split is exempted by the policy owner, never silently."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    check = "stack.size_limit"
    params = { max_statements: 30, max_nesting: 3, object_kinds: ["query", "function"] }
  }
}
