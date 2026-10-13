policy "NAMING-002" {
  title = "Tables are plural"
  statement = "Table names are plural lowercase words, such as orders, invoice_items or user_addresses. Flagged, not blocked: a table name that does not end in s is reported so the team can decide whether to rename it, since renaming changes every query that uses it."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    title = "Table names end in s"
    check = "object.naming"
    params = { name_kind: "object", object_kinds: ["table"], pattern: "[a-z][a-z0-9_]*s" }
  }
}
