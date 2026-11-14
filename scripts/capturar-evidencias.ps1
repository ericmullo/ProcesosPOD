$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$evidence = Join-Path $root 'evidencias'
New-Item -ItemType Directory -Force -Path $evidence | Out-Null

kubectl rollout status deployment/grafana --timeout=300s
if ($LASTEXITCODE -ne 0) { throw 'El Deployment no alcanzó el estado listo.' }

kubectl get deployment,replicaset,pods,service -o wide |
    Out-File -Encoding utf8 (Join-Path $evidence 'recursos.txt')
if ($LASTEXITCODE -ne 0) { throw 'No se pudo consultar el estado de Kubernetes.' }

kubectl describe deployment grafana |
    Out-File -Encoding utf8 (Join-Path $evidence 'deployment.txt')
if ($LASTEXITCODE -ne 0) { throw 'No se pudo describir el Deployment.' }

$job = Start-Job -ScriptBlock {
    kubectl port-forward service/grafana 3000:3000
}
try {
    $health = $null
    for ($attempt = 0; $attempt -lt 20; $attempt++) {
        Start-Sleep -Seconds 1
        try {
            $health = Invoke-WebRequest -Uri 'http://127.0.0.1:3000/api/health' -UseBasicParsing -TimeoutSec 2
            break
        } catch { }
    }
    if ($null -eq $health) { throw 'Grafana no respondió en localhost:3000.' }
    "HTTP $($health.StatusCode)`n$($health.Content)" |
        Out-File -Encoding utf8 (Join-Path $evidence 'salud-http.txt')
} finally {
    Stop-Job $job -ErrorAction SilentlyContinue
    Remove-Job $job -Force -ErrorAction SilentlyContinue
}

Write-Host 'Evidencias de texto guardadas en evidencias/. Capture además las tres pantallas indicadas en INFORME.md.'
