policy "LOG-010" {
  title = "External calls handle their own failures"
  statement = "Every external request (api.request) sits inside a try block, so a vendor outage reaches error handling instead of hanging or crashing the endpoint. Only api.request is checked. An object that cannot comply is exempted by its owner, never by the author of the change."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    check = "statement.containment"
    params = { statements: ["api.request"], must_be_inside: ["try_catch"] }
  }
}
