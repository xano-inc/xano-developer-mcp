policy "AUTH-002" {
  title = "Refund and price changes check the caller is a manager"
  statement = "Every stack that edits or patches refunds or products calls the require_manager function, unconditionally, so only users with the manager role can approve refunds or change prices. Staff can read both but not change them. A change that cannot call the check is a finding for the policy owner to decide, not something to exempt."
  severity = "critical"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.statement_required"
    params = {functions: ["require_manager"], placement: "unconditional", when: {statement: "db.edit", tables: ["refunds"]}}
  }

  rule {
    check = "object.statement_required"
    params = {functions: ["require_manager"], placement: "unconditional", when: {statement: "db.patch", tables: ["refunds"]}}
  }

  rule {
    check = "object.statement_required"
    params = {functions: ["require_manager"], placement: "unconditional", when: {statement: "db.edit", tables: ["products"]}}
  }

  rule {
    check = "object.statement_required"
    params = {functions: ["require_manager"], placement: "unconditional", when: {statement: "db.patch", tables: ["products"]}}
  }
}
