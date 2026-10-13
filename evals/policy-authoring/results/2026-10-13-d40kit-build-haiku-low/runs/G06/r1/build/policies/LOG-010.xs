policy "LOG-010" {
  title = "External calls handle their own failures"
  statement = "Every external request sits inside a try block, so a vendor failure reaches error handling. Checks api.request statements only."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["code-review"]

  rule {
    check = "statement.containment"
    params = { statements: ["api.request"], must_be_inside: ["try_catch"] }
  }
}
