policy "SEC-013" {
  title = "External requests time out quickly"
  statement = "Every external request (api.request, stream.from_request, webflow.request) sets its own timeout in the code, and that timeout is at most 30 seconds, so one slow vendor cannot stall the app. A request that leaves the timeout to its default is not accepted. A longer timeout is exempted only by the policy owner."
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
