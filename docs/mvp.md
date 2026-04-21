# MVP Técnico

> Status: active
> Type: roadmap
> Last updated: 2026-04-21
> Owner: repository

Escopo mínimo para transformar o problema do produto em um sistema útil, sem excesso de automação ou complexidade prematura.

## Objetivo

- Entregar uma base web funcional para engenharia elétrica.
- Permitir autenticação, criação de projetos e execução de cálculos básicos.
- Persistir entradas, resultados e histórico para revisão posterior.

## Obrigatório

### 1. Autenticação

- Login seguro.
- Sessão e autorização.
- Registro de eventos de acesso.

### 2. Projetos elétricos

- Criar e listar projetos.
- Registrar dados do contexto técnico.
- Vincular cada cálculo a um projeto.

### 3. Cálculos e dimensionamento

- Executar cálculos elétricos básicos.
- Expor entradas, regras aplicadas e resultados.
- Guardar histórico das execuções.

### 4. Persistência

- Salvar usuários, projetos e cálculos.
- Recuperar o estado salvo para edição ou consulta.

### 5. Interface web

- Exibir formulário de entrada.
- Exibir resultados de cálculo de forma clara.
- Permitir navegação simples entre projetos e resultados.

## Opcional no começo

- Bibliotecas de catálogos elétricos mais amplas.
- Exportação em PDF.
- Comparação entre cenários.
- Relatórios avançados.
- Aprovações adicionais para fluxos sensíveis.

## Arquitetura ideal para este caso

- API em `Go` como fonte de verdade.
- UI em `vinext` apenas como camada de experiência.
- Persistência em `PostgreSQL`.
- Regras de dimensionamento em serviços de domínio no backend.
- Frontend apenas coleta dados e apresenta resultados.

## Prioridade de construção

1. Autenticação
2. Projetos elétricos
3. Cálculos e dimensionamento
4. Persistência e histórico
5. Interface web de consulta e edição

## Critério de sucesso

- Eu consigo entrar na aplicação com autenticação.
- Eu consigo criar um projeto elétrico.
- Eu consigo executar e salvar pelo menos um cálculo.
- Eu consigo revisar o resultado no navegador.
- Eu consigo manter as regras principais no backend.

## Regra prática

- Se algo não ajuda a apoiar cálculo, rastreabilidade ou revisão técnica, ele não entra no MVP.
- Se uma automação puder aumentar o risco de erro técnico, ela fica para depois.
- Se um recurso não melhorar a confiança no cálculo ou a usabilidade da entrada de dados, ele fica fora da fase inicial.
