policy "CONV-010" {
  title = "Functions are snake_case and start with the client prefix"
  statement = "Every function name is lowercase words joined by underscores and starts with the client prefix acme_, such as acme_calculate_tax. A function that does not follow this is flagged, not blocked. Renaming a function changes every function.run call that uses it, so rename only when the callers can be updated. A name that must stay as it is is listed in allowed_names by the policy owner."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.naming"
    params = { name_kind: "object", object_kinds: ["function"], case_style: "snake_case", prefixes: ["acme_"] }
  }
}
