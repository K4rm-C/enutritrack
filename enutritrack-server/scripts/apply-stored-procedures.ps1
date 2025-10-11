# Script para aplicar stored procedures al dashboard de superusuario
# Este script debe ejecutarse despues de inicializar la base de datos

Write-Host '===============================================' -ForegroundColor Cyan
Write-Host '  Aplicando Stored Procedures al Dashboard' -ForegroundColor Cyan
Write-Host '===============================================' -ForegroundColor Cyan
Write-Host ''

# Configuracion de la base de datos
$DB_HOST = 'localhost'
$DB_PORT = '5433'
$DB_NAME = 'enutritrack'
$DB_USER = 'postgres'
$DB_PASSWORD = '1234'

Write-Host 'Conectando a PostgreSQL...' -ForegroundColor Yellow
Write-Host "Host: $DB_HOST" -ForegroundColor Gray
Write-Host "Port: $DB_PORT" -ForegroundColor Gray
Write-Host "Database: $DB_NAME" -ForegroundColor Gray
Write-Host ''

# Verificar si PostgreSQL esta en el PATH
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host 'ERROR: psql no esta en el PATH' -ForegroundColor Red
    Write-Host ''
    Write-Host 'Por favor, agrega PostgreSQL al PATH o ejecuta manualmente:' -ForegroundColor Yellow
    Write-Host ''
    Write-Host "  psql -U $DB_USER -d $DB_NAME -p $DB_PORT -f stored-procedures.sql" -ForegroundColor Cyan
    Write-Host ''
    Write-Host "O desde pgAdmin, abre stored-procedures.sql y ejecutalo en la base de datos $DB_NAME" -ForegroundColor Cyan
    Write-Host ''
    exit 1
}

# Aplicar stored procedures
try {
    $env:PGPASSWORD = $DB_PASSWORD
    
    Write-Host 'Aplicando stored procedures...' -ForegroundColor Yellow
    
    $result = & psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -f 'stored-procedures.sql' 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ''
        Write-Host 'Stored procedures aplicados exitosamente!' -ForegroundColor Green
        Write-Host ''
        Write-Host 'Procedimientos creados:' -ForegroundColor Cyan
        Write-Host '  - sp_get_all_patients()' -ForegroundColor Gray
        Write-Host '  - sp_get_patient_details(patient_id)' -ForegroundColor Gray
        Write-Host '  - sp_update_patient_doctor(patient_id, doctor_id)' -ForegroundColor Gray
        Write-Host '  - sp_toggle_patient_status(patient_id)' -ForegroundColor Gray
        Write-Host '  - sp_get_all_doctors()' -ForegroundColor Gray
        Write-Host '  - sp_get_doctor_patients(doctor_id)' -ForegroundColor Gray
        Write-Host '  - sp_create_doctor(...)' -ForegroundColor Gray
        Write-Host '  - sp_get_all_admins()' -ForegroundColor Gray
        Write-Host '  - sp_get_admin_details(email)' -ForegroundColor Gray
        Write-Host '  - sp_get_dashboard_stats()' -ForegroundColor Gray
        Write-Host '  - sp_get_patients_by_gender()' -ForegroundColor Gray
        Write-Host '  - sp_get_recent_registrations()' -ForegroundColor Gray
        Write-Host ''
    } else {
        Write-Host ''
        Write-Host 'ERROR al aplicar stored procedures:' -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        Write-Host ''
        exit 1
    }
} catch {
    Write-Host ''
    Write-Host "ERROR: $_" -ForegroundColor Red
    Write-Host ''
    exit 1
} finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host 'Proceso completado.' -ForegroundColor Green
Write-Host ''
