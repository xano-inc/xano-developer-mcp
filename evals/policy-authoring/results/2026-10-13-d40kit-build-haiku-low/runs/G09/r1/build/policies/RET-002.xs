policy "RET-002" {
  title = "Retained data has a cleanup task"
  statement = "Every table carrying the retained tag is referenced by a scheduled task that cleans it up. Retention age is set inside each cleanup task and is not checked here."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "gdpr"]

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
