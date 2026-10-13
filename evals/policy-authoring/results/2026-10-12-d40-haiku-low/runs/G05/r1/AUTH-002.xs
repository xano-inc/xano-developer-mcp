policy "AUTH-002" {
  title = "Admin endpoints check the caller's role"
  statement = "Every endpoint in the admin API group calls the role-check function check_admin_role as its first statement, passing the logged-in user. The check confirms that call comes first; check_admin_role itself must allow only the admin and support_lead roles."
  severity = "critical"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.statement_required"
    params = { functions: ["check_admin_role"], placement: "first", must_reference: ["$auth"], api_groups: ["admin"], object_kinds: ["query"] }
  }
}
