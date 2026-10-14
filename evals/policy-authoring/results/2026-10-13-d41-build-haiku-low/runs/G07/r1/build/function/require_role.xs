// Stops the call with access denied unless the user's stored role is the role passed in. Admin endpoints call it first, with the logged-in user.
function require_role {
  input {
    int user_id
    text role
  }

  stack {
    db.get users {
      field_name = "id"
      field_value = $input.user_id
    } as $user

    precondition ($user.role == $input.role) {
      error_type = "accessdenied"
      error = "You do not have access to this area."
    }
  }

  response = {allowed: true}
}
