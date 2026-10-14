// Deletes support tickets older than two years every night.
task purge_expired_support_tickets {
  stack {
    db.bulk.delete support_tickets {
      where = $db.support_tickets.created_at < now|timestamp_subtract_days:730
    } as $purged
  }

  schedule = [{starts_on: 2026-01-01 04:00:00+0000, freq: 86400}]
}
