#!/bin/bash

set -e  # Salir si hay error

echo "🚀 Iniciando despliegue de Enutritrack..."

# 1. Actualizar sistema
echo "📦 Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

# 2. Instalar Node.js 20
echo "📦 Instalando Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
echo "✅ Node.js $(node -v) instalado"

# 3. Instalar Docker
echo "📦 Instalando Docker..."
if ! command -v docker &> /dev/null; then
    sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo usermod -aG docker $USER
    newgrp docker
fi
echo "✅ Docker instalado"

# 4. Instalar Nginx
echo "📦 Instalando Nginx..."
sudo apt install -y nginx

# 5. Instalar PM2
echo "📦 Instalando PM2..."
sudo npm install -g pm2

# 6. Verificar que el proyecto existe
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

# 7. Instalar dependencias
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

# 8. Levantar bases de datos con Docker
echo "📦 Levantando bases de datos..."
cd /opt/enutritrack/enutritrack-server

docker compose up -d

# 9. Esperar y verificar que PostgreSQL esté corriendo
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

# 10. Inicializar PostgreSQL con manejo de errores
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

# 11. Compilar aplicaciones
echo "📦 Compilando aplicaciones..."
cd /opt/enutritrack/enutritrack-client
npm run build

cd /opt/enutritrack/enutritrack-server
npm run build

cd /opt/enutritrack/enutritrack-microservices
npm run build

# 13. Obtener IP externa de la VM
VM_IP=$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google")
if [ -z "$VM_IP" ]; then
    VM_IP=$(curl -s ifconfig.me)
fi

echo "🌐 IP externa de la VM: $VM_IP"

# 14. Configurar Nginx
echo "📦 Configurando Nginx..."
sudo tee /etc/nginx/sites-available/enutritrack > /dev/null << 'NGINX_CONFIG'
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
    # Nota: No incluir rutas que coincidan con microservicios (physical-activity, alerts, etc.)
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

    # Microservicios - rutas que capturan con y sin barra final
    # IMPORTANTE: Estas rutas deben ir ANTES de location / para tener prioridad
    location ~ ^/users(/|$) {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location ~ ^/medical-history(/|$) {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location ~ ^/nutrition(/|$) {
        proxy_pass http://localhost:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location ~ ^/physical-activity(/|$) {
        proxy_pass http://localhost:3005;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location ~ ^/recommendations(/|$) {
        proxy_pass http://localhost:3006;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location ~ ^/doctors(/|$) {
        proxy_pass http://localhost:3007;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location ~ ^/citas-medicas(/|$) {
        proxy_pass http://localhost:3008;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location ~ ^/alerts(/|$) {
        proxy_pass http://localhost:3009;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Microservicio de auth - debe ir después de las rutas específicas del CMS
    # Esta ruta captura /auth/ que no sea login, dashboard o refresh (para el microservicio)
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

sudo ln -sf /etc/nginx/sites-available/enutritrack /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# 15. Crear ecosystem de PM2
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

# 16. Iniciar servicios con PM2
echo "📦 Iniciando servicios..."
cd /opt/enutritrack
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo ""
echo "✅ ¡Despliegue completado!"
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
echo ""
echo "   Reiniciar bases de datos:"
echo "   cd /opt/enutritrack/enutritrack-server"
echo "   docker compose restart"
echo ""