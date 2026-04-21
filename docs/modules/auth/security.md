# Auth Security

> Status: draft
> Type: security
> Last updated: 2026-04-20
> Owner: security

Controles de segurança do módulo de autenticação.

## Controles mínimos

- Least privilege
- Fail closed
- Expiração curta de tokens
- Revogação auditável
- Proteção contra brute force
- Logging de eventos de segurança
- Segredos fora do repositório

## Riscos a considerar

- Credential stuffing
- Token theft
- Session fixation
- Replay de requests
- Escalada indevida de privilégios

## Exigências de revisão

- Mudança de auth deve ser revisada com foco em abuso, não só em fluxo feliz.
- Mudança de auth deve ter cobertura de regressão para erro, negação e revogação.
