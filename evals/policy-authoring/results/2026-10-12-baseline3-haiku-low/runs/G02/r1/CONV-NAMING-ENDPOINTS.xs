policy "CONV-NAMING-ENDPOINTS" {
  title = "Endpoint path segments are lowercase snake_case"
  statement = "Every segment of an endpoint path is lowercase snake_case, so callers see one naming style across the API. Path parameters such as {customer_id} are skipped. This is advisory: it flags a path that breaks the convention and blocks nothing. Renaming a path changes the URL callers use, so ask the API owner first; a path that must keep its URL goes in allowed_names by the owner."
  severity = "low"
  active = true
  enforcement = "advisory"
  tags = ["conventions", "naming"]

  rule {
    check = "object.naming"
    params = {name_kind: "endpoint_path", case_style: "snake_case"}
  }
}
