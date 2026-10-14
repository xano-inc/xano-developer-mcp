policy "AUTH-002" {
  title = "Admin endpoints check the caller's role"
  statement = "Every endpoint under /admin (the admin API group, and any endpoint whose path starts with admin) must call the require_role function as its first statement, passing the logged-in user. require_role stops the request unless the user's role is admin or support_lead."
  severity = "critical"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.statement_required"
    params = {api_groups: ["admin"], functions: ["require_role"], placement: "first", must_reference: ["$auth"], object_kinds: ["query"]}
  }

  rule {
    check = "object.statement_required"
    params = {paths: ["admin"], functions: ["require_role"], placement: "first", must_reference: ["$auth"], object_kinds: ["query"]}
  }
}
