policy "AUTH-002" {
  title = "Admin endpoints check the caller's role"
  statement = "Every endpoint in the admin API group must call require_admin_role as its first statement, before it does anything else, so only admin and support_lead users get through. Endpoints are selected by API group, not by URL path: an endpoint under /admin in another API group is not judged."
  severity = "critical"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.statement_required"
    params = {
      functions: ["require_admin_role"]
      placement: "first"
      api_groups: ["admin"]
      object_kinds: ["query"]
    }
  }
}
