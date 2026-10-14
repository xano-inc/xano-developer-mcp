policy "RATE-001" {
  title = "Login, signup and public endpoints are rate limited"
  statement = "Every public endpoint and every endpoint under the auth path (login and signup) runs the rate_limit middleware before its stack, so a caller past the limit is refused. A public endpoint that cannot run it is exempted only by the policy owner."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = []

  rule {
    check = "object.middleware_required"
    params = {middleware: ["rate_limit"], phase: "pre", endpoint_auth: "none", object_kinds: ["query"]}
  }

  rule {
    check = "object.middleware_required"
    params = {middleware: ["rate_limit"], phase: "pre", api_groups: ["app"], paths: ["auth"], object_kinds: ["query"]}
  }
}
