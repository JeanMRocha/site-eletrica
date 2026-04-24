import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..', '..');

const requiredRules = [
  {
    file: 'AGENTS.md',
    fragments: ['Do not create, switch, rename, or delete Git branches', 'explicitly asks'],
  },
  {
    file: '.agent',
    fragments: ['Do not create, switch, rename, or delete Git branches', 'explicit user authorization'],
  },
  {
    file: 'docs/governance.md',
    fragments: ['Git branch operations are gated', 'explicitly asks'],
  },
  {
    file: 'docs/agent-rules.md',
    fragments: ['## Gate de Git', 'Operações de branch exigem autorização explícita', 'Se o usuário pedir commit/push sem mencionar branch, use a branch atual'],
  },
];

const failures = [];

for (const rule of requiredRules) {
  const content = readFileSync(resolve(root, rule.file), 'utf8');
  for (const fragment of rule.fragments) {
    if (!content.includes(fragment)) {
      failures.push(`${rule.file}: missing "${fragment}"`);
    }
  }
}

if (failures.length > 0) {
  console.error('Governance gate failed. Branch authorization rules were removed or weakened.');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Governance gate passed.');
