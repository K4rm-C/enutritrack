Write-Host "Esperando que las bases de datos estén listas..."

# Esperar PostgreSQL
do {
    try {
        $result = Test-NetConnection -ComputerName localhost -Port 5433
        if ($result.TcpTestSucceeded) {
            Write-Host "PostgreSQL está listo"
            break
        }
    } catch {
        Write-Host "Esperando PostgreSQL..."
        Start-Sleep -Seconds 5
    }
} while ($true)

# Esperar Couchbase
do {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8091" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "Couchbase está listo"
            break
        }
    } catch {
        Write-Host "Esperando Couchbase..."
        Start-Sleep -Seconds 5
    }
} while ($true)

# Esperar Redis
do {
    try {
        $result = Test-NetConnection -ComputerName localhost -Port 6379
        if ($result.TcpTestSucceeded) {
            Write-Host "Redis está listo"
            break
        }
    } catch {
        Write-Host "Esperando Redis..."
        Start-Sleep -Seconds 5
    }
} while ($true)

Write-Host "Todas las bases de datos están listas!"