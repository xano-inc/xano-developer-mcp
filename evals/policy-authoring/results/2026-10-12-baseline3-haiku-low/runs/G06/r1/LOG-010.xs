policy "LOG-010" {
  title = "External calls handle their own failures"
  statement = "Every external request sits inside a try block, so a vendor failure reaches error handling. An external call that cannot be wrapped is exempted by the policy owner, never silently."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    check = "statement.containment"
    params = { statements: ["api.request"], must_be_inside: ["try_catch"] }
  }
}
