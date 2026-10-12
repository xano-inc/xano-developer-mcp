#!/usr/bin/env node
// Regenerate the catalogue-derived regions of src/xanoscript_docs/policies.md, and the whole of
// src/xanoscript_docs/policy-templates.md, from the check catalogue the platform serves. scripts/policy-catalogue.json is a copy of it: save what
// `xano policy catalogue -o json` prints from an instance running the matching platform version
// to that file, then run `npm run gen:policy-docs`.
//
// Only the text between `<!-- BEGIN GENERATED: <name> -->` and `<!-- END GENERATED: <name> -->`
// is rewritten; everything around it is edited by hand. policy-templates.md is generated whole.
// src/tools/policy_docs.test.ts renders both from the committed catalogue and fails when either differs.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const CATALOGUE = fileURLToPath(new URL('./policy-catalogue.json', import.meta.url));
export const POLICIES_MD = fileURLToPath(new URL('../src/xanoscript_docs/policies.md', import.meta.url));
export const TEMPLATES_MD = fileURLToPath(new URL('../src/xanoscript_docs/policy-templates.md', import.meta.url));

/** Parameters every check shares, all top-level; the Scoping section documents them once. */
const SCOPE_KEYS = ['tags', 'api_groups', 'tables', 'verbs', 'endpoint_auth', 'except_tags', 'object_kinds', 'reaching_table_tags'];

/** The sentence every scope parameter's description ends with; the Scoping section states it once. */
const SCOPE_READS = 'Scope limits what is reported, not what is read.';

const cell = s => String(s).replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim();
const code = v => '`' + (v === '' ? '""' : v) + '`';
const ownParams = it => Object.entries(it.params ?? {}).filter(([name]) => !SCOPE_KEYS.includes(name));

function checks(items) {
  const out = ['| Check | Label | Behavior | Parameters |', '| --- | --- | --- | --- |'];
  for (const it of items) {
    const oneOf = new Set(it.requires_one_of ?? []);
    const params = ownParams(it).filter(([name]) => !oneOf.has(name)).map(([name, p]) => code(name + (p.required ? '*' : '')));
    if (oneOf.size) params.unshift(`1 of (${[...oneOf].map(code).join(', ')})`);
    out.push(`| \`${it.id}\` | ${cell(it.label)} | ${cell(it.description)} | ${params.join(', ') || '_scope only_'} |`);
  }
  out.push('', 'Closed value sets worth knowing without a catalogue round-trip:', '');
  for (const it of items) {
    for (const [name, p] of ownParams(it)) {
      const values = p.values ?? p.items?.values;
      if (values) out.push(`- \`${it.id}.${name}\`: ${values.map(code).join(', ')}`);
    }
  }
  out.push('', 'Nested object parameters and their keys:', '');
  for (const it of items) {
    for (const [name, p] of ownParams(it)) {
      if (p.properties) out.push(`- \`${it.id}.${name}\` — keys ${Object.keys(p.properties).map(code).join(', ')}. Example: \`${JSON.stringify(p.example)}\``);
    }
  }
  return out.join('\n');
}

function scope(items) {
  const params = items[0]?.params ?? {};
  const missing = SCOPE_KEYS.filter(key => !params[key]);
  if (missing.length) throw new Error(`The catalogue does not publish the shared scope parameters: ${missing.join(', ')}.`);
  const lines = [SCOPE_READS, ''];
  for (const key of SCOPE_KEYS) {
    const shape = params[key];
    const values = shape.values ?? shape.items?.values;
    const description = String(shape.description).replace(SCOPE_READS, '').trim();
    lines.push(`- \`${key}\` (${shape.type}) — ${description}${values ? ` One of ${values.map(code).join(', ')}.` : ''}`);
  }
  return lines.join('\n');
}

function fixHints(items) {
  return items.filter(it => it.fix_hint).map(it => `- \`${it.id}\`: ${String(it.fix_hint).trim()}`).join('\n');
}

/** The generated regions of policies.md, by name, rendered from a catalogue response. */
export function renderSections(catalogue) {
  const items = [...(Array.isArray(catalogue) ? catalogue : catalogue.items)].sort((a, b) => a.id.localeCompare(b.id));
  return { checks: checks(items), scope: scope(items), 'fix-hints': fixHints(items) };
}

/** `markdown` with each named region replaced by its rendering. */
export function splice(markdown, sections) {
  let out = markdown;
  for (const [name, body] of Object.entries(sections)) {
    const begin = `<!-- BEGIN GENERATED: ${name} -->`;
    const end = `<!-- END GENERATED: ${name} -->`;
    const from = out.indexOf(begin);
    const to = out.indexOf(end);
    if (from < 0 || to < from) throw new Error(`policies.md has no "${name}" region.`);
    out = `${out.slice(0, from + begin.length)}\n${body}\n${out.slice(to)}`;
  }
  return out;
}

/** The example a need shows: the template's own for the path, else its check's catalogue `example` (a nested part's for a dotted path). */
function needExample(template, items, check, path) {
  if (template.examples && !Array.isArray(template.examples) && Object.hasOwn(template.examples, path)) return template.examples[path];
  let schemas = items.find(it => it.id === check)?.params;
  let schema;
  for (const part of path.split('.')) {
    if (!schemas || !Object.hasOwn(schemas, part)) return undefined;
    schema = schemas[part];
    schemas = schema?.properties;
  }
  return schema?.example;
}

/** What a template leaves to fill, rule by rule, each need with the example that fits it. */
function needsCell(template, items) {
  const parts = template.rules.flatMap((rule, index) => {
    if (!rule.needs?.length) return [];
    const needs = rule.needs.map(path => {
      const example = needExample(template, items, rule.check, path);
      return `${code(path)}${example === undefined ? '' : ` (e.g. ${code(JSON.stringify(example))})`}`;
    });
    const joined = needs.join(rule.needs_any ? ' or ' : ', ');
    return [template.rules.length > 1 ? `R${index + 1}: ${joined}` : joined];
  });
  return parts.join('; ') || '_nothing_';
}

/** policy-templates.md: every template in the catalogue, grouped by category in the catalogue's order. */
export function renderTemplates(catalogue) {
  const items = Array.isArray(catalogue) ? catalogue : catalogue.items;
  const templates = catalogue.templates ?? [];
  const categories = catalogue.template_categories ?? [];
  const out = [
    '# Policy templates',
    '',
    'The platform\'s starting points for a new policy, from the check catalogue this documentation was generated from. The instance\'s own catalogue is authoritative and can differ by platform version: `GET /api:meta/workspace/{id}/policy/check` serves it as `templates`, `xano policy catalogue` prints it, and the Xano MCP\'s `xano_list_policy_checks` returns it with `detail: "full"`. The `policies` topic describes each template field.',
    '',
    '## Using a template',
    '',
    '- **Prefer a template.** Before writing a new policy, look for a template that covers the request, and when one fits, start from it rather than inventing a key and rules: use its key (with a free `-2`, `-3`… suffix when the branch already has that key), its title, its summary as the `statement`, its severity and its rules, and keep `active = true` with `enforcement = "advisory"`. Then change only what the request asks for.',
    '- **Fill every need.** "Fill" names the parameter paths each rule leaves empty (one of them is enough where they are joined by "or"). The example shows a value that fits: the template\'s own, else the check\'s catalogue example. It is a hint, never a value to copy, so fill each need with the workspace\'s own names.',
    '- **Checks** names the checks the template\'s rules use; read a check\'s parameters in the `policies` topic\'s check catalogue.',
    '- With the CLI, `xano policy create --template <id>` creates the policy from the instance\'s template.',
  ];
  const order = [...categories.map(category => category.id), ...new Set(templates.map(template => template.category).filter(id => !categories.some(category => category.id === id)))];
  for (const id of order) {
    const group = templates.filter(template => template.category === id);
    if (!group.length) continue;
    const label = categories.find(category => category.id === id)?.label ?? id;
    out.push('', `## ${label}`, '', '| Template | Key | Severity | Title | Checks | Fill |', '| --- | --- | --- | --- | --- | --- |');
    for (const template of group) {
      const checksUsed = [...new Set(template.rules.map(rule => rule.check))].map(code).join(', ');
      out.push(`| ${code(template.id)} | ${code(template.key)} | ${template.severity} | ${cell(template.title)} | ${checksUsed} | ${cell(needsCell(template, items))} |`);
    }
  }
  return `${out.join('\n')}\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const catalogue = JSON.parse(readFileSync(CATALOGUE, 'utf8'));
  writeFileSync(POLICIES_MD, splice(readFileSync(POLICIES_MD, 'utf8'), renderSections(catalogue)));
  writeFileSync(TEMPLATES_MD, renderTemplates(catalogue));
}
