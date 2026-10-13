policy "NAMING-003" {
  title = "Functions start with the client prefix"
  statement = "Every function name starts with this client's prefix, acme_, such as acme_send_invoice_email. Flagged, not blocked: a function without the prefix is reported so the team can rename it, since renaming changes every function.run call that uses it."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    title = "Function names start with acme_"
    check = "object.naming"
    params = { name_kind: "object", object_kinds: ["function"], prefixes: ["acme_"] }
  }
}
