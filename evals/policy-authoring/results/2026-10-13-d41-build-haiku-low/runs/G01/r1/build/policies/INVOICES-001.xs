policy "INVOICES-001" {
  title = "Invoices are only served to logged-in callers, and never as an unbounded list"
  statement = "Every endpoint that reads the invoices table must require login, so an anonymous caller never receives invoice data. Every list read of invoices must be paged to at most 1000 rows, so no single response returns the whole table. A deliberately public endpoint must not read invoices at all."
  severity = "critical"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.auth_required"
    params = { tables: ["invoices"] }
  }

  rule {
    check = "statement.param_bound"
    params = { statements: ["db.query"], param_names: ["per_page"], max: 1000, unit: "rows", object_kinds: ["query"], tables: ["invoices"] }
  }
}
