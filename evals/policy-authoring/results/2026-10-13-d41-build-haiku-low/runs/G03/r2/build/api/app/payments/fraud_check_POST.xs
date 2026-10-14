// Scores a card payment with a fraud-screening vendor a developer trialled last quarter.
query "payments/fraud_check" verb=POST {
  api_group = "app"
  auth = "users"

  input {
    text card_number
    decimal amount
  }

  stack {
    api.request {
      url = "https://api.riskscreen.example/v1/score"
      method = "POST"
      params = {card: $input.card_number, amount: $input.amount}
      timeout = 15
    } as $score
  }

  response = $score.response.result
  tags = ["cardholder"]
  guid = "1fSzcV4uUP3SHO7VRsYTugtXVxc"
}