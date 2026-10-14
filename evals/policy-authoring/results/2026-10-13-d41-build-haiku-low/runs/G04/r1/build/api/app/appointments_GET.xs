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
  
    foreach ($appointments) {
      each as $appointment {
        function.run log_phi_access {
          input = {record_table: "appointments", record_id: $appointment.id}
        } as $access
      }
    }
  }

  response = $appointments
  guid = "5e9I6Dx7fcJbBFwmhaCrYUzWcQA"
}
