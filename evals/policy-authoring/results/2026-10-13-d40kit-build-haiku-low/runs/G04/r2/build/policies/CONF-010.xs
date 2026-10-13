policy "CONF-010" {
  title = "Health data tables are only reached by logged-in endpoints"
  statement = "Every endpoint or function that reaches a table tagged phi, directly or through a function it calls, requires login. A deliberately public endpoint that touches these tables is a HIPAA exception for the policy owner to approve, not a tag to add."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "object.tagged_table_access"
    params = { table_tags: ["phi"] }
  }
}
