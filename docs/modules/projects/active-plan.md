# Projects Active Plan

> Status: active
> Type: plan
> Last updated: 2026-04-24
> Owner: platform

Plano de trabalho do módulo `projects` para a fase atual da interface web.

## Context

- O sistema já tem rotas separadas para clientes, projetos, catálogo, normas e relatórios.
- O módulo `projects` agora concentra listagem, detalhe, criação, edição e acesso ao projetador.
- O projetador usa Fabric.js como camada visual do canvas 2D.
- A próxima entrega deve manter a UI compacta, clara e fácil de retomar depois.

## Scope

- Consolidar a tela de projetos em fluxo limpo, sem telas sobrepostas.
- Evoluir o projetador com um canvas 2D simples e clicável.
- Manter ferramentas e painel de propriedades em layout estreito e legível.
- Reduzir a densidade visual dos blocos do módulo para ganhar área útil.
- Preservar a separação entre UI, armazenamento local, cálculo e validação.
- Manter o canvas desacoplado em tela, controller, componentes de UI, modelo, mutações puras e adaptador visual Fabric.
- Manter o controller dependente de uma porta de persistência do canvas, não diretamente das funções do domínio/localStorage.

## Out of scope

- Drag and drop completo no canvas.
- Edição geométrica avançada de paredes.
- Roteamento elétrico automático em profundidade.
- Regras técnicas finais além do esqueleto de validação.

## Continuation checkpoints

1. Ler este plano e o `current-state.md` do módulo.
2. Abrir o projetador em `/projetos/:id/projetador`.
3. Confirmar o canvas 2D base com ferramenta ativa, clique para inserir, seleção, arraste e alças auxiliares.
4. Ajustar o tamanho dos cards, toolbars e painéis para um layout mais compacto.
5. Validar a responsividade em mobile, tablet e desktop.

## Next steps

1. Refinar criação de paredes com pontos inicial e final usando objetos Fabric.
2. Vincular paredes aos ambientes para medição mais confiável.
3. Criar propriedades elétricas específicas por tipo de ponto fora da camada visual do canvas.
4. Revisar a persistência JSON do canvas quando o projeto for reaberto.
5. Adicionar testes unitários para `canvasMutations` antes de ampliar regras de edição.
6. Evoluir a porta `ProjectCanvasRepository` para backend/API quando a persistência sair do localStorage.

## Validation

- `npm run build`
- Conferir layout em quebra móvel, tablet e desktop.
- Confirmar que o projetador continua navegável a partir da lista de projetos.
