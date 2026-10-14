// Stops the request unless the logged-in user's role is admin or support_lead. Admin endpoints call it first.
function require_role {
  input {
    int user_id
  }

  stack {
    db.get users {
      field_name = "id"
      field_value = $input.user_id
    } as $user

    var $allowed {
      value = $user.role == "admin" || $user.role == "support_lead"
    }

    precondition ($allowed) {
      error_type = "accessdenied"
      error = "You do not have permission to use this endpoint."
    }
  }

  response = {allowed: true}
}
