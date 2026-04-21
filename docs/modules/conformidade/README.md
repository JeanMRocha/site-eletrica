# Conformidade

> Status: draft
> Type: module
> Last updated: 2026-04-21
> Owner: repository

Modulo responsavel por validar o modelo eletrico contra fontes normativas, legais e tecnicas.

## Escopo

- Receber a saida do motor de calculo.
- Comparar o resultado com regras computaveis versionadas.
- Responder com conformidade, nao conformidade, incompletude ou revisao humana.
- Explicar qual regra foi aplicada e qual ajuste e necessario.

## O que nao faz

- Nao modela a instalacao.
- Nao substitui o motor de calculo.
- Nao vira o centro do produto.
- Nao armazena texto integral de norma como fonte primaria de verdade.

## Documentos do modulo

- [`reading-paths.md`](reading-paths.md)
- [`rules.md`](rules.md)
- [`contracts.md`](contracts.md)
- [`security.md`](security.md)
- [`tests.md`](tests.md)
- [`onboarding.md`](onboarding.md)
- [`current-state.md`](current-state.md)

## Regra de uso

- Leia este modulo quando a tarefa envolver validacao, severidade, regra aplicada ou revisao humana.
- Se a mudanca envolver modelagem ou calculo, leia tambem o modulo responsavel por essa parte.
