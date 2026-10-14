// Every user, for support staff.
query users verb=GET {
  api_group = "admin"
  auth = "users"

  input {
    int page?=1
  }

  stack {
    function.run require_role {
      input = {user_id: $auth.id}
    } as $role_check

    db.query users {
      sort = {users.created_at: "desc"}
      return = {type: "list", paging: {page: $input.page, per_page: 50}}
    } as $users
  }

  response = $users
  guid = "9tH4Fh132vcd-EMkOyC5g4f4yu4"
}