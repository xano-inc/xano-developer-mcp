policy "LOG-010" {
  title = "External calls handle their own failures"
  statement = "Every external request (api.request, stream.from_request, webflow.request) sits inside a try block, so a vendor outage reaches error handling instead of hanging or failing the caller. The check confirms the try block is there; it does not confirm the catch handles the failure well. An external call that cannot be wrapped is the policy owner's call to exempt."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = []

  rule {
    check = "statement.containment"
    params = {statements: ["api.request", "stream.from_request", "webflow.request"], must_be_inside: ["try_catch"]}
  }
}
