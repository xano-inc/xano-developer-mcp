policy "CONF-010" {
  title = "Sensitive tables are only reached by logged-in endpoints"
  statement = "Every endpoint that reaches a table tagged `confidential`, directly or through a function, requires authentication. Related to HIPAA access control for ePHI. Depends on the confidential tag being set on the patient, appointment and clinical note tables; until it is, this rule matches no table."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "object.tagged_table_access"
    params = { table_tags: ["confidential"] }
  }
}
