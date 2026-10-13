// Patients of the clinic product.
table patients {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int org_id {
      table = "orgs"
    }
  
    text first_name {sensitive = true}
    text last_name {sensitive = true}
    date dob {sensitive = true}
    text ssn? {sensitive = true}
    email email? {sensitive = true}
    text phone? {sensitive = true}
    text address? {sensitive = true}
    text insurance_member_id? {sensitive = true}
  }

  index = [{type: "primary", field: [{name: "id"}]}]
  tags = ["phi"]
  guid = "2owJebbNtRm-Ek78hCG3FxeWrO0"
}