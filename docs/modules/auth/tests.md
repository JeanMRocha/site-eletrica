# Auth Tests

> Status: draft
> Type: tests
> Last updated: 2026-04-20
> Owner: security

Estratégia de testes do módulo de autenticação.

## Regra geral

- Escreva os testes antes da implementação quando houver comportamento novo.
- Atualize os testes antes de alterar contrato ou regra de auth.
- Durante a implementação, rode os testes do módulo `auth`.
- Antes de commit ou PR, rode a suíte completa do repositório.

## Testes mínimos

- Login válido
- Login inválido
- Revogação de sessão
- Refresh com token expirado
- Acesso negado sem credencial
- Acesso negado com credencial sem permissão

## Gates do módulo

- Unit tests
- Integration tests
- Security regression tests

## Observações

- Este módulo deve ter cobertura acima do restante da base quando os fluxos críticos estiverem definidos.
