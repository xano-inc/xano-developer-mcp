policy "NAMING-001" {
  title = "Names follow the team naming convention"
  statement = "Endpoint paths are lowercase snake_case. Table names are plural. Function names start with the client prefix acme_. This policy is advisory: it flags names that do not match and blocks nothing. A name that must stay as it is (for example an irregular plural or a function from before the prefix rule) belongs in the rule's allowed_names list, set by the policy owner."
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
