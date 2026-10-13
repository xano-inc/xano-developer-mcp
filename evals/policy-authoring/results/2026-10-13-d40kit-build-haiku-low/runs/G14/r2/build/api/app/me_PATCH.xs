// The signed-in user edits their own profile.
query me verb=PATCH {
  api_group = "app"
  auth = "users"

  input {
    text name?
    text phone?
    text role?
    bool marketing_opt_in?
  }

  stack {
    db.patch users {
      field_name = "id"
      field_value = $auth.id
      data = $input[""]
    } as $me

    function.run record_audit_event {
      input = {
        table_name: "users"
        record_id : $me.id
        action    : "patch"
        actor_id  : $auth.id
        changes   : $input
      }
    } as $audit
  }

  response = $me
  guid = "hU_dGAUAU5dXtih5X1pVEZv2wyU"
}