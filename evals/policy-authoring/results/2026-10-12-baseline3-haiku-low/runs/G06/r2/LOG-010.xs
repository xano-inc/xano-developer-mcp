policy "LOG-010" {
  title = "External calls handle their own failures"
  statement = "Every api.request sits inside a try block, so a vendor failure reaches error handling instead of reaching the caller unhandled. This covers api.request only; other outbound statements are not checked by this policy."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    title = "Requests sit inside a try_catch"
    check = "statement.containment"
    params = { statements: ["api.request"], must_be_inside: ["try_catch"] }
  }
}
