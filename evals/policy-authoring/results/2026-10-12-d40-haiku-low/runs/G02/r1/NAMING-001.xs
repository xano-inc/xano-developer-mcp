policy "NAMING-001" {
  title = "Names follow the team naming convention"
  statement = "Table names are plural. Endpoint paths are lowercase snake_case. Function names start with the client prefix and are lowercase snake_case. Violations are flagged for review and do not block a change."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.naming"
    params = { name_kind: "object", object_kinds: ["table"], suffixes: ["s"] }
  }

  rule {
    check = "object.naming"
    params = { name_kind: "endpoint_path", case_style: "snake_case" }
  }

  rule {
    check = "object.naming"
    params = { name_kind: "object", object_kinds: ["function"], case_style: "snake_case", prefixes: ["acme_"] }
  }
}
