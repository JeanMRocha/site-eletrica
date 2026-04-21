# VPS Control

Projeto em fase de planejamento para monitorar, diagnosticar e automatizar a saúde da infraestrutura.

## Status

- Fase atual: planejamento e documentação
- Stack alvo: `vinext` na web, API em `Go`, banco `PostgreSQL`
- Execução: Docker + Coolify
- Infra de apoio: Oracle Free Tier e ambiente local em Proxmox
- Controle remoto padrão: SSH, com outros adaptadores apenas quando necessário
- Segredos locais e chaves SSH devem ficar em [`.secrets/ssh/`](.secrets/ssh/) e nunca no Git; o `.env` só aponta para os caminhos desses arquivos.

## Documentos principais

- [`docs/architecture.md`](docs/architecture.md)
- [`docs/stack.md`](docs/stack.md)
- [`docs/development-principles.md`](docs/development-principles.md)
- [`AGENTS.md`](AGENTS.md)
- [`.agent`](.agent)
