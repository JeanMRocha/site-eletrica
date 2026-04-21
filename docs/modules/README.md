# Modules

> Status: stable
> Type: index
> Last updated: 2026-04-20
> Owner: repository

Camada de documentação por módulo. Use esta pasta para concentrar regras, contratos, testes e histórico de cada área funcional.

## Regra de leitura por escopo

- Se a mudança for global, leia os documentos da raiz de `docs/`.
- Se a mudança tocar um módulo específico, leia os documentos daquele módulo.
- Se a mudança tocar um contrato compartilhado, leia também `docs/shared/` quando ele existir.
- Se a mudança não tocar um módulo, não carregue a documentação dele por padrão.

## Estrutura sugerida por módulo

- `README.md`: objetivo, escopo e links do módulo
- `rules.md`: regras específicas do módulo
- `contracts.md`: contratos, DTOs, endpoints e formatos esperados
- `security.md`: riscos, controles e exigências de segurança
- `tests.md`: estratégia de testes e gates do módulo
- `active-plan.md`: execução atual do módulo
- `changelog.md`: histórico de mudanças do módulo
- `plan-template.md`: modelo oficial de plan do módulo
- `current-state-template.md`: modelo oficial de current-state do módulo
- `adr/README.md`: regras de decisão do módulo
- `adr/template.md`: modelo oficial de ADR do módulo
- `adr/0001-title.md`: primeira decisão relevante do módulo
- `adr/current-state.md`: resumo do estado vigente do módulo
- `adr/archive/`: decisões antigas do módulo

## Exemplo de uso

- Alteração em autenticação: leia `docs/modules/auth/*`
- Alteração em incidentes: leia `docs/modules/incidents/*` quando existir
- Alteração em UI geral: leia os documentos globais e o módulo afetado
