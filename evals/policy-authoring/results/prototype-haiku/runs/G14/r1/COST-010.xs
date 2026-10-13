policy "COST-010" {
  title = "AI calls stay out of loops"
  statement = "AI model calls must not run inside a loop, so one run cannot multiply spend. A call that must repeat is moved out of the loop or bounded by an explicit cap, and an owner signs off on any exemption."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["cost", "reliability"]

  rule {
    check = "statement.containment"
    params = {
      statements: ["ai.prompt"],
      must_not_be_inside: ["foreach", "while", "for"]
    }
  }
}
