policy "AUTH-030" {
  title = "Users can't make themselves admin"
  statement = "HIPAA access management: a user cannot change their own role or organisation through a request. User rows take role and org_id from an admin action, never straight from the request input."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "db.write_from_input_forbidden"
    params = { fields: ["role", "org_id"], tables: ["users"] }
  }
}
