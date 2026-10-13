policy "CONV-010" {
  title = "Functions are snake_case"
  statement = "Every function name is lowercase words joined by underscores and starts with the client prefix (acme_ is a placeholder; set each client workspace's own prefix), such as acme_get_invoice. Advisory: a finding flags the function and blocks nothing. Renaming a function changes every function.run call, so an existing name is exempted only by the policy owner, through allowed_names or a tag in except_tags."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.naming"
    params = { name_kind: "object", object_kinds: ["function"], case_style: "snake_case", prefixes: ["acme_"] }
  }
}
