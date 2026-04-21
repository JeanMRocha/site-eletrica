# Nodes Tests

> Status: draft
> Type: tests
> Last updated: 2026-04-21
> Owner: platform

## Regra geral

- Escreva teste antes de ampliar o comportamento do probe.
- Cada comando opcional deve ter comportamento claro quando falhar.
- A validação de configuração deve impedir inputs inseguros.

## Testes mínimos

- Validação de `SSHConfig`
- Coleta de inventário por runner fake
- Warning quando comando opcional falhar
- Erro quando comando crítico falhar

## Gate do módulo

- `go test ./internal/nodes/...`
- `go test ./...` antes de commit ou PR

