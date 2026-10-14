policy "LOG-011" {
  title = "Middleware doesn't swallow errors"
  statement = "No middleware is set to swallow the exceptions it catches. Middleware such as rate_limit must surface its errors so the refusal reaches the caller."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    title = "Middleware surfaces the exceptions it catches"
    check = "object.settings_forbidden"
    params = {object_kind: "middleware", when: {exception_policy: {equals: "silent"}}}
  }
}
