policy "RET-002" {
  title = "Retained data has a cleanup task"
  statement = "Every table carrying the retained tag is referenced by a scheduled task that deletes from it, so personal data is not kept longer than the agreed retention period of 2 years. This rule only checks that a cleanup task exists for each tagged table; it does not check the period. The task's where filter must enforce the 2-year limit. An object that cannot be cleaned up by a scheduled task is exempted by the policy owner, not by a tag added to dodge the rule."
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
