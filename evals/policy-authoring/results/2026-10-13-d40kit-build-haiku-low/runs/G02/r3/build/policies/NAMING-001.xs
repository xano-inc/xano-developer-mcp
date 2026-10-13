policy "NAMING-001" {
  title = "Endpoints, tables and functions follow team naming"
  statement = "Endpoint paths are lowercase snake_case, table names are plural, and function names are snake_case and start with the client prefix acme_. Flagged for review; renaming is the owner's choice because it changes URLs and references. Existing names that break this are listed in the findings."
  severity = "low"
  active = true
  enforcement = "advisory"
  tags = ["conventions"]

  rule {
    check = "object.naming"
    params = { name_kind: "endpoint_path", case_style: "snake_case" }
  }

  rule {
    check = "object.naming"
    params = { name_kind: "object", object_kinds: ["table"], suffixes: ["s"] }
  }

  rule {
    check = "object.naming"
    params = { name_kind: "object", object_kinds: ["function"], case_style: "snake_case", prefixes: ["acme_"] }
  }
}
