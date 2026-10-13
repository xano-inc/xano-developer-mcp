policy "AUTH-002" {
  title = "Admin endpoints check the caller's role"
  statement = "Every endpoint in the admin API group calls the role-check function check_admin_role as its first statement, passing the logged-in user, so staff-only actions are refused for other callers."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.3"]

  rule {
    check = "object.statement_required"
    params = { functions: ["check_admin_role"], placement: "first", must_reference: ["$auth"], api_groups: ["admin"], object_kinds: ["query"] }
  }
}
