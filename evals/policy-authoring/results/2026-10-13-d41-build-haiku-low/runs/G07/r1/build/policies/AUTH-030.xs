policy "AUTH-030" {
  title = "Users can't make themselves admin"
  statement = "No database write takes the role field from request input, so a signed-in user cannot grant themselves a role. Writes that copy a whole request body into a user record are reported."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.3"]

  rule {
    check = "db.write_from_input_forbidden"
    params = {fields: ["role"]}
  }
}
