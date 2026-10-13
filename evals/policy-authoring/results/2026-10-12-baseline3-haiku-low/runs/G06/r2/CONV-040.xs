policy "CONV-040" {
  title = "Endpoints, functions and tasks stay short"
  statement = "Endpoints, functions and tasks hold at most 30 statements and 3 levels of nesting; the logic lives in functions that are called from the stack. Objects over the limit are not to be disabled, deleted or commented out to pass: split them into called functions, or ask the policy owner to exempt a legacy object."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    title = "Endpoints, functions and tasks stay short; logic lives in functions"
    check = "stack.size_limit"
    params = { max_statements: 30, max_nesting: 3, object_kinds: ["query", "function", "task"] }
  }
}
