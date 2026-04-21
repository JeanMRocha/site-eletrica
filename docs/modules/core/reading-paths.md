# Core - Reading Paths

> Status: draft
> Type: guide
> Last updated: 2026-04-21
> Owner: repository

## Regra geral

- Leia `README.md` primeiro.
- Use este modulo quando a mudanca tocar compartilhamento de tipos, formulas, unidades ou auditoria.

## Mapa rapido

| Perfil | Leitura minima | Leitura opcional | Nao ler por padrao |
| --- | --- | --- | --- |
| Compartilhado novo | `README.md`, `rules.md`, `contracts.md`, `tests.md`, `current-state.md` | `security.md`, `onboarding.md` | Modulos de dominio sem relacao com a primitva compartilhada |
| Mudanca de contrato | `README.md`, `rules.md`, `contracts.md`, `tests.md` | `current-state.md`, `security.md` | Regras de negocio especificas de um modulo |

## Como usar

- Se a mudanca afeta varios modulos, centralize o contrato em `core`.
- Se a mudanca e especifica de um modulo, nao mova a regra para `core`.
