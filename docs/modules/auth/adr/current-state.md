# Auth Decision State Snapshot

> Status: draft
> Type: state
> Last updated: 2026-04-20
> Owner: security

Snapshot da camada de decisão do módulo `auth`.

## Lifecycle

- `stable`: resumo vigente e confiável.
- `draft`: resumo em formação ou aguardando consolidação.

## Current state

- O estado vivo do módulo fica em `docs/modules/auth/current-state.md`.
- Este arquivo existe apenas como snapshot da camada de decisão do módulo.
- Decisões duradouras do módulo continuam nos ADRs locais.

## Invariants

- O snapshot não substitui o estado vivo do módulo.
- Auth continua sendo tratado como módulo crítico.

## Operational notes

- Use este arquivo apenas como visão resumida da camada de decisão do módulo.
- Mantenha o conteúdo curto o suficiente para leitura rápida.

## Update rule

- Atualize este documento quando a camada de decisão do módulo mudar de forma relevante.
- Se o estado vivo mudar, atualize `docs/modules/auth/current-state.md` primeiro.
- Se a mudança for apenas implementação incremental, atualize `active-plan.md` ou `changelog.md`.

## Review criteria

- Quando este resumo ficou defasado?
- Que mudança estrutural exige revisão?
- O estado vivo do módulo precisa de uma atualização própria?
