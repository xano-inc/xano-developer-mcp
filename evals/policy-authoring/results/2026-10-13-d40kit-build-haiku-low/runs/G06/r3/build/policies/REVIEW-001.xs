policy "REVIEW-001" {
  title = "Functions say what they do"
  statement = "Every function has a description of at least 20 characters, written as the // comment lines directly above it, saying what the function is for in words its callers need."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.description_required"
    params = { object_kinds: ["function"], min_length: 20 }
  }
}
