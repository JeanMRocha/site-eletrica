# Script para gerar o executável Windows (.exe)
$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$webDir = Join-Path $root 'web'

Write-Host "1/3: Instalando dependências do frontend..." -ForegroundColor Cyan
Push-Location $webDir
npm install
Pop-Location

Write-Host "2/3: Gerando build do frontend..." -ForegroundColor Cyan
Push-Location $webDir
npm run build
Pop-Location

Write-Host "3/3: Gerando executável com Wails..." -ForegroundColor Cyan
# Certifique-se que o wails está instalado: go install github.com/wailsapp/wails/v2/cmd/wails@latest
wails build -clean

Write-Host "`nSucesso! Executável gerado em: build\bin\eletrica.exe" -ForegroundColor Green
