policy "CONV-100" {
  title = "Endpoints, tables and functions follow the naming convention"
  statement = "Endpoint paths are lowercase snake_case. Table names are plural. Function names start with the client prefix `acme_`. This policy is advisory: it flags a name that breaks the convention and never blocks a change. Renaming changes API URLs and call sites, so ask the owner before renaming, or exempt a name by listing it in allowed_names."
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
    params = { name_kind: "object", object_kinds: ["function"], prefixes: ["acme_"] }
  }
}
