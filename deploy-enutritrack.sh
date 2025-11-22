#!/bin/bash

set -e  # Salir si hay error

echo "1.🚀 Iniciando despliegue de Enutritrack en CentOS 9..."

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" &> /dev/null
}

# Función para verificar si un paquete está instalado
package_installed() {
    dnf list installed "$1" &> /dev/null
}

# 2. Instalar Node.js 20
echo "📦 Instalando Node.js 20..."
if ! command_exists node; then
    sudo dnf install -y curl 
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo -E bash -
    sudo dnf install -y nodejs
    echo "✅ Node.js $(node -v) instalado"
else
    echo "✅ Node.js $(node -v) ya está instalado"
fi

# 3. Instalar Docker
echo "📦 Instalando Docker..."
if ! command_exists docker; then
    sudo dnf config-manager --add-repo=https://download.docker.com/linux/centos/docker-ce.repo
    sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
    newgrp docker
    echo "✅ Docker instalado"
else
    echo "✅ Docker ya está instalado"
fi

# 4. Instalar PostgreSQL
echo "📦 Instalando PostgreSQL..."
if ! command_exists psql; then
    sudo dnf install -y postgresql-server postgresql-contrib
    sudo postgresql-setup --initdb
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    echo "✅ PostgreSQL instalado"
else
    echo "✅ PostgreSQL ya está instalado"
fi

# 5. Instalar Nginx
echo "📦 Instalando Nginx..."
if ! command_exists nginx; then
    sudo dnf install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    echo "✅ Nginx instalado"
else
    echo "✅ Nginx ya está instalado"
fi

# 6. Instalar PM2
echo "📦 Instalando PM2..."
if ! command_exists pm2; then
    sudo npm install -g pm2
    echo "✅ PM2 instalado"
else
    echo "✅ PM2 ya está instalado"
fi

# 7. Verificar que el proyecto existe
echo "📦 Verificando proyecto..."
if [ ! -d "/opt/enutritrack" ]; then
    echo "❌ Error: El proyecto no se encuentra en /opt/enutritrack"
    echo "   Por favor, sube el proyecto (ZIP) y extráelo en /opt/enutritrack"
    echo "   Ejemplo:"
    echo "     sudo mkdir -p /opt/enutritrack"
    echo "     sudo unzip proyecto.zip -d /opt/"
    echo "     sudo chown -R $USER:$USER /opt/enutritrack"
    exit 1
fi

# 8. Instalar dependencias
echo "📦 Instalando dependencias..."
cd /opt/enutritrack

echo "  - Frontend..."
cd enutritrack-client
npm install
cd ..

echo "  - Backend..."
cd enutritrack-server
npm install
cd ..

echo "  - Microservicios..."
cd enutritrack-microservices
npm install
cd ..

# 9. Configurar PostgreSQL para conexiones remotas (si es necesario)
echo "📦 Configurando PostgreSQL..."
if ! sudo grep -q "enutritrack" /var/lib/pgsql/data/pg_hba.conf; then
    echo "  Configurando acceso a la base de datos..."
    # Configurar pg_hba.conf para permitir conexiones
    sudo tee -a /var/lib/pgsql/data/pg_hba.conf > /dev/null << 'PG_CONFIG'
# Enutritrack - Permitir conexiones desde Docker
host    all             all             172.0.0.0/8            md5
host    all             all             127.0.0.1/32           md5
PG_CONFIG

    # Configurar postgresql.conf para escuchar en todas las interfaces
    sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /var/lib/pgsql/data/postgresql.conf
    sudo systemctl restart postgresql
fi

# 10. Crear base de datos y usuario si no existen
echo "📦 Configurando base de datos..."
sudo -i -u postgres psql -c "CREATE USER enutritrack WITH PASSWORD 'enutritrack2024';" 2>/dev/null || true
sudo -i -u postgres psql -c "CREATE DATABASE enutritrack OWNER enutritrack;" 2>/dev/null || true
sudo -i -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE enutritrack TO enutritrack;" 2>/dev/null || true

# 11. Levantar bases de datos con Docker
echo "📦 Levantando bases de datos..."
cd /opt/enutritrack/enutritrack-server

# Verificar si los contenedores ya están corriendo
if ! docker compose ps | grep -q "Up"; then
    docker compose up -d
fi

# 12. Esperar y verificar que PostgreSQL esté corriendo
echo "⏳ Esperando que PostgreSQL se inicie correctamente..."
MAX_RETRIES=12
RETRY_COUNT=0
POSTGRES_READY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    sleep 5
    RETRY_COUNT=$((RETRY_COUNT + 1))
    
    # Verificar si el contenedor está corriendo
    if ! docker ps | grep -q enutritrack_postgres; then
        echo "⚠️  Intento $RETRY_COUNT/$MAX_RETRIES: Contenedor PostgreSQL no está corriendo, reintentando..."
        docker compose restart postgres
        continue
    fi
    
    # Verificar si PostgreSQL está listo para conexiones
    if docker exec enutritrack_postgres pg_isready -U postgres -d enutritrack > /dev/null 2>&1; then
        POSTGRES_READY=true
        echo "✅ PostgreSQL está listo después de $((RETRY_COUNT * 5)) segundos"
        break
    else
        echo "⏳ Intento $RETRY_COUNT/$MAX_RETRIES: Esperando que PostgreSQL esté listo..."
    fi
done

if [ "$POSTGRES_READY" = false ]; then
    echo "❌ Error: PostgreSQL no se inició correctamente después de $((MAX_RETRIES * 5)) segundos"
    echo "   Verificando logs del contenedor..."
    docker logs enutritrack_postgres --tail 50
    echo ""
    echo "   Intenta reiniciar manualmente:"
    echo "   cd /opt/enutritrack/enutritrack-server"
    echo "   docker compose restart postgres"
    echo "   docker logs -f enutritrack_postgres"
    exit 1
fi

# 13. Inicializar PostgreSQL con manejo de errores
echo "📦 Inicializando PostgreSQL..."
INIT_SUCCESS=false
MAX_INIT_RETRIES=3
INIT_RETRY_COUNT=0

while [ $INIT_RETRY_COUNT -lt $MAX_INIT_RETRIES ]; do
    INIT_RETRY_COUNT=$((INIT_RETRY_COUNT + 1))
    
    if docker exec -i enutritrack_postgres psql -U postgres -d enutritrack < /opt/enutritrack/enutritrack-server/scripts/init-db.sql 2>&1; then
        INIT_SUCCESS=true
        echo "✅ Base de datos inicializada correctamente"
        break
    else
        if [ $INIT_RETRY_COUNT -lt $MAX_INIT_RETRIES ]; then
            echo "⚠️  Intento $INIT_RETRY_COUNT/$MAX_INIT_RETRIES: Error al inicializar, esperando 10 segundos y reintentando..."
            sleep 10
        else
            echo "⚠️  Error al inicializar la base de datos después de $MAX_INIT_RETRIES intentos"
            echo "   Esto puede ser normal si la base de datos ya estaba inicializada"
            echo "   Continuando con el despliegue..."
        fi
    fi
done

# 14. Modificar frontend para usar rutas relativas a través de Nginx
echo "📦 Configurando frontend para usar rutas relativas..."
cd /opt/enutritrack/enutritrack-client/src/api

# Verificar si el archivo existe antes de modificarlo
if [ -f "axios.jsx" ]; then
    # Modificar axios.jsx para usar rutas relativas que coincidan con los controladores
    sed -i 's|const API_BASE_URL_USER = "http://localhost:3001/";|const API_BASE_URL_USER = "/users/";|g' axios.jsx
    sed -i 's|const API_BASE_URL_MEDICAL = "http://localhost:3002/";|const API_BASE_URL_MEDICAL = "/medical-history/";|g' axios.jsx
    sed -i 's|const API_BASE_URL_NUTRITION = "http://localhost:3003/";|const API_BASE_URL_NUTRITION = "/nutrition/";|g' axios.jsx
    sed -i 's|const API_BASE_URL_AUTH = "http://localhost:3004/";|const API_BASE_URL_AUTH = "/auth/";|g' axios.jsx
    sed -i 's|const API_BASE_URL_ACTIVITY = "http://localhost:3005/";|const API_BASE_URL_ACTIVITY = "/physical-activity/";|g' axios.jsx
    sed -i 's|const API_BASE_URL_RECOMMENDATION = "http://localhost:3006/";|const API_BASE_URL_RECOMMENDATION = "/recommendations/";|g' axios.jsx
    sed -i 's|const API_BASE_URL_CITAS_MEDIAS = "http://localhost:3008/";|const API_BASE_URL_CITAS_MEDIAS = "/citas-medicas/";|g' axios.jsx
    sed -i 's|const API_BASE_URL_ALERTAS = "http://localhost:3009/";|const API_BASE_URL_ALERTAS = "/alerts/";|g' axios.jsx
    echo "✅ Configuración de frontend completada"
else
    echo "⚠️  Archivo axios.jsx no encontrado, continuando..."
fi

# 15. Compilar aplicaciones
echo "📦 Compilando aplicaciones..."
cd /opt/enutritrack/enutritrack-client
npm run build

cd /opt/enutritrack/enutritrack-server
npm run build

cd /opt/enutritrack/enutritrack-microservices
npm run build

# 16. Obtener IP externa de la VM
VM_IP=$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google" 2>/dev/null || true)
if [ -z "$VM_IP" ]; then
    VM_IP=$(curl -s ifconfig.me 2>/dev/null || echo "IP-DESCONOCIDA")
fi

echo "🌐 IP externa de la VM: $VM_IP"

# 17. Configurar Nginx
echo "📦 Configurando Nginx..."
sudo tee /etc/nginx/conf.d/enutritrack.conf > /dev/null << 'NGINX_CONFIG'
server {
    listen 80;
    server_name _;

    # CMS/Dashboard del Backend - Rutas específicas del CMS (prioridad alta)
    location ~ ^/auth/(login|dashboard|refresh)$ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Otras rutas del CMS del backend (páginas HTML)
    location ~ ^/(dashboard|patients-crud|doctors-crud|appointments|food|health|history-medical|medications|allergies|states|types|gender|specialties-crud) {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Microservicios - rutas corregidas para coincidir con los controladores
    location /users/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /medical-history/ {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /nutrition/ {
        proxy_pass http://localhost:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /physical-activity/ {
        proxy_pass http://localhost:3005;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /recommendations/ {
        proxy_pass http://localhost:3006;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /doctors/ {
        proxy_pass http://localhost:3007;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /citas-medicas/ {
        proxy_pass http://localhost:3008;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /alerts/ {
        proxy_pass http://localhost:3009;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Microservicio de auth
    location /auth/ {
        proxy_pass http://localhost:3004;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Frontend (debe ir al final para capturar todo lo demás)
    location / {
        root /opt/enutritrack/enutritrack-client/dist;
        try_files $uri $uri/ /index.html;
    }

    client_max_body_size 50M;
}
NGINX_CONFIG

# Eliminar configuración por defecto si existe
sudo rm -f /etc/nginx/conf.d/default.conf

# Verificar configuración de Nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# 18. Configurar firewall (si está activo)
if command_exists firewall-cmd; then
    echo "📦 Configurando firewall..."
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --reload
    echo "✅ Firewall configurado"
fi

# 19. Crear ecosystem de PM2
echo "📦 Configurando PM2..."
mkdir -p /opt/enutritrack/logs

cat > /opt/enutritrack/ecosystem.config.js << 'PM2_CONFIG'
module.exports = {
  apps: [
    {
      name: 'enutritrack-backend',
      script: './enutritrack-server/dist/main.js',
      cwd: '/opt/enutritrack',
      env: { NODE_ENV: 'production', PORT: 4000 },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
    },
    {
      name: 'enutritrack-gateway',
      script: './enutritrack-microservices/dist/main.js',
      cwd: '/opt/enutritrack',
      env: { NODE_ENV: 'production', PORT: 3000 },
      error_file: './logs/gateway-error.log',
      out_file: './logs/gateway-out.log',
    },
    {
      name: 'enutritrack-auth',
      script: './enutritrack-microservices/dist/auth/main.js',
      cwd: '/opt/enutritrack',
      env: { NODE_ENV: 'production', PORT: 3004 },
      error_file: './logs/auth-error.log',
      out_file: './logs/auth-out.log',
    },
    {
      name: 'enutritrack-user',
      script: './enutritrack-microservices/dist/users/main.js',
      cwd: '/opt/enutritrack',
      env: { NODE_ENV: 'production', PORT: 3001 },
      error_file: './logs/user-error.log',
      out_file: './logs/user-out.log',
    },
    {
      name: 'enutritrack-doctor',
      script: './enutritrack-microservices/dist/doctor/main.js',
      cwd: '/opt/enutritrack',
      env: { NODE_ENV: 'production', PORT: 3007 },
      error_file: './logs/doctor-error.log',
      out_file: './logs/doctor-out.log',
    },
    {
      name: 'enutritrack-nutrition',
      script: './enutritrack-microservices/dist/nutrition/main.js',
      cwd: '/opt/enutritrack',
      env: { NODE_ENV: 'production', PORT: 3003 },
      error_file: './logs/nutrition-error.log',
      out_file: './logs/nutrition-out.log',
    },
    {
      name: 'enutritrack-activity',
      script: './enutritrack-microservices/dist/activity/main.js',
      cwd: '/opt/enutritrack',
      env: { NODE_ENV: 'production', PORT: 3005 },
      error_file: './logs/activity-error.log',
      out_file: './logs/activity-out.log',
    },
    {
      name: 'enutritrack-recommendation',
      script: './enutritrack-microservices/dist/recommendation/main.js',
      cwd: '/opt/enutritrack',
      env: { NODE_ENV: 'production', PORT: 3006 },
      error_file: './logs/recommendation-error.log',
      out_file: './logs/recommendation-out.log',
    },
    {
      name: 'enutritrack-medical',
      script: './enutritrack-microservices/dist/medical-history/main.js',
      cwd: '/opt/enutritrack',
      env: { NODE_ENV: 'production', PORT: 3002 },
      error_file: './logs/medical-error.log',
      out_file: './logs/medical-out.log',
    },
    {
      name: 'enutritrack-citas',
      script: './enutritrack-microservices/dist/citas/main.js',
      cwd: '/opt/enutritrack',
      env: { NODE_ENV: 'production', PORT: 3008 },
      error_file: './logs/citas-error.log',
      out_file: './logs/citas-out.log',
    },
    {
      name: 'enutritrack-alertas',
      script: './enutritrack-microservices/dist/alertas/main.js',
      cwd: '/opt/enutritrack',
      env: { NODE_ENV: 'production', PORT: 3009 },
      error_file: './logs/alertas-error.log',
      out_file: './logs/alertas-out.log',
    },
  ],
};
PM2_CONFIG

# 20. Iniciar servicios con PM2
echo "📦 Iniciando servicios..."
cd /opt/enutritrack
pm2 start ecosystem.config.js
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER

echo ""
echo "✅ ¡Despliegue completado en CentOS 9!"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🌐 URLs de acceso:"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "   📱 Portal de Doctores (Frontend):"
echo "      http://${VM_IP}/"
echo ""
echo "   🏥 CMS/Dashboard de Administrador:"
echo "      http://${VM_IP}/auth/login"
echo "      Credenciales: admin@enutritrack.com / admin123"
echo ""
echo "   📚 Documentación API (Swagger):"
echo "      http://${VM_IP}/api/docs"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📱 CONFIGURACIÓN DE APP MÓVIL (IMPORTANTE)"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "   Para usar la app móvil con este despliegue:"
echo ""
echo "   1. Abre Android Studio"
echo "   2. Abre el archivo:"
echo "      enutritrack-app/Enutritrackapp/app/src/main/java/com/example/enutritrack_app/config/ApiConfig.kt"
echo ""
echo "   3. Cambia estas dos líneas:"
echo "      private const val PROD_IP = \"${VM_IP}\""
echo "      private const val USE_PRODUCTION = true"
echo ""
echo "   4. Recompila la app (Build > Rebuild Project)"
echo "   5. Instala el APK en tu dispositivo"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📝 Comandos útiles:"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "   Ver logs:"
echo "   pm2 logs"
echo ""
echo "   Ver estado:"
echo "   pm2 status"
echo ""
echo "   Reiniciar servicios:"
echo "   pm2 restart all"
echo ""
echo "   Ver logs de PostgreSQL:"
echo "   docker logs enutritrack_postgres"
echo "   sudo journalctl -u postgresql -f"
echo ""
echo "   Reiniciar bases de datos:"
echo "   cd /opt/enutritrack/enutritrack-server"
echo "   docker compose restart"
echo ""