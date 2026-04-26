# Regras de Design

> Status: stable
> Type: design
> Last updated: 2026-04-23
> Owner: repository

Referência visual e de UX para telas do projeto.

## Quando usar

- Criar telas novas.
- Refatorar layouts existentes.
- Melhorar responsividade.
- Organizar dashboards, formulários, tabelas e painéis administrativos.
- Ajustar hierarquia visual, acessibilidade básica e consistência de componentes.

## Quando não usar

- Alterar lógica de negócio.
- Reescrever API, autenticação ou persistência.
- Introduzir uma nova stack visual sem decisão formal.
- Resolver problema estrutural só com efeitos visuais.

## Stack base

- Frontend: `React + TypeScript + Vite`
- Estilo: CSS organizado no repositório com componentes reutilizáveis
- Ícones: consistentes e funcionais, preferencialmente sem texto quando o contexto permitir
- Direção visual: Cyber Engineering - moderna, sóbria, tons escuros com acentos neon/glow
- Design: Modern & Rounded (Bordas generosas e campos profundos)

## Princípios

- Mobile-first.
- Hierarquia clara.
- Espaço suficiente entre blocos.
- Uma ação principal por bloco.
- Empilhamento Vertical: Rótulos (Labels) sempre ACIMA dos campos de entrada.
- Informações longas devem ser divididas em fases ou abas.
- A tela deve ser fácil de escanear em poucos segundos.

## Breakpoints

- `360px`: celular pequeno.
- `768px`: tablet.
- `1024px`: laptop.
- `1440px`: desktop largo.

## Comportamento esperado

- Mobile: pilha vertical.
- Tablet: 2 colunas quando fizer sentido.
- Desktop: mais densidade sem perder leitura.
- Nunca depender só de `overflow-x` para corrigir layout ruim.
- Botões não devem ficar pequenos demais em telas pequenas.

## Espaçamento

- Usar ritmo consistente.
- Evitar blocos colados.
- Preferir respiro visual.
- Manter espaçamento previsível entre título, descrição, ações e conteúdo.

## Tipografia

- Título claro.
- Subtítulo curto.
- Texto secundário discreto.
- Evitar muitos tamanhos diferentes.

## Cores

- 1 cor principal.
- 1 cor de apoio.
- Neutros para estrutura.
- Estados de erro, sucesso e aviso bem distintos.
- Destaque só no que importa.

## Tokens visuais

- Card com canto generoso (20px a 24px).
- Inputs com cantos modernos (12px).
- Sombra leve, sem exagero.
- Borda discreta com transparência (Glassmorphism).
- Botão primário evidente com brilho (Glow).
- Botão secundário circular e icônico para ferramentas.
- Badge simples e legível.
- Modal limpo, com foco claro.

## Componentes

- Botão primário.
- Botão secundário.
- Input padrão.
- Card padrão.
- Tabela padrão.
- Badge padrão.
- Modal padrão.

## Padrões de layout

- Container principal centralizado com largura controlada.
- Cabeçalho com título, subtítulo e ações separados.
- Grid com colunas progressivas por breakpoint.
- Seções longas devem ser quebradas em blocos claros.
- Formulários complexos: Usar o padrão **Wizard com Abas estilo Chrome**.
- Navegação Instrumental: Ações de fluxo (Salvar, Voltar, Avançar) agrupadas no topo à direita.
- Painéis de edição devem ser secundários ao resumo principal.

## Padrões de UX

- A ação principal deve ficar evidente.
- Filtros devem ser simples.
- Excesso de informação deve ser dividido.
- Estados de loading, empty e erro devem existir quando aplicável.
- O usuário deve entender o que pode fazer sem leitura longa.

## Do

- Usar rótulos curtos e claros.
- Priorizar leitura e alinhamento.
- Separar conteúdo, estrutura e ação.
- Reutilizar padrões existentes.
- Revisar responsividade antes de concluir.

## Don't

- Não poluir a tela com muitos efeitos.
- Não criar blocos sem respiro.
- Não misturar muitos tamanhos de fonte.
- Não esconder a ação principal.
- Não inventar um padrão novo se o existente já resolve.

## Uso

- Use este documento como referência ao criar ou refatorar telas.
- Preserve a identidade visual do sistema, mas priorize clareza e legibilidade.
- Se houver conflito entre efeito visual e usabilidade, a usabilidade vence.

## Checklist final

- Está bom no mobile?
- Está claro visualmente?
- Está coerente com o restante do sistema?
- O CTA principal está evidente?
- O layout está leve e profissional?
- Existe estado vazio, loading ou erro quando necessário?
