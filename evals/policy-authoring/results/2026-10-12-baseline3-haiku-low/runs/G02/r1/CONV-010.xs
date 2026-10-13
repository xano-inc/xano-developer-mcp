policy "CONV-010" {
  title = "Functions are snake_case and carry the client prefix"
  statement = "Every function name is snake_case and starts with the client prefix acme_, so functions from every team read the same way. This is advisory: it flags a function that breaks the convention and blocks nothing. Rename a function only after checking its callers (function.run calls); an existing function that must keep its name goes in allowed_names by the owner."
  severity = "low"
  active = true
  enforcement = "advisory"
  tags = ["conventions", "naming"]

  rule {
    check = "object.naming"
    params = {name_kind: "object", object_kinds: ["function"], case_style: "snake_case", prefixes: ["acme_"]}
  }
}
