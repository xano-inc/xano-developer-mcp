// Append-only record of each read or write of health data: who, which resource, which record and when.
table phi_access_log {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int user_id {
      table = "users"
    }

    text resource
    int record_id?
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}
