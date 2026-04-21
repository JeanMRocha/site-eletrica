# Governance Index

> Status: stable
> Type: index
> Last updated: 2026-04-21
> Owner: repository

Índice mestre e autoridade principal para decidir rapidamente o que ler, onde escrever e quando arquivar.

## Matrix

| Change type | Read first | Write/update | Archive when |
| --- | --- | --- | --- |
| Structural | `docs/architecture.md`, `docs/adr/README.md` | `docs/adr/` or module ADR | Decision is superseded |
| Execution | `docs/active-plan.md`, `docs/plan-lifecycle.md` | `docs/active-plan.md` or module `active-plan.md` | Work is completed or paused beyond usefulness |
| Current state | `docs/current-state.md`, `docs/current-state-lifecycle.md` | `docs/current-state.md` or module `current-state.md` | State no longer reflects the active scope |
| Decision | `docs/adr/template.md` or module ADR template | ADR in global or module scope | Decision is superseded or deprecated |
| Incremental | `docs/changelog.md`, module changelog | `docs/changelog.md` or module changelog | Usually not archived; keep in changelog |
| Module-local | `docs/modules/<modulo>/README.md` and module docs | Module docs only | Follow module archive rules |

## Always read

- `AGENTS.md`
- `.agent`
- [`docs/README.md`](README.md)
- [`docs/reading-paths.md`](reading-paths.md)
- [`docs/product-overview.md`](product-overview.md)
- [`docs/agent-rules.md`](agent-rules.md)
- [`docs/development-principles.md`](development-principles.md)
- [`docs/modules/new-module-process.md`](modules/new-module-process.md) when starting or expanding a module
- [`docs/modules/module-template.md`](modules/module-template.md) when creating the first version of a new module

## Authority

- This document is the source of truth for documentation navigation and scope-based reading.
- `docs/reading-paths.md` and module `reading-paths.md` files are derived guides.
- If a derived guide conflicts with this file, `docs/governance.md` wins.

## Lifecycle summary

- `plan`: `active`, `paused`, `completed`
- `current-state`: `stable`, `draft`
- `adr`: `proposed`, `accepted`, `superseded`, `deprecated`

## Rule of thumb

- If the change does not create a new decision, prefer `plan`, `current-state`, or `changelog`.
- If the change creates a durable decision, use ADR.
- If the current file no longer reflects the live scope, move the useful content to the relevant archive.
- If you are starting a new module, follow `docs/modules/new-module-process.md` before implementation.
- SSH keys, `known_hosts`, and other local secrets should live in `.secrets/ssh/` (or another ignored local secrets path) and never be committed.
- The `.env` must reference secret file paths, not secret contents.
