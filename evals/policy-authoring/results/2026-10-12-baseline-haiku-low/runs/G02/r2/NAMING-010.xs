policy "NAMING-010" {
  title = "Endpoints are snake_case and functions carry the client prefix"
  statement = "Endpoint paths are lowercase snake_case, such as get_customer_profile. Functions are snake_case and start with the client prefix acme_, such as acme_send_invoice_email. This policy flags a name that breaks the convention and never blocks a change. Table naming (plural names) is not checked by any policy check yet."
  severity = "low"
  active = true
  enforcement = "advisory"
  tags = ["naming", "conventions"]

  rule {
    title = "Endpoint paths are snake_case"
    check = "object.naming"
    params = { name_kind: "endpoint_path", case_style: "snake_case" }
  }

  rule {
    title = "Functions are snake_case and start with acme_"
    check = "object.naming"
    params = { name_kind: "object", case_style: "snake_case", prefixes: ["acme_"], object_kinds: ["function"] }
  }
}
