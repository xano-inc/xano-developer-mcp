policy "AUTH-020" {
  title = "Users only reach their own records"
  statement = "HIPAA access control: a logged-in user reads and writes patient records only within their own organisation. Every read of patients filters on org_id against the logged-in user's org_id, and a new patient takes its org_id from the login, never from the request."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "db.where_constraint_required"
    params = {
      field: "org_id"
      compare_to: "$auth.org_id"
      object_kinds: ["query", "function", "middleware", "addon", "tool", "message"]
      tables: ["patients"]
    }
  }

  rule {
    check = "db.write_from_input_forbidden"
    params = { fields: ["org_id"], tables: ["patients"] }
  }
}
