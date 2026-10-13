policy "CLIENT-NAMING" {
  title = "Names follow the client naming convention"
  statement = "Endpoint paths are lowercase snake_case, table names are plural, and function names start with the client prefix acme_. This policy flags names that break the convention and does not block them. A name that must stay as it is is the policy owner's decision to exempt."
  severity = "low"
  active = true
  enforcement = "advisory"

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
