policy "CONF-010" {
  title = "Sensitive tables are only reached by logged-in endpoints"
  statement = "Every endpoint that reaches a table tagged `phi`, directly or through a function, must require a login. Until the patients, appointments and clinical_notes tables carry the `phi` tag, this rule checks nothing."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "object.tagged_table_access"
    params = {
      table_tags: ["phi"]
    }
  }
}
