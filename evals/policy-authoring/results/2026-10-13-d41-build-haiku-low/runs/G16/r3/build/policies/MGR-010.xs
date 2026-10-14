policy "MGR-010" {
  title = "Refund approval and price changes check for a manager"
  statement = "Every endpoint that approves a refund or changes a product price calls the manager check first, before it writes anything."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["manager-only"]

  rule {
    check = "object.statement_required"
    params = {
      functions: ["require_manager"],
      placement: "first",
      must_reference: ["$auth"],
      paths: ["refunds/*/approve", "products/*/price"],
      object_kinds: ["query"]
    }
  }
}
