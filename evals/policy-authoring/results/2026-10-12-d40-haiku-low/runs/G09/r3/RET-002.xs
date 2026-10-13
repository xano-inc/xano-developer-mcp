policy "RET-002" {
  title = "Retained data has a cleanup task"
  statement = "Every table tagged retained has a scheduled task that deletes its expired rows. The retention period itself is set inside that task's query, not by this rule."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "gdpr"]

  rule {
    check = "table.coverage_required"
    params = {
      tags: ["retained"]
      referenced_by: {
        object_kinds: ["task"]
        statements: ["db.del", "db.bulk.delete"]
      }
    }
  }
}
