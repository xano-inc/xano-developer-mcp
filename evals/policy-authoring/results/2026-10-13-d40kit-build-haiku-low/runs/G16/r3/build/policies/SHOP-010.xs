policy "SHOP-010" {
  title = "Only managers approve refunds or change prices"
  statement = "Only a user whose role is manager may approve a refund or change a product price. Every endpoint that does either calls require_manager before the write. Staff may view refunds and products but not change them."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.statement_required"
    params = { functions: ["require_manager"], placement: "unconditional", when: { statement: "db.patch", tables: ["products"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["require_manager"], placement: "unconditional", when: { statement: "db.edit", tables: ["refunds"] } }
  }

  rule {
    check = "stack.statement_order"
    params = { before: { functions: ["require_manager"] }, after: ["db.patch", "db.edit"], tables: ["products", "refunds"] }
  }
}
