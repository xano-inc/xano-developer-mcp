policy "LOG-010" {
  title = "External calls handle their own failures"
  statement = "Every external request sits inside a try block, so a vendor failure reaches error handling instead of hanging or crashing the caller. This checks the try block only; what the catch branch does with the failure is for code review."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    check = "statement.containment"
    params = {
      statements: ["api.request", "stream.from_request"],
      must_be_inside: ["try_catch"]
    }
  }
}
