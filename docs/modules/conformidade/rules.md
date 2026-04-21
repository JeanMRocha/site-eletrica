# Conformidade - Rules

> Status: draft
> Type: rules
> Last updated: 2026-04-21
> Owner: repository

## Principios

- A conformidade valida o modelo, nao o cria.
- Cada regra precisa de identificador estavel.
- Cada regra precisa de fonte, versao e severidade.
- O sistema deve diferenciar erro tecnico, alerta e revisao humana.

## Regras basicas

- Nao guardar texto integral de norma como base computavel.
- Guardar a referencia da fonte e a logica computavel.
- Registrar o que foi aplicado em cada cálculo.
- Se a entrada for incompleta, o retorno deve ser `incompleto` e nao apenas `fora`.

## Saidas possiveis

- `conforme`
- `nao_conforme`
- `incompleto`
- `revisao_humana`

## Versao

- Regras e catalogo precisam ser versionados separadamente.
- O veredito deve carregar a versao da regra aplicada.
