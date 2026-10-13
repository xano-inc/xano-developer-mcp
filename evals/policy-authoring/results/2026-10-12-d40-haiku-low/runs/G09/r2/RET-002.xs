policy "RET-002" {
  title = "Retained data has a cleanup task"
  statement = "Every table carrying your retained-data tag is referenced by a scheduled task that cleans it up. The task confirms a delete happens, not how old a record must be before it is deleted: the age lives in the task's own query, so a retention period (GDPR storage limitation, two years for customer data) is not checked by this rule."
  severity = "medium"
  active = true
  enforcement = "advisory"

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
