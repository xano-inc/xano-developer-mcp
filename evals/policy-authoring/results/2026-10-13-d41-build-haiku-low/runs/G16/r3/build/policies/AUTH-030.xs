policy "AUTH-030" {
  title = "Users can't make themselves admin"
  statement = "Request input never writes a user's role. Only a manager can change prices or approve refunds, and no one can give themselves the manager role."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "hipaa"]

  rule {
    check = "db.write_from_input_forbidden"
    params = { fields: ["role"] }
  }
}
