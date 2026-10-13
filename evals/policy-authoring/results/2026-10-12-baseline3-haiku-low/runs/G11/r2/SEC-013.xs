policy "SEC-013" {
  title = "External requests time out quickly"
  statement = "Every external request must time out within 30 seconds, so one slow vendor cannot stall the app. A request that cannot be bounded this way needs its timeout set by the policy owner before it is exempted; never raise the bound to get it past this policy."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    title = "External requests time out within 30 seconds"
    check = "statement.param_bound"
    params = {statements: ["api.request", "stream.from_request", "webflow.request"], param_names: ["timeout"], max: 30, unit: "seconds"}
  }

  rule {
    title = "External requests set their timeout explicitly"
    check = "statement.param_required"
    params = {statements: ["api.request", "stream.from_request", "webflow.request"], param_names: ["timeout"]}
  }
}
