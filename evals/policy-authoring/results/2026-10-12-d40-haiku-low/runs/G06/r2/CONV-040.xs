policy "CONV-040" {
  title = "Endpoints and functions stay short"
  statement = "Every endpoint and function holds at most 30 statements and 3 levels of nesting. A function that is too long is split into named functions it calls, and nesting is flattened with early returns or preconditions. Advisory: a finding lists an object over either limit."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    check = "stack.size_limit"
    params = { max_statements: 30, max_nesting: 3, object_kinds: ["query", "function"] }
  }
}
