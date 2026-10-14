// Re-sends failed webhook deliveries. Each run makes one attempt per delivery; a delivery is abandoned after 5 failed attempts.
task retry_failed_webhooks {
  stack {
    db.query webhook_deliveries {
      where = $db.webhook_deliveries.status == "failed" && $db.webhook_deliveries.attempts < 5
      return = {type: "list"}
    } as $failed
  
    foreach ($failed) {
      each as $delivery {
        api.request {
          url = $delivery.url
          method = "POST"
          params = $delivery.payload
        } as $attempt
      
        conditional {
          if ($attempt.response.status == 200) {
            db.edit webhook_deliveries {
              field_name = "id"
              field_value = $delivery.id
              data = {status: "delivered", attempts: $delivery.attempts + 1}
            } as $done
          }
          else {
            conditional {
              if ($delivery.attempts + 1 >= 5) {
                db.edit webhook_deliveries {
                  field_name = "id"
                  field_value = $delivery.id
                  data = {status: "abandoned", attempts: $delivery.attempts + 1}
                } as $given_up
              }
              else {
                db.edit webhook_deliveries {
                  field_name = "id"
                  field_value = $delivery.id
                  data = {status: "failed", attempts: $delivery.attempts + 1}
                } as $retry_later
              }
            }
          }
        }
      }
    }
  }

  schedule = [{starts_on: 2026-01-01 00:00:00+0000, freq: 300}]
  guid = "xVlZD1UTTY6Qkl9YE0I31YR43FU"
}
