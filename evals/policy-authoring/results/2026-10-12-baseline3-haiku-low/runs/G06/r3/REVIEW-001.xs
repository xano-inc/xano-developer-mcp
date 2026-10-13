policy "REVIEW-001" {
  title = "Functions stay small and are tested"
  statement = "Functions hold at most 30 statements and 3 levels of nesting, and every function is called by a test that asserts something. When a function outgrows the limit, move a coherent part into another function rather than adding to it."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    title = "Functions stay within 30 statements and 3 levels of nesting"
    check = "stack.size_limit"
    params = { max_statements: 30, max_nesting: 3, object_kinds: ["function"] }
  }

  rule {
    title = "Functions are covered by a test"
    check = "object.test_coverage"
    params = { object_kinds: ["function"] }
  }
}
