---
applyTo: "mcp_servers/**/*.xs"
---

## MCP Server with Tools

This example shows a basic MCP server configuration that exposes two tools.

```xs
mcp_server "My Mcp Server" {
  description = "An example MCP server."
  canonical = "u3D7kj5Q"
  instructions = "General guidelines for AI agents about this server's overall purpose and usage context. These instructions apply server-wide and are separate from individual tool descriptions and parameters."
  tags = ["sample_tag"]
  tools = [
    { name: "new_statements" },
    { name: "what_is_xano" }
  ]
  history = "inherit"
}
```

## MCP Server without Tools

This example shows an MCP server that does not yet have any tools configured.

```xs
mcp_server "Empty Mcp Server" {
  description = "An MCP server with no tools yet."
  canonical = "a1B2c3D4"
  instructions = "This server is currently under development and does not yet have any tools available."
  tags = ["development"]
  tools = []
  history = "inherit"
}
```
