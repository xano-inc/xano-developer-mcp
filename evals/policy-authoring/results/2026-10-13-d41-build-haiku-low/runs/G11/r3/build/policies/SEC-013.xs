policy "SEC-013" {
  title = "External requests time out quickly"
  statement = "Every external request sets an explicit timeout of at most 30 seconds, so one slow vendor cannot stall the app. A request with no timeout is judged at the 10-second runtime default, so it must name its timeout explicitly. Covers api.request, stream.from_request and webflow.request."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    check = "statement.param_bound"
    params = { statements: ["api.request", "stream.from_request", "webflow.request"], param_names: ["timeout"], max: 30, unit: "seconds" }
  }

  rule {
    check = "statement.param_required"
    params = { statements: ["api.request", "stream.from_request", "webflow.request"], param_names: ["timeout"] }
  }
}
