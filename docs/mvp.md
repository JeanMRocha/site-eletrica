# MVP Técnico

> Status: active
> Type: roadmap
> Last updated: 2026-04-21
> Owner: repository

Escopo mínimo para transformar o problema do produto em um sistema útil, sem excesso de automação ou complexidade prematura.

## Objetivo

- Entregar uma base web funcional para engenharia elétrica.
- Permitir autenticação, criação de estudos e execução do primeiro fluxo técnico útil.
- Persistir entradas, resultados e histórico para revisão posterior.
- Deixar a base pronta para o modelo eletrico, normas, conformidade, rotas, estimativas e relatórios sem travar o fluxo.

## Obrigatório

### 1. Autenticação

- Login seguro.
- Sessão e autorização.
- Registro de eventos de acesso.

### 2. Estudos elétricos

- Criar e listar estudos.
- Registrar áreas, ambientes, distâncias, cargas e contexto técnico.
- Vincular cada cálculo a um estudo.
- Estruturar o estudo como modelo eletrico da instalacao.

### 3. Modelo eletrico inicial

- Registrar ambientes, cargas, circuitos, condutores, proteção e quadros.
- Manter referencias que permitam recalcular e validar o modelo.
- Preparar o estudo para a camada de conformidade.

### 4. Normas e critérios

- Registrar qual norma ou critério técnico foi usado no estudo.
- Versionar a regra aplicada para permitir rastreabilidade.
- Manter referência explícita da base normativa do cálculo.

### 5. Cálculos e dimensionamento

- Executar cálculos elétricos básicos.
- Expor entradas, regras aplicadas e resultados.
- Guardar histórico das execuções.

### 6. Conformidade

- Validar a saida do motor de calculo contra fontes e regras versionadas.
- Indicar conforme, nao conforme, incompleto ou revisao humana.
- Registrar a regra aplicada e a justificativa.

### 7. Interface técnica inicial

- Exibir formulário de entrada.
- Exibir resultados de cálculo de forma clara.
- Permitir navegação simples entre estudos e resultados.

### 8. Persistência

- Salvar usuários, estudos e cálculos.
- Recuperar o estado salvo para edição ou consulta.

## Opcional no começo

- Sugestão de caminhos de instalação.
- Bibliotecas de catálogos elétricos mais amplas.
- Estimativas de materiais, mão de obra, equipamentos e tempo.
- Exportação em PDF.
- Comparação entre cenários.
- Relatórios avançados.
- Explicacoes tecnicas detalhadas por regra.
- Aprovações adicionais para fluxos sensíveis.

## Arquitetura ideal para este caso

- API em `Go` como fonte de verdade.
- UI em `Vite + React` para o MVP.
- Persistência em `SQLite` local para o MVP.
- Regras de dimensionamento em serviços de domínio no backend.
- Catalogo de normas, fontes e versoes das regras no backend.
- Camada de conformidade separada do motor de cálculo.
- Sugestão de rotas, estimativas, relatórios e explicações como serviços de domínio, não na UI.
- O frontend inicial apenas coleta dados e apresenta resultados, em um app separado da API.

## Prioridade de construção

1. Autenticação
2. Estudos elétricos
3. Modelo eletrico inicial
4. Normas e critérios
5. Cálculos e dimensionamento
6. Conformidade
7. Interface técnica inicial
8. Persistência e histórico

## Critério de sucesso

- Eu consigo entrar na aplicação com autenticação.
- Eu consigo criar um estudo elétrico.
- Eu consigo modelar a instalação com os dados principais.
- Eu consigo executar e salvar pelo menos um cálculo.
- Eu consigo validar o resultado contra regras versionadas.
- Eu consigo revisar o resultado no navegador.
- Eu consigo manter as regras principais no backend.

## Regra prática

- Se algo não ajuda a apoiar cálculo, rastreabilidade ou revisão técnica, ele não entra no MVP.
- Se uma automação puder aumentar o risco de erro técnico, ela fica para depois.
- Se um recurso não melhorar a confiança no cálculo ou a usabilidade da entrada de dados, ele fica fora da fase inicial.
