policy "RATE-010" {
  title = "Public endpoints and login are rate limited"
  statement = "Every public endpoint runs the rate_limit middleware before its stack, and so do login and signup. A caller past the limit is refused. An endpoint that cannot run the limiter is exempted by the platform owner, not by tagging it public."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["rate-limit"]

  rule {
    check = "object.middleware_required"
    params = {middleware: ["rate_limit"], phase: "pre", endpoint_auth: "none", object_kinds: ["query"]}
  }

  rule {
    check = "object.middleware_required"
    params = {middleware: ["rate_limit"], phase: "pre", tags: ["login"], object_kinds: ["query"]}
  }
}
