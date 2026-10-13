policy "AUTH-030" {
  title = "Users can't make themselves admin"
  statement = "No write takes the role field from request input or copies a whole request body into a record, so a caller cannot give themselves the manager or admin role. Role changes come from a fixed value set by an authorised process, not from what the caller sends."
  severity = "critical"
  active = true
  enforcement = "advisory"

  rule {
    check = "db.write_from_input_forbidden"
    params = {fields: ["role"]}
  }
}
