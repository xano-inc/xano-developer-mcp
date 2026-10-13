policy "SEC-013" {
  title = "External requests time out quickly"
  statement = "Every external request times out within 30 seconds, so one slow vendor cannot stall a workspace. Every api.request and stream.from_request sets its timeout explicitly; the runtime default does not count. A request that legitimately needs longer than 30 seconds is exempted by the policy owner, never by an exemption tag added in code."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    check = "statement.param_bound"
    params = {statements: ["api.request", "stream.from_request", "webflow.request"], param_names: ["timeout"], max: 30, unit: "seconds"}
  }

  rule {
    check = "statement.param_required"
    params = {statements: ["api.request", "stream.from_request"], param_names: ["timeout"]}
  }
}
