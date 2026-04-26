param(
  [switch]$Stop,
  [switch]$Status
)

$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$apiPort = 8081
$webPort = 5173
$apiLog = Join-Path $root 'data\api.out.log'
$apiErr = Join-Path $root 'data\api.err.log'
$webLog = Join-Path $root 'data\web.out.log'
$webErr = Join-Path $root 'data\web.err.log'

function Get-PortProcessId {
  param([int]$Port)
  Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    Where-Object { $_ -gt 0 }
}

function Stop-PortProcess {
  param([int]$Port)
  $processIds = @(Get-PortProcessId -Port $Port)
  foreach ($processId in $processIds) {
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
  }
}

function Start-HiddenProcess {
  param(
    [string]$FilePath,
    [string]$Arguments,
    [string]$WorkingDirectory,
    [string]$StdOut,
    [string]$StdErr
  )

  New-Item -ItemType File -Force -Path $StdOut, $StdErr | Out-Null
  Start-Process `
    -FilePath $FilePath `
    -ArgumentList $Arguments `
    -WorkingDirectory $WorkingDirectory `
    -WindowStyle Hidden `
    -RedirectStandardOutput $StdOut `
    -RedirectStandardError $StdErr | Out-Null
}

function Wait-Http {
  param(
    [string]$Uri,
    [int]$TimeoutSeconds = 30
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-WebRequest -UseBasicParsing $Uri -TimeoutSec 3
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
        return $true
      }
    } catch {
      Start-Sleep -Milliseconds 500
    }
  }

  return $false
}

function Write-Status {
  $apiPid = Get-PortProcessId -Port $apiPort
  $webPid = Get-PortProcessId -Port $webPort
  [pscustomobject]@{
    api_port = $apiPort
    api_pid  = $apiPid
    web_port = $webPort
    web_pid  = $webPid
    api_ok   = (Wait-Http -Uri "http://127.0.0.1:$apiPort/healthz" -TimeoutSeconds 1)
    web_ok   = (Wait-Http -Uri "http://127.0.0.1:$webPort" -TimeoutSeconds 1)
  } | Format-List
}

if ($Status) {
  Write-Status
  exit 0
}

if ($Stop) {
  Stop-PortProcess -Port $webPort
  Stop-PortProcess -Port $apiPort
  Write-Host 'Processos locais finalizados.'
  exit 0
}

New-Item -ItemType Directory -Force (Join-Path $root 'data') | Out-Null

Stop-PortProcess -Port $webPort
Stop-PortProcess -Port $apiPort

$env:HTTP_ADDR = ":$apiPort"
Start-HiddenProcess -FilePath 'go' -Arguments 'run ./cmd/api' -WorkingDirectory $root -StdOut $apiLog -StdErr $apiErr
Start-HiddenProcess -FilePath 'npm.cmd' -Arguments 'run dev -- --host 127.0.0.1' -WorkingDirectory (Join-Path $root 'web') -StdOut $webLog -StdErr $webErr

$apiReady = Wait-Http -Uri "http://127.0.0.1:$apiPort/healthz" -TimeoutSeconds 45
$webReady = Wait-Http -Uri "http://127.0.0.1:$webPort" -TimeoutSeconds 45

if (-not $apiReady) {
  throw "API nao respondeu em http://127.0.0.1:$apiPort/healthz. Veja $apiErr."
}

if (-not $webReady) {
  throw "Frontend nao respondeu em http://127.0.0.1:$webPort. Veja $webErr."
}

Write-Host 'MVP local ativo.'
Write-Host "API:  http://127.0.0.1:$apiPort"
Write-Host "Web:  http://127.0.0.1:$webPort"
Write-Host "Logs: $apiLog"
Write-Host "Logs: $webLog"
