policy "REVIEW-001" {
  title = "Functions are described and tested"
  statement = "Every function says what it does in a sentence of at least 20 characters, and every function is called by a test that asserts something. Functions are the objects the endpoint templates do not cover, so their description and test coverage are checked here."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.description_required"
    params = {object_kinds: ["function"], min_length: 20}
  }

  rule {
    check = "object.test_coverage"
    params = {object_kinds: ["function"]}
  }
}
