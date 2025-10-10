# start-project.ps1 - Script de inicio MEJORADO con espera inteligente

Write-Host "=== INICIANDO PROYECTO ENUTRITRACK ===" -ForegroundColor Green

# Paso 1: Limpiar y levantar contenedores
Write-Host "`n1. Limpiando y levantando contenedores Docker..." -ForegroundColor Yellow
docker-compose down
docker-compose up -d

Write-Host "✓ Contenedores iniciados en segundo plano" -ForegroundColor Green

# Paso 2: ESPERAR ACTIVAMENTE que Docker Compose termine de inicializar
Write-Host "`n2. Esperando que Docker Compose termine de inicializar los servicios..." -ForegroundColor Yellow

$composeTimeout = 180  # 3 minutos máximo para Docker Compose
$composeAttempt = 0

do {
    $composeAttempt++
    Write-Host "   Verificando estado de contenedores... (Intento $composeAttempt)" -ForegroundColor Gray
    
    # Verificar si TODOS los contenedores están "Up"
    $containers = docker-compose ps --services --filter "status=running"
    $allServices = docker-compose config --services
    $runningCount = ($containers | Measure-Object).Count
    $totalCount = ($allServices | Measure-Object).Count
    
    if ($runningCount -eq $totalCount) {
        Write-Host "   ✓ Todos los contenedores están en estado 'Up' ($runningCount/$totalCount)" -ForegroundColor Green
        break
    }
    
    Write-Host "   ⏳ Contenedores listos: $runningCount/$totalCount - Esperando 10 segundos..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    if ($composeAttempt -ge ($composeTimeout / 10)) {
        Write-Host "   ⚠ ADVERTENCIA: Tiempo agotado para Docker Compose, continuando igual..." -ForegroundColor Red
        break
    }
} while ($true)

# Paso 3: Ahora sí, esperar que los servicios DENTRO de los contenedores estén listos
Write-Host "`n3. Esperando que los servicios dentro de los contenedores estén listos..." -ForegroundColor Yellow

# Ejecutar el script de espera MEJORADO
$waitResult = .\scripts\wait-for-db.ps1 -MaxAttempts 30 -DelaySeconds 10

# Paso 4: Verificar el resultado y decidir qué hacer
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n⚠ ALERTA: Algunas bases de datos no están completamente listas" -ForegroundColor Red
    Write-Host "Pero los contenedores SÍ están ejecutándose." -ForegroundColor Yellow
    
    # Preguntar al usuario qué quiere hacer
    $choice = Read-Host "¿Quieres continuar ejecutando el backend? (S/N)"
    if ($choice -notmatch '^[Ss]') {
        Write-Host "Deteniendo contenedores..." -ForegroundColor Yellow
        docker-compose down
        exit 1
    }
}

# Paso 5: Mostrar estado final
Write-Host "`n4. Estado final de los contenedores:" -ForegroundColor Yellow
docker-compose ps

Write-Host "`n5. Últimos logs de inicialización:" -ForegroundColor Yellow
docker-compose logs --tail=20

# Paso 6: Mensaje final
Write-Host "`n=== PROYECTO INICIADO ===" -ForegroundColor Green
Write-Host "PostgreSQL:    localhost:5433" -ForegroundColor Cyan
Write-Host "Couchbase:     http://localhost:8091" -ForegroundColor Cyan
Write-Host "Redis:         localhost:6379" -ForegroundColor Cyan

Write-Host "`nCredenciales Couchbase:" -ForegroundColor White
Write-Host "  Usuario: Alfredo" -ForegroundColor Gray
Write-Host "  Password: alfredo124$$" -ForegroundColor Gray

Write-Host "`nPara ver logs en tiempo real: docker-compose logs -f" -ForegroundColor Gray
Write-Host "Para detener: docker-compose down" -ForegroundColor Gray

Write-Host "`n¡Ahora puedes ejecutar tu backend NestJS!" -ForegroundColor Green
Write-Host "Comando: npm run start:dev" -ForegroundColor White