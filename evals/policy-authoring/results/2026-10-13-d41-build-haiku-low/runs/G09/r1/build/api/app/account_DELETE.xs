// The signed-in user deletes their own account.
query account verb=DELETE {
  api_group = "app"
  auth = "users"

  input {
  }

  stack {
    function.run delete_user_account {
      input = {user_id: $auth.id, email: $auth.email}
    } as $result
  }

  response = $result
  guid = "J-K_49mBxN3whNDJtqk8THm42x8"
}