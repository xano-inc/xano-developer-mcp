policy "AUTH-002" {
  title = "Admin endpoints check the caller's role"
  statement = "Every endpoint in the admin API group calls the role-check function as its first statement, passing the logged-in user. Only admins and support leads pass that check. An endpoint that cannot comply is exempted by the policy owner, not by the endpoint author."
  severity = "critical"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.statement_required"
    params = { functions: ["check_admin_role"], placement: "first", must_reference: ["$auth"], api_groups: ["admin"], object_kinds: ["query"] }
  }
}
