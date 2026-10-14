// A patient's chart header for the clinician view.
query "patients/{patient_id}" verb=GET {
  api_group = "app"
  auth = "users"

  input {
    int patient_id
  }

  stack {
    db.get patients {
      field_name = "id"
      field_value = $input.patient_id
    } as $patient

    function.run log_phi_access {
      input = {table_name: "patients", record_id: $input.patient_id}
    } as $access_log
  }

  response = $patient
  guid = "mWodKtX8x1ejIhzDrLMW9bAuG7Y"
}