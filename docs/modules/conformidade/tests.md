# Conformidade - Tests

> Status: draft
> Type: tests
> Last updated: 2026-04-21
> Owner: repository

## O que testar

- Regra aceita quando a entrada atende o criterio.
- Regra rejeita quando a entrada viola o criterio.
- Regra devolve `incompleto` quando faltam dados.
- Regra devolve `revisao_humana` quando a logica automatica nao e suficiente.

## Tipos de teste

- Unit tests por regra.
- Table tests para combinacao de entradas.
- Regression tests para regras versionadas.
- Snapshot tests da resposta de explicacao.

## Gate minimo

- Toda regra nova precisa de teste.
- Toda mudanca de severidade precisa de teste.
- Toda mudanca de contrato precisa de teste de compatibilidade.
