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

## Common status codes

- `200 OK`: successful read or refresh.
- `201 Created`: new session created after login when applicable.
- `204 No Content`: successful logout or revoke without response body.
- `400 Bad Request`: invalid payload or missing required data.
- `401 Unauthorized`: missing, expired, or invalid credentials.
- `403 Forbidden`: authenticated but not allowed.
- `404 Not Found`: session or token scope not found.
- `409 Conflict`: revocation or refresh conflict.
- `429 Too Many Requests`: rate limiting or brute force protection.

## Example payloads

### `POST /v1/auth/login`

Request:

```json
{
  "email": "operator@example.com",
  "password": "secret-password"
}
```

Response:

```json
{
  "session": {
    "id": "sess_123",
    "expiresAt": "2026-04-20T18:30:00Z",
    "permissions": ["nodes.read", "incidents.write"]
  },
  "token": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "rft_abc123",
    "tokenType": "Bearer"
  },
  "user": {
    "id": "usr_123",
    "email": "operator@example.com",
    "displayName": "Operator"
  }
}
```

Example error:

```json
{
  "error": {
    "code": "invalid_credentials",
    "message": "Invalid email or password."
  }
}
```

### `POST /v1/auth/refresh`

Request:

```json
{
  "refreshToken": "rft_abc123"
}
```

Response:

```json
{
  "session": {
    "id": "sess_123",
    "expiresAt": "2026-04-20T19:00:00Z"
  },
  "token": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "rft_def456",
    "tokenType": "Bearer"
  }
}
```

### `POST /v1/auth/logout`

Request:

```json
{
  "sessionId": "sess_123"
}
```

Response:

```json
{
  "revoked": true
}
```

### `POST /v1/auth/revoke`

Request:

```json
{
  "sessionId": "sess_123"
}
```

Response:

```json
{
  "revoked": true,
  "revokedAt": "2026-04-20T17:45:00Z"
}
```

### `GET /v1/auth/session`

Response:

```json
{
  "session": {
    "id": "sess_123",
    "status": "active",
    "expiresAt": "2026-04-20T18:30:00Z",
    "permissions": ["nodes.read", "incidents.write"]
  }
}
```

## Operational notes

- Este arquivo é a fonte principal de contrato do módulo `auth`.
- Os exemplos acima são a base esperada para a primeira implementação da API.
