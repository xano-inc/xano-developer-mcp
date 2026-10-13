policy "LOG-010" {
  title = "External calls handle their own failures"
  statement = "Every external request (api.request, stream.from_request, webflow.request, api.microservice, api.lambda) sits inside a try block, so a vendor outage or error reaches error handling instead of hanging or failing the caller. The catch branch must still handle the failure; this policy checks only that the try block is there."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    check = "statement.containment"
    params = {statements: ["api.request", "stream.from_request", "webflow.request", "api.microservice", "api.lambda"], must_be_inside: ["try_catch"]}
  }
}
