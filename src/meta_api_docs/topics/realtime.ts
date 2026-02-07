import type { TopicDoc } from "../types.js";

export const realtimeDoc: TopicDoc = {
  topic: "realtime",
  title: "Realtime Channel Management",
  description: `Realtime channels enable WebSocket-based push notifications and live updates to connected clients.

## Key Concepts
- Channels are WebSocket endpoints for real-time communication
- Clients subscribe to channels to receive updates
- Server can publish messages to channels
- Triggers can respond to channel events
- Useful for chat, notifications, live updates

## Common Use Cases
- Live chat applications
- Real-time notifications
- Live dashboards
- Collaborative editing
- Push updates to mobile apps`,

  ai_hints: `- Create channels for different message types (chat, notifications, etc.)
- Use triggers to respond to channel events (subscribe, message, etc.)
- Channels require authenticated connections for security
- Consider rate limiting for high-traffic channels
- Test with WebSocket clients before production`,

  endpoints: [
    {
      method: "GET",
      path: "/workspace/{workspace_id}/realtime/channel",
      tool_name: "listRealtimeChannels",
      description: "List all realtime channels in a workspace.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "page", type: "integer", default: 1, description: "Page number" },
        { name: "per_page", type: "integer", default: 50, description: "Items per page" },
        { name: "search", type: "string", description: "Search by channel name" }
      ]
    },
    {
      method: "GET",
      path: "/workspace/{workspace_id}/realtime/channel/{channel_id}",
      tool_name: "getRealtimeChannel",
      description: "Get details of a specific realtime channel.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "channel_id", type: "integer", required: true, in: "path", description: "Channel ID" }
      ]
    },
    {
      method: "POST",
      path: "/workspace/{workspace_id}/realtime/channel",
      tool_name: "createRealtimeChannel",
      description: "Create a new realtime channel.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          name: { type: "string", description: "Channel name", required: true },
          description: { type: "string", description: "Channel description" }
        }
      },
      example: {
        method: "POST",
        path: "/workspace/1/realtime/channel",
        body: {
          name: "notifications",
          description: "User notification channel"
        }
      }
    },
    {
      method: "PUT",
      path: "/workspace/{workspace_id}/realtime/channel/{channel_id}",
      tool_name: "updateRealtimeChannel",
      description: "Update an existing realtime channel.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "channel_id", type: "integer", required: true, in: "path", description: "Channel ID" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          name: { type: "string", description: "Channel name" },
          description: { type: "string", description: "Channel description" }
        }
      }
    },
    {
      method: "DELETE",
      path: "/workspace/{workspace_id}/realtime/channel/{channel_id}",
      tool_name: "deleteRealtimeChannel",
      description: "Delete a realtime channel.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "channel_id", type: "integer", required: true, in: "path", description: "Channel ID" }
      ]
    }
  ],

  schemas: {
    RealtimeChannel: {
      type: "object",
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        description: { type: "string" },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" }
      }
    }
  },

  related_topics: ["api", "function"]
};
