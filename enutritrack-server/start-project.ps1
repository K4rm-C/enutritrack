# start-project.ps1 - Versión Simplificada y Robusta
Write-Host "=== INICIANDO PROYECTO ENUTRITRACK ===" -ForegroundColor Green

# Paso 1: Limpiar y levantar contenedores
Write-Host "`n1. Limpiando y levantando contenedores Docker..." -ForegroundColor Yellow
docker-compose down
docker-compose up -d

Write-Host "Contenedores iniciados" -ForegroundColor Green

# Paso 2: Esperar inicialización básica
Write-Host "`n2. Esperando inicializacion de contenedores (10 segundos)..." -ForegroundColor Yellow
for ($i = 1; $i -le 10; $i++) {
    Write-Host "   Esperando... $i/10 segundos" -NoNewline
    Write-Host "`r" -NoNewline
    Start-Sleep -Seconds 1
}

# Paso 3: Inicializar Couchbase manualmente
Write-Host "`n3. Inicializando Couchbase..." -ForegroundColor Yellow
if (Test-Path ".\scripts\init-couchbase-manual.ps1") {
    .\scripts\init-couchbase-manual.ps1
} else {
    Write-Host "Script de inicializacion de Couchbase no encontrado" -ForegroundColor Red
}

# Paso 4: Verificar estado final
Write-Host "`n4. Estado final de los contenedores:" -ForegroundColor Yellow
docker-compose ps

Write-Host "`n5. Ultimos logs de Couchbase:" -ForegroundColor Yellow
docker-compose logs couchbase --tail=10

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

Write-Host "`nAhora puedes ejecutar tu backend NestJS!" -ForegroundColor Green
Write-Host "Comando: npm run start:dev" -ForegroundColor White