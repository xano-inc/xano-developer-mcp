// Deletes rate-limit counters whose window has ended every night.
task purge_rate_limit_hits {
  stack {
    db.bulk.delete rate_limit_hits {
      where = $db.rate_limit_hits.window_ends_at < now
    } as $purged
  }

  schedule = [{starts_on: 2026-01-01 03:05:00+0000, freq: 86400}]
}
