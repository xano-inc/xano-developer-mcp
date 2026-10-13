policy "AUTH-002" {
  title = "Admin endpoints check the caller's role"
  statement = "Every endpoint in the admin API group must call check_admin_role as its first statement, before anything else runs. check_admin_role stops the request unless the signed-in user's role is admin or support_lead."
  severity = "critical"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.statement_required"
    params = {object_kinds: ["query"], api_groups: ["admin"], functions: ["check_admin_role"], placement: "first"}
  }
}
