# Auth Rules

> Status: draft
> Type: rules
> Last updated: 2026-04-20
> Owner: security

Regras específicas para o módulo de autenticação.

## Regras obrigatórias

- Falhar fechado quando houver dúvida.
- Tratar autorização como decisão explícita da API.
- Manter tokens, sessões e credenciais com validade curta sempre que possível.
- Registrar eventos de segurança relevantes.
- Evitar expor detalhes internos em mensagens de erro.
- Preferir operações idempotentes para revogação e logout.

## Regras de implementação

- Não duplicar regra de negócio de auth na UI.
- Não confiar apenas em validação no frontend.
- Não misturar autenticação com lógica de domínio não relacionada.
- Manter nomes e contratos em inglês técnico.

## Critério de alteração

- Qualquer mudança em auth deve atualizar testes, contratos e documentação de segurança quando aplicável.
