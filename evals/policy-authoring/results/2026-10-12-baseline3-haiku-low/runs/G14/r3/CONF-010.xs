policy "CONF-010" {
  title = "Sensitive tables are only reached by logged-in endpoints"
  statement = "Any endpoint, message handler, AI tool or task that reaches a pii-tagged table, such as one holding customer emails, must call record_audit_event unconditionally in its own stack, so every change to customer data leaves a who-changed-what row in audit_log. Endpoints that reach these tables must also require a login. A call made through another function, or inside a conditional, does not count. Exempting an object is the policy owner's decision."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.1"]

  rule {
    check = "object.tagged_table_access"
    params = { table_tags: ["pii"], function: "record_audit_event" }
  }
}
