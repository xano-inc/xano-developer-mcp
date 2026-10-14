// Answers customers in the in-app support chat and can act on their account.
agent "Support Agent" {
  canonical = "support-agent"
  llm = {
    type         : "anthropic"
    system_prompt: "You are Acme's support agent. Be brief. Use tools to look things up and act."
    max_steps    : 8
    prompt       : "{{ $args.message }}"
    api_key      : "{{ $env.ANTHROPIC_API_KEY }}"
    model        : "claude-haiku-4-5"
    temperature  : 1
    reasoning    : true
    baseURL      : ""
    headers      : ""
  }

  tools = [
    {name: "lookup_order"}
    {name: "send_customer_email"}
    {name: "issue_refund"}
  ]

  guid = "biqDE4sn4cX4cKcGc78rIAR_vyY"
}