policy "CONV-040" {
  title = "Endpoints and functions stay short"
  statement = "Every endpoint and function holds at most 30 statements and 3 levels of nesting. Split a coherent part of a long stack into a function and call it; stop early with a return or precondition instead of nesting further. Tag a large legacy object and ask its owner before exempting it."
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
