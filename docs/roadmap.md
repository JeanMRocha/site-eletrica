# Roadmap

> Status: active
> Type: roadmap
> Last updated: 2026-04-21
> Owner: repository

Roadmap de alto nível para expandir o produto além do núcleo atual. O objetivo é registrar iniciativas amplas, não tarefas finas.

## Como usar

- Registre iniciativas amplas que ainda não viraram tarefa imediata.
- Mantenha descrições curtas, mas específicas.
- Separe o que é ideia, o que é prioridade e o que depende de decisão.

## Sugestão de seções

### Base do produto

- Identidade e autenticação
- Projetos elétricos
- Cálculos e dimensionamento
- Catálogos e tabelas de apoio
- MVP técnico mínimo detalhado em `docs/mvp.md`
- Fase 1 de implementação detalhada em `docs/phase-1-plan.md`

### Domínio elétrico

- Regras de dimensionamento por tipo de circuito
- Fórmulas e critérios técnicos versionados
- Conferência e revisão dos resultados
- Histórico de alterações em cálculos
- Exportação de memorial ou relatório técnico

### Web e experiência

- Telas principais da aplicação
- Componentes reutilizáveis da UI
- Padronização visual e textual em `pt-BR`
- Fluxo de entrada e revisão de dados

### Plataforma e entrega

- Dockerfiles por serviço
- Variáveis de ambiente e segredos
- Configuração de dev, staging e produção
- Banco de dados e migrações

## Modelo de item

```md
### Nome da iniciativa

- Objetivo: ...
- Descrição: ...
- Prioridade: alta | média | baixa
- Dependências: ...
- Critério de conclusão: ...
- Observações: ...
```

## Exemplo de item

### Cálculo de corrente e condutores

- Objetivo: executar o primeiro fluxo técnico do produto com dados persistidos.
- Descrição: definir entradas, validações, fórmula aplicada e persistência do resultado.
- Prioridade: alta
- Dependências: autenticação, modelagem de banco e endpoints da API.
- Critério de conclusão: o sistema salva o estudo e exibe o resultado no navegador.
- Observações: a UI apenas coleta e apresenta; a regra de cálculo fica no backend.

## Status

- A prioridade do MVP está detalhada em `docs/mvp.md` e a primeira fase de implementação em `docs/phase-1-plan.md`.
