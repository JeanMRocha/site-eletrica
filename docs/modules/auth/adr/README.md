# Auth ADR

> Status: draft
> Type: index
> Last updated: 2026-04-20
> Owner: security

ADR do módulo `auth`.

## Quando usar

- Use quando a decisão afetar diretamente autenticação, autorização, sessão ou revogação.
- Não use para ajustes pequenos de implementação.

## Ciclo de vida

- `proposed`: decisão em avaliação.
- `accepted`: decisão válida e em uso.
- `superseded`: decisão substituída por outra mais recente.
- `deprecated`: decisão arquivada sem uso ativo, mas preservada para histórico.

## Critério para criar ADR

- Crie ADR quando a mudança alterar a política de sessão, autorização, revogação, contrato ou controle de segurança.
- Crie ADR quando houver decisão relevante entre alternativas.
- Não crie ADR para ajuste pequeno de implementação, texto ou UI.

## Estrutura

- `0001-title.md`: primeira decisão relevante do módulo
- `0002-title.md`: próxima decisão relevante do módulo
- `template.md`: modelo oficial de ADR do módulo
- `current-state.md`: resumo do estado vigente do módulo
- `archive/`: decisões antigas, superseded ou deprecated
- `README.md`: regras gerais do ADR do módulo

## Leitura

- Leia os ADRs globais antes de criar um ADR de auth.
- Leia os ADRs de auth quando a alteração tocar segurança, contrato ou modelo de sessão.

## Regra de uso prático

- Mantenha um único ADR por decisão duradoura.
- Se uma nova decisão de auth substituir a anterior, marque a anterior como `superseded`.
- Se o ADR ainda precisar ser referenciado no histórico do módulo, mova-o para `archive/`.
- Se o ADR não tiver mais uso ativo e a referência histórica puder ficar só no resumo do módulo, marque-o como `deprecated` e mantenha o `current-state.md` atualizado.
- Se a decisão ainda vale, atualize `current-state.md` em vez de criar outro ADR.
