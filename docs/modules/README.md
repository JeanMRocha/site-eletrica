# Modules

> Status: stable
> Type: index
> Last updated: 2026-04-21
> Owner: repository

Camada de documentação por módulo. Use esta pasta para concentrar regras, contratos, testes e histórico de cada área funcional.

## Regra de leitura por escopo

- `docs/governance.md` é a autoridade principal para navegação por documentação.
- `docs/modules/<modulo>/reading-paths.md` é o guia mínimo quando a mudança ficar restrita a um módulo.
- Leia os documentos do módulo afetado, sem carregar módulos não relacionados por padrão.

## Estrutura sugerida por módulo

- `README.md`: objetivo, escopo e links do módulo
- `reading-paths.md`: leitura mínima por tipo de mudança
- `rules.md`: regras específicas do módulo
- `contracts.md`: contratos, DTOs, endpoints e formatos esperados
- `security.md`: riscos, controles e exigências de segurança
- `tests.md`: estratégia de testes e gates do módulo
- `onboarding.md`: guia de entrada do módulo quando ele precisar de mais contexto
- `current-state.md`: estado vigente do módulo
- `active-plan.md`: execução atual do módulo
- `changelog.md`: histórico de mudanças do módulo
- `adr/README.md`: regras de decisão do módulo
- `adr/current-state.md`: snapshot da camada de decisão do módulo

## Módulos atuais

- `auth`: autenticação, autorização e sessão
- `projects`: cadastro e organização de estudos elétricos
- `calculations`: dimensionamento e regras técnicas

## Uso prático

- Use `docs/reading-paths.md` para escolher o conjunto mínimo de documentos por perfil.
- Use `docs/modules/<modulo>/reading-paths.md` quando a tarefa estiver restrita a um módulo específico.
- Para qualquer alteração em um módulo, leia primeiro o `README.md` do próprio módulo e depois os arquivos indicados pelo reading path.
- Use `docs/modules/new-module-process.md` quando estiver criando ou ampliando um módulo novo com base em escopo e stack.
- Use `docs/modules/module-template.md` como base de preenchimento para a primeira versão de um módulo novo.
