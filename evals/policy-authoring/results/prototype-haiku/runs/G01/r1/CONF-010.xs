policy "CONF-010" {
  title = "Sensitive tables are only reached by logged-in endpoints"
  statement = "Every endpoint that reaches a table carrying the invoices tag, directly or through a function, must require authentication. An endpoint that returns invoice data to an anonymous caller is a finding. Tables that must stay open are not exempt by this policy; the policy owner decides any change."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "invoices"]

  rule {
    check = "object.tagged_table_access"
    params = { table_tags: ["invoices"] }
  }
}
