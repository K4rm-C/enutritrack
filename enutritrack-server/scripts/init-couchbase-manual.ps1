# scripts/init-couchbase-manual.ps1 - Versión mejorada con verificaciones

Write-Host "=== INICIALIZACION MANUAL DE COUCHBASE ===" -ForegroundColor Green

$CouchbaseUrl = "http://localhost:8091"
$Username = "Alfredo"
$Password = "alfredo124"
$BucketName = "enutritrack"

# Función para esperar a que Couchbase esté listo
Write-Host "Esperando que Couchbase esté listo..." -ForegroundColor Yellow

$maxAttempts = 30
$attempt = 1
$couchbaseReady = $false

while ($attempt -le $maxAttempts -and -not $couchbaseReady) {
    try {
        $response = Invoke-WebRequest -Uri $CouchbaseUrl -UseBasicParsing -TimeoutSec 10 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "Couchbase está respondiendo" -ForegroundColor Green
            $couchbaseReady = $true
        }
    } catch {
        Write-Host ("Intento {0} de {1}: Couchbase no responde, esperando 10 segundos..." -f $attempt, $maxAttempts) -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        $attempt++
    }
}

if (-not $couchbaseReady) {
    Write-Host ("Couchbase no respondió después de {0} intentos" -f $maxAttempts) -ForegroundColor Red
    exit 1
}

# Inicializar el cluster
Write-Host "Inicializando cluster de Couchbase..." -ForegroundColor Yellow

try {
    # Configurar memoria
    $response = Invoke-WebRequest -Uri ($CouchbaseUrl + "/pools/default") -Method POST -Body "memoryQuota=512&indexMemoryQuota=512" -UseBasicParsing
    Write-Host "Memoria configurada" -ForegroundColor Green
} catch {
    Write-Host "No se pudo configurar memoria (puede que ya esté configurado)" -ForegroundColor Yellow
}

try {
    # Configurar servicios
    $response = Invoke-WebRequest -Uri ($CouchbaseUrl + "/node/controller/setupServices") -Method POST -Body "services=kv,n1ql,index,fts" -UseBasicParsing
    Write-Host "Servicios configurados" -ForegroundColor Green
} catch {
    Write-Host "No se pudo configurar servicios (puede que ya estén configurados)" -ForegroundColor Yellow
}

try {
    # Configurar credenciales
    $response = Invoke-WebRequest -Uri ($CouchbaseUrl + "/settings/web") -Method POST -Body ("port=8091&username=" + $Username + "&password=" + $Password) -UseBasicParsing
    Write-Host "Credenciales configuradas" -ForegroundColor Green
} catch {
    Write-Host "No se pudo configurar credenciales (puede que ya estén configuradas)" -ForegroundColor Yellow
}

# Esperar a que las credenciales estén activas
Write-Host "Esperando que las credenciales se activen..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Verificar que podemos autenticar
$auth = $Username + ":" + $Password
$encodedAuth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($auth))
$headers = @{ Authorization = ("Basic " + $encodedAuth) }

$authAttempts = 10
$authAttempt = 1
$authReady = $false

while ($authAttempt -le $authAttempts -and -not $authReady) {
    try {
        $response = Invoke-WebRequest -Uri ($CouchbaseUrl + "/pools") -Headers $headers -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "Autenticación exitosa" -ForegroundColor Green
            $authReady = $true
        }
    } catch {
        Write-Host ("Intento {0} de {1}: Autenticación fallida, reintentando en 5 segundos..." -f $authAttempt, $authAttempts) -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        $authAttempt++
    }
}

if (-not $authReady) {
    Write-Host "No se pudo autenticar después de $authAttempts intentos" -ForegroundColor Red
    exit 1
}

# Crear el bucket
Write-Host ("Creando bucket {0}..." -f $BucketName) -ForegroundColor Yellow

$maxBucketAttempts = 10
$bucketAttempt = 1
$bucketCreated = $false

while ($bucketAttempt -le $maxBucketAttempts -and -not $bucketCreated) {
    try {
        $body = @{
            name = $BucketName
            ramQuotaMB = 128
            authType = "none"
            bucketType = "couchbase"
        }
        
        $response = Invoke-WebRequest -Uri ($CouchbaseUrl + "/pools/default/buckets") -Method POST -Headers $headers -Body $body -UseBasicParsing
        Write-Host ("Bucket {0} creado exitosamente" -f $BucketName) -ForegroundColor Green
        $bucketCreated = $true
    } catch {
        Write-Host ("Intento {0} de {1}: Error creando bucket, reintentando en 10 segundos..." -f $bucketAttempt, $maxBucketAttempts) -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        $bucketAttempt++
    }
}

if (-not $bucketCreated) {
    Write-Host ("No se pudo crear el bucket después de {0} intentos" -f $maxBucketAttempts) -ForegroundColor Red
    exit 1
}

# Esperar a que el bucket esté listo
Write-Host "Esperando que el bucket esté listo..." -ForegroundColor Yellow

$maxReadyAttempts = 20
$readyAttempt = 1
$bucketReady = $false

while ($readyAttempt -le $maxReadyAttempts -and -not $bucketReady) {
    try {
        $response = Invoke-WebRequest -Uri ($CouchbaseUrl + "/pools/default/buckets/" + $BucketName) -Headers $headers -UseBasicParsing
        if ($response.Content -like "*healthy*") {
            Write-Host "Bucket está listo y saludable" -ForegroundColor Green
            $bucketReady = $true
        }
    } catch {
        # Ignorar errores, seguir intentando
    }
    
    if (-not $bucketReady) {
        Write-Host ("Intento {0} de {1}: Bucket no listo, esperando 5 segundos..." -f $readyAttempt, $maxReadyAttempts) -ForegroundColor Gray
        Start-Sleep -Seconds 5
        $readyAttempt++
    }
}

if (-not $bucketReady) {
    Write-Host ("Bucket no está completamente listo después de {0} intentos" -f $maxReadyAttempts) -ForegroundColor Yellow
}

Write-Host "" -ForegroundColor Green
Write-Host "=== COUCHBASE CONFIGURADO CORRECTAMENTE ===" -ForegroundColor Green
Write-Host "URL: http://localhost:8091" -ForegroundColor White
Write-Host "Usuario: $Username" -ForegroundColor White
Write-Host "Password: $Password" -ForegroundColor White
Write-Host "Bucket: $BucketName" -ForegroundColor White
Write-Host "" -ForegroundColor Cyan
Write-Host "Puedes acceder a la consola web en http://localhost:8091!" -ForegroundColor Cyan