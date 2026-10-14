policy "SEC-013" {
  title = "External requests time out quickly"
  statement = "Every external HTTP request sets its own timeout of 30 seconds or less, so one slow vendor cannot stall the workspace. A request that leaves timeout unset runs at the platform default and is reported, so the timeout is always written in the code. MCP and external database calls take no timeout and are not covered by this policy."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = []

  rule {
    check = "statement.param_required"
    params = {
      statements: ["api.request", "stream.from_request", "webflow.request"]
      param_names: ["timeout"]
    }
  }

  rule {
    check = "statement.param_bound"
    params = {
      statements: ["api.request", "stream.from_request", "webflow.request"]
      param_names: ["timeout"]
      max: 30
      unit: "seconds"
    }
  }
}
