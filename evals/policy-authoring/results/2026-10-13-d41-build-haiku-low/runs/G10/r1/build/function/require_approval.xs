// Stops the caller unless a human has approved this action on this target in the approvals table.
function require_approval {
  input {
    text action
    text target
  }

  stack {
    db.query approvals {
      where = $db.approvals.action == $input.action && $db.approvals.target == $input.target && $db.approvals.status == "approved"
      return = {type: "single"}
    } as $approval

    precondition ($approval != null) {
      error_type = "accessdenied"
      error = "No human approval for this action yet."
    }
  }

  response = $approval
}
