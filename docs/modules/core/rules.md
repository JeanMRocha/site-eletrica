# Core - Rules

> Status: draft
> Type: rules
> Last updated: 2026-04-21
> Owner: repository

## Principios

- `core` deve conter apenas o que e compartilhado.
- `core` nao deve carregar regra de negocio local sem necessidade.
- Contratos compartilhados precisam ser estaveis e versionados.
- Unidades, formulas e IDs de versao precisam ser consistentes entre modulos.

## Regras basicas

- Na duvida, manter no modulo de dominio.
- Se mais de um modulo usa o mesmo contrato, considerar `core`.
- Se a mudanca quebra rastreabilidade, exigir revisao.
