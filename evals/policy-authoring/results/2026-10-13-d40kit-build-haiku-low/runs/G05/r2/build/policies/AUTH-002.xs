policy "AUTH-002" {
  title = "Admin endpoints check the caller's role"
  statement = "Every endpoint in the admin API group calls the require_admin_role function as its first statement, passing the logged-in user, so only admin and support_lead users get past it. Related to SOC 2 CC6.1 and HIPAA access control. Confirms the call comes first, not what the function decides. Endpoints under /admin/ outside the admin API group are not covered by this rule."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.1"]

  rule {
    check = "object.statement_required"
    params = {
      functions: ["require_admin_role"]
      placement: "first"
      must_reference: ["$auth"]
      api_groups: ["admin"]
      object_kinds: ["query"]
    }
  }
}
