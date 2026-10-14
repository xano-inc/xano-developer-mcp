policy "INVOICES-AUTH" {
  title = "Invoices are never returned without login or in full"
  statement = "Every endpoint that reaches the invoices table must require a login, and any read of invoices must page its results with a page size of at most 100 rows, so no endpoint returns the whole table. An endpoint that cannot meet this is exempted only by the policy owner."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.1"]

  rule {
    check = "object.auth_required"
    params = { tables: ["invoices"] }
  }

  rule {
    check = "statement.param_bound"
    params = { statements: ["db.query"], param_names: ["per_page"], max: 100, unit: "rows", object_kinds: ["query"], tables: ["invoices"] }
  }
}
