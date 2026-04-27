# ADR 001: Persistência Local Offline-First com SQLite

## Contexto
O projeto "Elétrica" precisa de alta performance e disponibilidade em campo (locais de obra) onde a internet pode ser instável. O uso exclusivo de LocalStorage (browser) é limitado em espaço e segurança.

## Decisão
Implementar o **SQLite** como motor de banco de dados nativo no Windows através do Wails, utilizando uma coluna de metadados JSON para flexibilidade de schema.

## Consequências
- **Positivas**: 
    - Funcionamento 100% offline.
    - Suporte a grandes volumes de dados (Projetos complexos).
    - Facilidade de migração futura para PostgreSQL/Supabase.
- **Negativas**:
    - Necessidade de gerenciar a sincronização (conflitos de versão) no futuro.
    - Aumento leve no tamanho do binário do aplicativo.

## Status
**Aceito e Implementado.**
