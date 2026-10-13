// Signs a user in and returns an auth token. Public by design.
query "auth/login" verb=POST {
  api_group = "app"

  input {
    email email filters=trim|lower
    text password
  }

  stack {
    db.get users {
      field_name = "email"
      field_value = $input.email
    } as $user
  
    security.check_password {
      text_password = $input.password
      hash_password = $user.password
    } as $ok
  
    precondition ($ok) {
      error_type = "accessdenied"
      error = "Wrong email or password."
    }
  
    security.create_auth_token {
      table = "users"
      extras = {}
      expiration = 86400
      id = $user.id
    } as $token
  }

  response = {token: $token}
  tags = ["public"]
  guid = "htgQegHjLXgs3wsCEx_67N9e8xo"
}