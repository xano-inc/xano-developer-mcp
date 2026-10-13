policy "PERF-001" {
  title = "Endpoints never return every row"
  statement = "Every list read an endpoint or AI tool runs, in its own stack or a function it calls, pages its results, at most 1000 rows a page. A read of the whole invoices table with paging off is not allowed to ship."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = []

  rule {
    check = "statement.param_bound"
    params = { statements: ["db.query"], param_names: ["per_page"], max: 1000, unit: "rows", object_kinds: ["query", "tool"] }
  }
}
