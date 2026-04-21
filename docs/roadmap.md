# Planejamento Geral

> Status: active
> Type: roadmap
> Last updated: 2026-04-20
> Owner: repository

Mapa de longo prazo com o que ainda não foi feito e o que precisa de ampliação.

## Como usar

- Registre iniciativas amplas que ainda não viraram tarefa imediata.
- Mantenha descrições curtas, mas específicas.
- Separe o que é ideia, o que é prioridade e o que depende de decisão.

## Sugestão de seções

### Base do produto

- Identidade e autenticação
- Inventário de nós e agentes
- Telemetria e heartbeats
- Incidentes e auditoria
- MVP técnico mínimo detalhado em `docs/mvp.md`
- Fase 1 de implementação detalhada em `docs/phase-1-plan.md`

### Operação

- Modelo de alertas
- Fluxos de remediação segura
- Logs e rastreabilidade
- Health checks e verificação de integridade

### Web e experiência

- Telas principais do operador
- Componentes reutilizáveis da UI
- Padronização visual e textual em `pt-BR`

### Plataforma e entrega

- Dockerfiles por serviço
- Variáveis de ambiente e segredos
- Configuração de dev, staging e produção
- Observabilidade e backups

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

### Telemetria e heartbeats

- Objetivo: receber sinais periódicos dos nós e consolidar o estado da infraestrutura.
- Descrição: definir contrato de envio, persistência dos eventos e regras de avaliação de saúde.
- Prioridade: alta
- Dependências: autenticação do agente, modelagem de banco e endpoints da API.
- Critério de conclusão: o sistema registra heartbeats, identifica ausência de sinal e expõe o estado para a UI.
- Observações: a UI apenas consome o resultado; a regra de decisão fica na API.

## Status

- A prioridade do MVP está detalhada em `docs/mvp.md` e a primeira fase de implementação em `docs/phase-1-plan.md`.
