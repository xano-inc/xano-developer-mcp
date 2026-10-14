policy "REVIEW-001" {
  title = "Functions say what they do"
  statement = "Every function has a description of at least 20 characters saying what it does, so a reviewer can read its purpose without opening its stack."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.description_required"
    params = { object_kinds: ["function"], min_length: 20 }
  }
}
