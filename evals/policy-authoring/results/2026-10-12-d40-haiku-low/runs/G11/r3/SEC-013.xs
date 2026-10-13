policy "SEC-013" {
  title = "External requests time out quickly"
  statement = "Every external request times out within 30 seconds, so one slow vendor cannot stall a workspace."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    check = "statement.param_bound"
    params = {
      statements: ["api.request", "stream.from_request", "webflow.request", "api.microservice", "api.lambda"]
      param_names: ["timeout"]
      max: 30
      unit: "seconds"
    }
  }
}
