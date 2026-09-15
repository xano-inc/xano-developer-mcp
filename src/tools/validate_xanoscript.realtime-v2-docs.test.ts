import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { validateXanoscript } from "./validate_xanoscript.js";
import { xanoscriptDocs } from "./xanoscript_docs.js";
import { getDocsForFilePath } from "../xanoscript.js";

const root = fileURLToPath(new URL("../../examples/realtime-v2/", import.meta.url));
function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? sources(join(dir, entry.name)) :
      entry.name.endsWith(".xs") ? [readFileSync(join(dir, entry.name), "utf8").trim()] : []);
}
const fixtures = sources(root);
const doc = readFileSync(new URL("../xanoscript_docs/realtime-v2.md", import.meta.url), "utf8");
const examples = [...doc.matchAll(/```xs\n([\s\S]*?)```/g)].map(match => match[1].trim());

describe("Realtime V2 documentation", () => {
  for (const [i, code] of fixtures.entries()) {
    it(`validates executable fixture ${i + 1}`, () => {
      const result = validateXanoscript({ code });
      expect(result.valid, result.message).toBe(true);
    });
  }
  it("uses the actual live-tested fixtures for every complete XanoScript example", () => {
    expect(examples.length).toBeGreaterThanOrEqual(7);
    for (const code of examples) expect(fixtures).toContain(code);
  });
  it("ships the same socket client used by the live demo and verifier", () => {
    const client = readFileSync(join(root, "frontend/socket.js"), "utf8").trim();
    expect(doc).toContain("```javascript\n" + client + "\n```");
  });
  it("serves V2 directly and through its natural aliases", () => {
    for (const topic of ["realtime-v2", "realtime_v2", "websocket", "channels", "pubsub"])
      expect(xanoscriptDocs({ topic }).documentation).toContain("# Realtime V2");
  });
  it("auto-selects V2 for CLI-pulled V2 object paths", () => {
    for (const path of ["realtime_server/chat.xs", "channel/rooms/room_id.xs", "message/send.xs", "channel_trigger/member_gate.xs", "realtime_server_trigger/gate.xs"])
      expect(getDocsForFilePath(path)).toContain("realtime-v2");
  });
  it("distinguishes V2 from legacy even in compact output", () => {
    const quick = xanoscriptDocs({ topic: "realtime-v2", mode: "quick_reference" }).documentation;
    expect(quick).toContain("realtime.publish");
    expect(quick).toContain("/ws/");
    const legacy = xanoscriptDocs({ topic: "realtime", mode: "quick_reference" }).documentation;
    expect(legacy).toContain("Legacy V1 only");
    expect(legacy).toContain("realtime-v2");
  });
});
