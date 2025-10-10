# scripts/wait-for-db.ps1 - Versión CORREGIDA sin emojis
param(
    [int]$MaxAttempts = 30,
    [int]$DelaySeconds = 10
)

Write-Host "=== VERIFICANDO SERVICIOS DE BASE DE DATOS ===" -ForegroundColor Green
Write-Host "Este script verifica que los servicios DENTRO de los contenedores esten listos" -ForegroundColor Yellow
Write-Host "Tiempo maximo de espera: $($MaxAttempts * $DelaySeconds) segundos`n" -ForegroundColor Gray

function Test-PostgreSQLReady {
    try {
        $result = docker exec enutritrack_postgres pg_isready -U postgres
        return $result -like "*accepting connections*"
    } catch {
        return $false
    }
}

function Test-CouchbaseReady {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8091" -UseBasicParsing -TimeoutSec 10
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

function Test-RedisReady {
    try {
        $result = docker exec enutritrack_redis redis-cli -a redispassword ping
        return $result -eq "PONG"
    } catch {
        return $false
    }
}

function Test-CouchbaseBucket {
    try {
        $auth = "Alfredo:alfredo124$$"
        $encodedAuth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($auth))
        $headers = @{ Authorization = "Basic $encodedAuth" }
        
        $response = Invoke-WebRequest -Uri "http://localhost:8091/pools/default/buckets/enutritrack-bucket" -Headers $headers -UseBasicParsing
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

# Bucle principal de verificacion
$attempt = 1
$allReady = $false

do {
    Write-Host "Intento $attempt de $MaxAttempts..." -ForegroundColor Yellow
    
    $postgresReady = Test-PostgreSQLReady
    $couchbaseReady = Test-CouchbaseReady
    $redisReady = Test-RedisReady
    $couchbaseBucketReady = Test-CouchbaseBucket
    
    Write-Host "  PostgreSQL:   $(if ($postgresReady) { 'LISTO' } else { 'ESPERANDO...' })" -ForegroundColor $(if ($postgresReady) { 'Green' } else { 'Yellow' })
    Write-Host "  Couchbase:    $(if ($couchbaseReady) { 'RESPONDE' } else { 'INICIANDO...' })" -ForegroundColor $(if ($couchbaseReady) { 'Green' } else { 'Yellow' })
    Write-Host "  Redis:        $(if ($redisReady) { 'LISTO' } else { 'ESPERANDO...' })" -ForegroundColor $(if ($redisReady) { 'Green' } else { 'Yellow' })
    Write-Host "  Bucket CB:    $(if ($couchbaseBucketReady) { 'CREADO' } else { 'CREANDO...' })" -ForegroundColor $(if ($couchbaseBucketReady) { 'Green' } else { 'Yellow' })
    
    if ($postgresReady -and $couchbaseReady -and $redisReady -and $couchbaseBucketReady) {
        Write-Host "`n TODOS LOS SERVICIOS ESTAN LISTOS!" -ForegroundColor Green
        $allReady = $true
        break
    }
    
    if ($attempt -ge $MaxAttempts) {
        Write-Host "`n TIEMPO DE ESPERA AGOTADO" -ForegroundColor Red
        Write-Host "Servicios listos: $(($postgresReady, $couchbaseReady, $redisReady, $couchbaseBucketReady | Where-Object { $_ }).Count)/4" -ForegroundColor Yellow
        break
    }
    
    Write-Host "Esperando $DelaySeconds segundos...`n"
    Start-Sleep -Seconds $DelaySeconds
    $attempt++
} while (-not $allReady)

# Estado final detallado
Write-Host "`n--- ESTADO DETALLADO ---" -ForegroundColor Cyan

# PostgreSQL
try {
    $dbCheck = docker exec enutritrack_postgres psql -U postgres -d enutritrack -t -c "SELECT message FROM database_init ORDER BY id DESC LIMIT 1;" 2>$null
    Write-Host "  PostgreSQL: $($dbCheck.Trim())" -ForegroundColor Green
} catch {
    Write-Host "  PostgreSQL: No se pudo verificar" -ForegroundColor Red
}

# Couchbase
if (Test-CouchbaseBucket) {
    Write-Host "  Couchbase: Bucket 'enutritrack-bucket' creado y accesible" -ForegroundColor Green
} else {
    Write-Host "  Couchbase: Problemas con el bucket" -ForegroundColor Red
}

# Redis
if (Test-RedisReady) {
    Write-Host "  Redis: Conectado y respondiendo" -ForegroundColor Green
} else {
    Write-Host "  Redis: No responde" -ForegroundColor Red
}

Write-Host "`n=== INSTRUCCIONES ===" -ForegroundColor White
Write-Host "1. Para ejecutar el backend: npm run start:dev" -ForegroundColor Gray
Write-Host "2. Para ver logs: docker-compose logs -f" -ForegroundColor Gray
Write-Host "3. Para detener: docker-compose down" -ForegroundColor Gray

# Codigo de salida
if (-not $allReady) {
    exit 1
} else {
    exit 0
}