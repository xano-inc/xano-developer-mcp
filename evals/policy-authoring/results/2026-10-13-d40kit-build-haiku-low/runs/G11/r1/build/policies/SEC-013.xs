policy "SEC-013" {
  title = "External requests time out quickly"
  statement = "Every external request (api.request, stream.from_request, webflow.request, api.microservice, api.lambda) sets a timeout of at most 30 seconds, so one slow vendor cannot stall the app. A request that cannot meet this is reported to its owner, who decides whether to exempt it."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    check = "statement.param_bound"
    params = {statements: ["api.request", "stream.from_request", "webflow.request", "api.microservice", "api.lambda"], param_names: ["timeout"], max: 30, unit: "seconds"}
  }
}
