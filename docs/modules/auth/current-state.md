# Auth Current State

> Status: stable
> Type: state
> Last updated: 2026-04-20
> Owner: security

Estado vigente do módulo `auth`.

## Current state

- `auth` é um módulo crítico e deve continuar com gates mais rígidos.
- O módulo concentra regras, contratos, segurança, testes, execução local e decisões próprias.
- Mudanças em auth precisam ser lidas de forma restrita ao escopo do módulo.
- O estado vigente do módulo deve ficar aqui, não espalhado em ADRs.

## Invariants

- Segurança tem prioridade sobre conveniência.
- Mudanças de comportamento precisam de testes antes de implementação.
- O módulo deve manter autenticação, autorização e sessão explicitamente separadas.

## Operational notes

- Use este arquivo como a fonte principal do estado vivo do módulo.
- Mantenha o conteúdo curto e atualizado.

## Update rule

- Atualize este documento quando o estado vigente do módulo mudar de forma relevante.
- Se a mudança for apenas implementação incremental, atualize `active-plan.md` ou `changelog.md`.
- Se a mudança for uma decisão nova, crie um ADR.
- Se o estado deixar de refletir o escopo ativo, mova o conteúdo útil para `archive/`.

## Review criteria

- Quando este resumo ficou defasado?
- Que mudança estrutural exige revisão?
- O escopo do módulo mudou a ponto de exigir um novo resumo?
