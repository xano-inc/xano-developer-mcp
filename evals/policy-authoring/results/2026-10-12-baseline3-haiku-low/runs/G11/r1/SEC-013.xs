policy "SEC-013" {
  title = "External requests time out quickly"
  statement = "Every external request must set a timeout, and that timeout must be 30 seconds or less, so one slow vendor cannot stall the app. A request that legitimately needs longer is exempted by the policy owner, not by raising the timeout here."
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
      statements: ["api.request", "stream.from_request"],
      param_names: ["timeout"]
    }
  }
}
