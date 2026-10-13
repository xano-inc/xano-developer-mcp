policy "RET-002" {
  title = "Retained data has a cleanup task"
  statement = "Every table tagged retained holds personal data that must not be kept longer than its retention period. Each such table must be referenced by an active scheduled task that deletes from it. Tables that hold no retained data carry no retained tag."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["gdpr", "soc2"]

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
