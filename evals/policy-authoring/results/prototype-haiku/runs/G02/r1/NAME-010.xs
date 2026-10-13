policy "NAME-010" {
  title = "Endpoint paths are lowercase snake_case"
  statement = "Each segment of an endpoint path is lowercase words joined by underscores, such as /v1/get_invoice; a {param} segment is skipped. Advisory: a finding flags the endpoint and blocks nothing. Renaming a path changes the URL every caller uses, so an existing path is exempted only by the policy owner, through allowed_names or a tag in except_tags."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.naming"
    params = { name_kind: "endpoint_path", case_style: "snake_case" }
  }
}
