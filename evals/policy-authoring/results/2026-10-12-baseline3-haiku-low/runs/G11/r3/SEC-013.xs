policy "SEC-013" {
  title = "External requests time out quickly"
  statement = "Every external request sets its own timeout, of 30 seconds or less, so one slow vendor cannot stall the workspace. A request that cannot take a timeout, such as an MCP or direct database call, is an exception for the policy owner to decide."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    check = "statement.param_bound"
    params = {
      statements: ["api.request", "stream.from_request", "webflow.request"],
      param_names: ["timeout"],
      max: 30,
      unit: "seconds"
    }
  }

  rule {
    check = "statement.param_required"
    params = {
      statements: ["api.request", "stream.from_request", "webflow.request"],
      param_names: ["timeout"]
    }
  }
}
