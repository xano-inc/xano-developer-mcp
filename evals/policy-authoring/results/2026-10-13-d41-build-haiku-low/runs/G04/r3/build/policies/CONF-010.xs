policy "CONF-010" {
  title = "Endpoints reaching phi tables require login"
  statement = "Every endpoint that reaches a table tagged phi, directly or through a function, requires authentication. A deliberately public endpoint carries the public tag, signed off by the policy owner."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "object.tagged_table_access"
    params = {table_tags: ["phi"]}
  }
}
