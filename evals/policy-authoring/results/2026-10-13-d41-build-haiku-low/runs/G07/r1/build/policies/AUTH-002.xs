policy "AUTH-002" {
  title = "Admin endpoints check the caller's role"
  statement = "Every endpoint in the admin API group, and every endpoint under the admin path, calls require_role as its first statement, passing the logged-in user. An admin endpoint without that check is reported; ask the policy owner before exempting one."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.3"]

  rule {
    check = "object.statement_required"
    params = {functions: ["require_role"], placement: "first", must_reference: ["$auth"], api_groups: ["admin"], object_kinds: ["query"]}
  }

  rule {
    check = "object.statement_required"
    params = {functions: ["require_role"], placement: "first", must_reference: ["$auth"], paths: ["admin"], object_kinds: ["query"]}
  }
}
