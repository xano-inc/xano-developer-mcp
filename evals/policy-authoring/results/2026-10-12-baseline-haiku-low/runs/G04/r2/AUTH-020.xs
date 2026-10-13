policy "AUTH-020" {
  title = "Users only reach their own records"
  statement = "Reads of patients must filter on the logged-in user's org_id, so a user only reaches patients of their own organisation. New patient records take their org_id from the login, not the request."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    title = "Patient reads filter on the logged-in user's org"
    check = "db.where_constraint_required"
    params = {
      field: "org_id"
      compare_to: "$auth.org_id"
      table_selector: {names: ["patients"]}
    }
  }

  rule {
    title = "New patient records take their org from the login"
    check = "db.write_from_input_forbidden"
    params = {
      fields: ["org_id"]
    }
  }
}
