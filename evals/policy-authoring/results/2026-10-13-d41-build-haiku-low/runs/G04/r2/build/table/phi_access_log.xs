// One row per access to a patient health record: who, which record, and when.
table phi_access_log {
  auth = false

  schema {
    int id
    int user_id? {
      table = "users"
    }

    text table_name
    int record_id?
    timestamp accessed_at?=now
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}
