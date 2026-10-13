policy "REVIEW-010" {
  title = "Functions say what they do"
  statement = "Every function has a description of at least 20 characters: the // comment lines directly above the function. Write what the function is for, in words a caller needs; do not pad the text to reach the length."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.description_required"
    params = { object_kinds: ["function"], min_length: 20 }
  }
}
