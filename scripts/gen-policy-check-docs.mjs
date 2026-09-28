#!/usr/bin/env node
// Regenerate the catalogue-derived regions of src/xanoscript_docs/policies.md from the
// check catalogue the platform serves. scripts/policy-catalogue.json is a copy of cloud-client's
// committed copy of it, which its Policy:Catalogue suite holds to the code (from a sibling checkout):
//
//   cp ../cloud-client/extensions/MVP/includes/xano/test/helper/policy/policy-catalogue.json scripts/policy-catalogue.json
//   npm run gen:policy-docs
//
// `xano policy catalogue -o json` from an instance at the same cloud-client commit prints the same file.
//
// Only the text between `<!-- BEGIN GENERATED: <name> -->` and `<!-- END GENERATED: <name> -->`
// is rewritten; everything around it is edited by hand. src/tools/policy_docs.test.ts renders
// the regions from the committed catalogue and fails when policies.md differs.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const CATALOGUE = fileURLToPath(new URL('./policy-catalogue.json', import.meta.url));
export const POLICIES_MD = fileURLToPath(new URL('../src/xanoscript_docs/policies.md', import.meta.url));

/** Parameters every check shares, all top-level; the Scoping section documents them once. */
const SCOPE_KEYS = ['tags', 'api_groups', 'tables', 'verbs', 'endpoint_auth', 'except_tags', 'object_kinds', 'reaching_table_tags'];

/** The sentence every scope parameter's description ends with; the Scoping section states it once. */
const SCOPE_READS = 'Scope limits what is reported, not what is read.';

const cell = s => String(s).replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim();
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const catalogue = JSON.parse(readFileSync(CATALOGUE, 'utf8'));
  writeFileSync(POLICIES_MD, splice(readFileSync(POLICIES_MD, 'utf8'), renderSections(catalogue)));
}
