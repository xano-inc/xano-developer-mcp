// Every night, summarise each open support ticket with the AI summariser.
task nightly_ticket_summaries {
  stack {
    db.query support_tickets {
      where = $db.support_tickets.status == "open"
      return = {type: "list"}
    } as $tickets
  
    foreach ($tickets) {
      each as $ticket {
        ai.agent.run "Ticket Summarizer" {
          args = {}|set:"ticket":$ticket.body
          allow_tool_execution = false
        } as $summary
      
        db.edit support_tickets {
          field_name = "id"
          field_value = $ticket.id
          data = {summary: $summary}
        } as $saved

        function.run record_audit_event {
          input = {
            table_name: "support_tickets"
            record_id : $ticket.id
            action    : "edit"
            changes   : {summary: $summary}
          }
        } as $audit
      }
    }
  }

  schedule = [{starts_on: 2026-01-01 02:00:00+0000, freq: 86400}]
  guid = "ZZtOTu84r8xWIwl4vK4aTSb_luQ"
}