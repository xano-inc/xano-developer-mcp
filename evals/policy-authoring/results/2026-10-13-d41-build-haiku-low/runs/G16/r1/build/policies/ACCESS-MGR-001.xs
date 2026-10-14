policy "ACCESS-MGR-001" {
  title = "Refund approval and price changes are manager only"
  statement = "Approving a refund and changing a product price require the manager role. Each of those endpoints calls the require_manager check first, with the logged-in user, so staff can view but not change. A user who cannot be a manager is refused; this policy does not exempt any endpoint."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.1"]

  rule {
    check = "object.statement_required"
    params = {
      functions: ["require_manager"]
      placement: "first"
      must_reference: ["$auth"]
      api_groups: ["app"]
      paths: ["refunds/{refund_id}/approve", "products/{product_id}/price"]
      object_kinds: ["query"]
    }
  }
}
