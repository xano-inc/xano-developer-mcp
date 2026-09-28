import type { TopicDoc } from "../types.js";
import { mcpPrimitiveEndpoints } from "./mcp_primitive.js";

export const promptDoc: TopicDoc = {
  topic: "prompt",
  title: "MCP Prompt Management",
  description: `MCP prompts are reusable prompt templates an MCP server offers to clients (\`prompts/list\`, \`prompts/get\`). A prompt has an \`input\` block (its arguments), a \`stack\` that builds the messages, and a \`response\`.

## Key Concepts
- A prompt is attached to an MCP server through the server's \`prompts\` block: \`prompts = [{ name: "code_review", auth: "user" }]\`
- Prompts cannot be attached to agents
- \`response\` may be a string (one user message), a list of \`{role, content}\` messages, or one message object
- An \`enum\` input field gives clients argument completions
- The stack may use \`mcp.elicit\` and \`mcp.progress\`
- RBAC uses the same scope as tools (\`workspace:tool\`)`,

  ai_hints: `- Create the prompt, then add it to an MCP server's \`prompts\` block (updateMcpServer)
- Write and validate the XanoScript first; see the \`prompts\` XanoScript docs topic
- Use debugPrompt to test, including simulated elicitation answers
- Every eliciting prompt needs a cancel branch: clients older than MCP 2026-07-28 always answer cancel`,

  endpoints: mcpPrimitiveEndpoints({
    kind: "prompt",
    label: "prompt",
    plural: "prompts",
    debugInputDescription: "The prompt's input (its arguments)",
    createExample: `prompt summarize {
  description = "Summarize a document"
  input {
    text doc {
      description = "The text to summarize"
    }
  }

  stack {
    var $msg {
      value = "Summarize: " ~ $input.doc
    }
  }

  response = $msg
}`
  }),

  schemas: {
    Prompt: {
      type: "object",
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        description: { type: "string" },
        title: { type: "string" },
        xanoscript: { type: "string" },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" }
      }
    }
  },

  related_topics: ["mcp_server", "resource", "tool"]
};
