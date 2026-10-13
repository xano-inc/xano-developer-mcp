// Texts a customer through Twilio. A contractor wrote it in a hurry.
function acme_notify_sms {
  input {
    text to
    text body
  }

  stack {
    api.request {
      url = "https://api.twilio.com/2010-04-01/Accounts/" ~ $env.TWILIO_ACCOUNT_SID ~ "/Messages.json"
      method = "POST"
      headers = ["Authorization: Basic " ~ $env.TWILIO_BASIC_AUTH]
      params = {To: $input.to, From: "+15550100", Body: $input.body}
    } as $sms
  }

  response = $sms.response.result
  guid = "CMQk0i8Zo3lst0KsNBp3ekyuO7c"
}