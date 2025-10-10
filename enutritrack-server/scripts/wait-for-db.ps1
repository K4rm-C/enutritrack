# scripts/wait-for-db.ps1 - Versión MEJORADA con parámetros

param(
    [int]$MaxAttempts = 30,
    [int]$DelaySeconds = 10
)

Write-Host "=== VERIFICANDO SERVICIOS DE BASE DE DATOS ===" -ForegroundColor Green
Write-Host "Este script verifica que los servicios DENTRO de los contenedores estén listos" -ForegroundColor Yellow
Write-Host "Tiempo máximo de espera: $($MaxAttempts * $DelaySeconds) segundos`n" -ForegroundColor Gray

function Test-ContainerService {
    param($ContainerName, $TestScript)
    
    try {
        $result = docker exec $ContainerName $TestScript 2>$null
        return $result -eq $true -or $result -like "*accepting*" -or $result -eq "PONG"
    } catch {
        return $false
    }
}

# Configuración de pruebas por servicio
$services = @(
    @{
        Name = "PostgreSQL"
        Container = "enutritrack_postgres"
        Test = "pg_isready -U postgres"
        Ready = $false
    },
    @{
        Name = "Redis"
        Container = "enutritrack_redis" 
        Test = "redis-cli -a redispassword ping"
        Ready = $false
    },
    @{
        Name = "Couchbase HTTP"
        Container = "enutritrack_couchbase"
        Test = "curl -s http://localhost:8091 > /dev/null && echo true"
        Ready = $false
    },
    @{
        Name = "Couchbase Bucket"
        Container = "enutritrack_couchbase"
        Test = "curl -s -u Alfredo:alfredo124$$ http://localhost:8091/pools/default/buckets/enutritrack-bucket | grep -q healthy && echo true"
        Ready = $false
    }
)

# Bucle principal de verificación
$attempt = 1
$allReady = $false

do {
    Write-Host "Intento $attempt de $MaxAttempts..." -ForegroundColor Yellow
    
    # Verificar cada servicio
    foreach ($service in $services) {
        if (-not $service.Ready) {
            $service.Ready = Test-ContainerService -ContainerName $service.Container -TestScript $service.Test
            Write-Host "  $($service.Name): $(if ($service.Ready) { '✓ LISTO' } else { '⏳ ESPERANDO...' })" -ForegroundColor $(if ($service.Ready) { 'Green' } else { 'Yellow' })
        }
    }
    
    # Verificar si todos están listos
    $allReady = ($services | Where-Object { $_.Ready }).Count -eq $services.Count
    
    if ($allReady) {
        Write-Host "`n✅ TODOS LOS SERVICIOS ESTÁN LISTOS!" -ForegroundColor Green
        break
    }
    
    if ($attempt -ge $MaxAttempts) {
        Write-Host "`n⚠ TIEMPO DE ESPERA AGOTADO" -ForegroundColor Red
        Write-Host "Servicios listos: $(($services | Where-Object { $_.Ready }).Count)/$($services.Count)" -ForegroundColor Yellow
        break
    }
    
    Write-Host "Esperando $DelaySeconds segundos...`n"
    Start-Sleep -Seconds $DelaySeconds
    $attempt++
} while (-not $allReady)

# Estado final detallado
Write-Host "`n--- ESTADO DETALLADO ---" -ForegroundColor Cyan
foreach ($service in $services) {
    $status = if ($service.Ready) { "✓ LISTO" } else { "✗ NO LISTO" }
    $color = if ($service.Ready) { "Green" } else { "Red" }
    Write-Host "  $($service.Name): $status" -ForegroundColor $color
}

# Código de salida: 0 si todo bien, 1 si hay servicios no listos
if (-not $allReady) {
    exit 1
}

exit 0