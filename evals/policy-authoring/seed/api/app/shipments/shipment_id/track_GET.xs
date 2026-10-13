// Live tracking for a shipment.
query "shipments/{shipment_id}/track" verb=GET {
  api_group = "app"
  auth = "users"

  input {
    int shipment_id
  }

  stack {
    db.get shipments {
      field_name = "id"
      field_value = $input.shipment_id
    } as $shipment
  
    function.run acme_get_tracking {
      input = {tracking_number: $shipment.tracking_number}
    } as $tracking
  }

  response = $tracking
  guid = "aK6PN5Av18j_vgpGjw7AjpGwLN8"
}