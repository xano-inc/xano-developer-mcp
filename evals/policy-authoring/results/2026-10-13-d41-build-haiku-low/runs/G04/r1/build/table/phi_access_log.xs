// One row per read or write of a health record, written only by log_phi_access.
table phi_access_log {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int user_id? {
      table = "users"
    }
  
    text record_table
    int record_id
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}
