policy "AUTH-002" {
  title = "Admin endpoints check the caller's role"
  statement = "Every endpoint in the admin API group, and every endpoint under the admin path, must call require_role first, passing the logged-in user, so only admins reach them. Related to SOC 2 CC6.3 (role-based access). A pass shows the stored definitions matched when it ran. It does not show that the admin role is right or who holds it."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.3"]

  rule {
    check = "object.statement_required"
    params = { functions: ["require_role"], placement: "first", must_reference: ["$auth"], api_groups: ["admin"], object_kinds: ["query"] }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["require_role"], placement: "first", must_reference: ["$auth"], paths: ["admin"], object_kinds: ["query"] }
  }
}
