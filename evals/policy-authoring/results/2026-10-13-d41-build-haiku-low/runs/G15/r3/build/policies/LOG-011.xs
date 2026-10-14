policy "LOG-011" {
  title = "Middleware doesn't swallow errors"
  statement = "No middleware may set its exception policy to silent, because a silent middleware hides the errors it catches. The rate_limit middleware must surface its refusal to the caller."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["rate-limit"]

  rule {
    check = "object.settings_forbidden"
    params = {object_kind: "middleware", when: {exception_policy: {equals: "silent"}}}
  }
}
