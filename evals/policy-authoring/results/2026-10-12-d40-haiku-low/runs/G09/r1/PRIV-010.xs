policy "PRIV-010" {
  title = "Personal data is erased with the account and expires on a schedule"
  statement = "When a user deletes their account, every table that holds that user's records must be reached by a function that deletes them, so nothing personal is left behind. Every table that stores a created_at time must be reached by a scheduled task that deletes its old rows, which is how customer data is kept no longer than the retention period. The check confirms that a cleanup exists for each table, not how old a row is before it goes: the retention age lives in each task's own query and is reviewed by the data owner. A table that must be kept longer, such as invoices kept for tax, is the data owner's decision and is recorded in the task that handles it, not exempted here."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["gdpr", "art-17", "art-5-1-e"]

  rule {
    check = "table.coverage_required"
    params = { table_selector: { has_fk_to: "users" }, referenced_by: { object_kinds: ["function"], statements: ["db.del", "db.bulk.delete"] } }
  }

  rule {
    check = "table.coverage_required"
    params = { table_selector: { has_field: "created_at" }, referenced_by: { object_kinds: ["task"], statements: ["db.del", "db.bulk.delete"] } }
  }
}
