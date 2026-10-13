policy "AUTH-002" {
  title = "Admin endpoints check the caller's role"
  statement = "Every endpoint in the admin API group (served at /api:admin) must call the role-check function check_admin_role as its first statement, passing the logged-in user. The role check allows only users whose role is 'admin' or 'support_lead'. An endpoint that cannot call it first is not public: it must not reach data until the check has run."
  severity = "critical"
  active = true
  enforcement = "advisory"

  rule {
    title = "Admin endpoints call the role check first"
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
