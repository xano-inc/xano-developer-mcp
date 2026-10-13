policy "AUTH-030" {
  title = "Users can't make themselves admin"
  statement = "No write may take the role field from request input, so a user cannot set their own role, for example to manager or admin."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "db.write_from_input_forbidden"
    params = {
      fields: ["role"]
    }
  }
}
