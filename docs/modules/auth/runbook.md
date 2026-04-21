# Auth Runbook

> Status: draft
> Type: runbook
> Last updated: 2026-04-20
> Owner: security

Procedimentos operacionais para o módulo `auth`.

## Common checks

- Verify session validity and expiry behavior.
- Check for rate limiting or brute-force protection triggers.
- Confirm token revocation state.
- Confirm permission assignment for the affected operator.

## Incident response

### Login failures

- Check whether the issue is invalid credentials, account lockout, or rate limiting.
- Confirm whether the error is expected or caused by a regression.
- Review relevant logs and security events.

### Session revocation issues

- Confirm the session exists and is still active.
- Check revocation audit events.
- Verify that caches or token state are not stale.

### Unauthorized access reports

- Confirm the operator's permissions.
- Verify the affected endpoint and expected scope.
- Check whether the request was properly authenticated and authorized.

### Token replay or theft suspicion

- Revoke the affected session or token scope.
- Check for repeated request patterns.
- Review audit logs and security alerts.

## Maintenance

- Prefer documented, idempotent actions.
- Keep recovery steps auditable.
- Update ADR or current-state if the operational procedure becomes a lasting rule.
