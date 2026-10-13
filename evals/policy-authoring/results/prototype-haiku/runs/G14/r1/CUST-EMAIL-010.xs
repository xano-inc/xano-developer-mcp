policy "CUST-EMAIL-010" {
  title = "Customer email changes are audited"
  statement = "Every table that stores customer emails is tagged pii. Every endpoint, task, tool or message that reaches such a table must require login and must call the record_audit_event function unconditionally, so every change can be traced to who made it."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pii", "soc2", "audit"]

  rule {
    check = "table.tag_required"
    params = {
      field_names: ["email"],
      tag: "pii"
    }
  }

  rule {
    check = "object.tagged_table_access"
    params = {
      table_tags: ["pii"],
      function: "record_audit_event"
    }
  }
}
