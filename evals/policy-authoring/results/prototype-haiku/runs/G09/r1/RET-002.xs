policy "RET-002" {
  title = "Retained data has a cleanup task"
  statement = "Every table tagged retained must be cleaned by a scheduled task. Customer data older than the two-year retention limit is deleted by the purge_expired_customer_data task. Tables that need a longer period must be listed as an exemption with the platform owner's sign-off."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["gdpr", "soc2", "retention"]

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

  rule {
    check = "workspace.object_required"
    params = {
      object_kind: "task",
      names: ["purge_expired_customer_data"]
    }
  }
}
