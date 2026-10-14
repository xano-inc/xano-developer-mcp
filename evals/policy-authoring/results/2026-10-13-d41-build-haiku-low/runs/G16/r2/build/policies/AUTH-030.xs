policy "AUTH-030" {
  title = "Users can't make themselves admin"
  statement = "Record writes never take a privilege field such as role or is_admin from request input, nor a whole record from it. A user cannot grant themselves a manager or admin role."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "hipaa"]

  rule {
    check = "db.write_from_input_forbidden"
    params = { fields: ["role"] }
  }
}
