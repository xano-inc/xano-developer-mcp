policy "SEC-013" {
  title = "External requests time out quickly"
  statement = "Every external request sets an explicit timeout, no longer than 30 seconds, so one slow vendor cannot stall the app. An omitted timeout is judged at its 10-second default, but the second rule requires it to be written out. A request that must wait longer needs the policy owner's exemption."
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
