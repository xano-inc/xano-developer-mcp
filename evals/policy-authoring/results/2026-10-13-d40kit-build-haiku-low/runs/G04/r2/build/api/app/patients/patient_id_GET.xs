// A patient's chart header for the clinician view.
query "patients/{patient_id}" verb=GET {
  api_group = "app"
  auth = "users"

  input {
    int patient_id
  }

  stack {
    function.run log_phi_access {
      input = {user_id: $auth.id, resource: "patients", resource_id: $input.patient_id}
    } as $access

    db.get patients {
      field_name = "id"
      field_value = $input.patient_id
    } as $patient
  }

  response = $patient
  guid = "mWodKtX8x1ejIhzDrLMW9bAuG7Y"
}