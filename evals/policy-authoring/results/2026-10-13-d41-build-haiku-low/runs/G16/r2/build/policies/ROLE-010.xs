policy "ROLE-010" {
  title = "Refund approvals and price changes need a manager"
  statement = "Any object that writes the refunds or products tables must first call the require_manager function, so only managers can approve refunds or change prices. Endpoints tagged manager-only must call require_manager as their first statement. Staff can still read these tables."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["role-access"]

  rule {
    check = "stack.statement_order"
    params = {
      before: {functions: ["require_manager"]}
      after: ["db.edit", "db.patch", "db.add", "db.del"]
      tables: ["refunds", "products"]
    }
  }

  rule {
    check = "object.statement_required"
    params = {
      functions: ["require_manager"]
      placement: "first"
      tags: ["manager-only"]
    }
  }
}
