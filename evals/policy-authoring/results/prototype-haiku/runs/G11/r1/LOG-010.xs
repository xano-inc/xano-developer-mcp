policy "LOG-010" {
  title = "External calls handle their own failures"
  statement = "Every external request sits inside a try block, so a vendor outage or timeout reaches error handling instead of failing the whole stack. This confirms the call is wrapped in try_catch; it does not confirm the catch branch handles the failure."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    check = "statement.containment"
    params = { statements: ["api.request", "stream.from_request"], must_be_inside: ["try_catch"] }
  }
}
