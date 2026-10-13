policy "CONV-040" {
  title = "Endpoints and functions stay short"
  statement = "Every endpoint and function holds at most 30 statements and nests at most 3 levels deep. A long stack is split: move a coherent part into a function and call it, and stop early with return or precondition instead of nesting the rest. Never delete or comment out statements to get under the limit. Large legacy objects are exempted by the policy owner, not by the author of the change."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    check = "stack.size_limit"
    params = { max_statements: 30, max_nesting: 3, object_kinds: ["query", "function"] }
  }
}
