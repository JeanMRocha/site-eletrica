# Governance Index

> Status: stable
> Type: index
> Last updated: 2026-04-20
> Owner: repository

Índice mestre para orientar o agente sobre onde ler, o que atualizar e quando abrir novos documentos.

## Ler primeiro

- `AGENTS.md`
- `.agent`
- [`docs/README.md`](README.md)
- [`docs/agent-rules.md`](agent-rules.md)
- [`docs/development-principles.md`](development-principles.md)
- [`docs/architecture.md`](architecture.md)

## Decidir por tipo de mudança

- Mudança estrutural: leia `architecture.md` e, se necessário, `adr/README.md`.
- Mudança de execução: leia `active-plan.md` e `plan-lifecycle.md`.
- Mudança de estado vigente: leia `current-state.md` e `current-state-lifecycle.md`.
- Nova decisão duradoura: crie ou atualize um ADR.
- Mudança incremental: atualize `changelog.md` e o documento vigente do escopo.
- Mudança local em módulo: leia `docs/modules/<modulo>/README.md` e os arquivos do módulo.

## Onde registrar

- `docs/active-plan.md`: execução global em andamento.
- `docs/changelog.md`: histórico incremental global.
- `docs/roadmap.md`: pendências e ampliações globais.
- `docs/current-state.md` e `docs/adr/current-state.md`: estado vigente global.
- `docs/adr/`: decisões arquiteturais globais.
- `docs/modules/<modulo>/active-plan.md`: execução local do módulo.
- `docs/modules/<modulo>/changelog.md`: histórico incremental do módulo.
- `docs/modules/<modulo>/adr/`: decisões arquiteturais locais do módulo.

## Ciclo de vida

- `plan`: `active`, `paused`, `completed`
- `current-state`: `stable`, `draft`
- `adr`: `proposed`, `accepted`, `superseded`, `deprecated`

## Arquivo morto

- `docs/archive/`: planos e estados globais que deixaram de ser vigentes.
- `docs/adr/archive/`: ADRs globais históricos.
- `docs/modules/<modulo>/archive/`: planos e estados do módulo que deixaram de ser vigentes.
- `docs/modules/<modulo>/adr/archive/`: ADRs históricos do módulo.

## Regra prática

- Se a mudança não criar decisão nova, prefira `plan`, `current-state` ou `changelog`.
- Se a mudança criar decisão duradoura, use ADR.
- Se o arquivo atual não representar mais o estado vivo do escopo, mova o conteúdo útil para archive.
