policy "CONF-012" {
  title = "Tables holding cardholder and bank data are tagged confidential"
  statement = "Any table with a cardholder or bank field listed here carries the confidential tag, so it is classified and picked up by the access policies. Related to PCI DSS 3.x data inventory. A pass only means the tag is present when the rule ran."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["pci", "pci-dss"]

  rule {
    check = "table.tag_required"
    params = { field_names: ["card_number", "cvv", "account_number", "routing_number"], tag: "confidential" }
  }
}
