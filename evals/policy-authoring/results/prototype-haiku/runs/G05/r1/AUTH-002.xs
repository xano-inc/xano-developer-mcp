policy "AUTH-002" {
  title = "Admin endpoints check the caller's role"
  statement = "Every endpoint tagged admin calls the role-check function as its first statement, passing the logged-in user. The function must allow only the admin and support_lead roles: this rule confirms the call is first, not what the function decides. An endpoint without the admin tag is not examined, so every endpoint under /admin needs that tag. Advisory: a finding flags the endpoint and blocks nothing."
  severity = "critical"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.statement_required"
    params = { functions: ["require_admin"], placement: "first", must_reference: ["$auth"], tags: ["admin"], object_kinds: ["query"] }
  }
}
