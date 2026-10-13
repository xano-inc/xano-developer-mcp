policy "NAMING-001" {
  title = "Names follow the workspace naming convention"
  statement = "Endpoint paths are lowercase snake_case. Table names are plural. Function names start with the client prefix acme_. Names that break this are flagged for the owner to rename; a policy never blocks, and an existing name is kept by adding it to allowed_names, the policy owner's decision."
  severity = "low"
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
