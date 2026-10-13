// One row per read or write of health data: who, which patient, and what they did.
table phi_access_log {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int user_id {
      table = "users"
    }

    int patient_id {
      table = "patients"
    }

    text action
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}
