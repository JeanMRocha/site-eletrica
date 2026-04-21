# Nodes Active Plan

> Status: active
> Type: plan
> Last updated: 2026-04-21
> Owner: platform

## Objetivo

- Fechar o primeiro conector SSH do módulo `nodes`.
- Preparar inventário operacional mínimo e caminho para heartbeat.
- Permitir probe real da VPS principal via variáveis do ambiente.

## Tarefas

- Validar o probe SSH com configuração segura.
- Expor o inventário operacional da VPS principal na API.
- Ler `SSH_HOST`, `SSH_PORT`, `SSH_USER`, `SSH_PRIVATE_KEY_PATH` e `SSH_KNOWN_HOSTS_PATH` do `.env`.
- Criar persistência básica de nós.
- Criar heartbeat e última comunicação.
- Expôr estado do nó para a API.
