# Regras do Agente

> Status: active
> Type: rules
> Last updated: 2026-04-20
> Owner: repository

Este arquivo complementa `AGENTS.md` e `.agent` com regras práticas de idioma e consistência para a base.

## Idioma da interface

- Toda interface de usuário deve estar em `pt-BR`.
- Isso inclui textos de telas, botões, rótulos, mensagens, títulos, toasts, modais, validações e erros exibidos ao operador.
- Quando houver texto para o usuário final, prefira uma redação natural em português do Brasil.

## Idioma do código

- Todo código deve usar inglês internacional.
- Isso inclui nomes de variáveis, funções, classes, componentes, arquivos técnicos, constantes, testes, branches e mensagens de commit.
- Comentários no código também devem ser em inglês, curtos e apenas quando acrescentarem contexto real.

## Separação de responsabilidades

- A camada de UI traduz e apresenta texto ao usuário.
- A lógica de negócio permanece em inglês no backend e no domínio.
- Não misture português e inglês no mesmo identificador técnico.
- Se um texto for visível ao usuário, ele deve ser tratado como conteúdo de interface, não como detalhe interno do domínio.

## Consistência

- Use nomes descritivos e padronizados.
- Evite abreviações locais ou siglas sem necessidade.
- Quando houver dúvida, mantenha o domínio técnico em inglês e o conteúdo da experiência do usuário em `pt-BR`.

## Escopo de leitura e testes

- Leia apenas a documentação global mínima e a documentação do módulo afetado quando a alteração for local.
- Leia `docs/adr/README.md` quando a alteração tiver decisão arquitetural relevante.
- Leia `docs/modules/<modulo>/adr/README.md` quando a alteração tiver decisão específica do módulo.
- Leia `current-state.md` antes de criar um novo ADR para entender o que já está vigente.
- Se a alteração tocar um módulo específico, execute primeiro os testes desse módulo.
- Se a alteração tocar auth, trate o módulo como crítico e aplique gates mais rígidos.
- Antes do commit ou PR, execute a suíte completa do repositório.

## Prioridade

- Se houver conflito entre um identificador técnico e um texto exibido na interface, a interface deve prevalecer em `pt-BR`.
- Se houver conflito entre documentação técnica e regras de produto, siga a arquitetura e os princípios já definidos nos documentos do repositório.
