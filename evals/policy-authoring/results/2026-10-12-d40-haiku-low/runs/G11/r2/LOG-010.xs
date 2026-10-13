policy "LOG-010" {
  title = "External calls handle their own failures"
  statement = "Every external request (api.request, stream.from_request, webflow.request) sits inside a try block, so a vendor outage reaches error handling instead of failing the whole request or hanging the app. The check confirms the try block is there. What the catch branch returns to the caller is reviewed by a person. A call that cannot sit in a try block is exempted only by the policy owner."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    check = "statement.containment"
    params = { statements: ["api.request", "stream.from_request", "webflow.request"], must_be_inside: ["try_catch"] }
  }
}
