policy "LOG-010" {
  title = "External calls handle their own failures"
  statement = "Every external request must sit inside a try block, so a vendor failure (outage, timeout, bad response) reaches error handling instead of hanging or crashing the caller. Handling must do something sensible in the catch branch, such as returning a fallback or a clear error. An external call that cannot be wrapped needs the policy owner's sign-off before it is exempted."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    title = "External requests sit inside a try_catch"
    check = "statement.containment"
    params = {statements: ["api.request", "stream.from_request"], must_be_inside: ["try_catch"]}
  }
}
