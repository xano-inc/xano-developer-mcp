policy "ENDPOINT-NAMING-010" {
  title = "Endpoint paths are lowercase snake_case"
  statement = "Every segment of an endpoint path is lowercase words joined by underscores, such as customers/{customer_id} or shipments/quote. A path segment holding a {parameter} is skipped. An endpoint that does not follow this is flagged, not blocked. Changing a path changes the URL that callers use, so rename only when the callers can be moved over. A path that must stay as it is is listed in allowed_names by the policy owner."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.naming"
    params = { name_kind: "endpoint_path", case_style: "snake_case" }
  }
}
