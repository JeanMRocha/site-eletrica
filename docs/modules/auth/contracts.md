# Auth Contracts

> Status: draft
> Type: contracts
> Last updated: 2026-04-20
> Owner: security

Contratos esperados do módulo de autenticação.

## Contratos principais

- `POST /v1/auth/login`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`
- `POST /v1/auth/revoke`
- `GET /v1/auth/session`

## Regras de contrato

- Respostas devem ser versionadas.
- Erros devem ser previsíveis e documentados.
- Campos sensíveis não devem ser retornados sem necessidade.
- Mudanças de contrato exigem atualização de testes e documentação.

## Observações

- Este arquivo deve ser expandido com payloads, status codes e exemplos quando a API do módulo for definida.
