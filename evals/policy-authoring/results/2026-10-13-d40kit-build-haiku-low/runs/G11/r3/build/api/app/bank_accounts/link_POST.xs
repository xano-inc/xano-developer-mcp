// Links a bank account through Plaid.
query "bank-accounts/link" verb=POST {
  api_group = "app"
  auth = "users"

  input {
    text public_token
    text bank_account_number?
    text bank_routing_number?
  }

  stack {
    try_catch {
      try {
        api.request {
          url = "https://production.plaid.com/item/public_token/exchange"
          method = "POST"
          params = {
            client_id   : $env.PLAID_CLIENT_ID
            secret      : $env.PLAID_SECRET
            public_token: $input.public_token
          }

          timeout = 20
        } as $exchange
      }

      catch {
        throw {
          value = "Bank link provider unavailable"
        }
      }
    }
  }

  response = {linked: true}
  guid = "TwfOehCPkAH9ys0Sep05eBawBvE"
}