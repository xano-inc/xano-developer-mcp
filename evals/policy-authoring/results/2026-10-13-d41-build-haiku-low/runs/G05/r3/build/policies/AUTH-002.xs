policy "AUTH-002" {
  title = "Admin endpoints check the caller's role"
  statement = "Every endpoint under the /admin path calls the require_admin_role function as its first statement, passing the logged-in user. The function stops the request unless the user's role is admin or support_lead."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "hipaa"]

  rule {
    check = "object.statement_required"
    params = { functions: ["require_admin_role"], placement: "first", must_reference: ["$auth"], paths: ["admin"], object_kinds: ["query"] }
  }
}
