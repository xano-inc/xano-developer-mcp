// One row per read of a health record: who looked, which record and when. Written only by log_phi_access.
table phi_access_log {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int user_id?
    text record_table
    int record_id
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}
