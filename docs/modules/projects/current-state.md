# Projects Current State

> Status: draft
> Type: state
> Last updated: 2026-04-24
> Owner: platform

## Current state

- O módulo `projects` já está separado em lista, detalhe, criação, edição e projetador.
- A tela principal de projetos virou ponto de entrada para a revisão técnica.
- O projetador usa Fabric.js como camada visual e mantém o estado em modelo próprio do projeto.
- As regras de alteração do canvas ficam em mutações puras; a integração com Fabric fica em adaptador separado.
- A tela do projetador foi dividida em controller, toolbar, painel de propriedades e canvas visual.
- O controller do projetador usa a porta `ProjectCanvasRepository`, mantendo a persistência local fora da composição visual.
- A sincronização do canvas é incremental por id para evitar recriação completa de objetos em cada atualização.
- O canvas 2D permite inserir, selecionar, arrastar, rotacionar, redimensionar ambientes, aplicar zoom/pan e excluir objetos.
- O menu do projetador segue uma sequência lógica: ambientes, paredes, entrada, pontos e circuitos.
- A persistência atual do módulo usa armazenamento local no front para o esqueleto funcional.

## Update rule

- Atualize este arquivo quando o fluxo do módulo, o canvas ou o vínculo com cálculo mudar de forma relevante.

## Review criteria

- O fluxo principal continua claro para retomada futura?
- O canvas base ainda reflete o estágio atual do módulo?
- A densidade visual continua compatível com telas pequenas e médias?
