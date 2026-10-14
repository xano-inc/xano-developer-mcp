policy "LOG-011" {
  title = "Middleware doesn't swallow errors"
  statement = "No middleware is set to swallow the exceptions it catches. A middleware that silently swallows an error hides it from callers and from logs."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = []

  rule {
    check = "object.settings_forbidden"
    params = {object_kind: "middleware", when: {exception_policy: {equals: "silent"}}}
  }
}
