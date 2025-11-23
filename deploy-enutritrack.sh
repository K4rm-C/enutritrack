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

# Obtener el directorio actual del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

echo "📁 Ruta del proyecto: $PROJECT_ROOT"

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

# 3. Instalar Docker y configurar permisos
echo "📦 Instalando Docker..."
if ! command_exists docker; then
    sudo dnf config-manager --add-repo=https://download.docker.com/linux/centos/docker-ce.repo
    sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # Configurar permisos de Docker
    echo "🔧 Configurando permisos de Docker..."
    sudo groupadd docker 2>/dev/null || true
    sudo usermod -aG docker $USER
    sudo chown root:docker /var/run/docker.sock
    sudo chmod 666 /var/run/docker.sock
    echo "✅ Docker instalado y configurado"
else
    echo "✅ Docker ya está instalado"
    
    # Verificar y configurar permisos si es necesario
    if ! docker ps > /dev/null 2>&1; then
        echo "🔧 Configurando permisos de Docker..."
        sudo groupadd docker 2>/dev/null || true
        sudo usermod -aG docker $USER
        sudo chown root:docker /var/run/docker.sock
        sudo chmod 666 /var/run/docker.sock
        echo "✅ Permisos de Docker configurados"
    fi
fi

# 4. Instalar PostgreSQL (pero lo deshabilitaremos porque usaremos Docker)
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

# 4.5 Deshabilitar PostgreSQL nativo (usaremos solo Docker)
echo "📦 Deshabilitando PostgreSQL nativo..."
sudo systemctl stop postgresql
sudo systemctl disable postgresql
echo "✅ PostgreSQL nativo deshabilitado (usando solo Docker)"

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
if [ ! -d "$PROJECT_ROOT/enutritrack-client" ]; then
    echo "❌ Error: Estructura del proyecto no encontrada"
    echo "   Se esperaban los directorios:"
    echo "   - $PROJECT_ROOT/enutritrack-client"
    echo "   - $PROJECT_ROOT/enutritrack-server" 
    echo "   - $PROJECT_ROOT/enutritrack-microservices"
    echo ""
    echo "   Estructura actual:"
    ls -la "$PROJECT_ROOT"
    exit 1
fi

echo "✅ Estructura del proyecto verificada"

# 8. Verificar permisos de Docker antes de continuar
echo "🔍 Verificando permisos de Docker..."
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Error: Sin permisos para Docker"
    echo "   Solución:"
    echo "   1. Cerrar sesión y volver a entrar"
    echo "   2. O ejecutar: newgrp docker"
    echo "   3. Luego ejecutar este script de nuevo"
    echo ""
    echo "   Como solución temporal, usando sudo para comandos Docker..."
    # Definir función docker con sudo para uso temporal
    docker() {
        sudo docker "$@"
    }
else
    echo "✅ Permisos de Docker verificados"
fi

# 9. Instalar dependencias
echo "📦 Instalando dependencias..."
cd "$PROJECT_ROOT"

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

# 10. Configurar PostgreSQL para conexiones remotas (si es necesario) - Esto ya no es necesario porque usamos Docker
# Pero por si acaso, eliminamos la configuración anterior y no hacemos nada en el PostgreSQL nativo.
echo "📦 Saltando configuración de PostgreSQL nativo (usando Docker)..."

# 11. Crear base de datos y usuario en PostgreSQL Docker
echo "📦 Configurando base de datos en PostgreSQL Docker..."
cd "$PROJECT_ROOT/enutritrack-server"

# Levantar bases de datos con Docker
echo "📦 Levantando bases de datos con Docker..."

# Verificar si los contenedores ya están corriendo
if ! docker compose ps 2>/dev/null | grep -q "Up"; then
    echo "  Iniciando contenedores Docker..."
    docker compose up -d
fi

# Esperar y verificar que PostgreSQL esté corriendo
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
    if docker exec enutritrack_postgres pg_isready -U postgres > /dev/null 2>&1; then
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
    echo "   cd $PROJECT_ROOT/enutritrack-server"
    echo "   docker compose restart postgres"
    echo "   docker logs -f enutritrack_postgres"
    exit 1
fi

# Ahora creamos la base de datos y el usuario en el contenedor Docker
echo "📦 Creando usuario y base de datos en PostgreSQL Docker..."
docker exec enutritrack_postgres psql -U postgres -c "CREATE USER enutritrack WITH PASSWORD 'enutritrack2024';" 2>/dev/null || echo "✅ Usuario ya existe"
docker exec enutritrack_postgres psql -U postgres -c "CREATE DATABASE enutritrack OWNER enutritrack;" 2>/dev/null || echo "✅ Base de datos ya existe"
docker exec enutritrack_postgres psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE enutritrack TO enutritrack;" 2>/dev/null || echo "✅ Permisos ya configurados"

# 12. Inicializar PostgreSQL con manejo de errores
echo "📦 Inicializando PostgreSQL..."
INIT_SUCCESS=false
MAX_INIT_RETRIES=3
INIT_RETRY_COUNT=0

while [ $INIT_RETRY_COUNT -lt $MAX_INIT_RETRIES ]; do
    INIT_RETRY_COUNT=$((INIT_RETRY_COUNT + 1))
    
    if docker exec -i enutritrack_postgres psql -U enutritrack -d enutritrack < "$PROJECT_ROOT/enutritrack-server/scripts/init-db.sql" 2>&1; then
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

# 12.1 Otorgar permisos completos al usuario enutritrack
echo "📦 Otorgando permisos en PostgreSQL..."
docker exec enutritrack_postgres psql -U postgres -d enutritrack -c "
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO enutritrack;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO enutritrack;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO enutritrack;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO enutritrack;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO enutritrack;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO enutritrack;
"

# 12.3 Transferir propiedad de todas las tablas al usuario enutritrack
echo "📦 Transferiendo propiedad de tablas al usuario enutritrack..."
docker exec enutritrack_postgres psql -U postgres -d enutritrack -c "
-- Transferir propiedad de todas las tablas existentes
DO \$\$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
    LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' OWNER TO enutritrack';
    END LOOP;
END \$\$;

-- Transferir propiedad de todas las secuencias
DO \$\$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN 
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public' 
    LOOP
        EXECUTE 'ALTER SEQUENCE public.' || quote_ident(r.sequence_name) || ' OWNER TO enutritrack';
    END LOOP;
END \$\$;

-- Transferir propiedad de todas las vistas
DO \$\$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN 
        SELECT table_name 
        FROM information_schema.views 
        WHERE table_schema = 'public' 
    LOOP
        EXECUTE 'ALTER VIEW public.' || quote_ident(r.table_name) || ' OWNER TO enutritrack';
    END LOOP;
END \$\$;
"

echo "✅ Propiedad de tablas transferida a enutritrack"

# 12.4 Configurar permisos por defecto para futuras tablas
echo "📦 Configurando permisos por defecto..."
docker exec enutritrack_postgres psql -U postgres -d enutritrack -c "
-- Asegurar que el usuario enutritrack sea propietario de objetos futuros
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO enutritrack;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO enutritrack;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO enutritrack;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TYPES TO enutritrack;

-- También configurar para el usuario enutritrack mismo
ALTER DEFAULT PRIVILEGES FOR ROLE enutritrack IN SCHEMA public GRANT ALL ON TABLES TO enutritrack;
ALTER DEFAULT PRIVILEGES FOR ROLE enutritrack IN SCHEMA public GRANT ALL ON SEQUENCES TO enutritrack;
ALTER DEFAULT PRIVILEGES FOR ROLE enutritrack IN SCHEMA public GRANT ALL ON FUNCTIONS TO enutritrack;
ALTER DEFAULT PRIVILEGES FOR ROLE enutritrack IN SCHEMA public GRANT ALL ON TYPES TO enutritrack;
"

# 12.2 Aplicar Stored Procedures para el Dashboard
echo "📦 Aplicando Stored Procedures para el Dashboard..."

# Verificar que el archivo de stored procedures existe
STORED_PROCEDURES_FILE="$PROJECT_ROOT/enutritrack-server/scripts/stored-procedures.sql"
if [ -f "$STORED_PROCEDURES_FILE" ]; then
    echo "  Aplicando stored procedures desde: $STORED_PROCEDURES_FILE"
    
    # Ejecutar el archivo SQL en el contenedor PostgreSQL
    if docker exec -i enutritrack_postgres psql -U postgres -d enutritrack -f - < "$STORED_PROCEDURES_FILE"; then
        echo "✅ Stored procedures aplicados exitosamente"
        echo ""
        echo "Procedimientos principales creados:" 
        echo "  - sp_get_all_patients()"
        echo "  - sp_get_patient_details(patient_id)"
        echo "  - sp_update_patient_doctor(patient_id, doctor_id)"
        echo "  - sp_toggle_patient_status(patient_id)"
        echo "  - sp_get_all_doctors()"
        echo "  - sp_get_doctor_patients(doctor_id)"
        echo "  - sp_create_doctor(...)"
        echo "  - sp_update_doctor(...)"
        echo "  - sp_get_all_admins()"
        echo "  - sp_get_admin_details(email)"
        echo "  - sp_get_dashboard_stats()"
        echo "  - sp_get_patients_by_gender()"
        echo "  - sp_get_recent_registrations()"
        echo "  - obtener_historial_medico_completo()"
        echo "  - analisis_progreso_peso()"
        echo "  - reporte_consumo_mensual()"
        echo "  - dashboard_estadisticas_generales()"
        echo "  - buscar_usuarios_por_patron_medico()"
        echo "  - buscar_usuarios_por_perfil()"
        echo "  - buscar_staff_por_patron()"
        echo ""
    else
        echo "⚠️  Error al aplicar stored procedures, continuando..."
    fi
else
    echo "⚠️  Archivo de stored procedures no encontrado en $STORED_PROCEDURES_FILE, continuando..."
fi

echo "✅ Permisos por defecto configurados"

echo "✅ Permisos otorgados al usuario enutritrack"
# 13. Configurar Couchbase
echo "📦 Configurando Couchbase..."
COUCHBASE_URL="http://localhost:8091"
USERNAME="Alfredo"
PASSWORD="alfredo124"
BUCKET_NAME="enutritrack"

# Esperar a que Couchbase esté listo
echo "⏳ Esperando que Couchbase esté listo..."

MAX_ATTEMPTS=30
ATTEMPT=1
COUCHBASE_READY=false

while [ $ATTEMPT -le $MAX_ATTEMPTS ] && [ "$COUCHBASE_READY" = false ]; do
    if curl -s -f "$COUCHBASE_URL" > /dev/null 2>&1; then
        echo "✅ Couchbase está respondiendo"
        COUCHBASE_READY=true
    else
        echo "⏳ Intento $ATTEMPT de $MAX_ATTEMPTS: Couchbase no responde, esperando 10 segundos..."
        sleep 10
        ATTEMPT=$((ATTEMPT + 1))
    fi
done

if [ "$COUCHBASE_READY" = false ]; then
    echo "❌ Couchbase no respondió después de $MAX_ATTEMPTS intentos"
    echo "   Continuando sin Couchbase..."
else
    # Inicializar el cluster
    echo "📦 Inicializando cluster de Couchbase..."

    # Configurar memoria
    if curl -s -X POST "$COUCHBASE_URL/pools/default" -d "memoryQuota=512" -d "indexMemoryQuota=512" > /dev/null 2>&1; then
        echo "✅ Memoria configurada"
    else
        echo "⚠️  No se pudo configurar memoria (puede que ya esté configurado)"
    fi

    # Configurar servicios
    if curl -s -X POST "$COUCHBASE_URL/node/controller/setupServices" -d "services=kv,n1ql,index,fts" > /dev/null 2>&1; then
        echo "✅ Servicios configurados"
    else
        echo "⚠️  No se pudo configurar servicios (puede que ya estén configurados)"
    fi

    # Configurar credenciales
    if curl -s -X POST "$COUCHBASE_URL/settings/web" -d "port=8091" -d "username=$USERNAME" -d "password=$PASSWORD" > /dev/null 2>&1; then
        echo "✅ Credenciales configuradas"
    else
        echo "⚠️  No se pudo configurar credenciales (puede que ya estén configuradas)"
    fi

    # Esperar a que las credenciales estén activas
    echo "⏳ Esperando que las credenciales se activen..."
    sleep 15

    # Verificar que podemos autenticar
    AUTH_ATTEMPTS=10
    AUTH_ATTEMPT=1
    AUTH_READY=false

    while [ $AUTH_ATTEMPT -le $AUTH_ATTEMPTS ] && [ "$AUTH_READY" = false ]; do
        if curl -s -u "$USERNAME:$PASSWORD" "$COUCHBASE_URL/pools" > /dev/null 2>&1; then
            echo "✅ Autenticación exitosa"
            AUTH_READY=true
        else
            echo "⏳ Intento $AUTH_ATTEMPT de $AUTH_ATTEMPTS: Autenticación fallida, reintentando en 5 segundos..."
            sleep 5
            AUTH_ATTEMPT=$((AUTH_ATTEMPT + 1))
        fi
    done

    if [ "$AUTH_READY" = false ]; then
        echo "❌ No se pudo autenticar después de $AUTH_ATTEMPTS intentos"
        echo "   Continuando sin Couchbase..."
    else
        # Crear el bucket
        echo "📦 Creando bucket $BUCKET_NAME..."

        MAX_BUCKET_ATTEMPTS=10
        BUCKET_ATTEMPT=1
        BUCKET_CREATED=false

        while [ $BUCKET_ATTEMPT -le $MAX_BUCKET_ATTEMPTS ] && [ "$BUCKET_CREATED" = false ]; do
            if curl -s -X POST -u "$USERNAME:$PASSWORD" "$COUCHBASE_URL/pools/default/buckets" \
                -d "name=$BUCKET_NAME" \
                -d "ramQuotaMB=128" \
                -d "authType=none" \
                -d "bucketType=couchbase" > /dev/null 2>&1; then
                echo "✅ Bucket $BUCKET_NAME creado exitosamente"
                BUCKET_CREATED=true
            else
                echo "⏳ Intento $BUCKET_ATTEMPT de $MAX_BUCKET_ATTEMPTS: Error creando bucket, reintentando en 10 segundos..."
                sleep 10
                BUCKET_ATTEMPT=$((BUCKET_ATTEMPT + 1))
            fi
        done

        if [ "$BUCKET_CREATED" = false ]; then
            echo "❌ No se pudo crear el bucket después de $MAX_BUCKET_ATTEMPTS intentos"
            echo "   Continuando sin bucket de Couchbase..."
        else
            # Esperar a que el bucket esté listo
            echo "⏳ Esperando que el bucket esté listo..."

            MAX_READY_ATTEMPTS=20
            READY_ATTEMPT=1
            BUCKET_READY=false

            while [ $READY_ATTEMPT -le $MAX_READY_ATTEMPTS ] && [ "$BUCKET_READY" = false ]; do
                if curl -s -u "$USERNAME:$PASSWORD" "$COUCHBASE_URL/pools/default/buckets/$BUCKET_NAME" | grep -q "healthy"; then
                    echo "✅ Bucket está listo y saludable"
                    BUCKET_READY=true
                else
                    echo "⏳ Intento $READY_ATTEMPT de $MAX_READY_ATTEMPTS: Bucket no listo, esperando 5 segundos..."
                    sleep 5
                    READY_ATTEMPT=$((READY_ATTEMPT + 1))
                fi
            done

            if [ "$BUCKET_READY" = false ]; then
                echo "⚠️  Bucket no está completamente listo después de $MAX_READY_ATTEMPTS intentos"
            fi
        fi
    fi

    echo ""
    echo "✅ Couchbase configurado correctamente"
    echo "   URL: http://localhost:8091"
    echo "   Usuario: $USERNAME"
    echo "   Password: $PASSWORD"
    echo "   Bucket: $BUCKET_NAME"
fi

# 14. Modificar frontend para usar rutas relativas a través de Nginx
echo "📦 Configurando frontend para usar rutas relativas..."
cd "$PROJECT_ROOT/enutritrack-client/src/api"

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
cd "$PROJECT_ROOT/enutritrack-client"
npm run build

cd "$PROJECT_ROOT/enutritrack-server"
npm run build

cd "$PROJECT_ROOT/enutritrack-microservices"
npm run build

# 16. Obtener IP externa de la VM
VM_IP=$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google" 2>/dev/null || true)
if [ -z "$VM_IP" ]; then
    VM_IP=$(curl -s ifconfig.me 2>/dev/null || echo "IP-DESCONOCIDA")
fi

echo "🌐 IP externa de la VM: $VM_IP"

# 17. Configurar Nginx
echo "📦 Configurando Nginx..."
sudo tee /etc/nginx/conf.d/enutritrack.conf > /dev/null << NGINX_CONFIG
server {
    listen 80;
    server_name _;

    # CMS/Dashboard del Backend - Rutas específicas del CMS (prioridad alta)
    location ~ ^/auth/(login|dashboard|refresh)\$ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
    }

    # Otras rutas del CMS del backend (páginas HTML)
    location ~ ^/(dashboard|patients-crud|doctors-crud|appointments|food|health|history-medical|medications|allergies|states|types|gender|specialties-crud) {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
    }

    # Microservicios - rutas corregidas para coincidir con los controladores
    location /users/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    location /medical-history/ {
        proxy_pass http://localhost:3002;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    location /nutrition/ {
        proxy_pass http://localhost:3003;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    location /physical-activity/ {
        proxy_pass http://localhost:3005;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    location /recommendations/ {
        proxy_pass http://localhost:3006;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    location /doctors/ {
        proxy_pass http://localhost:3007;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    location /citas-medicas/ {
        proxy_pass http://localhost:3008;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    location /alerts/ {
        proxy_pass http://localhost:3009;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Microservicio de auth
    location /auth/ {
        proxy_pass http://localhost:3004;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Frontend (debe ir al final para capturar todo lo demás)
    location / {
        root $PROJECT_ROOT/enutritrack-client/dist;
        try_files \$uri \$uri/ /index.html;
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
mkdir -p "$PROJECT_ROOT/logs"

cat > "$PROJECT_ROOT/ecosystem.config.js" << PM2_CONFIG
module.exports = {
  apps: [
    {
      name: 'enutritrack-backend',
      script: './enutritrack-server/dist/main.js',
      cwd: '$PROJECT_ROOT',
      env: { NODE_ENV: 'production', PORT: 4000 },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
    },
    {
      name: 'enutritrack-gateway',
      script: './enutritrack-microservices/dist/main.js',
      cwd: '$PROJECT_ROOT',
      env: { NODE_ENV: 'production', PORT: 3000 },
      error_file: './logs/gateway-error.log',
      out_file: './logs/gateway-out.log',
    },
    {
      name: 'enutritrack-auth',
      script: './enutritrack-microservices/dist/auth/main.js',
      cwd: '$PROJECT_ROOT',
      env: { NODE_ENV: 'production', PORT: 3004 },
      error_file: './logs/auth-error.log',
      out_file: './logs/auth-out.log',
    },
    {
      name: 'enutritrack-user',
      script: './enutritrack-microservices/dist/users/main.js',
      cwd: '$PROJECT_ROOT',
      env: { NODE_ENV: 'production', PORT: 3001 },
      error_file: './logs/user-error.log',
      out_file: './logs/user-out.log',
    },
    {
      name: 'enutritrack-doctor',
      script: './enutritrack-microservices/dist/doctor/main.js',
      cwd: '$PROJECT_ROOT',
      env: { NODE_ENV: 'production', PORT: 3007 },
      error_file: './logs/doctor-error.log',
      out_file: './logs/doctor-out.log',
    },
    {
      name: 'enutritrack-nutrition',
      script: './enutritrack-microservices/dist/nutrition/main.js',
      cwd: '$PROJECT_ROOT',
      env: { NODE_ENV: 'production', PORT: 3003 },
      error_file: './logs/nutrition-error.log',
      out_file: './logs/nutrition-out.log',
    },
    {
      name: 'enutritrack-activity',
      script: './enutritrack-microservices/dist/activity/main.js',
      cwd: '$PROJECT_ROOT',
      env: { NODE_ENV: 'production', PORT: 3005 },
      error_file: './logs/activity-error.log',
      out_file: './logs/activity-out.log',
    },
    {
      name: 'enutritrack-recommendation',
      script: './enutritrack-microservices/dist/recommendation/main.js',
      cwd: '$PROJECT_ROOT',
      env: { NODE_ENV: 'production', PORT: 3006 },
      error_file: './logs/recommendation-error.log',
      out_file: './logs/recommendation-out.log',
    },
    {
      name: 'enutritrack-medical',
      script: './enutritrack-microservices/dist/medical-history/main.js',
      cwd: '$PROJECT_ROOT',
      env: { NODE_ENV: 'production', PORT: 3002 },
      error_file: './logs/medical-error.log',
      out_file: './logs/medical-out.log',
    },
    {
      name: 'enutritrack-citas',
      script: './enutritrack-microservices/dist/citas/main.js',
      cwd: '$PROJECT_ROOT',
      env: { NODE_ENV: 'production', PORT: 3008 },
      error_file: './logs/citas-error.log',
      out_file: './logs/citas-out.log',
    },
    {
      name: 'enutritrack-alertas',
      script: './enutritrack-microservices/dist/alertas/main.js',
      cwd: '$PROJECT_ROOT',
      env: { NODE_ENV: 'production', PORT: 3009 },
      error_file: './logs/alertas-error.log',
      out_file: './logs/alertas-out.log',
    },
  ],
};
PM2_CONFIG

# 20. Iniciar servicios con PM2
echo "📦 Iniciando servicios..."
cd "$PROJECT_ROOT"
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
echo "      http://${VM_IP}:5174/"
echo ""
echo "   🏥 CMS/Dashboard de Administrador:"
echo "      http://${VM_IP}:4000/auth/login"
echo "      Credenciales: admin@enutritrack.com / admin123"
echo ""
echo "   📚 Documentación API (Swagger):"
echo "      http://${VM_IP}puerto_del_microservicio/api/docs"
echo ""
echo "   🗄️  Consola Couchbase:"
echo "      http://${VM_IP}:8091"
echo "      Usuario: Alfredo"
echo "      Password: alfredo124"
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
echo "   Ver logs de Couchbase:"
echo "   docker logs enutritrack_couchbase"
echo ""
echo "   Reiniciar bases de datos:"
echo "   cd $PROJECT_ROOT/enutritrack-server"
echo "   docker compose restart"
echo ""