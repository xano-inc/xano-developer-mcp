policy "NAMING-001" {
  title = "Endpoints, tables and functions follow the naming convention"
  statement = "Endpoint paths are lowercase snake_case, table names are plural, and function names start with the client prefix acme_. Violations are flagged, never blocked. Renaming changes every URL and call that uses a name, so renames are the owner's decision. An object that must keep its name is exempted by the owner."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["convention"]

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
