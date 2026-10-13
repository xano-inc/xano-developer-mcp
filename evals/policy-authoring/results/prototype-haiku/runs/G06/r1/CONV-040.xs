policy "CONV-040" {
  title = "Endpoints and functions stay short"
  statement = "Endpoints and functions hold at most 30 statements, so the logic lives in smaller functions that can be read and tested on their own. Statements inside called functions count on those functions. An object that is too long is refactored, or exempted by its owner, never by the author of the change."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    check = "stack.size_limit"
    params = { max_statements: 30, object_kinds: ["query", "function"] }
  }
}
