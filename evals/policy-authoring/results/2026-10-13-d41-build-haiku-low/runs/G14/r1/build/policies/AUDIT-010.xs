policy "AUDIT-010" {
  title = "Customer email records are tracked"
  statement = "Every table holding a customer email carries the customer-email tag, and every object that reaches such a table records the change through record_email_change."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["audit", "pii"]

  rule {
    check = "table.tag_required"
    params = { field_names: ["email", "requester_email", "billing_email"], tag: "customer-email" }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_email_change"], placement: "unconditional", reaching_table_tags: ["customer-email"] }
  }
}
