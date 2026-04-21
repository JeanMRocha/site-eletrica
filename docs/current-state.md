# Current State

> Status: stable
> Type: state
> Last updated: 2026-04-21
> Owner: repository

Resumo vigente do sistema como um todo.

## Current state

- A documentação global define uma aplicação web para cálculos e dimensionamentos elétricos.
- A documentação por módulo concentra regras, contratos, segurança, testes, planos, estado e histórico local.
- `auth` continua sendo tratado como módulo crítico.
- `projects` e `calculations` são os próximos módulos centrais do novo produto.
- Mudanças locais devem ler somente o contexto necessário.
- O estado vigente do sistema deve ser resumido aqui, não espalhado em ADRs.

## Invariants

- A leitura por escopo deve permanecer limitada ao necessário.
- Decisões duradouras devem ficar em ADR.
- Mudanças incrementais devem ficar em changelog ou plan.

## Operational notes

- Use este arquivo como a fonte principal do estado vivo global.
- Mantenha o conteúdo curto e atualizado.

## Update rule

- Atualize este documento quando o estado vigente mudar.
- Se a mudança for apenas evolução incremental, use `changelog.md` ou `active-plan.md`.
- Se a mudança for uma nova decisão, crie ou atualize um ADR.
- Se o estado deixar de refletir o escopo ativo, mova o conteúdo útil para `archive/`.

## Review criteria

- Quando este resumo ficou defasado?
- Que mudança estrutural exige revisão?
- O escopo mudou a ponto de exigir um novo resumo?
