// Clinicians' notes from an appointment.
table clinical_notes {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int patient_id {
      table = "patients"
    }
  
    int appointment_id? {
      table = "appointments"
    }
  
    text diagnosis? {
      sensitive = true
    }
    text note {
      sensitive = true
    }
    text author_name?
  }

  index = [{type: "primary", field: [{name: "id"}]}]
  tags = ["phi"]
  guid = "UiAA2Sf5YY9LLj5_dLilWvAygo0"
}