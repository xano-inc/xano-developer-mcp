policy "RATE-001" {
  title = "Public endpoints and login are rate limited"
  statement = "Every public endpoint, and the login and signup endpoints, must run the rate_limit middleware before their stack. A new public endpoint that does not run it is a blocking finding: attach rate_limit to its API group, or ask the policy owner before exempting it."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["rate-limit"]

  rule {
    title = "Public endpoints run the rate limit first"
    check = "object.middleware_required"
    params = {middleware: ["rate_limit"], phase: "pre", endpoint_auth: "none", object_kinds: ["query"]}
  }

  rule {
    title = "Login endpoints run the rate limit first"
    check = "object.middleware_required"
    params = {middleware: ["rate_limit"], phase: "pre", api_groups: ["app"], paths: ["auth"], object_kinds: ["query"]}
  }
}
