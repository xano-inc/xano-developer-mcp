// A clinician adds a note to a patient's record.
query clinical_notes verb=POST {
  api_group = "app"
  auth = "users"

  input {
    int patient_id
    int appointment_id?
    text diagnosis?
    text note
  }

  stack {
    debug.log {
      value = $input[""]
    }
  
    db.add clinical_notes {
      data = {
        patient_id    : $input.patient_id
        appointment_id: $input.appointment_id
        diagnosis     : $input.diagnosis
        note          : $input.note
      }
    } as $created

    function.run log_phi_access {
      input = {table_name: "clinical_notes", record_id: $created.id}
    } as $access_log
  }

  response = $created
  guid = "3rB_UNodo0BhCF1z58vvHWyVMSk"
}