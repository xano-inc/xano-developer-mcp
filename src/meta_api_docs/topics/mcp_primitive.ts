import type { EndpointDoc } from "../types.js";

/** The debug-route description shared by the tool, prompt and resource topics. */
export function debugDescription(kind: "tool" | "prompt" | "resource"): string {
  return `Run the ${kind}'s stack outside MCP and return its result. Requires \`workspace:tool\` read and \`workspace:action:rundebug\` enabled. \`elicit\` simulates mcp.elicit answers keyed by elicit key, e.g. {"confirm":{"action":"accept","content":{"proceed":true}}}; an elicit with no simulated answer gets {"action":"cancel"}. The response's \`mcp\` object lists every elicit asked (with its answer) and every mcp.progress call. The stack runs for real, so its writes happen.`;
}

/**
 * Shared route set for the MCP `prompt` and `resource` objects. Both expose the
 * same CRUD + debug surface in cloud-client (`app/meta/{prompt,resource}.yaml`).
 */
export function mcpPrimitiveEndpoints(opts: {
  kind: "prompt" | "resource";
  plural: string;
  debugInputDescription: string;
  createExample: string;
}): EndpointDoc[] {
  const { kind, plural, debugInputDescription, createExample } = opts;
  const idParam = `${kind}_id`;
    const PascalPlural = plural.charAt(0).toUpperCase() + plural.slice(1);
  const PascalKind = kind.charAt(0).toUpperCase() + kind.slice(1);
  const workspace = { name: "workspace_id", type: "integer", required: true, in: "path" as const, description: "Workspace ID" };
  const id = { name: idParam, type: "integer", required: true, in: "path" as const, description: `${PascalKind} ID` };

  return [
    {
      method: "GET",
      path: `/workspace/{workspace_id}/${kind}`,
      tool_name: `list${PascalPlural}`,
      description: `List MCP ${plural} in a workspace.`,
      parameters: [
        workspace,
        { name: "branch", type: "string", description: "Filter by branch name" },
        { name: "page", type: "integer", default: 1, description: "Page number" },
        { name: "per_page", type: "integer", default: 50, description: "Items per page" },
        { name: "search", type: "string", description: `Search ${plural}` },
        { name: "sort", type: "string", default: "created_at", enum: ["created_at", "updated_at", "name"], description: "Sort field" },
        { name: "order", type: "string", default: "desc", enum: ["asc", "desc"], description: "Sort order" },
        { name: "include_xanoscript", type: "boolean", default: false, description: "Include XanoScript" },
        { name: "include_draft", type: "boolean", default: false, description: "Include draft versions" }
      ]
    },
    {
      method: "GET",
      path: `/workspace/{workspace_id}/${kind}/{${idParam}}`,
      tool_name: `get${PascalKind}`,
      description: `Get one MCP ${kind}.`,
      parameters: [
        workspace,
        id,
        { name: "include_xanoscript", type: "boolean", default: false, description: "Include XanoScript" },
        { name: "include_draft", type: "boolean", default: false, description: "Include the draft version" }
      ]
    },
    {
      method: "POST",
      path: `/workspace/{workspace_id}/${kind}`,
      tool_name: `create${PascalKind}`,
      description: `Create an MCP ${kind} from XanoScript. The body is the raw XanoScript (Content-Type: text/x-xanoscript).`,
      parameters: [
        workspace,
        { name: "branch", type: "string", description: "Target branch name" },
        { name: "include_xanoscript", type: "boolean", default: false, description: "Include XanoScript in the response" }
      ],
      request_body: {
        type: "text/x-xanoscript",
        description: `The ${kind} definition in XanoScript.`
      },
      example: {
        method: "POST",
        path: `/workspace/1/${kind}`,
        headers: { "Content-Type": "text/x-xanoscript" },
        body: createExample
      }
    },
    {
      method: "PUT",
      path: `/workspace/{workspace_id}/${kind}/{${idParam}}`,
      tool_name: `update${PascalKind}`,
      description: `Replace an MCP ${kind}'s definition with new XanoScript (Content-Type: text/x-xanoscript).`,
      parameters: [
        workspace,
        id,
        { name: "publish", type: "boolean", default: true, description: "Publish the change immediately" },
        { name: "include_xanoscript", type: "boolean", default: false, description: "Include XanoScript in the response" }
      ],
      request_body: {
        type: "text/x-xanoscript",
        description: `The full ${kind} definition in XanoScript.`
      }
    },
    {
      method: "DELETE",
      path: `/workspace/{workspace_id}/${kind}/{${idParam}}`,
      tool_name: `delete${PascalKind}`,
      description: `Delete an MCP ${kind} permanently. MCP servers that list it stop offering it.`,
      parameters: [workspace, id]
    },
    {
      method: "POST",
      path: `/workspace/{workspace_id}/${kind}/{${idParam}}/debug`,
      tool_name: `debug${PascalKind}`,
      description: debugDescription(kind),
      parameters: [workspace, id],
      request_body: {
        type: "application/json",
        properties: {
          input: { type: "object", description: debugInputDescription },
          elicit: { type: "object", description: "Simulated mcp.elicit answers, keyed by elicit key: {action: accept|decline|cancel, content?}" }
        }
      }
    }
  ];
}
