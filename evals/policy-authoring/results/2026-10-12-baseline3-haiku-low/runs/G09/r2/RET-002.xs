policy "RET-002" {
  title = "Retained data has a cleanup task"
  statement = "Every table that holds retained personal data carries the `retained` tag and is deleted from by a scheduled task, so personal data is removed once its retention period ends. Covers GDPR storage limitation (no personal data kept longer than 2 years). The task must delete records older than the retention period; this check confirms a scheduled delete exists, not the cutoff it uses."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["gdpr"]

  rule {
    check = "table.coverage_required"
    params = {
      tags: ["retained"],
      referenced_by: {
        object_kinds: ["task"],
        statements: ["db.del", "db.bulk.delete", "db.truncate", "db.direct_query"]
      }
    }
  }
}
