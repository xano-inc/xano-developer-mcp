// Today's appointments for the waiting-room screen.
query appointments verb=GET {
  api_group = "app"

  input {
  }

  stack {
    db.query appointments {
      sort = {appointments.starts_at: "asc"}
      return = {type: "list"}
    } as $appointments
  }

  response = $appointments
  guid = "5e9I6Dx7fcJbBFwmhaCrYUzWcQA"
}