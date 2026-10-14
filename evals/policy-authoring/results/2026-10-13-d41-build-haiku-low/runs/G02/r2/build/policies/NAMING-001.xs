policy "NAMING-001" {
  title = "Backend names follow the team naming convention"
  statement = "Endpoint paths are lowercase snake_case, table names are plural, and function names start with the client prefix acme_. Findings are advisory: a name that breaks a rule is flagged for review, not blocked. Renaming changes URLs and function.run calls, so ask before renaming an existing object; a name that must stay can be listed in allowed_names."
  severity = "low"
  active = true
  enforcement = "advisory"
  tags = ["conventions", "naming"]

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
