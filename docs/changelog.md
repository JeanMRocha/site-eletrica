# Histórico de Mudanças

> Status: active
> Type: history
> Last updated: 2026-04-21
> Owner: repository

Registro cronológico das mudanças relevantes no repositório.

## Formato sugerido

- Data: `AAAA-MM-DD`
- Mudança: descrição objetiva do que foi alterado
- Motivo: por que a mudança foi feita
- Impacto: efeito prático para a base, a API ou a UI
- Arquivos: principais arquivos afetados

## Modelo de entrada

```md
### AAAA-MM-DD

- Mudança: ...
- Motivo: ...
- Impacto: ...
- Arquivos: `arquivo-1`, `arquivo-2`
```

## Entradas

### 2026-04-21

- Mudança: formalizada a convenção de segredos locais em `.secrets/ssh/`, com o `.env` contendo apenas caminhos para arquivos de chave e `known_hosts`.
- Motivo: evitar que chaves SSH ou outros segredos caiam no Git e deixar o fluxo de operação mais claro.
- Impacto: a raiz do projeto e a governança agora apontam explicitamente para a pasta local de segredos como padrão operacional.
- Arquivos: `README.md`, `docs/governance.md`, `.gitignore`, `.secrets/ssh/.gitkeep`, `.env`, `.env.example`

### 2026-04-21

- Mudança: o módulo `nodes` passou a ler a VPS principal do `.env` e a expor um probe operacional configurado por ambiente.
- Motivo: permitir a primeira tentativa real de conexão com a VPS principal usando a configuração local de SSH.
- Impacto: o inventário do node principal e a rota de probe agora seguem a configuração do ambiente sem exigir payload manual.
- Arquivos: `cmd/api/main.go`, `internal/nodes/*`, `.env.example`, `docs/modules/nodes/current-state.md`, `docs/modules/nodes/active-plan.md`, `docs/modules/nodes/contracts.md`

### 2026-04-21

- Mudança: transformado o snapshot da VPS principal em inventário operacional no módulo `nodes`, com leitura exposta pela API.
- Motivo: sair do registro documental e tornar o node principal consultável no sistema.
- Impacto: o módulo `nodes` passou a ter um inventário vivo da VPS principal, ligado ao entrypoint da API e pronto para evoluir para probe manual e heartbeat.
- Arquivos: `internal/nodes/*`, `cmd/api/main.go`, `docs/modules/nodes/*`, `docs/active-plan.md`, `docs/phase-1-plan.md`

### 2026-04-21

- Mudança: documentado o snapshot operacional da VPS principal com hostname, IP, plano, recursos, renovação e usuário SSH atual.
- Motivo: registrar o inventário real da primeira VPS para orientar o módulo `nodes` e a operação inicial.
- Impacto: a documentação passou a refletir o estado atual da máquina principal e o ponto de atenção de segurança do acesso SSH em `root`.
- Arquivos: `docs/product-overview.md`, `docs/architecture.md`, `docs/modules/nodes/current-state.md`, `docs/modules/nodes/contracts.md`

### 2026-04-21

- Mudança: criada a base do módulo `nodes` com conector SSH, probe de inventário mínimo e documentação inicial do módulo.
- Motivo: iniciar o canal padrão de controle remoto da primeira VPS e deixar o módulo pronto para evoluir em inventário e heartbeat.
- Impacto: o repositório passou a ter a primeira espinha dorsal de controle remoto para a VPS principal, separada da camada de telemetria futura.
- Arquivos: `internal/nodes/*`, `docs/modules/nodes/*`, `docs/active-plan.md`, `docs/phase-1-plan.md`

### 2026-04-21

- Mudança: formalizado SSH como canal padrão de controle remoto, com provider APIs e outros mecanismos tratados como adapters opcionais.
- Motivo: garantir controle portátil e auditável sobre as VPS sem prender o sistema a um provedor específico.
- Impacto: a documentação de arquitetura, produto, stack, MVP, fase 1 e inicialização do projeto passou a refletir SSH como padrão.
- Arquivos: `README.md`, `.env.example`, `.env`, `docs/adr/0003-ssh-primary-control-channel.md`, `docs/adr/README.md`, `docs/architecture.md`, `docs/product-overview.md`, `docs/stack.md`, `docs/mvp.md`, `docs/phase-1-plan.md`, `docs/roadmap.md`, `docs/modules/new-module-process.md`, `docs/modules/module-template.md`

### 2026-04-21

- Mudança: iniciada a primeira implementação funcional do projeto com a espinha dorsal do módulo `auth` em Go, serviço em memória, handlers HTTP e testes.
- Motivo: sair da fase de documentação e começar a execução real da fase 1.
- Impacto: o repositório passou a conter código executável e testes para o primeiro módulo da plataforma.
- Arquivos: `go.mod`, `cmd/api/main.go`, `internal/auth/*`, `docs/active-plan.md`, `docs/phase-1-plan.md`, `docs/modules/auth/active-plan.md`, `docs/modules/auth/current-state.md`, `docs/modules/auth/changelog.md`

### 2026-04-21

- Mudança: detalhada a fase 1 em tarefas por módulo dentro de `docs/phase-1-plan.md` e conectado o plano ativo global a essa decomposição.
- Motivo: transformar a primeira fase em trabalho executável com sequência clara de módulos e tarefas.
- Impacto: o plano passou a orientar implementação real por módulo, não apenas o escopo geral.
- Arquivos: `docs/phase-1-plan.md`, `docs/active-plan.md`

### 2026-04-21

- Mudança: criado `docs/phase-1-plan.md` e atualizado `docs/active-plan.md` para acompanhar a primeira fase de implementação por módulo.
- Motivo: transformar o MVP em um plano executável com sequência clara de módulos e critérios de conclusão.
- Impacto: o projeto passou a ter um plano ativo de implementação, não apenas um roadmap conceitual.
- Arquivos: `docs/phase-1-plan.md`, `docs/active-plan.md`, `docs/README.md`, `docs/roadmap.md`

### 2026-04-21

- Mudança: criado `docs/mvp.md` para definir o MVP técnico mínimo, separar obrigatório de opcional e registrar a arquitetura ideal para o problema do projeto.
- Motivo: transformar a análise técnica em uma referência prática para decidir o que construir primeiro.
- Impacto: o projeto passou a ter uma linha de corte clara entre o que é essencial para iniciar e o que pode ficar para fases futuras.
- Arquivos: `docs/mvp.md`, `docs/README.md`, `docs/product-overview.md`, `docs/roadmap.md`

### 2026-04-20

- Mudança: incorporado o contexto operacional real do projeto em `docs/product-overview.md` e `docs/architecture.md`, incluindo a VPS principal, a VPS Oracle de monitoramento e a VPS local de suporte.
- Motivo: refletir o cenário real em que o painel administrativo vai operar antes de começar a implementação.
- Impacto: a documentação de produto e arquitetura passou a descrever o ambiente real que o sistema vai centralizar e proteger.
- Arquivos: `docs/product-overview.md`, `docs/architecture.md`

### 2026-04-20

- Mudança: criado `docs/modules/module-template.md` para servir como base copiável na primeira versão de qualquer módulo novo e ligado ao processo de evolução de módulos.
- Motivo: acelerar a criação de módulos sem perder o padrão documental já estabelecido.
- Impacto: novos módulos passam a ter um molde inicial claro e um fluxo explícito antes da implementação.
- Arquivos: `docs/modules/module-template.md`, `docs/modules/new-module-process.md`, `docs/modules/README.md`, `docs/README.md`, `docs/governance.md`

### 2026-04-20

- Mudança: ajustado `docs/modules/README.md` para incluir `onboarding.md` como parte esperada da estrutura de módulos em crescimento.
- Motivo: deixar explícito que novos módulos devem ter uma entrada de onboarding quando precisarem de mais contexto de uso.
- Impacto: o índice de módulos passou a reconhecer onboarding como peça normal da evolução documental.
- Arquivos: `docs/modules/README.md`

### 2026-04-20

- Mudança: criado `docs/modules/new-module-process.md` e ligado aos índices centrais para formalizar a evolução de módulos novos a partir de escopo e stack.
- Motivo: garantir que novos módulos comecem pela documentação antes da implementação e sigam a arquitetura já escolhida.
- Impacto: a criação e expansão de módulos passou a ter um fluxo explícito, baseado em produto, stack e governança.
- Arquivos: `docs/modules/new-module-process.md`, `docs/governance.md`, `docs/README.md`, `docs/modules/README.md`

### 2026-04-20

- Mudança: criado `docs/modules/auth/onboarding.md`, enriquecidos os contratos com exemplos reais e códigos de resposta, e explicitada a diferença entre estado vivo e snapshot histórico do `auth`.
- Motivo: fechar o pacote de onboarding do módulo e torná-lo mais útil para quem está começando ou integrando com a API.
- Impacto: o módulo `auth` passou a ter uma porta de entrada mais clara, contratos mais concretos e distinção explícita entre estado atual e histórico.
- Arquivos: `docs/modules/auth/onboarding.md`, `docs/modules/auth/contracts.md`, `docs/modules/auth/README.md`, `docs/modules/auth/current-state.md`

### 2026-04-20

- Mudança: enxugada a seção de regra de ouro de `docs/governance.md` para remover a última repetição já coberta pelos reading paths.
- Motivo: deixar a autoridade central mais concisa e menos operacional.
- Impacto: a governança ficou mais limpa e mais claramente separada dos guias de leitura por perfil.
- Arquivos: `docs/governance.md`

### 2026-04-20

- Mudança: simplificados `AGENTS.md` e `.agent` para funcionarem como pontos de entrada curtos, sem repetir a governança central.
- Motivo: reduzir duplicação entre arquivos raiz e `docs/governance.md`, deixando a leitura inicial do agente mais limpa.
- Impacto: os pontos de entrada ficaram mais enxutos e mais fáceis de manter como ponte para a governança.
- Arquivos: `AGENTS.md`, `.agent`

### 2026-04-20

- Mudança: simplificado `docs/README.md` para funcionar só como índice de entrada, sem repetir a política central de navegação.
- Motivo: reduzir duplicação com `docs/governance.md` e deixar o arquivo raiz mais leve.
- Impacto: o ponto de entrada de `docs/` ficou mais curto e mais fácil de manter sem competir com a governança.
- Arquivos: `docs/README.md`

### 2026-04-20

- Mudança: enxugado `docs/modules/README.md` para reduzir repetição com a governança e deixar o índice de módulos mais direto.
- Motivo: diminuir ruído, manter uma autoridade principal única para navegação e tornar a leitura por módulo mais objetiva.
- Impacto: a pasta de módulos ficou com um índice mais curto e mais fácil de manter sem duplicar a política central.
- Arquivos: `docs/modules/README.md`

### 2026-04-20

- Mudança: enxugada a duplicação entre `docs/modules/auth/README.md` e `docs/modules/auth/reading-paths.md`, deixando o `reading-paths` como referência principal de leitura por escopo no módulo.
- Motivo: reduzir repetição, diminuir risco de drift e tornar a hierarquia documental mais profissional.
- Impacto: o `README` de auth passou a ser um ponto de entrada mais curto, sem repetir a lista mínima de leitura do módulo.
- Arquivos: `docs/modules/auth/README.md`, `docs/modules/auth/reading-paths.md`

### 2026-04-20

- Mudança: centralizada a autoridade de navegação em `docs/governance.md`, formalizada a política de idioma em `docs/agent-rules.md` e `docs/development-principles.md`, e alinhado o índice de `auth` para `stable`.
- Motivo: reduzir duplicação, deixar a leitura por escopo mais clara e tornar a linguagem da documentação mais profissional e previsível.
- Impacto: a navegação por docs passou a ter uma fonte principal explícita, a política de idioma ficou formalizada e o índice de `auth` passou a refletir melhor seu uso real.
- Arquivos: `docs/governance.md`, `docs/reading-paths.md`, `docs/modules/README.md`, `docs/modules/auth/README.md`, `docs/modules/auth/reading-paths.md`, `docs/agent-rules.md`, `docs/development-principles.md`

### 2026-04-20

- Mudança: criado `docs/modules/auth/reading-paths.md` com caminhos mínimos de leitura por tipo de trabalho em auth.
- Motivo: reduzir leitura desnecessária dentro do módulo mais sensível do sistema e deixar o fluxo de navegação mais objetivo.
- Impacto: alterações em auth passam a ter um subconjunto explícito de docs para ler antes de abrir documentação não relacionada.
- Arquivos: `docs/modules/auth/reading-paths.md`, `docs/modules/auth/README.md`, `docs/modules/README.md`

### 2026-04-20

- Mudança: refinado `docs/reading-paths.md` para uma tabela operacional com leitura mínima, opcional e documentos que devem ficar fora do padrão.
- Motivo: tornar o guia mais prático para uso diário e reduzir o risco de abrir documentação desnecessária.
- Impacto: o perfil de leitura ficou mais direto, curto e aplicável na rotina do agente e de colaboradores.
- Arquivos: `docs/reading-paths.md`

### 2026-04-20

- Mudança: criado `docs/reading-paths.md` com mapas de leitura por perfil para novo contribuidor, auth, operação e revisão de arquitetura.
- Motivo: reduzir carga desnecessária de documentação e deixar a navegação mais profissional e orientada ao escopo.
- Impacto: o agente e os colaboradores passam a ter um caminho mínimo de leitura por perfil antes de abrir docs fora do escopo.
- Arquivos: `docs/reading-paths.md`, `docs/README.md`, `docs/governance.md`, `docs/modules/README.md`

### 2026-04-20

- Mudança: reorganizada a documentação para incluir `product-overview.md`, `current-state.md`, runbook de `auth`, matriz de governança e separação entre estado vivo e snapshots de decisão.
- Motivo: reduzir duplicação, melhorar navegação e deixar o docs mais profissional e orientado a uso real.
- Impacto: a documentação passou a ter um fluxo mais claro para leitura, escrita, operação e histórico.
- Arquivos: `docs/product-overview.md`, `docs/current-state.md`, `docs/governance.md`, `docs/README.md`, `docs/modules/README.md`, `docs/modules/auth/README.md`, `docs/modules/auth/current-state.md`, `docs/modules/auth/runbook.md`, `docs/modules/auth/contracts.md`, `docs/adr/current-state.md`, `docs/modules/auth/adr/current-state.md`
