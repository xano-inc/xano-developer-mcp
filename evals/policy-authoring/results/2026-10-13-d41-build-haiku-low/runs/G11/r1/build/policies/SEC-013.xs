policy "SEC-013" {
  title = "External requests time out quickly"
  statement = "Every external request (api.request, stream.from_request, webflow.request, api.microservice, api.lambda) must set a timeout of at most 30 seconds, so one slow vendor cannot stall the workspace. A request that cannot take a timeout is raised with the policy owner, never exempted by the author."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    check = "statement.param_bound"
    params = {statements: ["api.request", "stream.from_request", "webflow.request", "api.microservice", "api.lambda"], param_names: ["timeout"], max: 30, unit: "seconds"}
  }

  rule {
    check = "statement.param_required"
    params = {statements: ["api.request", "stream.from_request", "webflow.request", "api.microservice", "api.lambda"], param_names: ["timeout"]}
  }
}
