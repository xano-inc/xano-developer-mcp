policy "AUTH-030" {
  title = "Users can't make themselves admin"
  statement = "Record writes never take a privilege field such as role from request input, nor a whole record from it. A user cannot raise their own role, for example to manager, through their profile endpoint."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "hipaa"]

  rule {
    check = "db.write_from_input_forbidden"
    params = { fields: ["role"] }
  }
}
