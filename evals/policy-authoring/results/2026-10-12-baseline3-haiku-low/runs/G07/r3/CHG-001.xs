policy "CHG-001" {
  title = "Endpoints are tested"
  statement = "Every endpoint, function, AI tool and task must be called by a test that asserts something, and every endpoint that requires a login must have a test that checks an anonymous call is rejected. Supports SOC 2 CC8.1 (change management): changes are tested before release. A passing test run is not proof of an approved change."
  severity = "low"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc8.1"]

  rule {
    check = "object.test_coverage"
  }

  rule {
    check = "test.assertion_required"
  }
}
