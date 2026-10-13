policy "CLIENT-NAMING" {
  title = "Client naming conventions"
  statement = "Endpoint paths are lowercase snake_case, table names are plural, and function names start with the client prefix acme_. This policy flags a name that breaks the convention so the owner can decide; it blocks nothing. An existing name that is kept on purpose is exempted by the policy owner, not by renaming it."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.naming"
    params = { name_kind: "endpoint_path", case_style: "snake_case" }
  }

  rule {
    check = "object.naming"
    params = { name_kind: "object", object_kinds: ["table"], pattern: "[a-z0-9_]*s" }
  }

  rule {
    check = "object.naming"
    params = { name_kind: "object", object_kinds: ["function"], prefixes: ["acme_"] }
  }
}
