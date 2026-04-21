# Standards Module

> Status: draft
> Type: module
> Last updated: 2026-04-21
> Owner: platform

Módulo responsável pelo catálogo de normas, critérios técnicos e versão da base normativa aplicada aos cálculos.

## Escopo

- Registro de normas e critérios técnicos
- Versionamento de regras aplicáveis
- Seleção da norma usada em cada cálculo
- Rastreabilidade da base normativa
- Hierarquia legal e técnica por precedência
- Regras computáveis e resolução de conflito

## Documentos do módulo

- [`rules.md`](rules.md): regras específicas do módulo
- [`contracts.md`](contracts.md): contratos e formatos esperados
- [`security.md`](security.md): controles de segurança e riscos
- [`tests.md`](tests.md): testes e gates do módulo
- [`hierarchy.md`](hierarchy.md): ordem de precedência e matriz de decisão
- [`reading-paths.md`](reading-paths.md): leitura mínima por tipo de mudança
- [`onboarding.md`](onboarding.md): guia de entrada para quem está conhecendo o módulo
- [`current-state.md`](current-state.md): estado vigente do módulo

## Navegação mínima

- `docs/governance.md`
- `docs/modules/standards/reading-paths.md`
- `docs/modules/standards/onboarding.md`
- `docs/modules/standards/current-state.md`

## Maturidade do módulo

- O escopo está definido em nível de produto.
- A primeira implementação já expõe catálogo em memoria e leitura por codigo na API.
- A primeira implementação também expõe hierarquia e resolução de precedência.
- O módulo deve servir de base para qualquer cálculo que dependa de norma ou critério técnico.
