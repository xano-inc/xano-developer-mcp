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