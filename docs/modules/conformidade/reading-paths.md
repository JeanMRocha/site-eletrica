# Conformidade - Reading Paths

> Status: draft
> Type: guide
> Last updated: 2026-04-21
> Owner: repository

## Regra geral

- Leia `README.md` primeiro.
- Depois leia `rules.md` e `contracts.md`.
- Use `tests.md` quando mudar uma regra.
- Use `security.md` quando a mudanca tocar fonte normativa, rastreabilidade ou exposicao da decisao.

## Mapa rapido

| Perfil | Leitura minima | Leitura opcional | Nao ler por padrao |
| --- | --- | --- | --- |
| Regra nova | `README.md`, `rules.md`, `contracts.md`, `tests.md`, `current-state.md` | `security.md`, `onboarding.md` | Modulos que nao participam da validacao |
| Ajuste de severidade | `README.md`, `rules.md`, `contracts.md`, `tests.md` | `security.md`, `current-state.md` | Docs de calculo sem relacao direta |
| Mudanca de fonte | `README.md`, `rules.md`, `security.md`, `current-state.md` | `contracts.md`, `tests.md` | Modulos fora de conformidade |

## Como usar

- Se o ajuste for de regra, priorize `rules.md`.
- Se o ajuste for de entrada ou saida, priorize `contracts.md`.
- Se o ajuste for de comportamento observavel, priorize `tests.md`.
