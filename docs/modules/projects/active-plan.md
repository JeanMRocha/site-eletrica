# Projects Active Plan

> Status: active
> Type: plan
> Last updated: 2026-04-24
> Owner: platform

Plano de trabalho do módulo `projects` para a fase atual da interface web.

## Context

- O sistema já tem rotas separadas para clientes, projetos, catálogo, normas e relatórios.
- O módulo `projects` agora concentra listagem, detalhe, criação, edição e acesso ao projetador.
- O projetador ainda é um esqueleto funcional e precisa evoluir em camadas pequenas.
- A próxima entrega deve manter a UI compacta, clara e fácil de retomar depois.

## Scope

- Consolidar a tela de projetos em fluxo limpo, sem telas sobrepostas.
- Evoluir o projetador com um canvas 2D simples e clicável.
- Manter ferramentas e painel de propriedades em layout estreito e legível.
- Reduzir a densidade visual dos blocos do módulo para ganhar área útil.
- Preservar a separação entre UI, armazenamento local, cálculo e validação.

## Out of scope

- Drag and drop completo no canvas.
- Edição geométrica avançada de paredes.
- Roteamento elétrico automático em profundidade.
- Regras técnicas finais além do esqueleto de validação.

## Continuation checkpoints

1. Ler este plano e o `current-state.md` do módulo.
2. Abrir o projetador em `/projetos/:id/projetador`.
3. Confirmar o canvas 2D base com ferramenta ativa, clique para inserir e seleção simples.
4. Ajustar o tamanho dos cards, toolbars e painéis para um layout mais compacto.
5. Validar a responsividade em mobile, tablet e desktop.

## Next steps

1. Finalizar a base do canvas 2D.
2. Expor propriedades do item selecionado.
3. Refinar a redução de densidade visual do módulo.
4. Revisar a persistência do estado do canvas quando o projeto for reaberto.

## Validation

- `npm run build`
- Conferir layout em quebra móvel, tablet e desktop.
- Confirmar que o projetador continua navegável a partir da lista de projetos.

