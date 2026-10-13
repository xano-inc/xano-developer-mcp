policy "RATE-001" {
  title = "Public endpoints are rate limited"
  statement = "Every public endpoint, including login, signup and any added later, runs the rate_limit middleware before its stack, so one client address cannot flood it."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["rate-limit"]

  rule {
    check = "object.middleware_required"
    params = { middleware: ["rate_limit"], phase: "pre", endpoint_auth: "none", object_kinds: ["query"] }
  }
}
