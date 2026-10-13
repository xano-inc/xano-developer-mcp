// Deletes support tickets, customer notes and newsletter sign-ups older than two years.
task purge_retained_personal_data {
  stack {
    var $cutoff {
      value = now|subtract_secs_to_timestamp:63072000
    }
  
    db.bulk.delete support_tickets {
      where = $db.support_tickets.created_at < $cutoff
    } as $tickets
  
    db.bulk.delete customer_notes {
      where = $db.customer_notes.created_at < $cutoff
    } as $notes
  
    db.bulk.delete newsletter_subscribers {
      where = $db.newsletter_subscribers.created_at < $cutoff
    } as $subscribers
  }

  schedule = [{starts_on: 2026-01-01 04:00:00+0000, freq: 86400}]
  guid = "Qm7rT2kVbX9dLh4sWcZeNa1PyUo"
}
