# Auth Active Plan

> Status: active
> Type: plan
> Last updated: 2026-04-21
> Owner: security

Use este documento para registrar trabalho em andamento no módulo `auth`.

## Lifecycle

- `active`: trabalho em execução.
- `paused`: trabalho bloqueado ou suspenso temporariamente.
- `completed`: trabalho concluído.

## Context

- A base inicial do módulo `auth` em Go já foi criada com serviço em memória, HTTP handlers e testes.
- O próximo passo é evoluir o módulo para persistência e integração com o restante da fase 1.

## Scope

- Login, refresh, logout, revogação e consulta de sessão.
- Serviço em memória como primeiro incremento funcional.
- Regras específicas do módulo, contratos e testes.

## Out of scope

- Persistência em PostgreSQL.
- UI do fluxo de login.
- Integração com provedores externos.
- Fluxos avançados de recuperação ou MFA.

## Next steps

1. Substituir o armazenamento em memória por persistência real.
2. Ajustar contratos e validações conforme o uso do módulo crescer.
3. Ampliar os testes de erro, auditoria e revogação.

## Blockers

- Ainda não há camada de persistência.

## Validation

- Confirmar que login, refresh, logout, revogação e sessão funcionam em memória.
- Confirmar que os testes de auth passam antes de evoluir o armazenamento.

## Review criteria

- Quando este plano deixa de fazer sentido?
- O que precisa acontecer para atualizar o escopo?
- Que mudança exige um novo plano?
- O plano do módulo deve ser pausado, concluído ou substituído?
