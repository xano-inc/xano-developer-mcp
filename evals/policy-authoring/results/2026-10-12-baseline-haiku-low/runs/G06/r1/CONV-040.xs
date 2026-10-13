policy "CONV-040" {
  title = "Endpoints stay short"
  statement = "Endpoints hold at most 30 statements and 3 levels of nesting; the logic lives in functions. Functions are held to the same limits so a long function is split into smaller ones."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    title = "Endpoints and functions stay short; logic lives in functions"
    check = "stack.size_limit"
    params = { max_statements: 30, max_nesting: 3, object_kinds: ["query", "function"] }
  }
}
