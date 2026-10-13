policy "SEC-013" {
  title = "External requests time out quickly"
  statement = "Every external request (api.request, stream.from_request, webflow.request) sets an explicit timeout of 30 seconds or less, so one slow vendor cannot stall the app. An omitted timeout is not accepted: the timeout must be written out. A request that truly cannot be bounded is the policy owner's call to exempt."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = []

  rule {
    check = "statement.param_bound"
    params = {statements: ["api.request", "stream.from_request", "webflow.request"], param_names: ["timeout"], max: 30, unit: "seconds"}
  }

  rule {
    check = "statement.param_required"
    params = {statements: ["api.request", "stream.from_request", "webflow.request"], param_names: ["timeout"]}
  }
}
