policy "SEC-013" {
  title = "External requests time out quickly"
  statement = "Every external request times out within 30 seconds, so one slow vendor cannot stall a workspace. Each external request sets its timeout explicitly: a request that omits it is judged at a 10-second default and is reported. A request that needs longer than 30 seconds is split, or its timeout is raised, by the policy owner."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    check = "statement.param_bound"
    params = {
      statements: ["api.request", "stream.from_request", "webflow.request", "api.microservice", "api.lambda"],
      param_names: ["timeout"],
      max: 30,
      unit: "seconds"
    }
  }

  rule {
    check = "statement.param_required"
    params = {
      statements: ["api.request", "stream.from_request", "webflow.request", "api.microservice", "api.lambda"],
      param_names: ["timeout"]
    }
  }
}
