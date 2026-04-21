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
- [`changelog.md`](changelog.md): histórico cronológico das mudanças relevantes.
- [`active-plan.md`](active-plan.md): plano em execução no momento.
- [`roadmap.md`](roadmap.md): visão geral do que ainda falta fazer ou ampliar.
- [`header-template.md`](header-template.md): padrão de cabeçalho reutilizável para documentos de `docs/`.
- [`modules/README.md`](modules/README.md): convenção para documentação por módulo.
- [`adr/README.md`](adr/README.md): convenção para ADRs globais.
- [`adr/current-state.md`](adr/current-state.md): resumo do estado vigente das decisões globais.
- [`adr/archive/README.md`](adr/archive/README.md): regras de arquivamento de ADRs globais.

## Ordem sugerida de uso

1. Leia `architecture.md` para entender as fronteiras do sistema.
2. Leia `stack.md` para entender as escolhas tecnológicas.
3. Leia `development-principles.md` para seguir o modo de trabalho.
4. Consulte `agent-rules.md` para regras de idioma e consistência.
5. Use `active-plan.md`, `roadmap.md` e `changelog.md` para organizar execução e rastreio.
6. Use `modules/README.md` e a documentação do módulo afetado quando a alteração for local.
7. Use `adr/README.md` quando a alteração trouxer uma decisão arquitetural relevante.

## Regra prática

- Se a mudança for estrutural, consulte a arquitetura primeiro.
- Se a mudança for de execução imediata, atualize `active-plan.md`.
- Se a mudança for uma ampliação futura, registre em `roadmap.md`.
- Se a mudança já foi concluída, registre em `changelog.md`.
- Se a mudança for de um módulo, consulte a pasta `docs/modules/<nome>/`.
- Se a mudança exigir uma decisão arquitetural, registre em `docs/adr/` ou no `adr/` do módulo.
- Se a decisão antiga deixar de valer, marque o ADR como `superseded` e mova-o para `archive/` quando apropriado.
