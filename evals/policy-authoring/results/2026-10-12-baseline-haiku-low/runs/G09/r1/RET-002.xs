policy "RET-002" {
  title = "Retained data has a cleanup task"
  statement = "Every table carrying the retained-data tag is referenced by a scheduled task that cleans it up. Personal data is kept no longer than the retention period (two years for customer data), and the task must delete or anonymise the expired records. A table that must be kept longer is exempted by its owner, not by a tag added here."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["gdpr", "storage-limitation"]

  rule {
    check = "table.coverage_required"
    params = {
      tags: ["retained"]
      referenced_by: {
        object_kinds: ["task"]
        statements: ["db.del", "db.bulk.delete", "db.truncate", "db.direct_query"]
      }
    }
  }
}
