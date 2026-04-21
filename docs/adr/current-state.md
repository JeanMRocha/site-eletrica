# Current State

> Status: stable
> Type: state
> Last updated: 2026-04-20
> Owner: repository

Resumo do que hoje é verdade sobre a camada de decisão do sistema.

## Estado vigente

- A documentação global define arquitetura, princípios, regras e stack.
- A documentação por módulo concentra regras, contratos, segurança, testes, planos e histórico local.
- ADR global registra decisões arquiteturais do sistema.
- ADR por módulo registra decisões específicas do módulo.
- O módulo `auth` é tratado como crítico e aplica gates mais rígidos.
- Mudanças locais devem ler somente o contexto necessário.

## Regra de atualização

- Atualize este documento quando o estado vigente mudar.
- Se a mudança for apenas evolução incremental, use `changelog.md` ou `active-plan.md`.
- Se a mudança for uma nova decisão, crie ou atualize um ADR.
