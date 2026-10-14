policy "NAMING-010" {
  title = "Endpoints are snake_case, tables are plural, functions carry the client prefix"
  statement = "Endpoint paths use lowercase snake_case words. Table names are plural. Function names start with the client prefix acme_. This policy is advisory: it flags names that break the convention so the owner can rename them, and it blocks nothing. An object that must keep its name can be exempted by the policy owner."
  severity = "medium"
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
