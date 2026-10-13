// Append-only record of who read or wrote a patient record, and when.
table phi_access_log {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int user_id? {
      table = "users"
    }
  
    text resource
    int resource_id?
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}
