# Documentação

> Status: stable
> Type: index
> Last updated: 2026-04-20
> Owner: repository

Índice rápido para entender o papel de cada documento em `docs/`.

## Visão geral

- [`architecture.md`](architecture.md): descreve a arquitetura alvo, responsabilidades e comunicação entre camadas.
- [`stack.md`](stack.md): registra a stack escolhida e os motivos das decisões.
- [`development-principles.md`](development-principles.md): consolida princípios de trabalho, qualidade e segurança.
- [`agent-rules.md`](agent-rules.md): define regras práticas para o agente, incluindo idioma da UI e do código.
- [`governance.md`](governance.md): índice mestre para leitura, escrita e ciclo de vida da documentação.
- [`changelog.md`](changelog.md): histórico cronológico das mudanças relevantes.
- [`active-plan.md`](active-plan.md): plano em execução no momento.
- [`roadmap.md`](roadmap.md): visão geral do que ainda falta fazer ou ampliar.
- [`plan-template.md`](plan-template.md): modelo oficial de plan.
- [`plan-lifecycle.md`](plan-lifecycle.md): política de ciclo de vida de plan.
- [`current-state-template.md`](current-state-template.md): modelo oficial de current-state.
- [`current-state-lifecycle.md`](current-state-lifecycle.md): política de ciclo de vida de current-state.
- [`header-template.md`](header-template.md): padrão de cabeçalho reutilizável para documentos de `docs/`.
- [`archive/README.md`](archive/README.md): regras de arquivamento de plan e current-state globais.
- [`modules/README.md`](modules/README.md): convenção para documentação por módulo.
- [`adr/README.md`](adr/README.md): convenção para ADRs globais.
- [`adr/template.md`](adr/template.md): modelo oficial de ADR global.
- [`adr/current-state.md`](adr/current-state.md): resumo do estado vigente das decisões globais.
- [`adr/archive/README.md`](adr/archive/README.md): regras de arquivamento de ADRs globais.
- [`archive/README.md`](archive/README.md): regras de arquivamento de planos e current-state globais.

## Ordem sugerida de uso

1. Leia `governance.md` para seguir o fluxo de documentação por tipo de mudança.
2. Leia `architecture.md` para entender as fronteiras do sistema.
3. Leia `stack.md` para entender as escolhas tecnológicas.
4. Leia `development-principles.md` para seguir o modo de trabalho.
5. Consulte `agent-rules.md` para regras de idioma e consistência.
6. Use `active-plan.md`, `roadmap.md` e `changelog.md` para organizar execução e rastreio.
7. Use `modules/README.md` e a documentação do módulo afetado quando a alteração for local.
8. Use `adr/README.md` quando a alteração trouxer uma decisão arquitetural relevante.

## Regra prática

- Se a mudança for estrutural, consulte a arquitetura primeiro.
- Se a mudança for de execução imediata, atualize `active-plan.md`.
- Se a mudança for uma ampliação futura, registre em `roadmap.md`.
- Se a mudança já foi concluída, registre em `changelog.md`.
- Se a mudança for de um módulo, consulte a pasta `docs/modules/<nome>/`.
- Se a mudança exigir uma decisão arquitetural, registre em `docs/adr/` ou no `adr/` do módulo.
- Se a decisão antiga deixar de valer, marque o ADR como `superseded` e mova-o para `archive/` quando apropriado.
- Se um `plan` ou `current-state` deixar de ser o resumo ativo do escopo, mova-o para `archive/` quando fizer sentido.
