policy "AUTH-002" {
  title = "Admin endpoints check the caller's role"
  statement = "Every endpoint under /admin must call require_admin_role as its first statement, passing the logged-in user, before doing anything else. require_admin_role stops the request unless the user's role is admin or support_lead. The policy confirms the call comes first, not that the function compares the right roles."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "hipaa"]

  rule {
    check = "object.statement_required"
    params = {
      functions: ["require_admin_role"],
      placement: "first",
      must_reference: ["$auth"],
      paths: ["admin"],
      object_kinds: ["query"]
    }
  }
}
