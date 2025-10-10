# start-simple.ps1 - Versión simple y robusta
Write-Host "=== INICIANDO PROYECTO ENUTRITRACK ===" -ForegroundColor Green

Write-Host "`n1. Deteniendo contenedores anteriores..." -ForegroundColor Yellow
docker-compose down

Write-Host "`n2. Iniciando contenedores..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "`n3. Esperando 60 segundos para inicialización..." -ForegroundColor Yellow
for ($i = 1; $i -le 5; $i++) {
    Write-Host "   Esperando... $i/60 segundos" -NoNewline
    Write-Host "`r" -NoNewline
    Start-Sleep -Seconds 1
}

Write-Host "`n4. Verificando estado..." -ForegroundColor Yellow
docker-compose ps

Write-Host "`n5. Verificando bases de datos..." -ForegroundColor Yellow
.\scripts\wait-for-db.ps1 -MaxAttempts 20 -DelaySeconds 5

Write-Host "`n=== PROYECTO LISTO ===" -ForegroundColor Green
Write-Host "PostgreSQL: localhost:5433" -ForegroundColor Cyan
Write-Host "Couchbase:  http://localhost:8091" -ForegroundColor Cyan
Write-Host "Redis:      localhost:6379" -ForegroundColor Cyan
Write-Host "`nEjecuta: npm run start:dev" -ForegroundColor White