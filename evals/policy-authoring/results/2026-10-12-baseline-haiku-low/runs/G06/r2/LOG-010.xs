policy "LOG-010" {
  title = "External calls handle their own failures"
  statement = "Every external request (api.request) sits inside a try block, so a vendor failure reaches error handling instead of surfacing as an unhandled error. An object that cannot comply is exempted by the policy owner."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    check = "statement.containment"
    params = {
      statements: ["api.request"]
      must_be_inside: ["try_catch"]
    }
  }
}
