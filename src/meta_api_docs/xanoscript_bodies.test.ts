import { describe, expect, it } from "vitest";
import { topics, handleMetaApiDocs } from "./index.js";
import { validateXanoscript } from "../tools/validate_xanoscript.js";

// The Meta API create/update routes for these objects take the object as XanoScript, sent as the
// raw body with Content-Type: text/x-xanoscript (cloud-client app/workspace/mvp/app/meta/*.yaml,
// `requestBody.type: text/x-xanoscript`). Their JSON form declares no `xanoscript` field, and a
// route drops every field it does not declare, so a JSON body carrying `xanoscript` creates the
// object without its code and answers 200 (DEV-8990: measured on PHP and the Go engine).
const XANOSCRIPT_BODY = [
  "createFunction", "updateFunction",
  "createAPI", "updateAPI",
  "addTable", "updateTable",
  "createTask", "updateTask",
  "createAgent", "updateAgent",
  "createTool", "updateTool",
  "createMCPServer", "updateMCPServer",
  "createMiddleware", "updateMiddleware",
];

const endpoints = Object.values(topics).flatMap(doc =>
  (doc.endpoints ?? []).map(ep => ({ topic: doc.topic, ep })));

describe("Meta API docs: objects are created and updated with a XanoScript body (DEV-8990)", () => {
  it("documents every create/update route as a text/x-xanoscript body", () => {
    for (const tool of XANOSCRIPT_BODY) {
      const hit = endpoints.find(({ ep }) => ep.tool_name === tool);
      expect(hit, tool).toBeDefined();
      expect(hit!.ep.request_body?.type, tool).toBe("text/x-xanoscript");
    }
  });

  it("never documents xanoscript as a JSON request field", () => {
    for (const { topic, ep } of endpoints) {
      expect(ep.request_body?.properties?.xanoscript, `${topic} ${ep.method} ${ep.path}`).toBeUndefined();
    }
    for (const doc of Object.values(topics)) {
      for (const ex of doc.examples ?? []) {
        const body = ex.request.body;
        expect(typeof body === "object" && body !== null && "xanoscript" in body, `${doc.topic}: ${ex.title}`).toBe(false);
      }
      for (const pattern of doc.patterns ?? []) {
        expect(pattern.example ?? "", `${doc.topic}: ${pattern.name}`).not.toMatch(/"xanoscript"\s*:/);
      }
    }
  });

  it("tells a task's schedule apart from cron", () => {
    const task = handleMetaApiDocs({ topic: "task", detail_level: "examples" });
    expect(task).toContain("schedule = [{starts_on:");
    expect(task).not.toMatch(/cron expression|"0 \* \* \* \*"/i);
  });

  const scripts = [
    ...endpoints
      // the routes above must carry one; any other XanoScript-body endpoint that shows an example
      // must show a valid one
      .filter(({ ep }) => ep.request_body?.type === "text/x-xanoscript" && (XANOSCRIPT_BODY.includes(ep.tool_name ?? "") || ep.example))
      .map(({ topic, ep }) => ({ name: `${topic} ${ep.tool_name}`, example: ep.example })),
    ...Object.values(topics).flatMap(doc => (doc.examples ?? [])
      .filter(ex => ex.request.headers?.["Content-Type"] === "text/x-xanoscript")
      .map(ex => ({ name: `${doc.topic}: ${ex.title}`, example: ex.request }))),
  ];

  for (const { name, example } of scripts) {
    it(`gives ${name} a XanoScript example that validates`, () => {
      expect(example?.headers?.["Content-Type"], name).toBe("text/x-xanoscript");
      expect(typeof example?.body, name).toBe("string");
      const result = validateXanoscript({ code: example!.body as string });
      expect(result.valid, result.message).toBe(true);
    });
  }
});
