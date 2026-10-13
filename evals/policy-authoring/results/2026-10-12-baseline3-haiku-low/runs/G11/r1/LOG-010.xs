policy "LOG-010" {
  title = "External calls handle their own failures"
  statement = "Every external request must sit inside a try block, so a vendor failure (timeout, outage, error response) reaches error handling in the catch branch instead of hanging or crashing the caller. A call that cannot be wrapped is exempted by the policy owner."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    check = "statement.containment"
    params = {
      statements: ["api.request", "stream.from_request"],
      must_be_inside: ["try_catch"]
    }
  }
}
