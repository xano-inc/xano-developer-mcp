import type { TopicDoc } from "../types.js";
import { mcpPrimitiveEndpoints } from "./mcp_primitive.js";

export const resourceDoc: TopicDoc = {
  topic: "resource",
  title: "MCP Resource Management",
  description: `MCP resources are data an MCP server shares with clients as context (\`resources/list\`, \`resources/templates/list\`, \`resources/read\`). A resource has a \`uri\`, a \`stack\` and a \`response\`.

## Key Concepts
- A literal uri (\`docs://readme\`) is a static resource with no input
- A uri with level-1 variables (\`orders://{region}/{order_id}\`) is a template; its variables and the \`input\` fields must be the same set
- A resource is attached to an MCP server through the server's \`resources\` block: \`resources = [{ name: "regional_order" }]\`
- Two resources on one server may not share a uri; a first-class resource wins over a legacy \`type: "resource"\` tool reference on the same uri
- The stack may use \`mcp.elicit\` and \`mcp.progress\`
- RBAC uses the same scope as tools (\`workspace:tool\`)`,

  ai_hints: `- Create the resource, then add it to an MCP server's \`resources\` block (updateMcpServer)
- Prefer a resource object over the legacy \`type: "resource"\` tool reference for new work
- Validate the uri and input together; see the \`resources\` XanoScript docs topic
- Use debugResource to test; pass template variables by name in \`input\``,

  endpoints: mcpPrimitiveEndpoints({
    kind: "resource",
    plural: "resources",
    debugInputDescription: "The resource's input: a template's URI variables by name",
    createExample: `resource readme {
  uri = "docs://readme"
  mime_type = "text/markdown"

  stack {
  }

  response = "# Readme"
}`
  }),

  schemas: {
    Resource: {
      type: "object",
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        description: { type: "string" },
        title: { type: "string" },
        uri: { type: "string" },
        mime_type: { type: "string" },
        xanoscript: { type: "string" },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" }
      }
    }
  },

  related_topics: ["mcp_server", "prompt", "tool"]
};
