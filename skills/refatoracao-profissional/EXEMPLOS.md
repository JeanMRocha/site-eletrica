# Exemplos de Refatoração Profissional

## Exemplo 1: Extração de Lógica de UI (Hook Pattern)

**Antes:**
Um componente React com 500 linhas contendo `useState`, `useEffect` e o JSX do formulário.
Violação: SRP (Single Responsibility Principle).

**Depois:**
1. Criado `useClientes.ts` com toda a lógica de estado e efeitos.
2. `ClientesFeature.tsx` apenas consome o hook e renderiza o JSX.
Resultado: Componentes mais testáveis e fáceis de ler.

## Exemplo 2: Padrão Repository (Abstração de Persistência)

**Antes:**
Funções de domínio chamando `localStorage` diretamente.
Violação: DIP (Dependency Inversion Principle).

**Depois:**
1. Definida interface `ProjectRepository`.
2. Criada implementação `LocalStorageProjectRepository`.
3. UI depende da interface através de um factory.
Resultado: Fácil troca para Supabase ou Backend API no futuro.

## Exemplo 3: Validação e Máscara Centralizada

**Antes:**
Lógica de máscara de CEP espalhada pelo `onChange`.

**Depois:**
Função pura `maskCep` criada fora do componente.
Resultado: Lógica reutilizável e fácil de testar unitariamente.
