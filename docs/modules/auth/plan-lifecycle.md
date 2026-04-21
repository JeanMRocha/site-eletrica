# Auth Plan Lifecycle

> Status: stable
> Type: plan
> Last updated: 2026-04-20
> Owner: security

Política de ciclo de vida para documentos de plano do módulo `auth`.

## Status

- `active`: plano em execução.
- `paused`: plano bloqueado ou suspenso temporariamente.
- `completed`: plano concluído.

## Rule

- Mantenha apenas um `active` para o módulo `auth` quando houver execução corrente.
- Se o trabalho mudar de foco, atualize o plano vigente ou crie um novo plano e marque o anterior como `completed` ou `paused`.
- Não mantenha planos antigos como documentos vivos sem necessidade.
- Se o plano não descreve mais trabalho real, mova o conteúdo útil para `changelog.md`, `current-state.md` ou archive do módulo.

## Review criteria

- O plano ainda representa trabalho em andamento?
- O plano foi substituído por outro mais atual?
- O trabalho pode ser resumido apenas em changelog e current-state?
