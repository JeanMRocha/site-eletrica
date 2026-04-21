# Auth Reading Paths

> Status: stable
> Type: guide
> Last updated: 2026-04-20
> Owner: security

Guia mínimo derivado de `docs/governance.md` para ler apenas o que é necessário quando a mudança toca `auth`.

## Regra geral

- Leia `docs/governance.md` primeiro.
- Depois leia este guia para escolher o subconjunto mínimo do módulo.
- Não abra ADRs, runbooks ou planos do módulo sem necessidade de escopo.
- Se a mudança criar comportamento novo, leia os testes antes de implementar.
- Se houver conflito com `docs/governance.md`, a governança vence.

## Mapa rápido

| Tipo de mudança | Leitura mínima | Leitura opcional | Evitar por padrão |
| --- | --- | --- | --- |
| Fluxo de login | `docs/modules/auth/README.md`, `rules.md`, `contracts.md`, `tests.md`, `current-state.md` | `security.md`, `runbook.md`, `adr/README.md` | Outros módulos, ADRs não relacionados, archive |
| Sessão e refresh | `docs/modules/auth/README.md`, `contracts.md`, `tests.md`, `current-state.md` | `security.md`, `active-plan.md`, `adr/README.md` | Documentos globais sem impacto direto, módulos fora de auth |
| Logout e revogação | `docs/modules/auth/README.md`, `contracts.md`, `security.md`, `tests.md`, `runbook.md` | `current-state.md`, `adr/README.md` | Módulos não relacionados, ADRs antigos sem uso ativo |
| Mudança de segurança | `docs/modules/auth/README.md`, `rules.md`, `security.md`, `tests.md`, `adr/README.md`, `current-state.md` | `runbook.md`, `active-plan.md` | Implementação de outros módulos, docs duplicados fora do módulo |
| Incidente operacional | `docs/modules/auth/runbook.md`, `current-state.md`, `contracts.md` | `security.md`, `changelog.md` | ADRs extensos quando a operação não exigir decisão histórica |
| Revisão técnica | `docs/modules/auth/README.md`, `rules.md`, `contracts.md`, `security.md`, `tests.md`, `adr/README.md`, `adr/current-state.md` | `active-plan.md`, `current-state.md` | Runbooks e arquivos de archive sem relação com a revisão |

## Como usar

- Se a alteração tocar uma API de auth, comece por `contracts.md`.
- Se tocar comportamento de segurança, comece por `security.md`.
- Se tocar efeito observável, valide `tests.md`.
- Se tocar operação ou incidente, use `runbook.md`.
- Se tocar decisão duradoura, use `adr/README.md`.

## Resumo rápido

- Login e sessão: contratos + testes + estado atual.
- Segurança: regras + controles + ADR quando houver trade-off.
- Operação: runbook + estado atual + histórico recente.
- Revisão: leitura mínima do módulo antes de abrir documentos extras.
