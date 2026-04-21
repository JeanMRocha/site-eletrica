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
- Estudos elétricos
- Modelo eletrico da instalacao
- Normas e criterios tecnicos
- Cálculos e dimensionamento
- Conformidade normativa e legal
- Sugestão de rota de instalação
- Estimativas de materiais e mão de obra
- Explicação tecnica e memoria de decisao
- Relatórios técnicos
- Catalogos, tabelas e conhecimento de apoio
- MVP técnico mínimo detalhado em `docs/mvp.md`
- Fase 1 de implementação detalhada em `docs/phase-1-plan.md`

### Domínio elétrico

- Modelo de projeto com ambientes, cargas, circuitos, condutores, proteção e quadros
- Regras de dimensionamento por tipo de circuito
- Fórmulas e critérios técnicos versionados
- Aderência a normas como base de validação, não como centro do modelo
- Camada de conformidade separada do motor de cálculo
- Conferência e revisão dos resultados
- Histórico de alterações em cálculos
- Exportação de memorial ou relatório técnico
- Versão do catalogo de conformidade e versão das regras

### Conformidade e explicação

- Cadastro de fontes normativas e legais
- Regras computaveis derivadas das fontes
- Explicacao de por que a solucao foi aceita ou rejeitada
- Sinalizacao de pendencia humana quando a regra automatica nao fecha

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
- Versionamento, auditoria e trilha de revisao

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
- Critério de conclusão: o sistema salva o projeto e exibe o resultado no navegador.
- Observações: a UI apenas coleta e apresenta; a regra de cálculo fica no backend.

### Conformidade de um circuito

- Objetivo: validar o resultado tecnico contra as regras cadastradas.
- Descrição: consumir a saida do motor de calculo e responder com status, severidade, regra aplicada e recomendacao.
- Prioridade: alta
- Dependências: modelo eletrico, catalogo de fontes e regras computaveis.
- Critério de conclusão: o sistema identifica conformidade, nao conformidade ou revisao humana.
- Observações: a camada de conformidade nao substitui o motor de cálculo.

### Sugestão de rota e orçamento

- Objetivo: comparar caminhos de instalação e custo estimado do projeto.
- Descrição: analisar áreas e distâncias, sugerir rota, estimar materiais, tempo e custo.
- Prioridade: média
- Dependências: projeto, cálculo base e catálogo técnico.
- Critério de conclusão: o sistema oferece alternativas e um resumo de orçamento revisável.
- Observações: a decisão final continua humana.

## Status

- A prioridade do MVP está detalhada em `docs/mvp.md` e a primeira fase de implementação em `docs/phase-1-plan.md`.
