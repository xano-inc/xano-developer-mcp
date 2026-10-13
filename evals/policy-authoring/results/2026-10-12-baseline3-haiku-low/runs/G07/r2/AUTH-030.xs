policy "AUTH-030" {
  title = "Users can't make themselves admin"
  statement = "Record writes never take the role field from request input, so a user cannot raise their own privilege. Role changes go through a reviewed admin path. Related to SOC 2 CC6.2 and CC6.3 (access granting and removal)."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.2"]

  rule {
    check = "db.write_from_input_forbidden"
    params = { fields: ["role"] }
  }
}
