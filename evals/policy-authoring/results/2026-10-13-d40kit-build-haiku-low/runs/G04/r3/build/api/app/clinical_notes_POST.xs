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
    function.run log_phi_access {
      input = {user_id: $auth.id, patient_id: $input.patient_id, action: "create"}
    } as $phi_log

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
  }

  response = $created
  guid = "3rB_UNodo0BhCF1z58vvHWyVMSk"
}