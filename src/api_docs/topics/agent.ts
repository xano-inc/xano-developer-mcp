import type { TopicDoc } from "../types.js";

export const agentDoc: TopicDoc = {
  topic: "agent",
  title: "AI Agent Management",
  description: `Agents are AI-powered automation units that use LLMs (like Claude) to make decisions and execute multi-step workflows.

## Key Concepts
- Agents use LLMs for reasoning and decision-making
- Can call tools to perform actions
- Support multiple LLM providers (Anthropic, OpenAI, etc.)
- Configurable system prompts, temperature, max steps
- Can have triggers that invoke them automatically

## LLM Configuration
- Type: Provider (e.g., "anthropic")
- Model: Specific model (e.g., "claude-4-sonnet-20250514")
- System prompt: Instructions for the agent
- Temperature: Creativity level (0-1)
- Max steps: Maximum reasoning iterations
- Reasoning: Enable/disable chain-of-thought`,

  ai_hints: `- Create tools first, then create agent and associate tools
- System prompt is critical for agent behavior
- Lower temperature = more deterministic responses
- Max steps limits runaway agent loops
- Use triggers to invoke agents on events (table changes, etc.)`,

  endpoints: [
    {
      method: "GET",
      path: "/workspace/{workspace_id}/agent",
      tool_name: "listAgents",
      description: "List all AI agents in a workspace.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "page", type: "integer", default: 1, description: "Page number" },
        { name: "per_page", type: "integer", default: 50, description: "Items per page" },
        { name: "search", type: "string", description: "Search by agent name" },
        { name: "include_xanoscript", type: "boolean", default: false, description: "Include XanoScript definition" },
        { name: "include_draft", type: "boolean", default: false, description: "Include draft versions" }
      ]
    },
    {
      method: "GET",
      path: "/workspace/{workspace_id}/agent/{agent_id}",
      tool_name: "getAgent",
      description: "Get details of a specific AI agent.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "agent_id", type: "integer", required: true, in: "path", description: "Agent ID" },
        { name: "include_xanoscript", type: "boolean", default: false, description: "Include XanoScript definition" },
        { name: "include_draft", type: "boolean", default: false, description: "Include draft version" }
      ]
    },
    {
      method: "POST",
      path: "/workspace/{workspace_id}/agent",
      tool_name: "createAgent",
      description: "Create a new AI agent with LLM configuration.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          name: { type: "string", description: "Agent name", required: true },
          description: { type: "string", description: "Agent description" },
          xanoscript: { type: "string", description: "XanoScript agent definition", required: true }
        }
      },
      example: {
        method: "POST",
        path: "/workspace/1/agent",
        body: {
          name: "support_agent",
          description: "Customer support AI agent",
          xanoscript: `agent support_agent {
  llm {
    type = "anthropic"
    model = "claude-4-sonnet-20250514"
    system_prompt = "You are a helpful customer support agent."
    max_steps = 10
    temperature = 0.3
  }
  tools = [lookup_order, update_ticket]
}`
        }
      }
    },
    {
      method: "PUT",
      path: "/workspace/{workspace_id}/agent/{agent_id}",
      tool_name: "updateAgent",
      description: "Update an existing AI agent.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "agent_id", type: "integer", required: true, in: "path", description: "Agent ID" },
        { name: "publish", type: "boolean", default: true, description: "Publish changes immediately" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          name: { type: "string", description: "Agent name" },
          description: { type: "string", description: "Agent description" },
          xanoscript: { type: "string", description: "XanoScript agent definition" }
        }
      }
    },
    {
      method: "DELETE",
      path: "/workspace/{workspace_id}/agent/{agent_id}",
      tool_name: "deleteAgent",
      description: "Delete an AI agent.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "agent_id", type: "integer", required: true, in: "path", description: "Agent ID" }
      ]
    }
  ],

  schemas: {
    Agent: {
      type: "object",
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        description: { type: "string" },
        llm: {
          type: "object",
          properties: {
            type: { type: "string", description: "LLM provider (anthropic, openai, etc.)" },
            model: { type: "string", description: "Model identifier" },
            system_prompt: { type: "string" },
            max_steps: { type: "integer" },
            temperature: { type: "number" },
            reasoning: { type: "boolean" }
          }
        },
        tools: { type: "array", items: { type: "string" } },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" }
      }
    }
  },

  related_topics: ["tool", "mcp_server", "function"]
};
