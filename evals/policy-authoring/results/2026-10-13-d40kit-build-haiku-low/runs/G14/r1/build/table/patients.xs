// Patients of the clinic product.
table patients {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int org_id {
      table = "orgs"
    }
  
    text first_name
    text last_name
    date dob
    text ssn?
    email email?
    text phone?
    text address?
    text insurance_member_id?
  }

  index = [{type: "primary", field: [{name: "id"}]}]
  tags = ["customer-email"]
  guid = "2owJebbNtRm-Ek78hCG3FxeWrO0"
}