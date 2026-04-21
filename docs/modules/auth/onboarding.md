# Onboarding do Auth

> Status: stable
> Type: guide
> Last updated: 2026-04-20
> Owner: security

Guia de entrada para quem vai trabalhar no módulo `auth` pela primeira vez.

## O que este módulo cobre

- Login
- Refresh de sessão
- Logout e revogação
- Emissão e validação de tokens
- Autorização de acesso

## Ordem de leitura recomendada

1. `docs/governance.md`
2. `docs/modules/auth/README.md`
3. `docs/modules/auth/reading-paths.md`
4. `docs/modules/auth/current-state.md`
5. `docs/modules/auth/contracts.md`
6. `docs/modules/auth/security.md`
7. `docs/modules/auth/tests.md`
8. `docs/modules/auth/runbook.md`
9. `docs/modules/auth/adr/README.md`

## Estado vivo versus snapshot

- `docs/modules/auth/current-state.md` é o estado vivo do módulo.
- `docs/modules/auth/adr/current-state.md` é apenas um snapshot da camada de decisão.
- Se você precisa saber o que vale agora, leia primeiro o estado vivo.
- Se você precisa da forma histórica da camada de decisão, use o snapshot do ADR.

## O que olhar primeiro

- Se você vai mudar a API, comece por `contracts.md`.
- Se você vai mudar tratamento de falha ou resistência a abuso, comece por `security.md`.
- Se você vai mudar comportamento esperado, comece por `tests.md`.
- Se você vai operar ou recuperar o módulo, comece por `runbook.md`.
- Se você vai tomar uma decisão duradoura, comece por `adr/README.md`.

## Regra prática

- Use este guia quando você estiver chegando ao `auth` pela primeira vez ou quando o README curto do módulo não for suficiente.
