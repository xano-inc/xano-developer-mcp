// A light, line-based reader of pulled XanoScript, enough for the scorer's mechanical checks:
// each object's kind, name, tags, auth, API group, attached middleware, table fields with their
// attributes, and its stack's statements (name, target, nesting, source block). It is not a
// parser: the platform validates the build (`xano workspace push --dry-run`) and the language
// server reports syntax errors; this only reads what a well-formed file says.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { listFiles } from "./common.mjs";

const HEADER = /^([a-z_]+)\s+("((?:[^"\\]|\\.)*)"|[^\s{]+)(?:\s+verb\s*=\s*"?(\w+)"?)?\s*\{/;
// A statement line starts with a (dotted) identifier that is not a key: no `=` or `:` after it.
const STATEMENT = /^([a-z_][\w]*(?:\.[\w]+)*)(?=\s|\{|\(|$)(?!\s*[=:])\s*(?:("(?:[^"\\]|\\.)*"|[^\s{(]+))?/;
const NOT_STATEMENTS = new Set(["as", "then", "true", "false", "null", "now"]);
// Blocks inside a statement that hold statements: conditional branches, loop bodies, try_catch parts.
const BRANCHES = new Set(["if", "elseif", "else", "try", "catch", "finally", "case", "default", "each", "stack"]);

const unquote = (s) => (s && /^".*"$/.test(s) ? s.slice(1, -1) : s);

function braceDelta(line) {
  // Ignore braces inside string literals and after // comments.
  let d = 0;
  let inStr = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inStr) {
      if (c === "\\") i++;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "/" && line[i + 1] === "/") break;
    else if (c === "{") d++;
    else if (c === "}") d--;
  }
  return d;
}

// The lines of a top-level block `name {` or `name = {` (indent 2 in pulled files), or null.
function topBlock(lines, key) {
  const start = lines.findIndex((l) => new RegExp(`^\\s{0,4}${key}\\s*(=\\s*)?\\{`).test(l) && braceDepthBefore(lines, l) === 1);
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < lines.length; i++) {
    depth += braceDelta(lines[i]);
    if (depth <= 0) return { start, end: i, lines: lines.slice(start, i + 1) };
  }
  return { start, end: lines.length - 1, lines: lines.slice(start) };
}
let depthCache = new Map();
function braceDepthBefore(lines, line) {
  // Depth of the object's own block where `line` starts (1 = directly inside the object).
  let m = depthCache.get(lines);
  if (!m) {
    m = new Map();
    let d = 0;
    for (const l of lines) {
      if (!m.has(l)) m.set(l, d);
      d += braceDelta(l);
    }
    depthCache.set(lines, m);
  }
  return m.get(line);
}

function topValue(lines, key) {
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const m = l.match(new RegExp(`^\\s{0,4}${key}\\s*=\\s*(.+?)\\s*$`));
    if (!m || braceDepthBefore(lines, l) !== 1) continue;
    // A list written over several lines: join until it closes.
    let v = m[1];
    for (let j = i + 1; /^\[/.test(v) && !v.includes("]") && j < lines.length; j++) v += " " + lines[j].trim();
    return v;
  }
  return undefined;
}

function stringList(text) {
  if (!text) return [];
  return [...text.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
}

function parseMiddleware(block) {
  if (!block) return null;
  const text = block.lines.join("\n");
  const out = {};
  for (const phase of ["pre", "post"]) {
    const m = text.match(new RegExp(`\\b${phase}\\s*[:=]\\s*\\[([\\s\\S]*?)\\]`));
    if (!m) continue;
    out[phase] = [...m[1].matchAll(/\{([^}]*)\}/g)].map((e) => ({
      name: e[1].match(/name\s*[:=]\s*"([^"]+)"/)?.[1] ?? null,
      active: !/active\s*[:=]\s*false/.test(e[1]),
    }));
    // A list of bare strings is not a valid attachment; record it so a check can say so.
    if (!out[phase].length && /"/.test(m[1])) out[phase] = stringList(m[1]).map((name) => ({ name, active: true, invalid: true }));
  }
  return out;
}

function parseFields(block) {
  if (!block) return [];
  const fields = [];
  const lines = block.lines.slice(1, -1);
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const t = l.trim();
    if (depth === 0 && t && !t.startsWith("//")) {
      const m = t.match(/^([a-z_]\w*)(?:\[\])?\s+("[^"]+"|\w+)(\?)?(?:\s*=\s*(\S+))?(.*)$/);
      if (m) {
        const field = { type: m[1], name: unquote(m[2]), optional: !!m[3], attrs: {} };
        // Attributes inline (`{sensitive = true}`) or in the field's own block on the next lines.
        let body = m[5] ?? "";
        if (braceDelta(l) > 0) {
          let d = braceDelta(l);
          let j = i + 1;
          while (j < lines.length && d > 0) {
            body += "\n" + lines[j];
            d += braceDelta(lines[j]);
            j++;
          }
        }
        for (const a of body.matchAll(/\b(\w+)\s*=\s*("(?:[^"\\]|\\.)*"|\[[^\]]*\]|[^\s,}]+)/g)) {
          const v = a[2];
          field.attrs[a[1]] = v === "true" ? true : v === "false" ? false : /^"/.test(v) ? unquote(v) : v;
        }
        fields.push(field);
      }
    }
    depth += braceDelta(l);
  }
  return fields;
}

// Statements of a stack block in source order, each with its nesting depth (0 = directly in the
// stack), its target (table, function, path), and the lines of its own block.
function parseStatements(block) {
  if (!block) return [];
  const lines = block.lines.slice(1, -1);
  const out = [];
  let depth = 0; // brace depth inside the stack
  const open = []; // depths at which a statement's block opened
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const t = raw.trim().replace(/^\}\s*/, "");
    const m = t.match(STATEMENT);
    if (m && t && !t.startsWith("//") && !NOT_STATEMENTS.has(m[1]) && !/^\w+\s*[:=]/.test(t)) {
      // Lines inside an object literal or a param block (data = {...}) are not statements: a
      // statement sits at the depth where its parent statement's block (or the stack) opened.
      const parentDepth = open.length ? open[open.length - 1] : 0;
      if (depth === parentDepth || BRANCHES.has(m[1])) {
        let end = i;
        let d = braceDelta(raw);
        while (d > 0 && end + 1 < lines.length) {
          end++;
          d += braceDelta(lines[end]);
        }
        const branch = BRANCHES.has(m[1]);
        if (!branch) {
          const target = m[2] && !/^[(\[$]/.test(m[2]) ? unquote(m[2]) : null;
          out.push({
            name: m[1],
            target,
            depth: open.length,
            line: block.start + 2 + i,
            text: lines.slice(i, end + 1).join("\n"),
            disabled: /^\s*disabled\s*=\s*true/m.test(lines.slice(i, end + 1).join("\n")),
          });
        }
        if (braceDelta(raw) > 0) open.push(depth + braceDelta(raw) - 0);
      }
    }
    depth += braceDelta(raw);
    while (open.length && depth < open[open.length - 1]) open.pop();
  }
  return out;
}

export function parseXs(src, file = null) {
  const lines = src.split("\n");
  depthCache = new Map();
  const headerIdx = lines.findIndex((l) => l.trim() && !l.trim().startsWith("//"));
  const h = headerIdx >= 0 ? lines[headerIdx].trim().match(HEADER) : null;
  if (!h) return { kind: null, name: null, file, error: "no object header", text: src };
  const kind = h[1];
  const rawName = h[3] ?? h[2];
  const verb = h[4] ? h[4].toUpperCase() : null;
  const body = lines.slice(headerIdx);
  const obj = {
    kind,
    name: kind === "query" && verb ? `${rawName} ${verb}` : rawName,
    path: kind === "query" ? rawName : null,
    verb,
    file,
    text: src,
    tags: stringList(topValue(body, "tags")),
    api_group: unquote(topValue(body, "api_group") ?? "") || null,
    auth: unquote(topValue(body, "auth") ?? "") || null,
    active: topValue(body, "active") !== "false",
    schedule: !!topValue(body, "schedule") || !!topBlock(body, "schedule"),
    middleware: parseMiddleware(topBlock(body, "middleware")),
    fields: kind === "table" ? parseFields(topBlock(body, "schema")) : [],
    statements: parseStatements(topBlock(body, "stack")),
  };
  // Tools served to agents: the agent's tools list.
  if (kind === "agent") obj.tools = [...(topBlock(body, "tools")?.lines.join("\n") ?? "").matchAll(/name\s*:\s*"([^"]+)"/g)].map((m) => m[1]);
  return obj;
}

// Every object under a pulled workspace directory, keyed `kind:name`, with its relative file.
export function loadModel(dir) {
  const objects = [];
  for (const f of listFiles(dir, (p) => p.endsWith(".xs"))) {
    const rel = f.slice(dir.length + 1);
    if (rel.startsWith("policies/")) continue;
    const o = parseXs(readFileSync(f, "utf8"), rel);
    if (o.kind) objects.push(o);
  }
  return buildModel(objects);
}

export function buildModel(objects) {
  const byKey = new Map(objects.map((o) => [`${o.kind}:${o.name}`, o]));
  const functions = new Map(objects.filter((o) => o.kind === "function").map((o) => [o.name, o]));
  const groups = new Map(objects.filter((o) => o.kind === "api_group").map((o) => [o.name, o]));
  return { objects, byKey, functions, groups };
}

// The statements an object runs: its own, and those of the functions it calls, transitively.
export function reach(model, obj, seen = new Set()) {
  if (!obj || seen.has(obj)) return [];
  seen.add(obj);
  const out = [];
  for (const s of obj.statements) {
    if (s.disabled) continue;
    out.push({ ...s, owner: obj.name });
    if (s.name === "function.run" && s.target) out.push(...reach(model, model.functions.get(s.target), seen));
  }
  return out;
}

// The middleware that runs for an endpoint in a phase: its own list when it sets that phase,
// else its API group's (the branch default is not in a pulled workspace).
export function middlewareFor(model, obj, phase) {
  const own = obj.middleware?.[phase];
  if (own) return own.filter((m) => m.active && !m.invalid).map((m) => m.name);
  const g = obj.api_group ? model.groups.get(obj.api_group) : null;
  return (g?.middleware?.[phase] ?? []).filter((m) => m.active && !m.invalid).map((m) => m.name);
}

// Ways a reply might name an object: its name (or with spaces), an endpoint's path.
export function mentionPatterns(o) {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const out = [];
  if (o.kind === "query") {
    const path = o.path;
    out.push(esc(path), esc(path.replace(/\{[^}]+\}/g, ":x")).replace(/:x/g, "[^\\s/]+"));
    const literal = path.split("/").filter((s) => s && !s.startsWith("{"));
    const last = literal[literal.length - 1];
    if (last && last.length >= 4) out.push(`\\b${esc(last)}\\b`);
    else if (last) out.push(`(${o.verb}\\s+/?${esc(path)}\\b|/${esc(path)}\\b|\\b${esc(path)} endpoint)`);
  } else {
    out.push(`\\b${esc(o.name)}\\b`);
    if (o.name.includes("_")) out.push(`\\b${esc(o.name.replace(/_/g, " "))}\\b`);
  }
  return out.map((p) => new RegExp(p, "i"));
}

export function seedModelFrom(dir) {
  return loadModel(dir);
}

export { join };
