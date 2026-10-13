// Asks for an internal note about a customer to be deleted. A person approves it first.
tool delete_customer_note {
  instructions = "Ask for an internal note to be deleted when the customer asks for it to be removed. The deletion waits for a person to approve it, so tell the customer it is pending."

  input {
    // The note to delete
    int note_id
  }

  stack {
    db.add pending_actions {
      data = {
        action : "delete_customer_note"
        payload: {note_id: $input.note_id}
      }
    } as $queued
  }

  response = {queued: true}
  guid = "fBiHjWG1iPkEHhqm-foQR71c0Xg"
}