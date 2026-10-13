// Deletes expired login sessions every night.
task purge_expired_sessions {
  stack {
    db.bulk.delete sessions {
      where = $db.sessions.expires_at < now
    } as $purged
  }

  schedule = [{starts_on: 2026-01-01 03:00:00+0000, freq: 86400}]
  guid = "YniT_ROmjD-M0d6gbpueIpcTt2g"
}