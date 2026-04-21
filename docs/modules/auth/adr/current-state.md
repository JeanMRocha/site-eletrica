# Auth Current State

> Status: draft
> Type: state
> Last updated: 2026-04-20
> Owner: security

Use este documento para registrar o estado vigente do módulo `auth`.

Resumo do estado atual da governança do módulo `auth`.

## Current state

- `auth` é um módulo crítico.
- O módulo possui regras próprias, contratos, segurança, testes e ADRs locais.
- O módulo deve ser lido apenas quando a mudança tocar autenticação, autorização, sessão ou revogação.
- O módulo exige testes de comportamento antes da implementação quando houver regra nova.
- O módulo deve rodar testes locais durante o desenvolvimento e suíte completa antes de commit ou PR.

## Invariants

- Auth continua sendo tratado como módulo crítico.
- Segurança continua tendo prioridade sobre conveniência.
- Mudanças de comportamento precisam de testes antes de implementação.

## Operational notes

- Use este arquivo para resumir o que vale agora no módulo.
- Não use este arquivo para registrar histórico detalhado.

## Update rule

- Atualize este documento quando o modelo de auth mudar de forma relevante.
- Se a mudança for uma decisão nova, crie um ADR.
- Se a mudança for apenas implementação incremental, atualize `active-plan.md` ou `changelog.md`.
- Se um ADR do módulo deixar de ser ativo mas continuar útil para histórico, mova-o para `archive/`.
- Se um ADR perder uso ativo e a referência histórica puder ficar só no resumo do módulo, marque-o como `deprecated`.

## Review criteria

- Quando este resumo ficou defasado?
- Que mudança estrutural exige revisão?
