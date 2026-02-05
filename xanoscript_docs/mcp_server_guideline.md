---
applyTo: "mcp_servers/**/*.xs"
---

# How to Define MCP Servers in XanoScript

MCP (Model Context Protocol) servers in Xano are the gateways that expose your AI Tools to external clients and AI models. They act as a standardized endpoint that AI-powered applications can connect to, discover available tools, and execute them.

MCP Servers are defined in `.xs` files within the `mcp_servers/` directory of your project. For example, you might have a file named `mcp_servers/task_manager_mcp.xs` that contains the definition of an MCP server dedicated to task management:

```xs
mcp_server "Task Manager MCP" {
  canonical = "1TuBS8V2"
  instructions = "Manages tasks specifically for the user, all tools directly relate to the users records in the database. "
  tags = ["internal"]
  tools = [
    {name: "add_task"}
    {name: "delete_task"}
    {name: "edit_task"}
    {name: "get_user_tasks"}
  ]
}
```

## Core MCP Server Syntax

Every MCP server is defined within an `mcp_server` block.

```xs
mcp_server "MCP Server Display Name" {
  canonical = "unique-server-id"
  description = "A brief explanation of what this server is for."
  instructions = "These instructions apply server-wide and guide the AI on how to use the collection of tools."
  tags = ["tag1", "tag2"]
  tools = [
    { name: "tool-name-1" },
    { name: "tool-name-2" }
  ]
  history = "inherit"
}
```

- **`mcp_server "Name"`**: The top-level declaration. The name is a human-readable string.
- **`canonical`**: A required unique, non-changeable string identifier for the server.
- **`description`**: An optional string for internal documentation. This is not broadcast with the server.
- **`instructions`**: A string containing general guidelines for AI agents about the server's overall purpose and usage context.
- **`tags`**: An optional list of strings for categorizing and organizing your servers.
- **`tools`**: A required list of objects, where each object references an AI Tool by its unique name.

## Tools Block

The `tools` block is a list that specifies the tools exposed by the MCP server:

```xs
tools = [
  { name: "get_user_details_by_email" },
  { name: "cancel_subscription" },
  { name: "create_support_ticket" }
]
```

The value of the `name` key must be an exact match the unique name of a tool defined in your `tools/` directory, see [Tool Guideline](./tool_guideline.md) for more information.

## Best Practices

- **Use a Clear Naming Convention**: Give your servers a descriptive name and a memorable canonical ID.
- **Write Comprehensive Instructions**: The server-level `instructions` should provide a high-level overview of what the collection of tools can accomplish. For example, "A set of tools for managing customer support tickets, including creating, updating, and closing tickets."
- **Group Related Tools**: Create logical groupings of tools within a single MCP server. For instance, a `user-management-server` could contain tools for creating, updating, and deleting users.
- **Use Tags for Organization**: Use tags to categorize your servers, making them easier to manage in a large project.
