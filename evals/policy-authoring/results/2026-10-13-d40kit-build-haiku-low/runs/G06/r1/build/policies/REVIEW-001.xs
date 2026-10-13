policy "REVIEW-001" {
  title = "Functions say what they do"
  statement = "Every function has a description of at least 20 characters saying what it is for, in words its callers need. Write the // comment lines directly above the function; do not pad to reach the length."
  severity = "low"
  active = true
  enforcement = "advisory"
  tags = ["code-review"]

  rule {
    check = "object.description_required"
    params = { object_kinds: ["function"], min_length: 20 }
  }
}
