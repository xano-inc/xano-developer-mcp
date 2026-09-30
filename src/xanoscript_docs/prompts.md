---
applyTo: "ai/prompt/*.xs"
---

# Prompts

Reusable prompt templates that an MCP server offers to clients. A client lists them with `prompts/list` and fetches one, with arguments, through `prompts/get`.

> **TL;DR:** A `prompt` is shaped like a tool: `input { }` holds the arguments, `stack { }` builds the messages, and `response` returns them. Attach it to a server with `prompts = [{ name: "<prompt>" }]` on the `mcp_server`. Prompts cannot be attached to agents.

---

## Quick Reference

```xs
prompt "<name>" {
  description = "Shown to the client as the prompt description"
  title = "Human readable name"
  input { ... }
  stack { ... }
  response = $messages
}
```

---

## Basic Structure

```xs
// Review a code change
prompt code_review {
  title = "Code review"
  icons = [
    {
      src      : "https://cdn.example.com/icons/review.png"
      mime_type: "image/png"
      sizes    : ["48x48"]
    }
  ]

  input {
    // The code to review
    text code

    // The language of the code
    enum language? {
      values = ["php", "typescript"]
    }
  }

  stack {
    var $messages {
      value = [
        {role: "user", content: "Review this code: " ~ $input.code}
        {role: "assistant", content: "Sure, reviewing it now."}
      ]
    }
  }

  response = $messages
  tags = ["mcp", "review"]
}
```

---

## Key Fields

| Field | Purpose | Required |
|-------|---------|----------|
| `input` | The prompt's arguments. Each field becomes a prompt argument; its `description` is sent to the client | Yes (may be empty) |
| `stack` | Logic that builds the messages | Yes |
| `response` | The messages to return. The grammar allows omitting it, but a prompt without one fails every `prompts/get` | Yes, in practice |
| `description` | The prompt description sent to the client | No |
| `title` | Human readable display name | No |
| `icons` | Icons a client may show. Same rules as tool icons (see `tools`) | No |
| `middleware` | Pre/post middleware, as on a tool | No |
| `history` | Execution history retention | No |
| `tags`, `docs`, `guid` | Organization and internal notes | No |

An input field that is required and has no default becomes a required prompt argument. A client that omits one gets an error before the stack runs.

---

## What `response` May Return

| Response | Messages the client receives |
|----------|------------------------------|
| A string or a number | One `user` message with that text |
| A list of `{role, content}` objects | Those messages, in order |
| A single `{role, content}` object | One message |

`role` is `user` or `assistant`. `content` is a string (a text block) or one MCP content block: `text`, `image`, `audio`, `resource_link` or `resource`.

```xs
prompt greeting {
  input {
    text name
  }

  stack {
  }

  response = "Write a warm greeting for " ~ $input.name
}
```

Any other response (no response at all, `null`, a bool, an object that is not a message) is an authoring error, and the client receives it as an internal error that names the bad value.

---

## Argument Completions

An `enum` input field gives the client argument completions: `completion/complete` answers with the enum `values` that start with what the user typed. No stack runs. Any other field type completes to nothing.

---

## Elicitation and Progress

A prompt's stack can use `mcp.elicit` and `mcp.progress`, exactly as a tool can. See `mcp-servers` ("Elicitation" and "Progress") for the rules, in particular that input is only collected from `2026-07-28` clients.

---

## Attaching to a Server

```xs
mcp_server "Engineering" {
  canonical = "eng-mcp"
  tools = [{ name: "search_code" }]
  prompts = [
    { name: "code_review" },
    { name: "greeting", auth: "user" },
    { name: "old_prompt", active: false }
  ]
}
```

| Entry field | Purpose | Default |
|-------------|---------|---------|
| `name` | Prompt file name in `ai/prompt/` | (required) |
| `active` | Whether this server offers the prompt | `true` |
| `auth` | Name of an auth-enabled table whose token is required to fetch it | omitted = public |

---

## Related Topics

| Topic | Description |
|-------|-------------|
| `mcp-servers` | Attaching prompts, elicitation, progress, protocol versions |
| `resources` | The other first-class MCP primitive |
| `tools` | Tool metadata and icon rules |
| `types` | Input field types |
