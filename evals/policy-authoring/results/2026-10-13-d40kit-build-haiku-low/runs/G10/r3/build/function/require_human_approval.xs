// Stops the caller unless a person has approved this email. Call it before any step that sends email.
function require_human_approval {
  input {
    int approval_id
  }

  stack {
    db.get email_approvals {
      field_name = "id"
      field_value = $input.approval_id
    } as $approval

    precondition ($approval.status == "approved") {
      error_type = "accessdenied"
      error = "This email has not been approved by a person."
    }
  }

  response = $approval
}
