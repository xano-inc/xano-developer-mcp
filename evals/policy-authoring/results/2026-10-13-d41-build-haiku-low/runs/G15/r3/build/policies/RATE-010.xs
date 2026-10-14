policy "RATE-010" {
  title = "Public endpoints and login/signup run the rate limit first"
  statement = "Every public endpoint, and the login and signup endpoints, must run the rate_limit middleware before their stack, so a caller who hits them too often is refused. Attach the middleware to the API group rather than per endpoint. The limit value and the counting key are not checked here."
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
    params = {middleware: ["rate_limit"], phase: "pre", api_groups: ["app"], paths: ["auth/login", "auth/signup"], object_kinds: ["query"]}
  }
}
