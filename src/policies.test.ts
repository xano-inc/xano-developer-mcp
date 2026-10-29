import { describe, it, expect } from "vitest";
import { gatePolicies, perPolicies, policiesIncluded, policiesOnly } from "./policies.js";

const ON = { policies: true };

describe("policies gate", () => {
  it("includes the feature only for an explicit policies: true", () => {
    expect(policiesIncluded(ON)).toBe(true);
    for (const options of [undefined, {}, { policies: false }, { policies: "true" as unknown as boolean }]) {
      expect(policiesIncluded(options)).toBe(false);
    }
  });

  it("cuts a block of whole lines, line breaks included, or keeps it without its markers", () => {
    const text = "a\n\n<!-- policies -->\n## P\n\np.\n\n<!-- /policies -->\n## B\n";
    expect(gatePolicies(text)).toBe("a\n\n## B\n");
    expect(gatePolicies(text, ON)).toBe("a\n\n## P\n\np.\n\n## B\n");
  });

  it("cuts or keeps exactly what inline markers enclose", () => {
    const text = "exits <!-- policies -->2 when it blocks and <!-- /policies -->1.\n";
    expect(gatePolicies(text)).toBe("exits 1.\n");
    expect(gatePolicies(text, ON)).toBe("exits 2 when it blocks and 1.\n");
  });

  it("refuses an unbalanced marker rather than serve it", () => {
    expect(() => gatePolicies("a <!-- policies --> b")).toThrow(/Unbalanced/);
    expect(() => gatePolicies("a <!-- /policies --> b", ON)).toThrow(/Unbalanced/);
  });

  it("drops marked entries and wholly marked strings from arrays and objects, and keeps them with the feature", () => {
    const flag = policiesOnly({ name: "policy-override" });
    const doc = {
      title: "t<!-- policies --> (p)<!-- /policies -->",
      related: ["a", "<!-- policies -->skills<!-- /policies -->", "b"],
      flags: [{ name: "file" }, flag],
      topics: { start: { n: 1 }, policy: policiesOnly({ n: 2 }) },
    };
    expect(gatePolicies(doc)).toEqual({
      title: "t",
      related: ["a", "b"],
      flags: [{ name: "file" }],
      topics: { start: { n: 1 } },
    });
    expect(gatePolicies(doc, ON)).toEqual({
      title: "t (p)",
      related: ["a", "skills", "b"],
      flags: [{ name: "file" }, { name: "policy-override" }],
      topics: { start: { n: 1 }, policy: { n: 2 } },
    });
  });

  it("builds each gate state once", () => {
    let builds = 0;
    const get = perPolicies((options) => ({ builds: ++builds, included: options.policies }));
    expect(get()).toBe(get({ policies: false }));
    expect(get(ON)).toBe(get(ON));
    expect(get(ON)).not.toBe(get());
    expect([get().included, get(ON).included, builds]).toEqual([false, true, 2]);
  });
});
