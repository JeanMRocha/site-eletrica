# Documentation Topology

> Status: stable
> Type: architecture
> Last updated: 2026-04-20
> Owner: repository

## Context

O repositório precisa evitar leitura excessiva de documentação e manter decisões rastreáveis por escopo.

## Decision

Adotar uma topologia em camadas:

- documentação global para regras e arquitetura do sistema
- documentação por módulo para regras, contratos, segurança, testes e planos locais
- ADR global para decisões de arquitetura do sistema
- ADR por módulo para decisões específicas daquele módulo

## Consequences

- O agente passa a ler apenas o contexto necessário para a alteração em andamento.
- Decisões relevantes ficam registradas com justificativa e trade-offs.
- Módulos críticos, como auth, podem aplicar gates mais rígidos sem penalizar o restante do sistema.

## Review criteria

- Rever se a separação entre documentação global, por módulo e ADR continua reduzindo leitura desnecessária.
- Criar novo ADR se surgir uma exceção estrutural que invalide essa topologia.

## Alternatives considered

- Manter toda a documentação em uma árvore única.
- Criar ADR apenas global.
- Criar documentação por módulo sem padrão de leitura.

## Status

- accepted
