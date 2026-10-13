// Summarises one support ticket with the ticket summariser agent.
function summarize_ticket {
  input {
    int ticket_id
  }

  stack {
    db.get support_tickets {
      field_name = "id"
      field_value = $input.ticket_id
    } as $ticket
  
    ai.agent.run "Ticket Summarizer" {
      args = {}|set:"ticket":$ticket.body
      allow_tool_execution = false
    } as $summary
  
    db.edit support_tickets {
      field_name = "id"
      field_value = $ticket.id
      data = {summary: $summary}
    } as $saved
  }

  response = $saved
  guid = "QT0tDYBOeqLcCgUEPDB54-RBAbA"
}