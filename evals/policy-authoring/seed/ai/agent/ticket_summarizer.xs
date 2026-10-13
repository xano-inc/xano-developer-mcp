// Writes a two-line summary of a support ticket.
agent "Ticket Summarizer" {
  canonical = "ticket-summarizer"
  llm = {
    type            : "openai"
    system_prompt   : "Summarise the support ticket in two lines."
    max_steps       : 1
    prompt          : "{{ $args.ticket }}"
    api_key         : "{{ $env.OPENAI_API_KEY }}"
    model           : "gpt-5-mini"
    temperature     : 1
    reasoning_effort: "medium"
    baseURL         : ""
    headers         : ""
    organization    : ""
    project         : ""
    compatibility   : "strict"
  }

  tools = []
  guid = "7AyRA7WS_lWQHzW3iUGy9qYOiZQ"
}