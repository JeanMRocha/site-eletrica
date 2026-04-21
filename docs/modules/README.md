# Modules

> Status: stable
> Type: index
> Last updated: 2026-04-21
> Owner: repository

Camada de documentação por módulo. Use esta pasta para concentrar regras, contratos, testes e histórico de cada area funcional.

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
- `projects`: cadastro e organização de estudos eletricos
- `standards`: catalogo de normas, fontes e critérios tecnicos
- `calculations`: dimensionamento e regras tecnicas
- `conformidade`: validacao normativa, legal e tecnica do modelo eletrico
- `routing`: sugestao de caminhos e alternativas de instalacao
- `estimations`: materiais, mao de obra, equipamentos, tempo e custos
- `reports`: memoria tecnica, relatorios e saida consolidada
- `knowledge`: glossario, ajuda e explicacoes tecnicas
- `core`: contratos compartilhados, formulas, unidades, versionamento e auditoria

## Modulos em modelagem

- `ambientes`: ambientes, areas e contexto de uso
- `cargas`: cargas, demanda e classificacao
- `circuitos`: segmentacao e agrupamento de circuitos
- `condutores`: seccao, metodo de instalacao e queda de tensao
- `protecao`: disjuntores, DR, DPS e compatibilidades basicas

## Papel dos blocos principais

- `standards` guarda a fonte catalogada e versionada.
- `calculations` produz o resultado tecnico do modelo.
- `conformidade` recebe o resultado calculado e decide se atende, nao atende, exige revisao ou esta incompleto.
- `knowledge` explica o dominio e reduz ambiguidade de uso.
- `core` sustenta os contratos e primitivas compartilhadas entre modulos.

## Uso prático

- Use `docs/reading-paths.md` para escolher o conjunto mínimo de documentos por perfil.
- Use `docs/modules/<modulo>/reading-paths.md` quando a tarefa estiver restrita a um módulo específico.
- Para qualquer alteração em um módulo, leia primeiro o `README.md` do próprio módulo e depois os arquivos indicados pelo reading path.
- Use `docs/modules/new-module-process.md` quando estiver criando ou ampliando um módulo novo com base em escopo e stack.
- Use `docs/modules/module-template.md` como base de preenchimento para a primeira versão de um módulo novo.
