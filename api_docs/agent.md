# Agent API

Agents are AI-powered assistants that can use tools to accomplish tasks. They are configured with an LLM provider, system prompt, and available tools.

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspace/{workspace_id}/agent` | List agents |
| GET | `/workspace/{workspace_id}/agent/{agent_id}` | Get agent |
| POST | `/workspace/{workspace_id}/agent` | Create agent |
| PUT | `/workspace/{workspace_id}/agent/{agent_id}` | Update agent |
| DELETE | `/workspace/{workspace_id}/agent/{agent_id}` | Delete agent |

---

## List Agents

```
GET /workspace/{workspace_id}/agent
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `branch` | text | "" | Branch label |
| `page` | int | 1 | Page number |
| `per_page` | int | 50 | Items per page (1-10000) |
| `search` | text | "" | Search filter |
| `sort` | enum | "created_at" | Sort field |
| `order` | enum | "desc" | Sort order |
| `tools` | bool | true | Include tool information |

---

## Get Agent

```
GET /workspace/{workspace_id}/agent/{agent_id}
```

**Query Parameters:**
- `tools` (bool, default: true): Include tool information

Returns agent definition including LLM configuration and XanoScript.

---

## Create Agent

```
POST /workspace/{workspace_id}/agent
```

**Content-Type:** `text/x-xanoscript`

**Query Parameters:**
- `branch` (text): Target branch label
- `tools` (bool): Include tool information in response

### XanoScript Agent Syntax

```xanoscript
agent foo {
  canonical = "custom"
  llm = {
    type         : "anthropic"
    system_prompt: "You are a helpful AI Agent."
    max_steps    : 5
    prompt       : ""
    model        : "claude-4-sonnet-20250514"
    temperature  : 1
    reasoning    : true
    baseURL      : ""
    headers      : ""
  }
}
```

### LLM Configuration

| Field | Type | Description |
|-------|------|-------------|
| `type` | text | LLM provider: "anthropic", "openai", etc. |
| `system_prompt` | text | Instructions for agent behavior |
| `max_steps` | int | Maximum tool calls per request |
| `model` | text | Model identifier |
| `temperature` | float | Response randomness (0-2) |
| `reasoning` | bool | Enable extended thinking |
| `baseURL` | text | Custom API endpoint (optional) |
| `headers` | text | Custom headers (optional) |

### Available LLM Providers

| Provider | Type Value |
|----------|------------|
| Anthropic | `"anthropic"` |
| OpenAI | `"openai"` |

### Example: Customer Support Agent

```xanoscript
agent support_bot {
  canonical = "support"
  llm = {
    type         : "anthropic"
    system_prompt: "You are a customer support agent. Help users with their questions about our products. Be friendly and professional."
    max_steps    : 10
    model        : "claude-4-sonnet-20250514"
    temperature  : 0.7
    reasoning    : true
  }
}
```

### Example: Data Analysis Agent

```xanoscript
agent data_analyst {
  canonical = "analyst"
  llm = {
    type         : "anthropic"
    system_prompt: "You are a data analyst. Help users understand their data by running queries and providing insights. Always explain your findings clearly."
    max_steps    : 15
    model        : "claude-4-sonnet-20250514"
    temperature  : 0.3
    reasoning    : true
  }
}
```

---

## Update Agent

```
PUT /workspace/{workspace_id}/agent/{agent_id}
```

**Query Parameters:**
- `publish` (bool, default: true): Publish changes immediately
- `tools` (bool, default: true): Include tool information in response

**Content-Type:** `text/x-xanoscript`

---

## Delete Agent

```
DELETE /workspace/{workspace_id}/agent/{agent_id}
```

**Warning:** This action cannot be undone.
