# Auth Current State

> Status: draft
> Type: state
> Last updated: 2026-04-20
> Owner: security

Resumo do estado atual da governança do módulo `auth`.

## Estado vigente

- `auth` é um módulo crítico.
- O módulo possui regras próprias, contratos, segurança, testes e ADRs locais.
- O módulo deve ser lido apenas quando a mudança tocar autenticação, autorização, sessão ou revogação.
- O módulo exige testes de comportamento antes da implementação quando houver regra nova.
- O módulo deve rodar testes locais durante o desenvolvimento e suíte completa antes de commit ou PR.

## Regra de atualização

- Atualize este documento quando o modelo de auth mudar de forma relevante.
- Se a mudança for uma decisão nova, crie um ADR.
- Se a mudança for apenas implementação incremental, atualize `active-plan.md` ou `changelog.md`.
