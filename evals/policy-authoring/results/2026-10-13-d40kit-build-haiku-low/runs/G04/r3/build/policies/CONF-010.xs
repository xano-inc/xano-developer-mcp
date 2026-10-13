policy "CONF-010" {
  title = "Endpoints reaching PHI tables require login"
  statement = "Every endpoint that reaches a table tagged phi, directly or through a function, requires authentication. An endpoint that must stay public needs its owner's sign-off. Related to HIPAA access control."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "object.tagged_table_access"
    params = { table_tags: ["phi"] }
  }
}
