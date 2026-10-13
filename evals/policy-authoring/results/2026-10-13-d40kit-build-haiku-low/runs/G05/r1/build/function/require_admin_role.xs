// Stops the request unless the caller's role is admin or support_lead. Admin endpoints call it first.
function require_admin_role {
  input {
    text role
  }

  stack {
    precondition ($input.role == "admin" || $input.role == "support_lead") {
      error_type = "accessdenied"
      error = "Admin or support lead role required"
    }
  }
}
