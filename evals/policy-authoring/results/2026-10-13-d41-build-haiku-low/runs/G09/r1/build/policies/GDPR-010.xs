policy "GDPR-010" {
  title = "Account deletion reaches personal data, and personal data expires after 2 years"
  statement = "When a user deletes their account, every table holding personal data is erased or unlinked by delete_user_account, which is tagged erasure. Rows in tables tagged retained are deleted by a scheduled task once they are more than 730 days old. Related to GDPR Art. 5(1)(e) storage limitation and Art. 17 right to erasure; this policy checks the stored definitions only and does not show that the data was deleted."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["gdpr", "art-5-1-e", "art-17"]

  rule {
    check = "table.coverage_required"
    params = {tags: ["personal"], referenced_by: {object_kinds: ["function"], tags: ["erasure"], statements: ["db.del", "db.bulk.delete", "db.edit"]}}
  }

  rule {
    check = "table.coverage_required"
    params = {tags: ["retained"], referenced_by: {object_kinds: ["task"], max_age_days: 730, age_field: "created_at"}}
  }
}
