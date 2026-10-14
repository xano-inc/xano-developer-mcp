// Deletes an internal note about a customer.
tool delete_customer_note {
  instructions = "Delete an internal note when the customer asks for it to be removed."

  input {
    // The note to delete
    int note_id
  }

  stack {
    function.run require_approval {
      input = {action: "delete_customer_note", record_id: $input.note_id, requested_by: "support-agent"}
    } as $approval

    db.del customer_notes {
      field_name = "id"
      field_value = $input.note_id
    }
  }

  response = {deleted: true}
  guid = "fBiHjWG1iPkEHhqm-foQR71c0Xg"
}