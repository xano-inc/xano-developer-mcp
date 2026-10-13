policy "CONV-040" {
  title = "Endpoints and functions stay short"
  statement = "Endpoints and functions hold at most 30 statements and nest at most 3 levels deep; the logic lives in smaller functions that are called from them. An object that cannot comply is exempted by the policy owner, never by a disabled or deleted statement."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    check = "stack.size_limit"
    params = { max_statements: 30, max_nesting: 3, object_kinds: ["query", "function"] }
  }
}
