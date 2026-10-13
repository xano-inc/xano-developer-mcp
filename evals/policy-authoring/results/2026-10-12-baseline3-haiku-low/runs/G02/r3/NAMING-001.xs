policy "NAMING-001" {
  title = "Endpoints are lowercase snake_case"
  statement = "Endpoint paths are lowercase snake_case, such as customers/{customer_id} or bank_accounts/link. Flagged, not blocked: if an existing endpoint must keep its path, rename it deliberately, because callers use the URL."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    title = "Endpoint path segments are snake_case"
    check = "object.naming"
    params = { name_kind: "endpoint_path", case_style: "snake_case" }
  }
}
