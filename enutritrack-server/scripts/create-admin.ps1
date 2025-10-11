# Script para crear administrador inicial
# Ejecutar: .\scripts\create-admin.ps1

Write-Host "Creando administrador inicial..." -ForegroundColor Green

# Datos del admin
$adminEmail = "admin@enutritrack.com"
$adminPassword = "admin123"
$adminNombre = "Administrador"

# Crear cuenta
$cuentaBody = @{
    email = $adminEmail
    password = $adminPassword
    tipo_cuenta = "admin"
    activa = $true
} | ConvertTo-Json

Write-Host "1. Creando cuenta de administrador..." -ForegroundColor Yellow

try {
    $cuentaResponse = Invoke-RestMethod -Uri "http://localhost:4000/cuentas" `
        -Method Post `
        -Body $cuentaBody `
        -ContentType "application/json"
    
    Write-Host "   Cuenta creada exitosamente: $($cuentaResponse.id)" -ForegroundColor Green
    
    # Crear perfil de admin
    $perfilBody = @{
        cuenta_id = $cuentaResponse.id
        nombre = $adminNombre
        departamento = "TI"
    } | ConvertTo-Json
    
    Write-Host "2. Creando perfil de administrador..." -ForegroundColor Yellow
    
    $perfilResponse = Invoke-RestMethod -Uri "http://localhost:4000/admins" `
        -Method Post `
        -Body $perfilBody `
        -ContentType "application/json"
    
    Write-Host "   Perfil creado exitosamente: $($perfilResponse.id)" -ForegroundColor Green
    Write-Host ""
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host "ADMIN CREADO CORRECTAMENTE" -ForegroundColor Green
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host "Email: $adminEmail" -ForegroundColor White
    Write-Host "Password: $adminPassword" -ForegroundColor White
    Write-Host ""
    Write-Host "Ahora puedes hacer login en: http://localhost:4000/auth/login" -ForegroundColor Yellow
    
} catch {
    Write-Host "Error al crear el administrador:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Detalles: $responseBody" -ForegroundColor Red
    }
}

