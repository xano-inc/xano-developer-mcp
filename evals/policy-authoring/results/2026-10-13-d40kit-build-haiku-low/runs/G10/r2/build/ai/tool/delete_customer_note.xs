// Deletes an internal note about a customer, only after a person approved it.
tool delete_customer_note {
  instructions = "Delete an internal note when the customer asks for it to be removed. Needs an approval_id from a person's approval."

  input {
    // The note to delete
    int note_id

    // The approval request a person approved for this deletion
    int approval_id
  }

  stack {
    function.run require_human_approval {
      input = {approval_id: $input.approval_id}
    } as $approved

    db.del customer_notes {
      field_name = "id"
      field_value = $input.note_id
    }
  }

  response = {deleted: true}
  guid = "fBiHjWG1iPkEHhqm-foQR71c0Xg"
}
