// Deletes support tickets and webhook deliveries older than two years every night.
task purge_expired_customer_data {
  stack {
    db.bulk.delete support_tickets {
      where = $db.support_tickets.created_at < ("now"|subtract_days:730)
    } as $purged_tickets

    db.bulk.delete webhook_deliveries {
      where = $db.webhook_deliveries.created_at < ("now"|subtract_days:730)
    } as $purged_deliveries
  }

  schedule = [{starts_on: 2026-01-01 04:00:00+0000, freq: 86400}]
  tags = ["retained"]
}
