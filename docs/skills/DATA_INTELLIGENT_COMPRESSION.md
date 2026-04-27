# SKILL: DATA_INTELLIGENT_COMPRESSION

## 1. Objetivo
Implementar uma camada de compressão inteligente baseada em padrões de dados para reduzir tráfego, deduplicar informações e otimizar custos de storage e processamento.

## 2. Conceito Operacional
Baseado em três pilares fundamentais:
- **Dicionário Global (.cromdb)**: Base de conhecimento de dados recorrentes (termos técnicos elétricos, normas NBR).
- **Chunking Inteligente**: Divisão de dados em blocos reutilizáveis, identificando padrões em JSON e logs.
- **Referenciação (CAS)**: Uso de IDs/hashes para reconstrução de conteúdo em vez de envio de dados completos.

## 3. Implementação no Projeto
- **Backend (Go)**: Localizado em `internal/compression/`. Inclui motor de compressão e dicionário técnico.
- **Middleware**: Intercepta payloads > 1KB e aplica a compressão se o cabeçalho `Accept: application/x-crom` estiver presente.
- **Frontend (React)**: Camada de transporte preparada para lidar com payloads `.crom`.

## 4. Regras de Ativação
- Payload > 1KB.
- Dados estruturados (JSON, logs, texto).
- Repetição frequente de conteúdo técnico.

## 5. Manutenção do Dicionário
O dicionário técnico deve ser atualizado em `internal/compression/dictionary/dictionary.go` sempre que novos padrões recorrentes de engenharia forem identificados.
