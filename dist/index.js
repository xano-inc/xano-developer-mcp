#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { xanoscriptParser } from "@xano/xanoscript-language-server/parser/parser.js";
import { getSchemeFromContent } from "@xano/xanoscript-language-server/utils.js";
import { generateInitWorkspaceTemplate } from "./templates/init-workspace.js";
import { generateXanoscriptIndexTemplate } from "./templates/xanoscript-index.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// XanoScript docs mapping - keyword to files
// Run `npm run sync-docs` to regenerate this from the docs directory
const XANOSCRIPT_DOCS = {
    // Core concepts (guideline + examples)
    agent: ["agent_guideline.md", "agent_examples.md"],
    api_query: ["api_query_guideline.md", "api_query_examples.md"],
    function: ["function_guideline.md", "function_examples.md"],
    mcp_server: ["mcp_server_guideline.md", "mcp_server_examples.md"],
    table: ["table_guideline.md", "table_examples.md"],
    task: ["task_guideline.md", "task_examples.md"],
    tool: ["tool_guideline.md", "tool_examples.md"],
    // Guideline only
    db_query: ["db_query_guideline.md"],
    ephemeral: ["ephemeral_environment_guideline.md"],
    expressions: ["expression_guideline.md"],
    frontend: ["frontend_guideline.md"],
    input: ["input_guideline.md"],
    testing: ["unit_testing_guideline.md"],
    // Workflows (AI agent development guides)
    workflow: ["AGENTS.md"],
    api_workflow: ["API_AGENTS.md"],
    function_workflow: ["FUNCTION_AGENTS.md"],
    table_workflow: ["TABLE_AGENTS.md"],
    task_workflow: ["TASK_AGENTS.md"],
    // Standalone reference docs
    lovable: ["build_from_lovable.md"],
    syntax: ["functions.md"],
    query_filter: ["query_filter.md"],
    tips: ["tips_and_tricks.md"],
    workspace: ["workspace.md"],
};
// Keyword aliases for convenience
const KEYWORD_ALIASES = {
    // api_query
    api: "api_query",
    apis: "api_query",
    endpoint: "api_query",
    endpoints: "api_query",
    query: "api_query",
    // function
    func: "function",
    functions: "function",
    // table
    tables: "table",
    schema: "table",
    schemas: "table",
    // task
    tasks: "task",
    cron: "task",
    scheduled: "task",
    // tool
    tools: "tool",
    // agent
    agents: "agent",
    ai_agent: "agent",
    // mcp_server
    mcp: "mcp_server",
    // syntax
    reference: "syntax",
    ref: "syntax",
    statements: "syntax",
    stack: "syntax",
    // expressions
    expr: "expressions",
    expression: "expressions",
    filters: "expressions",
    pipes: "expressions",
    operators: "expressions",
    // input
    inputs: "input",
    params: "input",
    parameters: "input",
    // db_query
    db: "db_query",
    database: "db_query",
    // query_filter
    filter: "query_filter",
    where: "query_filter",
    // workflow
    workflows: "workflow",
    dev: "workflow",
    development: "workflow",
    // testing
    test: "testing",
    tests: "testing",
    unit_test: "testing",
    // tips
    tip: "tips",
    tricks: "tips",
    // frontend
    ui: "frontend",
    static: "frontend",
};
const XANO_OBJECT_TYPES = {
    function: {
        path: "functions",
        endpoint: "function",
        extension: ".xs",
        hasXanoscript: true,
    },
    table: {
        path: "tables",
        endpoint: "table",
        extension: ".xs",
        hasXanoscript: true,
    },
    task: {
        path: "tasks",
        endpoint: "task",
        extension: ".xs",
        hasXanoscript: true,
    },
    api_group: {
        path: "apis",
        endpoint: "api-group",
        extension: ".xs",
        hasXanoscript: true,
        supportsNesting: true,
    },
    tool: {
        path: "tools",
        endpoint: "tool",
        extension: ".xs",
        hasXanoscript: true,
    },
    agent: {
        path: "agents",
        endpoint: "agent",
        extension: ".xs",
        hasXanoscript: true,
    },
    middleware: {
        path: "middlewares",
        endpoint: "middleware",
        extension: ".xs",
        hasXanoscript: true,
    },
    addon: {
        path: "addons",
        endpoint: "addon",
        extension: ".xs",
        hasXanoscript: true,
    },
    mcp_server: {
        path: "mcp_servers",
        endpoint: "mcp-server",
        extension: ".xs",
        hasXanoscript: true,
    },
    realtime_channel: {
        path: "realtime",
        endpoint: "realtime-channel",
        extension: ".xs",
        hasXanoscript: true,
    },
};
// Generate init_workspace documentation
function generateInitWorkspaceDoc() {
    const objectTypes = Object.entries(XANO_OBJECT_TYPES).map(([type, config]) => ({
        type,
        path: config.path,
        endpoint: config.endpoint,
    }));
    return generateInitWorkspaceTemplate(objectTypes);
}
// Map of object names to their documentation files
const DOCS_MAP = {
    workspace: "workspace.md",
    table: "table.md",
    api_group: "api_group.md",
    function: "function.md",
    task: "task.md",
    middleware: "middleware.md",
    addon: "addon.md",
    agent: "agent.md",
    tool: "tool.md",
    mcp_server: "mcp_server.md",
    realtime: "realtime.md",
    triggers: "triggers.md",
    file: "file.md",
    history: "history.md",
    authentication: "authentication.md",
};
// Get the api_docs directory path
function getDocsPath() {
    // In development, look relative to src
    // In production (after build), look relative to dist
    const possiblePaths = [
        join(__dirname, "..", "api_docs"),
        join(__dirname, "..", "..", "api_docs"),
    ];
    for (const p of possiblePaths) {
        try {
            readFileSync(join(p, "index.md"));
            return p;
        }
        catch {
            continue;
        }
    }
    return join(__dirname, "..", "api_docs");
}
const DOCS_PATH = getDocsPath();
// Get the xanoscript_docs directory path
function getXanoscriptDocsPath() {
    const possiblePaths = [
        join(__dirname, "..", "xanoscript_docs"),
        join(__dirname, "..", "..", "xanoscript_docs"),
    ];
    for (const p of possiblePaths) {
        try {
            readFileSync(join(p, "version.json"));
            return p;
        }
        catch {
            continue;
        }
    }
    return join(__dirname, "..", "xanoscript_docs");
}
const XANOSCRIPT_DOCS_PATH = getXanoscriptDocsPath();
function readDocumentation(object) {
    try {
        if (!object) {
            // Return index documentation
            return readFileSync(join(DOCS_PATH, "index.md"), "utf-8");
        }
        const normalizedObject = object.toLowerCase().trim();
        // Check if the object exists in our map
        if (normalizedObject in DOCS_MAP) {
            const filePath = join(DOCS_PATH, DOCS_MAP[normalizedObject]);
            return readFileSync(filePath, "utf-8");
        }
        // Try to find a partial match
        const matchingKey = Object.keys(DOCS_MAP).find((key) => key.includes(normalizedObject) || normalizedObject.includes(key));
        if (matchingKey) {
            const filePath = join(DOCS_PATH, DOCS_MAP[matchingKey]);
            return readFileSync(filePath, "utf-8");
        }
        // Return error message with available options
        const availableObjects = Object.keys(DOCS_MAP).join(", ");
        return `Error: Unknown object "${object}". Available objects: ${availableObjects}

Use api_docs() without parameters to see the full documentation index.`;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `Error reading documentation: ${errorMessage}`;
    }
}
// Read XanoScript documentation version
function getXanoscriptDocsVersion() {
    try {
        const versionFile = readFileSync(join(XANOSCRIPT_DOCS_PATH, "version.json"), "utf-8");
        return JSON.parse(versionFile).version || "unknown";
    }
    catch {
        return "unknown";
    }
}
// Generate the XanoScript documentation index
function generateXanoscriptIndex() {
    const version = getXanoscriptDocsVersion();
    // Build alias lookup (keyword -> aliases)
    const aliasLookup = {};
    for (const [alias, keyword] of Object.entries(KEYWORD_ALIASES)) {
        aliasLookup[keyword] = aliasLookup[keyword] || [];
        aliasLookup[keyword].push(alias);
    }
    return generateXanoscriptIndexTemplate({ version, aliasLookup });
}
// Read XanoScript documentation for a keyword
function readXanoscriptDocs(keyword) {
    try {
        if (!keyword) {
            return generateXanoscriptIndex();
        }
        const normalizedKeyword = keyword.toLowerCase().trim();
        // Check for alias first
        const resolvedKeyword = KEYWORD_ALIASES[normalizedKeyword] || normalizedKeyword;
        // Check if keyword exists
        if (!(resolvedKeyword in XANOSCRIPT_DOCS)) {
            // Try partial match
            const matchingKey = Object.keys(XANOSCRIPT_DOCS).find((key) => key.includes(resolvedKeyword) || resolvedKeyword.includes(key));
            if (matchingKey) {
                return readXanoscriptDocs(matchingKey);
            }
            const availableKeywords = Object.keys(XANOSCRIPT_DOCS).join(", ");
            return `Error: Unknown keyword "${keyword}". Available keywords: ${availableKeywords}

Use xanoscript_docs() without parameters to see the full documentation index.`;
        }
        const files = XANOSCRIPT_DOCS[resolvedKeyword];
        const version = getXanoscriptDocsVersion();
        // Read and concatenate all files for this keyword
        const contents = [];
        contents.push(`# XanoScript: ${resolvedKeyword}`);
        contents.push(`Documentation version: ${version}\n`);
        for (const file of files) {
            const filePath = join(XANOSCRIPT_DOCS_PATH, file);
            try {
                const content = readFileSync(filePath, "utf-8");
                contents.push(`---\n## Source: ${file}\n---\n`);
                contents.push(content);
            }
            catch (err) {
                contents.push(`\n[Error reading ${file}: file not found]\n`);
            }
        }
        return contents.join("\n");
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `Error reading XanoScript documentation: ${errorMessage}`;
    }
}
// Create the MCP server
const server = new Server({
    name: "xano-developer-mcp",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "api_docs",
                description: "Get Xano Headless API documentation. Returns documentation for interacting with the Xano Headless API using XanoScript. Use without parameters for an overview, or specify an object for detailed documentation.",
                inputSchema: {
                    type: "object",
                    properties: {
                        object: {
                            type: "string",
                            description: `Optional: The specific API object to get documentation for. Available values: ${Object.keys(DOCS_MAP).join(", ")}`,
                        },
                    },
                    required: [],
                },
            },
            {
                name: "validate_xanoscript",
                description: "Validate XanoScript code for syntax errors. Returns a list of errors with line/column positions, or confirms the code is valid. The language server auto-detects the object type from the code syntax.",
                inputSchema: {
                    type: "object",
                    properties: {
                        code: {
                            type: "string",
                            description: "The XanoScript code to validate",
                        },
                    },
                    required: ["code"],
                },
            },
            {
                name: "xanoscript_docs",
                description: "Get XanoScript programming language documentation for AI code generation. " +
                    "Call without a keyword to see the full index of available topics. " +
                    "Use a keyword to retrieve specific documentation (guidelines + examples).",
                inputSchema: {
                    type: "object",
                    properties: {
                        keyword: {
                            type: "string",
                            description: "Documentation topic to retrieve. " +
                                "Core: function, api_query (or 'api'), table, task, tool, agent, mcp_server. " +
                                "Reference: syntax (or 'ref'), expressions (or 'expr'), input, db_query (or 'db'). " +
                                "Workflow: workflow, function_workflow, api_workflow, table_workflow, task_workflow. " +
                                "Omit for the full documentation index.",
                        },
                    },
                    required: [],
                },
            },
            {
                name: "init_workspace",
                description: "Get comprehensive instructions for initializing a local Xano development workspace. " +
                    "Returns documentation on directory structure, file naming conventions, registry format for tracking changes, " +
                    "and workflows for pulling/pushing XanoScript files via the Headless API. " +
                    "Use this when setting up local development for Xano projects.",
                inputSchema: {
                    type: "object",
                    properties: {},
                    required: [],
                },
            },
        ],
    };
});
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "api_docs") {
        const args = request.params.arguments;
        const object = args?.object;
        const documentation = readDocumentation(object);
        return {
            content: [
                {
                    type: "text",
                    text: documentation,
                },
            ],
        };
    }
    if (request.params.name === "validate_xanoscript") {
        const args = request.params.arguments;
        if (!args?.code) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Error: 'code' parameter is required",
                    },
                ],
                isError: true,
            };
        }
        try {
            const text = args.code;
            const scheme = getSchemeFromContent(text);
            const parser = xanoscriptParser(text, scheme);
            if (parser.errors.length === 0) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "✓ XanoScript is valid. No syntax errors found.",
                        },
                    ],
                };
            }
            // Convert parser errors to diagnostics with line/column info
            const diagnostics = parser.errors.map((error) => {
                const startOffset = error.token?.startOffset ?? 0;
                const endOffset = error.token?.endOffset ?? 5;
                // Calculate line and character positions from offset
                const lines = text.substring(0, startOffset).split("\n");
                const line = lines.length - 1;
                const character = lines[lines.length - 1].length;
                const endLines = text.substring(0, endOffset + 1).split("\n");
                const endLine = endLines.length - 1;
                const endCharacter = endLines[endLines.length - 1].length;
                return {
                    range: {
                        start: { line, character },
                        end: { line: endLine, character: endCharacter },
                    },
                    message: error.message,
                    source: error.name || "XanoScript Parser",
                };
            });
            // Format errors for readable output
            const errorMessages = diagnostics.map((d, i) => {
                const location = `Line ${d.range.start.line + 1}, Column ${d.range.start.character + 1}`;
                return `${i + 1}. [${location}] ${d.message}`;
            });
            return {
                content: [
                    {
                        type: "text",
                        text: `Found ${diagnostics.length} error(s):\n\n${errorMessages.join("\n")}`,
                    },
                ],
                isError: true,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                content: [
                    {
                        type: "text",
                        text: `Validation error: ${errorMessage}`,
                    },
                ],
                isError: true,
            };
        }
    }
    if (request.params.name === "xanoscript_docs") {
        const args = request.params.arguments;
        const keyword = args?.keyword;
        const documentation = readXanoscriptDocs(keyword);
        return {
            content: [
                {
                    type: "text",
                    text: documentation,
                },
            ],
        };
    }
    if (request.params.name === "init_workspace") {
        const documentation = generateInitWorkspaceDoc();
        return {
            content: [
                {
                    type: "text",
                    text: documentation,
                },
            ],
        };
    }
    return {
        content: [
            {
                type: "text",
                text: `Unknown tool: ${request.params.name}`,
            },
        ],
        isError: true,
    };
});
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Xano Developer MCP server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
