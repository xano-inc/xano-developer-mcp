policy "GDPR-001" {
  title = "Personal data is erased with the account and expires after 2 years"
  statement = "When a user deletes their account, every personal-data table is deleted from by the erasure function delete_user_account. Support ticket rows are deleted after 730 days by the scheduled task purge_old_support_tickets. Order and payment records are not covered: they are kept under financial record-keeping duties, and the owner decides their retention."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["gdpr", "gdpr-art-5-1-e", "gdpr-art-17"]

  rule {
    check = "table.coverage_required"
    params = {
      tags: ["personal"],
      referenced_by: {object_kinds: ["function"], tags: ["erasure"], statements: ["db.del", "db.bulk.delete"]}
    }
  }

  rule {
    check = "table.coverage_required"
    params = {
      tags: ["retained"],
      referenced_by: {object_kinds: ["task"], max_age_days: 730}
    }
  }
}
