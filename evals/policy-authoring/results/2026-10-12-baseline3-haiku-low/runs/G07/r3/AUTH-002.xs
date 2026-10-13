policy "AUTH-002" {
  title = "Admin endpoints check the caller's role"
  statement = "Every endpoint in the admin API group must call check_admin_role before it reads or changes data, so only admins and support leads reach back-office data. Supports SOC 2 CC6.1/CC6.3 (logical access and role-based access): it shows the role check is in place, not that access was reviewed."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.1", "cc6.3"]

  rule {
    check = "object.statement_required"
    params = {
      functions: ["check_admin_role"]
      placement: "first"
      api_groups: ["admin"]
      object_kinds: ["query"]
    }
  }
}
