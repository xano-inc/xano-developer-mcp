policy "AUTH-002" {
  title = "Admin endpoints check the caller's role"
  statement = "Every endpoint in the admin API group calls the role-check function check_admin_role as its first statement, passing the logged-in user, so only admins and support leads reach staff data. Related to SOC 2 CC6.2 and CC6.3 (access granting and removal)."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.3"]

  rule {
    check = "object.statement_required"
    params = {
      functions: ["check_admin_role"],
      placement: "first",
      must_reference: ["$auth"],
      api_groups: ["admin"],
      object_kinds: ["query"]
    }
  }
}
