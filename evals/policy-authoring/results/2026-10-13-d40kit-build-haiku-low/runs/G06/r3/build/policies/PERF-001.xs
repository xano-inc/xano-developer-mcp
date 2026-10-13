policy "PERF-001" {
  title = "Endpoints never return every row"
  statement = "Every paged read holds at most 1000 rows per page, so no endpoint or tool returns a whole table."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    title = "Reads page at most 1000 rows"
    check = "statement.param_bound"
    params = { statements: ["db.query"], param_names: ["per_page"], max: 1000, unit: "rows", object_kinds: ["query", "tool"] }
  }
}
