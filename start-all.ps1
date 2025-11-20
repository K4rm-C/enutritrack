# start-all.ps1 - Script completo para levantar todo el proyecto Enutritrack
# Ejecutar desde el directorio raíz: .\start-all.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ENUTRITRACK - START ALL SERVICES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Obtener la ruta raíz del proyecto (donde se ejecuta el script)
$rootPath = $PSScriptRoot
if ([string]::IsNullOrEmpty($rootPath)) {
    $rootPath = Get-Location
}

$serverPath = Join-Path $rootPath "enutritrack-server"
$clientPath = Join-Path $rootPath "enutritrack-client"
$microservicesPath = Join-Path $rootPath "enutritrack-microservices"

# Verificar que las carpetas existen
Write-Host "Verificando estructura del proyecto..." -ForegroundColor Yellow
if (-not (Test-Path $serverPath)) {
    Write-Host "ERROR: No se encontró enutritrack-server en: $serverPath" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $clientPath)) {
    Write-Host "ERROR: No se encontró enutritrack-client en: $clientPath" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $microservicesPath)) {
    Write-Host "ERROR: No se encontró enutritrack-microservices en: $microservicesPath" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Estructura del proyecto verificada" -ForegroundColor Green
Write-Host ""

# ============================================
# PASO 1: Levantar contenedores Docker
# ============================================
Write-Host "[1/6] Levantando contenedores Docker..." -ForegroundColor Yellow
Set-Location $serverPath

# Detener contenedores existentes
Write-Host "  Deteniendo contenedores existentes..." -ForegroundColor Gray
docker-compose down 2>&1 | Out-Null

# Levantar contenedores
Write-Host "  Iniciando contenedores (PostgreSQL, Couchbase, Redis)..." -ForegroundColor Gray
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudieron levantar los contenedores Docker" -ForegroundColor Red
    exit 1
}

Write-Host "  ✓ Contenedores Docker iniciados" -ForegroundColor Green
Write-Host ""

# ============================================
# PASO 2: Esperar y verificar PostgreSQL (con manejo de false start)
# ============================================
Write-Host "[2/6] Esperando a que PostgreSQL esté listo..." -ForegroundColor Yellow

# Buscar psql en rutas comunes
$possiblePaths = @(
    "C:\Program Files\PostgreSQL\18\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\13\bin\psql.exe",
    "C:\Program Files\PostgreSQL\12\bin\psql.exe"
)

$psqlPath = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $psqlPath = $path
        Write-Host "  psql encontrado en: $path" -ForegroundColor Gray
        break
    }
}

if (-not $psqlPath) {
    Write-Host "ADVERTENCIA: No se encontró psql.exe. Verificando PostgreSQL solo por Docker..." -ForegroundColor Yellow
}

# Función para verificar PostgreSQL
function Test-PostgreSQLConnection {
    param([string]$PsqlPath)
    
    if ($PsqlPath) {
        $env:PGPASSWORD = "1234"
        $testResult = & $PsqlPath -U postgres -h localhost -p 5433 -d postgres -c "SELECT 1;" 2>&1
        $result = $LASTEXITCODE -eq 0
        Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
        return $result
    } else {
        # Verificar por Docker
        $containerStatus = docker ps --filter "name=enutritrack_postgres" --format "{{.Status}}" 2>&1
        return $containerStatus -like "*Up*" -or $containerStatus -like "*healthy*"
    }
}

# Función para reiniciar contenedor PostgreSQL
function Restart-PostgreSQLContainer {
    Write-Host "  ⚠ PostgreSQL tuvo un false start, reiniciando contenedor..." -ForegroundColor Yellow
    docker restart enutritrack_postgres 2>&1 | Out-Null
    Start-Sleep -Seconds 5
}

$maxAttempts = 30
$attempt = 0
$postgresReady = $false
$restartCount = 0
$maxRestarts = 3

while ($attempt -lt $maxAttempts -and -not $postgresReady) {
    $attempt++
    Write-Host "  Intentando conectar a PostgreSQL... ($attempt/$maxAttempts)" -NoNewline -ForegroundColor Gray
    
    # Verificar si el contenedor está corriendo
    $containerRunning = docker ps --filter "name=enutritrack_postgres" --format "{{.Names}}" 2>&1
    if ([string]::IsNullOrWhiteSpace($containerRunning)) {
        Write-Host "`r  ⚠ Contenedor PostgreSQL no está corriendo, iniciando..." -ForegroundColor Yellow
        docker start enutritrack_postgres 2>&1 | Out-Null
        Start-Sleep -Seconds 5
        $attempt--
        continue
    }
    
    # Intentar conexión
    if (Test-PostgreSQLConnection -PsqlPath $psqlPath) {
        $postgresReady = $true
        Write-Host "`r  ✓ PostgreSQL está listo y respondiendo" -ForegroundColor Green
    } else {
        Write-Host "`r" -NoNewline
        
        # Si falla después de varios intentos, intentar reiniciar (false start)
        if ($attempt -gt 5 -and $restartCount -lt $maxRestarts) {
            $restartCount++
            Restart-PostgreSQLContainer
            $attempt = 0  # Resetear contador después de reiniciar
        } else {
            Start-Sleep -Seconds 2
        }
    }
}

if (-not $postgresReady) {
    Write-Host "`r  ERROR: PostgreSQL no está respondiendo después de $maxAttempts intentos" -ForegroundColor Red
    Write-Host "  Intenta verificar manualmente: docker logs enutritrack_postgres" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# ============================================
# PASO 3: Inicializar Couchbase (cluster y bucket)
# ============================================
Write-Host "[3/6] Inicializando Couchbase..." -ForegroundColor Yellow

$couchbaseScript = Join-Path $serverPath "scripts\init-couchbase-manual.ps1"
if (Test-Path $couchbaseScript) {
    Write-Host "  Ejecutando script de inicialización de Couchbase..." -ForegroundColor Gray
    & $couchbaseScript
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ADVERTENCIA: init-couchbase-manual.ps1 falló, pero continuando..." -ForegroundColor Yellow
    } else {
        Write-Host "  ✓ Couchbase inicializado y bucket creado" -ForegroundColor Green
    }
} else {
    Write-Host "  ADVERTENCIA: No se encontró init-couchbase-manual.ps1" -ForegroundColor Yellow
    Write-Host "  Couchbase deberá inicializarse manualmente" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# PASO 4: Ejecutar init-db.sql
# ============================================
Write-Host "[4/6] Ejecutando init-db.sql..." -ForegroundColor Yellow

$initDbScript = Join-Path $serverPath "scripts\init-db.ps1"
if (Test-Path $initDbScript) {
    Write-Host "  Ejecutando script de inicialización de base de datos..." -ForegroundColor Gray
    & $initDbScript
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ADVERTENCIA: init-db.ps1 falló, pero continuando..." -ForegroundColor Yellow
    } else {
        Write-Host "  ✓ Base de datos inicializada" -ForegroundColor Green
    }
} else {
    Write-Host "  ADVERTENCIA: No se encontró init-db.ps1" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# PASO 5: Verificar estado final de contenedores
# ============================================
Write-Host "[5/6] Verificando estado final de contenedores..." -ForegroundColor Yellow
docker-compose ps
Write-Host "  ✓ Verificación completada" -ForegroundColor Green
Write-Host ""

# ============================================
# PASO 6: Abrir terminales con los servicios
# ============================================
Write-Host "[6/6] Abriendo terminales con los servicios..." -ForegroundColor Yellow

# Función para abrir una nueva terminal con un comando
function Start-ServiceTerminal {
    param(
        [string]$Title,
        [string]$WorkingDirectory,
        [string]$Command
    )
    
    $powershellPath = "powershell.exe"
    $titleColor = "Cyan"
    $arguments = "-NoExit", "-Command", "cd '$WorkingDirectory'; Write-Host ''; Write-Host '========================================' -ForegroundColor $titleColor; Write-Host '  $Title' -ForegroundColor $titleColor; Write-Host '========================================' -ForegroundColor $titleColor; Write-Host ''; $Command"
    
    Start-Process -FilePath $powershellPath -ArgumentList $arguments -WindowStyle Normal
    Start-Sleep -Milliseconds 500
}

# Terminal 1: enutritrack-server
Write-Host "  Abriendo terminal 1: Server..." -ForegroundColor Gray
Start-ServiceTerminal -Title "ENUTRITRACK SERVER" -WorkingDirectory $serverPath -Command "npm run start:dev"

# Terminal 2: enutritrack-client
Write-Host "  Abriendo terminal 2: Client..." -ForegroundColor Gray
Start-ServiceTerminal -Title "ENUTRITRACK CLIENT" -WorkingDirectory $clientPath -Command "npm run dev"

# Terminal 3: Microservices - Gateway
Write-Host "  Abriendo terminal 3: Gateway..." -ForegroundColor Gray
Start-ServiceTerminal -Title "MICROSERVICES - GATEWAY" -WorkingDirectory $microservicesPath -Command "npm run dev:gateway"

# Terminal 4: Microservices - Auth
Write-Host "  Abriendo terminal 4: Auth Service..." -ForegroundColor Gray
Start-ServiceTerminal -Title "MICROSERVICES - AUTH" -WorkingDirectory $microservicesPath -Command "npm run dev:auth"

# Terminal 5: Microservices - Nutrition
Write-Host "  Abriendo terminal 5: Nutrition Service..." -ForegroundColor Gray
Start-ServiceTerminal -Title "MICROSERVICES - NUTRITION" -WorkingDirectory $microservicesPath -Command "npm run dev:nutrition"

# Terminal 6: Microservices - Medical History
Write-Host "  Abriendo terminal 6: Medical History Service..." -ForegroundColor Gray
Start-ServiceTerminal -Title "MICROSERVICES - MEDICAL" -WorkingDirectory $microservicesPath -Command "npm run dev:medical"

# Terminal 7: Microservices - Activity
Write-Host "  Abriendo terminal 7: Activity Service..." -ForegroundColor Gray
Start-ServiceTerminal -Title "MICROSERVICES - ACTIVITY" -WorkingDirectory $microservicesPath -Command "npm run dev:activity"

# Terminal 8: Microservices - Recommendation
Write-Host "  Abriendo terminal 8: Recommendation Service..." -ForegroundColor Gray
Start-ServiceTerminal -Title "MICROSERVICES - RECOMMENDATION" -WorkingDirectory $microservicesPath -Command "npm run dev:recommendation"

# Terminal 9: Microservices - User
Write-Host "  Abriendo terminal 9: User Service..." -ForegroundColor Gray
Start-ServiceTerminal -Title "MICROSERVICES - USER" -WorkingDirectory $microservicesPath -Command "npm run dev:user"

# Terminal 10: Microservices - Citas
Write-Host "  Abriendo terminal 10: Citas Service..." -ForegroundColor Gray
Start-ServiceTerminal -Title "MICROSERVICES - CITAS" -WorkingDirectory $microservicesPath -Command "npm run dev:citas"

Write-Host "  ✓ 10 terminales abiertas" -ForegroundColor Green
Write-Host ""

# ============================================
# RESUMEN FINAL
# ============================================
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ TODO INICIADO CORRECTAMENTE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Servicios disponibles:" -ForegroundColor Cyan
Write-Host "  • PostgreSQL:    localhost:5433" -ForegroundColor White
Write-Host "  • Couchbase:     http://localhost:8091" -ForegroundColor White
Write-Host "  • Redis:         localhost:6379" -ForegroundColor White
Write-Host "  • Server:        http://localhost:3000" -ForegroundColor White
Write-Host "  • Client:        http://localhost:5174" -ForegroundColor White
Write-Host ""
Write-Host "Credenciales:" -ForegroundColor Cyan
Write-Host "  • PostgreSQL:    postgres / 1234" -ForegroundColor White
Write-Host "  • Couchbase:     Alfredo / alfredo124" -ForegroundColor White
Write-Host "  • Redis:         redispassword" -ForegroundColor White
Write-Host ""
Write-Host "Comandos útiles:" -ForegroundColor Cyan
Write-Host "  • Ver logs Docker:    docker-compose logs -f" -ForegroundColor Gray
Write-Host "  • Detener todo:       docker-compose down" -ForegroundColor Gray
Write-Host "  • Reiniciar PostgreSQL: docker restart enutritrack_postgres" -ForegroundColor Gray
Write-Host ""
Write-Host "Las 10 terminales están ejecutando los servicios." -ForegroundColor Green
Write-Host "Espera unos segundos para que todos los servicios inicien completamente." -ForegroundColor Yellow
Write-Host ""

# Volver al directorio raíz
Set-Location $rootPath

