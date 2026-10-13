// Records an action the support agent wants to take and stops until a person approves it in the back office.
function request_human_approval {
  input {
    text action
    json payload?
    int approval_id?
  }

  stack {
    conditional {
      if ($input.approval_id == null) {
        db.add approval_requests {
          data = {
            action : $input.action
            payload: $input.payload
            status : "pending"
          }
        } as $request
      
        throw {
          name = "approval_required"
          value = "Waiting for a person to approve request " ~ $request.id
        }
      }
    }
  
    db.get approval_requests {
      field_name = "id"
      field_value = $input.approval_id
    } as $approval
  
    precondition ($approval.status == "approved" && $approval.action == $input.action) {
      error_type = "accessdenied"
      error = "This action has not been approved."
    }
  }

  response = $approval
  guid = "q_h1OreGIDwQ9c-qeXh8ftVl0qQ"
}