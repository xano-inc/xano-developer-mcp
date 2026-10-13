// The in-app support chat: the support agent answers the customer.
query "support/chat" verb=POST {
  api_group = "app"
  auth = "users"

  input {
    text message
  }

  stack {
    ai.agent.run "Support Agent" {
      args = {}|set:"message":$input.message
      allow_tool_execution = true
    } as $reply
  }

  response = $reply
  guid = "bz9vjUFxWTm61IpvVBYPBIP5Dhs"
}