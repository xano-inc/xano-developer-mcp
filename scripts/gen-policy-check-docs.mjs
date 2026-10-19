#!/usr/bin/env node
// Regenerate the catalogue-derived regions of src/xanoscript_docs/policies.md (the checks with their
// uses, the scope fields, the statement names and the fix hints), and the whole of
// src/xanoscript_docs/policy-templates.md (templates, recipes, what no check can see), from the
// check catalogue the platform serves. scripts/policy-catalogue.json is a copy of it: save what
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
const SCOPE_KEYS = ['tags', 'api_groups', 'paths', 'except_paths', 'tables', 'verbs', 'endpoint_auth', 'except_tags', 'object_kinds', 'reaching_table_tags'];

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
  const uses = items.flatMap(it => (it.uses ?? []).map(use => `- \`${it.id}\`: ${use.goal} → ${code(JSON.stringify(use.params ?? {}))}${use.note ? ` — ${use.note}` : ''}`));
  if (uses.length) out.push('', 'Uses: what each check is for, as goals in a customer\'s words with the params that achieve them, scope params included. Each is a complete rule its check accepts as written; `{}` takes the check\'s defaults.', '', ...uses);
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
  const settings = settingsLines(items);
  if (settings.length) out.push('', '`object.settings_forbidden`\'s `when` names a setting by its key below, per `object_kind` (a dotted storage path also works). A secret setting holds a value that is never matched.', '', ...settings);
  return out.join('\n');
}

/** object.settings_forbidden's curated settings, by object kind: type, value set and default. */
function settingsLines(items) {
  const settings = items.find(it => it.id === 'object.settings_forbidden')?.params?.when?.settings ?? {};
  return Object.entries(settings).map(([kind, byName]) => `- \`${kind}\`: ${Object.entries(byName).map(([name, s]) => {
    if (s.secret) return `${code(name)} (${s.type}, secret)`;
    const facts = [s.values ? s.values.map(code).join(', ') : s.type];
    if (s.default !== undefined) facts.push(`default ${code(typeof s.default === 'string' ? s.default : JSON.stringify(s.default))}`);
    return `${code(name)} (${facts.join('; ')})`;
  }).join(', ')}`);
}

/** The statement vocabulary, grouped by what the statements do, with the params checks read on each. */
function statements(groups) {
  const out = ['| Does | Statements, with the params checks read on each | Note |', '| --- | --- | --- |'];
  for (const group of groups) {
    const names = group.statements.map(st => code(st.name) + (st.params?.length ? ` (${st.params.join(', ')})` : '')).join(', ');
    out.push(`| ${cell(group.label)} | ${cell(names)} | ${cell(group.note ?? '')} |`);
  }
  return out.join('\n');
}

function scope(items) {
  // Not every check takes every field (agent.tool_allowlist inspects no endpoint), so each is read from the first check that does.
  const shapes = Object.fromEntries(SCOPE_KEYS.map(key => [key, items.find(it => it.params?.[key])?.params[key]]));
  const missing = SCOPE_KEYS.filter(key => !shapes[key]);
  if (missing.length) throw new Error(`The catalogue does not publish the shared scope parameters: ${missing.join(', ')}.`);
  const lines = [SCOPE_READS, ''];
  for (const key of SCOPE_KEYS) {
    const shape = shapes[key];
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
  return { checks: checks(items), scope: scope(items), statements: statements(catalogue.statement_groups ?? []), 'fix-hints': fixHints(items) };
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

/**
 * A rule's `needs_any` group: the needs of which one is enough (two or more, or none). The catalogue
 * serves a list; an older one served `true` for "every need".
 */
function needsAnyGroup(rule) {
  const needs = rule.needs ?? [];
  const group = rule.needs_any === true ? needs : Array.isArray(rule.needs_any) ? needs.filter(need => rule.needs_any.includes(need)) : [];
  return group.length > 1 ? group : [];
}

/** Needs as the rule requires them: every one outside the group, then the group as one choice (`functions, and tags or paths`). */
export function joinNeeds(rule, render = code) {
  const group = needsAnyGroup(rule);
  const required = (rule.needs ?? []).filter(need => !group.includes(need)).map(render);
  const choice = group.length ? `${group.slice(0, -1).map(render).join(', ')} or ${render(group.at(-1))}` : '';
  if (!choice) return required.join(', ');
  return required.length ? `${required.join(', ')}, and ${choice}` : choice;
}

/** A rule's needs, each with the example that fits it, joined as the rule requires them. */
function needsList(template, items, rule) {
  return joinNeeds(rule, path => {
    const example = needExample(template, items, rule.check, path);
    return `${code(path)}${example === undefined ? '' : ` (e.g. ${code(JSON.stringify(example))})`}`;
  });
}

/** What a template leaves to fill, rule by rule, each need with the example that fits it. */
function needsCell(template, items) {
  const parts = template.rules.flatMap((rule, index) => {
    if (!rule.needs?.length) return [];
    const joined = needsList(template, items, rule);
    return [template.rules.length > 1 ? `R${index + 1}: ${joined}` : joined];
  });
  return parts.join('; ') || '_nothing_';
}

/** Framework tag ids as their served labels. */
const frameworkLabels = (ids, frameworks) => (ids ?? []).map(id => frameworks.find(framework => framework.id === id)?.label ?? id);

/** The Recipes section: each goal with the objects to build, what the user fills, its templates in order, its own rules and what none of them can see. */
function recipesSection(catalogue, items) {
  const recipes = catalogue.recipes ?? [];
  if (!recipes.length) return [];
  const templates = catalogue.templates ?? [];
  const frameworks = catalogue.template_frameworks ?? [];
  const notCheckable = catalogue.not_checkable ?? [];
  const out = [
    '',
    '## Recipes',
    '',
    'A recipe covers a goal that takes several templates, such as protecting payment card data. Most goals have three parts, and a recipe names each: the enforcement (the objects that do the work at run time, under Build), the coverage (the templates and rules that keep it wired in everywhere) and the gap (what no rule in it can see). Nothing creates a recipe. Show the user one plan: the objects to build and the changes to existing ones, each with the workspace\'s own names, the policies (each template as its own policy, in the order given, then the recipe\'s own rules together in one policy of your own) and what stays unchecked. After one yes, build all of it in the same change, objects before the policies that name them. A fill names the rule param an object\'s name goes in: `<template id>.<param>` for a template\'s rule, `rules[<n>].<param>` for the recipe\'s own rule n (from 0). Say so when the request reaches into the gap. The catalogue serves them as `recipes`.',
  ];
  if (catalogue.template_frameworks_note) out.push('', catalogue.template_frameworks_note);
  for (const recipe of recipes) {
    const tags = frameworkLabels(recipe.frameworks, frameworks);
    out.push('', `### ${recipe.title}`, '', `${code(recipe.id)}${tags.length ? ` · ${tags.join(', ')}` : ''}. ${recipe.summary}`);
    if (recipe.keywords?.length) out.push('', `Keywords: ${recipe.keywords.join(', ')}.`);
    if (recipe.builds?.length) {
      out.push('', 'Build (the enforcement the rules point at):', '');
      for (const build of recipe.builds) {
        const fills = build.fills?.length ? ` Fills ${build.fills.map(code).join(', ')}.` : '';
        out.push(`- **${build.kind}** ${code(build.name)}: ${build.role}${fills}`);
      }
    }
    if (recipe.user_fills?.length) out.push('', `The user's own objects and choices fill ${recipe.user_fills.map(code).join(', ')}.`);
    if (recipe.templates?.length) {
      out.push('', 'Templates, in order, one policy each:', '');
      recipe.templates.forEach((id, index) => {
        const template = templates.find(t => t.id === id);
        out.push(`${index + 1}. ${code(id)}${template ? ` (${code(template.key)}): ${template.title}` : ''}`);
      });
    }
    if (recipe.rules?.length) {
      out.push('', 'Rules no template covers, together in one policy of your own:', '');
      recipe.rules.forEach((rule, index) => {
        // No example here: a check's own example is often unrelated, and the builds and user fills name the values.
        const fill = rule.needs?.length ? ` Fill ${joinNeeds(rule)}.` : '';
        out.push(`- ${code(`rules[${index}]`)} ${rule.title}: ${code(rule.check)} with ${code(JSON.stringify(Array.isArray(rule.params) ? {} : rule.params ?? {}))}.${fill}`);
      });
    }
    if (recipe.limits?.length) {
      const topics = recipe.limits.map(id => notCheckable.find(item => item.id === id)?.topic ?? id);
      out.push('', `No rule here can see: ${topics.join('; ')} (see What no check can see).`);
    }
  }
  return out;
}

/** The What no check can see section, from `not_checkable`. */
function notCheckableSection(catalogue) {
  const items = catalogue.not_checkable ?? [];
  if (!items.length) return [];
  const out = [
    '',
    '## What no check can see',
    '',
    'Policies read the workspace\'s stored definitions. A request about any of these goes beyond them: say so plainly, and cover what a check can see with a template or a rule. The catalogue serves them as `not_checkable`.',
    '',
  ];
  for (const item of items) out.push(`- **${item.topic}** (${code(item.id)}): ${item.why}${item.keywords?.length ? ` Keywords: ${item.keywords.join(', ')}.` : ''}`);
  return out;
}

/** policy-templates.md: every template in the catalogue, grouped by category in the catalogue's order, then the recipes and what no check can see. */
export function renderTemplates(catalogue) {
  const items = Array.isArray(catalogue) ? catalogue : catalogue.items;
  const templates = catalogue.templates ?? [];
  const categories = catalogue.template_categories ?? [];
  const frameworks = catalogue.template_frameworks ?? [];
  const out = [
    '# Policy templates',
    '',
    'The platform\'s starting points for a new policy, and its recipes for goals that take several, from the check catalogue this documentation was generated from. The instance\'s own catalogue is authoritative and can differ by platform version: `GET /api:meta/workspace/{id}/policy/check` serves it as `templates`, `recipes` and `not_checkable`, `xano policy catalogue` prints it, and the Xano MCP\'s `xano_list_policy_checks` returns it with `detail: "full"`. The `policies` topic describes each template field.',
    '',
    '## Using a template',
    '',
    '- **Prefer a template.** Before writing a new policy, look for a template that covers the request, and when one fits, start from it rather than inventing a key and rules: use its key (with a free `-2`, `-3`… suffix when the branch already has that key), its title, its summary as the `statement`, its severity and its rules, and keep `enforcement = "advisory"`. Then change only what the request asks for. When a recipe covers the goal, follow it (see Recipes): it names the objects to build, the templates to create, in order, and the rules to add.',
    '- **Fill every need.** "Fill" names the parameter paths each rule leaves empty: every one is required, except that of a group joined by "or" one is enough (`functions`, and `tags` or `paths`). A path with a dot names a property of an object parameter (`referenced_by.max_age_days`, filled inside `referenced_by`). The example shows a value that fits: the template\'s own, else the check\'s catalogue example. It is a hint, never a value to copy, so fill each need with the workspace\'s own names.',
    '- **Checks** names the checks the template\'s rules use; read a check\'s parameters, and the goals each one serves, in the `policies` topic\'s check catalogue.',
    `- **Frameworks** names the framework tags a template carries, a second way to find it.${catalogue.template_frameworks_note ? ` ${catalogue.template_frameworks_note}` : ''}`,
    '- With the CLI, `xano policy create --template <id>` creates the policy from the instance\'s template.',
  ];
  const order = [...categories.map(category => category.id), ...new Set(templates.map(template => template.category).filter(id => !categories.some(category => category.id === id)))];
  for (const id of order) {
    const group = templates.filter(template => template.category === id);
    if (!group.length) continue;
    const label = categories.find(category => category.id === id)?.label ?? id;
    out.push('', `## ${label}`, '', '| Template | Key | Severity | Title | Checks | Fill | Frameworks |', '| --- | --- | --- | --- | --- | --- | --- |');
    for (const template of group) {
      const checksUsed = [...new Set(template.rules.map(rule => rule.check))].map(code).join(', ');
      out.push(`| ${code(template.id)} | ${code(template.key)} | ${template.severity} | ${cell(template.title)} | ${checksUsed} | ${cell(needsCell(template, items))} | ${cell(frameworkLabels(template.frameworks, frameworks).join(', '))} |`);
    }
  }
  out.push(...recipesSection(catalogue, items), ...notCheckableSection(catalogue));
  return `${out.join('\n')}\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const catalogue = JSON.parse(readFileSync(CATALOGUE, 'utf8'));
  writeFileSync(POLICIES_MD, splice(readFileSync(POLICIES_MD, 'utf8'), renderSections(catalogue)));
  writeFileSync(TEMPLATES_MD, renderTemplates(catalogue));
}
