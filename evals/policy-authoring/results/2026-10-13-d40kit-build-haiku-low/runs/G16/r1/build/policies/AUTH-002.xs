policy "AUTH-002" {
  title = "Admin endpoints check the caller's role"
  statement = "Endpoints that approve refunds or change prices must call the require_manager role check as their first statement, passing the logged-in user, so only managers and admins can use them. Other endpoints are not covered by this policy."
  severity = "critical"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.statement_required"
    params = {
      functions: ["require_manager"]
      placement: "first"
      must_reference: ["$auth"]
      paths: ["refunds/{refund_id}/approve"]
      object_kinds: ["query"]
    }
  }

  rule {
    check = "object.statement_required"
    params = {
      functions: ["require_manager"]
      placement: "first"
      must_reference: ["$auth"]
      paths: ["products/{product_id}/price"]
      object_kinds: ["query"]
    }
  }
}
