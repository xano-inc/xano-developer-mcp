// Stops unless a human has approved this action. Called by tools before a side effect.
function require_approval {
  input {
    int approval_id
    text action
  }

  stack {
    db.get approvals {
      field_name = "id"
      field_value = $input.approval_id
    } as $approval

    precondition ($approval != null && $approval.action == $input.action && $approval.approved_by != null) {
      error_type = "accessdenied"
      error = "This action needs a human approval first."
    }
  }

  response = $approval
}
