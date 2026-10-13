policy "RATE-010" {
  title = "Public endpoints are rate limited"
  statement = "Every endpoint, public or logged-in, runs the rate_limit middleware before its stack, so one client cannot flood login, signup or any other endpoint. An endpoint that cannot run it must be raised with the policy owner before it ships; exempting one is the owner's decision, not the author's."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["bot-protection"]

  rule {
    title = "Public endpoints attach the rate limiter"
    check = "object.middleware_required"
    params = { middleware: ["rate_limit"], phase: "pre", endpoint_auth: "none", object_kinds: ["query"] }
  }

  rule {
    title = "Logged-in endpoints attach the rate limiter"
    check = "object.middleware_required"
    params = { middleware: ["rate_limit"], phase: "pre", endpoint_auth: "required", object_kinds: ["query"] }
  }
}
