// The signed-in user edits their own profile.
query me verb=PATCH {
  api_group = "app"
  auth = "users"

  input {
    text name?
    text phone?
    bool marketing_opt_in?
  }

  stack {
    db.patch users {
      field_name = "id"
      field_value = $auth.id
      data = {name: $input.name, phone: $input.phone, marketing_opt_in: $input.marketing_opt_in}
    } as $me

    function.run record_audit_event {
      input = {user_id: $auth.id, table_name: "users", record_id: $auth.id, action: "patch"}
    } as $audit
  }

  response = $me
  guid = "hU_dGAUAU5dXtih5X1pVEZv2wyU"
}