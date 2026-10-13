// Parcels booked with the shipping vendor.
table shipments {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int order_id {
      table = "orders"
    }
  
    text carrier?
    text tracking_number?
    text status?=created
    json last_tracking?
  }

  index = [{type: "primary", field: [{name: "id"}]}]
  guid = "QMQL2GE7Xy_28jwi4uq4Pw6e2kg"
}