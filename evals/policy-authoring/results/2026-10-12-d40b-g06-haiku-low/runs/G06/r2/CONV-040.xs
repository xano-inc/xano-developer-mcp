policy "CONV-040" {
  title = "Endpoints and functions stay short"
  statement = "Every endpoint and function holds at most 30 statements and 3 levels of nesting. When an object is too long, move a coherent part of it into a function and call that function. A legacy object that cannot be split yet is exempted by the policy owner."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    check = "stack.size_limit"
    params = {
      max_statements: 30,
      max_nesting: 3,
      object_kinds: ["query", "function"]
    }
  }
}
