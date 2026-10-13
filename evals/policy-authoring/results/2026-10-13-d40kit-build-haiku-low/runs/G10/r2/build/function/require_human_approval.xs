// Stops the calling action unless a person has approved the matching approval request.
function require_human_approval {
  input {
    int approval_id
  }

  stack {
    db.get approval_requests {
      field_name = "id"
      field_value = $input.approval_id
    } as $approval

    precondition ($approval.status == "approved") {
      error_type = "accessdenied"
      error = "A person must approve this action first."
    }
  }

  response = $approval
}
