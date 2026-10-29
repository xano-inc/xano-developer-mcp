/**
 * The policies feature gate.
 *
 * Policies are unreleased: their docs, topics and wording are served only to a
 * host that asks for them with `{ policies: true }` (the hosted Xano MCP does,
 * for an instance with the feature on). Everything else, the local stdio server
 * included, gets the package as it is without them.
 *
 * Two ways to mark what belongs to the feature, both read by {@link gatePolicies}:
 *
 * - Text (markdown docs, TypeScript topic strings): a passage between
 *   `<!-- policies -->` and `<!-- /policies -->`. A marker alone on its line
 *   takes its line break with it, so a block of whole lines leaves no trace;
 *   inline markers cut exactly what they enclose. An array entry or object
 *   property that is nothing but such a passage is dropped.
 * - Whole entries (a topic, a flag): {@link policiesOnly}.
 */

export interface DeveloperToolsOptions {
  /** Include the unreleased policies feature. Off unless a host passes `true`. */
  policies?: boolean;
}

/** The one decision: only an explicit `policies: true` includes the feature. */
export function policiesIncluded(options?: DeveloperToolsOptions): boolean {
  return options?.policies === true;
}

const OPEN = "<!-- policies -->";
const CLOSE = "<!-- /policies -->";
const ALONE_ON_LINE = /^(<!-- \/?policies -->)\n/gm;
const PASSAGE = /<!-- policies -->([\s\S]*?)<!-- \/policies -->/g;

const entries = new WeakSet<object>();

/** Mark a whole entry (in an array or an object) as part of the feature. */
export function policiesOnly<T extends object>(entry: T): T {
  entries.add(entry);
  return entry;
}

function gateText(text: string, included: boolean): string {
  if (!text.includes(OPEN) && !text.includes(CLOSE)) return text;
  const gated = text.replace(ALONE_ON_LINE, "$1").replace(PASSAGE, included ? "$1" : "");
  if (gated.includes(OPEN) || gated.includes(CLOSE)) {
    throw new Error(`Unbalanced policies marker in: ${text.slice(0, 120)}`);
  }
  return gated;
}

function isPolicyEntry(value: unknown): boolean {
  if (typeof value === "string") return value !== "" && gateText(value, false) === "";
  return typeof value === "object" && value !== null && entries.has(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * `value` as the host's options serve it: with the feature, its markers
 * removed; without it, its passages and entries removed. Strings, arrays and
 * plain objects are copied; anything else is returned as is.
 */
export function gatePolicies<T>(value: T, options?: DeveloperToolsOptions): T {
  const included = policiesIncluded(options);
  const gate = (v: unknown): unknown => {
    if (typeof v === "string") return gateText(v, included);
    if (Array.isArray(v)) return v.filter((e) => included || !isPolicyEntry(e)).map(gate);
    if (isPlainObject(v)) {
      const copy: Record<string, unknown> = {};
      for (const [key, inner] of Object.entries(v)) {
        if (included || !isPolicyEntry(inner)) copy[key] = gate(inner);
      }
      return copy;
    }
    return v;
  };
  return gate(value) as T;
}

/**
 * Memoize `build` per gate state, so each of the two variants is built once.
 * `build` receives the options it is built for.
 */
export function perPolicies<T>(build: (options: DeveloperToolsOptions) => T): (options?: DeveloperToolsOptions) => T {
  const built = new Map<boolean, T>();
  return (options) => {
    const included = policiesIncluded(options);
    if (!built.has(included)) built.set(included, build({ policies: included }));
    return built.get(included)!;
  };
}
