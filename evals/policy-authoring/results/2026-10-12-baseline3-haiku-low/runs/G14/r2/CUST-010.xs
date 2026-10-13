policy "CUST-010" {
  title = "Tables holding customer emails are tagged and their changes are audited"
  statement = "Every table that stores an email address carries the pii tag, so the tracking rule can find it. Every object that reaches a pii table calls record_audit_event unconditionally, so each change to customer data has a row in audit_log saying who changed which record. The audit call also requires a login, so a public object that reaches a pii table is reported: the policy owner decides whether it is exempt, and the exemption is never added by a fix."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pii", "audit"]

  rule {
    title = "Email tables carry the pii tag"
    check = "table.tag_required"
    params = { field_names: ["email", "requester_email"], field_types: ["email"], tag: "pii" }
  }

  rule {
    check = "object.tagged_table_access"
    params = { table_tags: ["pii"], function: "record_audit_event" }
  }
}
