policy "AUTH-002" {
  title = "Admin endpoints check the caller's role"
  statement = "Every endpoint in the admin API group must call the role check function check_admin_role as its first statement, passing the logged-in user. That function stops the request unless the user's role is admin or support_lead. An endpoint that cannot make this call first is not exempt; fix the endpoint."
  severity = "critical"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.statement_required"
    params = {
      functions: ["check_admin_role"]
      placement: "first"
      must_reference: ["$auth"]
      api_groups: ["admin"]
      object_kinds: ["query"]
    }
  }
}
