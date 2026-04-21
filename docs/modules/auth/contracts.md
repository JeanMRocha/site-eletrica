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

## Request and response model

### `POST /v1/auth/login`

- Request: credentials or provider-specific login payload.
- Response: authenticated session, token metadata, and user identity summary.
- Errors: invalid credentials, locked account, rate-limited request, unsupported provider.

### `POST /v1/auth/refresh`

- Request: refresh token or equivalent session proof.
- Response: renewed session or token pair.
- Errors: expired token, revoked token, invalid session, replay detection.

### `POST /v1/auth/logout`

- Request: active session proof.
- Response: confirmation of revocation.
- Errors: invalid session, already revoked, unauthorized request.

### `POST /v1/auth/revoke`

- Request: session identifier or token scope to revoke.
- Response: confirmation of revocation.
- Errors: unauthorized request, not found, already revoked.

### `GET /v1/auth/session`

- Request: authenticated session proof.
- Response: current session state, permissions, and expiry metadata.
- Errors: unauthenticated request, expired session, revoked session.

## Contract rules

- Respostas devem ser versionadas.
- Erros devem ser previsíveis e documentados.
- Campos sensíveis não devem ser retornados sem necessidade.
- Mudanças de contrato exigem atualização de testes e documentação.
- Payloads devem ser claros e estáveis antes de virar dependência de outra área.

## Operational notes

- Este arquivo é a fonte principal de contrato do módulo `auth`.
- Quando a API for implementada, adicione exemplos reais de payloads e status codes.
