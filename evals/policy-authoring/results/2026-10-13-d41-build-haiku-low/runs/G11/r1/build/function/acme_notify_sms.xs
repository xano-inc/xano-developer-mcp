// Texts a customer through Twilio. A contractor wrote it in a hurry.
function acme_notify_sms {
  input {
    text to
    text body
  }

  stack {
    try_catch {
      try {
        api.request {
          url = "https://AC5f1b2c3d4e:twilio-auth-token-not-real@api.twilio.com/2010-04-01/Accounts/AC5f1b2c3d4e/Messages.json"
          method = "POST"
          params = {To: $input.to, From: "+15550100", Body: $input.body}
          timeout = 30
        } as $sms
      }

      catch {
        throw {
          name = "sms_vendor_unavailable"
          value = "The SMS vendor did not respond. The message was not sent."
        }
      }
    }
  }

  response = $sms.response.result
  guid = "CMQk0i8Zo3lst0KsNBp3ekyuO7c"
}