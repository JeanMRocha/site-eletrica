# Current State

> Status: stable
> Type: state
> Last updated: 2026-04-20
> Owner: repository

Use este documento para registrar o estado vigente da camada de decisão global.

## Lifecycle

- `stable`: resumo vigente e confiável.
- `draft`: resumo em formação ou aguardando consolidação.

## Current state

- A documentação global define arquitetura, princípios, regras e stack.
- A documentação por módulo concentra regras, contratos, segurança, testes, planos e histórico local.
- ADR global registra decisões arquiteturais do sistema.
- ADR por módulo registra decisões específicas do módulo.
- O módulo `auth` é tratado como crítico e aplica gates mais rígidos.
- Mudanças locais devem ler somente o contexto necessário.

## Invariants

- A leitura por escopo deve permanecer limitada ao necessário.
- Decisões duradouras devem ficar em ADR.
- Mudanças incrementais devem ficar em changelog ou plan.

## Operational notes

- Use `current-state` como resumo vigente, não como histórico.
- Mantenha o arquivo curto o suficiente para leitura rápida.

## Update rule

- Atualize este documento quando o estado vigente mudar.
- Se a mudança for apenas evolução incremental, use `changelog.md` ou `active-plan.md`.
- Se a mudança for uma nova decisão, crie ou atualize um ADR.
- Se um ADR deixar de ser ativo mas continuar útil para histórico, ele deve ser movido para `archive/`.
- Se um ADR perder uso ativo e a referência histórica puder ficar só no resumo, marque-o como `deprecated`.

## Review criteria

- Quando este resumo ficou defasado?
- Que mudança estrutural exige revisão?
- O escopo mudou a ponto de exigir um novo resumo?
