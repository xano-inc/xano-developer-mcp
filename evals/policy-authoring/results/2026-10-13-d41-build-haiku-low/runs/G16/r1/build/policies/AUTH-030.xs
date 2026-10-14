policy "AUTH-030" {
  title = "Users can't make themselves admin"
  statement = "No request may write a user's role. Role is set by an administrator outside request input, never taken from what a caller sends."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.1", "hipaa"]

  rule {
    check = "db.write_from_input_forbidden"
    params = { fields: ["role"] }
  }
}
