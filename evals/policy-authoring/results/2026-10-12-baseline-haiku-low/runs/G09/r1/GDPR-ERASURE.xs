policy "GDPR-ERASURE" {
  title = "Account deletion reaches every table holding user data"
  statement = "Every table with a field that links to the users table must be reached by a function, endpoint or task that deletes records from it, so that deleting a user account also removes the user's data everywhere it is held. A table whose rows must be kept for a legal reason, such as invoices or orders, is exempted by its owner, who must also decide whether those rows are anonymised instead."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["gdpr", "right-to-erasure"]

  rule {
    check = "table.coverage_required"
    params = {
      table_selector: {has_fk_to: "users"}
      referenced_by: {
        object_kinds: ["function", "query", "task"]
        statements: ["db.del", "db.bulk.delete"]
      }
    }
  }
}
