policy "CONF-010" {
  title = "Sensitive tables are only reached by logged-in endpoints"
  statement = "Every endpoint that reaches a table tagged phi, directly or through a function, requires login. Related to HIPAA access control for protected health information."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "object.tagged_table_access"
    params = {table_tags: ["phi"]}
  }
}
