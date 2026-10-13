policy "CONF-010" {
  title = "Sensitive tables are only reached by logged-in endpoints"
  statement = "HIPAA access control: every endpoint that reaches a table tagged phi, directly or through a function, requires login. The phi tag is not yet on the workspace's tables, so this rule checks nothing until patients, appointments and clinical_notes carry it."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "object.tagged_table_access"
    params = { table_tags: ["phi"] }
  }
}
