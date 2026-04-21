# Decision State Snapshot

> Status: stable
> Type: state
> Last updated: 2026-04-20
> Owner: repository

Snapshot da camada de decisão global.

## Lifecycle

- `stable`: resumo vigente e confiável.
- `draft`: resumo em formação ou aguardando consolidação.

## Current state

- O estado vivo global fica em `docs/current-state.md`.
- Este arquivo existe apenas como snapshot da camada de decisão.
- Decisões duradouras continuam nos ADRs.

## Invariants

- O snapshot não substitui o estado vivo.
- Decisões duradouras devem ficar em ADR.

## Operational notes

- Use este arquivo apenas como visão resumida da camada de decisão.
- Mantenha o conteúdo curto o suficiente para leitura rápida.

## Update rule

- Atualize este documento quando a camada de decisão global mudar de forma relevante.
- Se o estado vivo mudar, atualize `docs/current-state.md` primeiro.
- Se a mudança for apenas evolução incremental, use `changelog.md` ou `active-plan.md`.

## Review criteria

- Quando este resumo ficou defasado?
- Que mudança estrutural exige revisão?
- O estado vivo global precisa de uma atualização própria?
