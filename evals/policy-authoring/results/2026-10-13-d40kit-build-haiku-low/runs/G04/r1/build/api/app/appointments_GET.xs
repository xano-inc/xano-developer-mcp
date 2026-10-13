// Today's appointments for the waiting-room screen.
query appointments verb=GET {
  api_group = "app"
  auth = "users"

  input {
  }

  stack {
    db.query appointments {
      sort = {appointments.starts_at: "asc"}
      return = {type: "list"}
    } as $appointments

    function.run log_phi_access {
      input = {user_id: $auth.id, resource: "appointments", record_id: null}
    } as $access
  }

  response = $appointments
  guid = "5e9I6Dx7fcJbBFwmhaCrYUzWcQA"
}