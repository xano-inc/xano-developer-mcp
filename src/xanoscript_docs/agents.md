---
applyTo: "agent/**/*.xs"
---

# Agents

AI-powered agents that use LLMs to perform tasks autonomously.

> **TL;DR:** Define with `agent "name" { llm = { type: "provider", system_prompt: "...", prompt: "..." } tools = [...] }`. Providers: `xano-free`, `openai`, `anthropic`, `google-genai`. Tools give agents capabilities.

---

## Quick Reference

```xs
agent "<name>" {
  canonical = "<unique-id>"
  description = "What this agent does"
  llm = {
    type: "<provider>"
    system_prompt: "Agent instructions"
    prompt: "{{ $args.message }}"
    max_steps: 5
  }
  tools = [{ name: "<tool-name>" }]
}
```

### LLM Providers
| Provider | Type Value |
|----------|------------|
| Xano Free (Gemini) | `xano-free` |
| Google Gemini | `google-genai` |
| OpenAI | `openai` |
| Anthropic | `anthropic` |

---

## Basic Structure

```xs
agent "Customer Support" {
  canonical = "support-agent-v1"
  description = "Handles customer inquiries"
  llm = {
    type: "xano-free"
    system_prompt: "You are a helpful customer support agent."
    prompt: "{{ $args.user_message }}"
    max_steps: 5
    temperature: 0.7
  }
  tools = [
    { name: "get_order_status" },
    { name: "create_ticket" }
  ]
}
```

---

## Calling Agents

```xs
ai.agent.run "Customer Support" {
  args = {}|set:"user_message":$input.message
  allow_tool_execution = true
} as $agent_result
```

---

## LLM Configuration

### Common Properties

```xs
llm = {
  type: "<provider>"                    // Required
  system_prompt: "..."                  // Agent persona and rules
  prompt: "{{ $args.input }}"           // User input template
  max_steps: 5                          // Max LLM calls per run
}
```

### Dynamic Variables
- `{{ $args.<name> }}` - Runtime arguments
- `{{ $env.<name> }}` - Environment variables (for API keys)

---

## Provider Configurations

### Xano Free (for testing)
```xs
llm = {
  type: "xano-free"
  system_prompt: "You are a helpful assistant."
  prompt: "{{ $args.message }}"
  max_steps: 3
  temperature: 0
  search_grounding: false               // Google Search grounding
}
```

### Google Gemini
```xs
llm = {
  type: "google-genai"
  api_key: "{{ $env.GEMINI_API_KEY }}"
  model: "gemini-2.5-flash"
  system_prompt: "You are a helpful assistant."
  prompt: "{{ $args.message }}"
  max_steps: 5
  temperature: 0.2
  thinking_tokens: 10000                // Extended thinking
  include_thoughts: true
}
```

### OpenAI
```xs
llm = {
  type: "openai"
  api_key: "{{ $env.OPENAI_API_KEY }}"
  model: "gpt-5-mini"
  system_prompt: "You are a helpful assistant."
  prompt: "{{ $args.message }}"
  max_steps: 5
  temperature: 0.8
  reasoning_effort: "medium"            // low, medium, high
}
```

**OpenAI-Compatible APIs:**
```xs
llm = {
  type: "openai"
  api_key: "{{ $env.GROQ_API_KEY }}"
  baseURL: "https://api.groq.com/openai/v1"
  model: "llama-3.3-70b-versatile"
  compatibility: "compatible"           // Required for non-OpenAI
  ...
}
```

Supported: Groq, Mistral, OpenRouter, X.AI

### Anthropic Claude
```xs
llm = {
  type: "anthropic"
  api_key: "{{ $env.ANTHROPIC_API_KEY }}"
  model: "claude-sonnet-4-5-20250929"
  system_prompt: "You are a helpful assistant."
  prompt: "{{ $args.message }}"
  max_steps: 8
  temperature: 0.3
  send_reasoning: true                  // Include thinking blocks
}
```

---

## Structured Outputs

Force JSON response format (disables tools):

```xs
agent "Classifier" {
  canonical = "classifier-v1"
  llm = {
    type: "openai"
    api_key: "{{ $env.OPENAI_API_KEY }}"
    model: "gpt-5-mini"
    system_prompt: "Classify the sentiment of the text."
    prompt: "{{ $args.text }}"
    structured_outputs: true

    output {
      enum sentiment { values = ["positive", "negative", "neutral"] }
      decimal confidence filters=min:0|max:1
      text reasoning?
    }
  }
  tools = []
}
```

---

## Tools

Reference tools by name from `tool/` directory:

```xs
tools = [
  { name: "get_user_by_email" },
  { name: "update_order_status" },
  { name: "send_notification" }
]
```

**Important:** Do not describe tools in system_prompt or prompt. Tool descriptions are automatically provided to the LLM.

---

## Prompting

### Using Twig Templates
```xs
llm = {
  prompt: """
    User ID: {{ $args.user_id }}
    Request: {{ $args.message }}

    {% if $args.is_priority %}
    This is a priority customer. Respond within 5 minutes.
    {% endif %}
  """
}
```

### Available Variables
```xs
{{ $args.any_arg }}                     // Runtime arguments
{{ $env.MY_VAR }}                       // Environment variables
{{ "now"|date("Y-m-d") }}               // Current date
```

---

## Complete Examples

### Task Manager Agent
```xs
agent "Task Manager" {
  canonical = "task-mgr-v1"
  description = "Manages user tasks"
  llm = {
    type: "google-genai"
    api_key: "{{ $env.GEMINI_API_KEY }}"
    model: "gemini-2.5-flash"
    system_prompt: """
      You help users manage their tasks. You can:
      - Add new tasks
      - Mark tasks complete
      - List pending tasks
      Always confirm actions with the user.
    """
    prompt: "User {{ $args.user_id }}: {{ $args.message }}"
    max_steps: 5
    temperature: 0.2
  }
  tools = [
    { name: "add_task" },
    { name: "complete_task" },
    { name: "list_tasks" }
  ]
}
```

### Code Review Agent
```xs
agent "Code Reviewer" {
  canonical = "code-review-v1"
  llm = {
    type: "anthropic"
    api_key: "{{ $env.ANTHROPIC_API_KEY }}"
    model: "claude-sonnet-4-5-20250929"
    system_prompt: """
      You are an expert code reviewer. Analyze code for:
      - Bugs and potential issues
      - Security vulnerabilities
      - Performance problems
      - Code style and best practices
      Provide specific, actionable feedback.
    """
    prompt: """
      Language: {{ $args.language }}
      Code:
      ```
      {{ $args.code }}
      ```
    """
    max_steps: 3
    temperature: 0.1
    send_reasoning: true
  }
  tools = []
}
```

### Multi-Tool Research Agent
```xs
agent "Research Assistant" {
  canonical = "research-v1"
  llm = {
    type: "openai"
    api_key: "{{ $env.OPENAI_API_KEY }}"
    model: "gpt-5"
    system_prompt: """
      You are a research assistant. Use your tools to:
      1. Search for relevant information
      2. Analyze data
      3. Compile findings into clear summaries
      Always cite your sources.
    """
    prompt: "Research topic: {{ $args.topic }}"
    max_steps: 10
    temperature: 0.5
    reasoning_effort: "high"
  }
  tools = [
    { name: "web_search" },
    { name: "fetch_article" },
    { name: "analyze_data" },
    { name: "save_findings" }
  ]
}
```

---

## External MCP Tools

Integrate external MCP (Model Context Protocol) servers to extend agent capabilities.

### ai.external.mcp.tool.list

List available tools from an external MCP server.

```xs
ai.external.mcp.tool.list {
  server_url = "https://mcp.example.com"
  api_key = $env.MCP_API_KEY
} as $tools

// $tools = [
//   { name: "search_web", description: "Search the web", inputSchema: {...} },
//   { name: "fetch_page", description: "Fetch webpage content", inputSchema: {...} }
// ]
```

### ai.external.mcp.tool.run

Execute a tool on an external MCP server.

```xs
ai.external.mcp.tool.run {
  server_url = "https://mcp.example.com"
  api_key = $env.MCP_API_KEY
  tool_name = "search_web"
  arguments = { query: "latest AI news" }
} as $result
```

### ai.external.mcp.server_details

Get metadata about an external MCP server.

```xs
ai.external.mcp.server_details {
  server_url = "https://mcp.example.com"
  api_key = $env.MCP_API_KEY
} as $details

// $details = {
//   name: "Web Tools",
//   version: "1.0.0",
//   capabilities: ["tools", "resources"],
//   tools: [...]
// }
```

### Using External Tools in Agents

```xs
agent "Research Agent" {
  canonical = "research-v1"
  llm = {
    type: "openai"
    api_key: "{{ $env.OPENAI_API_KEY }}"
    model: "gpt-5"
    system_prompt: """
      You are a research assistant with access to web search
      and document analysis tools. Use them to find and analyze information.
    """
    prompt: "{{ $args.query }}"
    max_steps: 8
  }
  tools = [
    { name: "search_web" },
    { name: "fetch_page" },
    { name: "summarize_document" }
  ]
  external_mcp_servers = [
    {
      url: "{{ $env.WEB_MCP_URL }}",
      api_key: "{{ $env.WEB_MCP_KEY }}"
    }
  ]
}
```

---

## Best Practices

1. **Clear system prompts** - Define persona, capabilities, and constraints
2. **Use appropriate temperature** - Low for factual, higher for creative
3. **Limit max_steps** - Prevent infinite loops (3-10 typical)
4. **Don't repeat tool descriptions** - They're auto-injected
5. **Use environment variables** - Never hardcode API keys
6. **Test with xano-free first** - Free for development
7. **Validate external MCP servers** - Check server_details before using

---

## Related Topics

| Topic | Description |
|-------|-------------|
| `tools` | Functions that agents can execute |
| `mcp-servers` | MCP server configuration |
| `triggers` | Agent triggers for events |
| `security` | API key management |
