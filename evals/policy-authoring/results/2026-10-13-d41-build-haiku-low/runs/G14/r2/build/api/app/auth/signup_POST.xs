// Creates an account and signs the new user in. Public by design.
query "auth/signup" verb=POST {
  api_group = "app"

  input {
    text name filters=trim
    email email filters=trim|lower
    text password
  }

  stack {
    db.add users {
      data = {
        name    : $input.name
        email   : $input.email
        password: $input.password
      }
    } as $user

    function.run record_audit_event {
      input = {
        table_name: "users"
        record_id : $user.id
        action    : "create"
        actor_id  : $user.id
      }
    } as $audit

    security.create_auth_token {
      table = "users"
      extras = {}
      expiration = 86400
      id = $user.id
    } as $token
  }

  response = {token: $token}
  tags = ["public"]
  guid = "uAC0OYfmlgmnJbNkIX2SDD_2iFA"
}