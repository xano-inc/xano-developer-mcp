policy "COST-020" {
  title = "No unbounded while loops"
  statement = "No object uses a while loop, so every loop has a bounded count and a retry cannot run forever."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["cost", "reliability"]

  rule {
    check = "stack.statement_forbidden"
    params = { statements: ["while"] }
  }
}
