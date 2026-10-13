policy "AUTH-002" {
  title = "Admin endpoints check the caller's role"
  statement = "Every endpoint in the admin API group calls the check_admin_role function as its first statement, passing the logged-in user, so no work runs before the role check. The check stops the request unless the user is an admin or a support_lead. An endpoint that must stay open to other roles is exempted by the policy owner, not by the endpoint author."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "hipaa"]

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
