policy "AUTH-002" {
  title = "Admin endpoints check the caller's role"
  statement = "Every endpoint in the admin API group calls the role-check function check_admin_role as its first statement, passing the logged-in user. This supports SOC 2 CC6.1 (logical access) by showing that staff-only endpoints are guarded. It does not show that the role list itself is reviewed; that review happens outside the workspace."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.1"]

  rule {
    check = "object.statement_required"
    params = { functions: ["check_admin_role"], placement: "first", must_reference: ["$auth"], api_groups: ["admin"], object_kinds: ["query"] }
  }
}
