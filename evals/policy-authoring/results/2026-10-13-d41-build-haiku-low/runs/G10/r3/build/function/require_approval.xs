// Stops an agent action unless a different person approved it for this record.
function require_approval {
  input {
    text action
    int record_id
    text requested_by
  }

  stack {
    db.query approvals {
      where = $db.approvals.action == $input.action && $db.approvals.record_id == $input.record_id && $db.approvals.requested_by != $input.requested_by && $db.approvals.approved_by != null
      return = {type: "count"}
    } as $approved

    precondition ($approved > 0) {
      error_type = "accessdenied"
      error = "This action needs a human approval first."
    }
  }

  response = true
}
