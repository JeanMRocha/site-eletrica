# Auth Governance

> Status: draft
> Type: architecture
> Last updated: 2026-04-20
> Owner: security

## Context

Auth é um módulo crítico e precisa de regras mais rígidas do que o restante da aplicação.

## Decision

Tratar auth como um módulo isolado com:

- contratos próprios
- regras próprias
- testes próprios
- gate de segurança reforçado
- plano local quando houver implementação em andamento

## Consequences

- O agente pode focar em auth sem ler documentação irrelevante.
- Mudanças em auth exigem validação mais completa antes de commit.
- O restante do sistema não herda complexidade de auth sem necessidade.

## Alternatives considered

- Misturar auth com regras globais apenas.
- Centralizar todas as decisões de auth na documentação raiz.

## Status

- Decision accepted
