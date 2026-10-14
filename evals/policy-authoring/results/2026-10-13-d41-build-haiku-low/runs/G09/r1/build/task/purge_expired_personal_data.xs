// Deletes support tickets, newsletter sign-ups and orders older than 730 days (2 years) every night.
task purge_expired_personal_data {
  stack {
    db.bulk.delete support_tickets {
      where = $db.support_tickets.created_at < now|timestamp_subtract_days:730
    } as $expired_tickets

    db.bulk.delete newsletter_subscribers {
      where = $db.newsletter_subscribers.created_at < now|timestamp_subtract_days:730
    } as $expired_subscribers

    db.bulk.delete orders {
      where = $db.orders.created_at < now|timestamp_subtract_days:730
    } as $expired_orders
  }

  schedule = [{starts_on: 2026-01-01 04:00:00+0000, freq: 86400}]
  guid = "7kRq2TzVw9LbNs4XeHc1GdPm6Ua"
}
