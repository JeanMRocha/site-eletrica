# Regra de Desacoplamento

> Status: stable
> Type: principles
> Last updated: 2026-04-21
> Owner: platform

## Objetivo

Definir como módulos, telas, componentes, comportamentos e layout global devem nascer separados para permitir reaproveitamento, troca e expansão sem reescrita ampla.

## Regra central

- Cada módulo deve resolver uma única responsabilidade de domínio.
- Cada tela deve consolidar estado e decisão, não virar cadastro bruto por padrão.
- Cada componente deve receber dados por contrato explícito e não depender do contexto global além do necessário.
- Layout global, navegação, comportamento e domínio precisam evoluir de forma independente.
- Se uma peça puder ser reaproveitada em mais de um fluxo, ela deve nascer desacoplada desde a primeira versão.

## Camadas

### 1. Layout global

Responsável por:

- barra superior
- navegação principal
- identidade visual
- shell responsivo
- slots de conteúdo

Não é responsável por:

- regras de domínio
- fluxo de cálculo
- persistência
- controle de estado específico de um módulo

### 2. Tela de consolidação

Responsável por:

- sumarizar o estado do domínio
- indicar próximo passo
- expor ações secundárias
- mostrar resultados consolidados e status

Não é responsável por:

- formulário bruto como fluxo principal
- regras técnicas do cálculo
- persistência direta

### 3. Componente reutilizável

Responsável por:

- renderizar um bloco visual ou funcional isolado
- aceitar props ou contrato de dados explícito
- permanecer previsível e fácil de testar

Não é responsável por:

- buscar dados sozinho sem necessidade
- conhecer estado global desnecessário
- embutir regra de negócio

### 4. Módulo de domínio

Responsável por:

- regra técnica
- contrato de entrada e saída
- persistência do próprio agregado
- testes do comportamento do domínio

Não é responsável por:

- layout
- navegação
- exibição superficial

## Divisão de responsabilidade

### Frontend

- `layout`: shell, navegação, topo, ações globais
- `tabs`: consolidação por área
- `panels`: blocos de resumo e conferência
- `forms`: ações secundárias, nunca a home
- `state`: seleção de aba, seleção de item, sessão simulada

### Backend

- `projects`: ciclo de vida do projeto
- `standards`: catálogo, hierarquia, versões, precedência
- `calculations`: motor de dimensionamento
- `conformidade`: validação do resultado técnico
- `reports`: consolidação textual e rastreável
- `core`: contratos compartilhados

## Contratos mínimos

### Tela

Toda tela deve expor:

- objetivo
- dados que consome
- ações primárias
- ações secundárias
- dependências externas

### Componente

Todo componente deve expor:

- props de entrada
- eventos de saída
- estado local mínimo
- ausência de dependência oculta

### Módulo

Todo módulo deve expor:

- responsabilidade única
- contrato público
- estado vigente
- dependências permitidas
- fronteiras explícitas

## Regra de interface

- A home é sempre consolidação geral.
- Cadastros entram como ações secundárias ou fluxos internos de uma aba, nunca como tela principal do menu.
- Se existir tela de detalhe ou edição, ela deve ser aberta a partir da consolidação.
- Se uma tela estiver longa demais, ela deve ser quebrada em painéis ou subabas.

## Regra de comportamento

- Comportamentos compartilhados devem ser centralizados em um contrato comum.
- Componentes de navegação, identidade e feedback devem ser reaproveitáveis.
- O layout global não deve conhecer detalhes do domínio.
- O domínio não deve conhecer o layout global.

## Regra prática

- Se duas áreas precisam da mesma estrutura, extraia um contrato antes de duplicar.
- Se um componente cresce demais, extraia subcomponentes com responsabilidade única.
- Se uma tela mistura resumo, cadastro e cálculo, separe em consolidação e ação secundária.
- Se o contrato não estiver claro, o componente ainda não está pronto para reaproveitamento.
