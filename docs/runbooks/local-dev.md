# Execução local do MVP

> Status: stable
> Type: runbook
> Last updated: 2026-04-21
> Owner: repository

Este runbook registra o fluxo canônico para subir o MVP local sem abrir janela visível do console.

## Objetivo

Subir:

- API Go em `http://127.0.0.1:8080`
- interface web Vite em `http://127.0.0.1:5173`
- persistência local em SQLite no arquivo configurado em `DATABASE_PATH`

## Pré-requisitos

- Go instalado
- Node.js instalado
- dependências do front instaladas em `web/node_modules`
- banco local permitido pelo `.env`

## Comando padrão

```powershell
.\scripts\dev.ps1
```

O script:

- encerra processos antigos nas portas `8080` e `5173`
- inicia API e front em background
- grava logs em `data/api.out.log`, `data/api.err.log`, `data/web.out.log` e `data/web.err.log`
- espera as duas URLs responderem antes de retornar sucesso

## Verificação

```powershell
.\scripts\dev.ps1 -Status
```

Respostas esperadas:

- API com `api_ok = True`
- front com `web_ok = True`

## Parada

```powershell
.\scripts\dev.ps1 -Stop
```

## Primeira validação funcional

Após subir o ambiente:

- abrir `http://127.0.0.1:5173`
- criar um projeto
- abrir o detalhe do projeto
- executar uma avaliação de conformidade
- confirmar que o histórico aparece após salvar

## Falhas comuns

- `npm.cmd` sem `node_modules`: rodar `npm install` dentro de `web/`
- API não responde: revisar `data/api.err.log`
- front não responde: revisar `data/web.err.log`
- porta ocupada por processo antigo: usar `.\scripts\dev.ps1 -Stop` e iniciar de novo
