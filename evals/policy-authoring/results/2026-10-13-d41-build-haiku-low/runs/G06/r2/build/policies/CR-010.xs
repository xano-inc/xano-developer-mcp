policy "CR-010" {
  title = "Functions say what they do"
  statement = "Every function carries a description of at least 20 characters, so a reviewer can tell its purpose without reading its stack."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.description_required"
    params = {object_kinds: ["function"], min_length: 20}
  }
}
