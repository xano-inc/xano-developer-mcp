---
applyTo: "tools/**/*.xs"
---

# How to Define AI Tools in XanoScript

AI Tools in Xano are specialized, reusable function stacks designed to be executed by [AI Agents](./agent_guideline.md) or exposed externally through an [MCP server](./mcp_server_guideline.md), also known as Model Context Protocol Server. They act as the bridge between an AI's reasoning capabilities and your application's backend, allowing agents to query databases, call APIs, and perform complex actions.

Tools are defined in `<tool_name>.xs` files within the `tools/` directory of your project, they follow the same syntax as standard Xano [function stacks](./function_guideline.md) with some additional features tailored for AI interactions.

For example, you might have a file named `tools/user_lookup.xs` that contains the definition of a tool for looking up user information:

````xs
tool "user_lookup" {
  description = "Looks up user information by user ID."
  instructions = "Use this tool to retrieve detailed information about a user given their unique user ID. Provide the user ID as input, and the tool will return the user's profile data."
  input {
    int user_id {
      description = "The unique identifier of the user to look up."
    }
  }
  stack {
    db.get "user" {
      field_name = "id"
      field_value = $input.user_id
      description = "Verify user exists"
    } as $user
  }

  response = $user
}

## Core Tool Syntax

Every tool is defined within a `tool` block.

```xs
tool "unique_tool_name" {
  description = "A brief explanation of what this tool does."
  instructions = "Guidelines explaining how AI agents should use this tool, including use cases, input formatting, and output interpretation."
  input {

  }
  stack {

  }
  response = null
  history = false
}
````

### Key Fields

- **`tool "name"`**: The top-level declaration. The name must be a unique string identifier, as this is how the tool is referenced by Agents and MCP servers.
- **`description`**: An optional string for internal documentation. This is not visible to the AI.
- **`instructions`**: A required string that provides the AI with the context it needs to use the tool effectively. This is a crucial field for ensuring the tool is used correctly by the agent.
- **`input`**: An object defining the parameters the tool accepts.
- **`stack`**: An object containing the sequence of operations to be executed.
- **`response`**: An object that specifies the data returned by the tool.

---

## Input Block

The `input` block defines the parameters that the tool can accept at runtime. The structure is identical to inputs in other Xano function stacks, but the `description` for each parameter is especially important, as it is included in the information sent to the AI.

### Input Structure

The `input` block accepts a series of field definitions, follow the [input guidleine](./input_guideline.md) for more details

## Stack Block and Tool-Specific Statements

The `stack` contains the tool's logic. In addition to all standard Xano function statements, tools have access to three unique statements for calling other Xano resources.

### 1. `api.call`

Executes an API endpoint from one of your API groups. This is the preferred way to interact with your backend from a tool, as it ensures that all business logic encapsulated in the API is respected.

```xs
stack {
  api.call "auth/login" verb=POST {
    api_group = "Authentication"
    input = {
      email: "user@example.com",
      password: "password123"
    }
  } as $login_response
}
```

### 2. `task.call`

Executes a background task. Tasks do not accept inputs or return outputs directly.

```xs
stack {
  task.call "my_background_task" as $task_call_result
}
```

### 3. `tool.call`

```xs
stack {
  tool.call "get_user_details" {
    input = {user_id: 123}
  } as $user_details
}
```

Executes another AI Tool. This allows you to create modular, reusable tools that can be composed together.

- **Syntax**: `tool.call <tool_name> { ... }`

```xs
stack {
  tool.call "get_user_details" {
    input = {user_id: 123}
  } as $user_details
}
```

## Response Block

The `response` block specifies the data that the tool returns to the agent or client that called it. The structure is the same as in other Xano function stacks.

**Example:**

```xs
response = $user_details
```

## Best Practices

- **Write Clear Instructions**: The `instructions` field is the most important part of your tool's definition. Be explicit about what the tool does, what each input parameter is for, and what the output means.
- **Use Descriptive Input Fields**: Clearly describe each input parameter. This information is passed to the AI and helps it construct valid requests.
- **Leverage Enums**: For inputs with a fixed set of possible values, use an `enum` type. This provides the AI with the exact options it can use, reducing errors.
- **Keep Tools Focused**: Design tools that perform a single, well-defined task. This makes them easier for the AI to understand and combine.
- **Handle Errors Gracefully**: Use `filters` on input, `precondition` and `try_catch` blocks in the stack to validate inputs and handle potential errors. Return clear error messages in the response so the AI can understand what went wrong.
