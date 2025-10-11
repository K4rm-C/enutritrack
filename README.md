# Enutritrack 🍏💪

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Couchbase](https://img.shields.io/badge/Couchbase-EA2328?style=for-the-badge&logo=couchbase&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**Enutritrack** es una plataforma integral de salud preventiva que utiliza inteligencia artificial para proporcionar planes de nutrición personalizados y seguimiento de actividad física.

## ✨ Características Principales

### 🍎 Gestión Nutricional Avanzada
- **Registro de alimentos** con base de datos completa
- **Seguimiento calórico** y de macronutrientes
- **Planes alimenticios** personalizados por IA
- **Recomendaciones inteligentes** basadas en objetivos

### 🏃‍♂️ Monitoreo de Actividad Física
- **Registro de ejercicios** y actividades
- **Cálculo de calorías** quemadas

### 👤 Perfiles Personalizados
- **Historial médico completo**
- **Objetivos personalizados** de salud
- **Preferencias alimenticias** y restricciones
- **Seguimiento de evolución** de peso y medidas

### 📊 Analytics y Reportes
- **Dashboards interactivos** con métricas de salud
- **Reportes personalizados** exportables
- **Análisis predictivo** de progreso
- **Segmentación** de usuarios por perfiles

## 🏗️ Arquitectura del Sistema

### Bases de Datos
- **PostgreSQL**: Datos transaccionales y relaciones complejas https://www.postgresql.org/download/
- **Couchbase**: Documentos JSON y perfiles de usuarios
- **Redis**: Caché, sesiones y colas de mensajes

## 🚀 Guía de Inicio Rápido

### Prerrequisitos

- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **Docker Desktop** ([Descargar](https://www.docker.com/products/docker-desktop))
- **Git**

Descarga la última versión LTS desde la página oficial:
👉 https://nodejs.org/

Verifica la instalación:
Verifica las instalaciones:
```bash
node -v
npm -v
docker --version
docker-compose --version
```
 Verifica:
  nest --version
### Paso a Paso - Primera Configuración

- **Docker** y **Docker Compose** - deberia dejar abierto DOCKER
- **npm (para la instalacion de dependencias)**
- **VSCODE**


#### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/AlfredoPerez73/enutritrack.git
cd enutritrack
```

#### 2️⃣ Instalar Dependencias

```powershell
# Frontend
cd enutritrack-client
npm install

# Backend
cd ../enutritrack-server
npm install

# Microservicios
cd ../enutritrack-microservices
npm install

# Volver a la raíz
cd ..
```

#### 3️⃣ Levantar Bases de Datos con Docker

```powershell
cd enutritrack-server
docker-compose up -d
```

Espera 30-60 segundos para que los servicios se inicialicen completamente.

#### 4️⃣ Configurar Couchbase

1. Abre `http://localhost:8091`
2. Configura el cluster:
   - Username: `Alfredo`
   - Password: `alfredo124` (sin caracteres especiales)
3. Crea el bucket:
   - Name: `enutritrack`
   - Bucket Type: Couchbase
4. En Query Workbench, ejecuta:
   ```sql
   CREATE PRIMARY INDEX ON `enutritrack`;
   ```

#### 5️⃣ Inicializar Base de Datos PostgreSQL

**Opción A: Con pgAdmin**
1. Conecta a PostgreSQL (`localhost:5433`, user: `postgres`, password: `1234`)
2. Abre y ejecuta `enutritrack-server/scripts/init-db.sql`

**Opción B: Con psql (si está en PATH)**
```bash
psql -U postgres -d enutritrack -p 5433 -f scripts/init-db.sql
```

Esto crea:
- Todas las tablas del sistema
- El primer superusuario con credenciales:
  - Email: `admin@enutritrack.com`
  - Password: `admin123`

#### 6️⃣ Aplicar Stored Procedures para Dashboard

```powershell
cd scripts
.\apply-stored-procedures.ps1
```

O manualmente con pgAdmin ejecutando `scripts/stored-procedures.sql`

#### 7️⃣ Iniciar Servicios

Abre **10 terminales** y ejecuta en cada una:

```powershell
# Terminal 1 - Backend
cd enutritrack-server
npm run start:dev

# Terminal 2 - Gateway de Microservicios
cd enutritrack-microservices
npm run dev:gateway

# Terminal 3 - Microservicio de Auth
cd enutritrack-microservices
npm run dev:auth

# Terminal 4 - Microservicio de Usuarios
cd enutritrack-microservices
npm run dev:user

# Terminal 5 - Microservicio de Doctores
cd enutritrack-microservices
npm run dev:doctor

# Terminal 6 - Microservicio de Nutrición
cd enutritrack-microservices
npm run dev:nutrition

# Terminal 7 - Microservicio de Actividad
cd enutritrack-microservices
npm run dev:activity

# Terminal 8 - Microservicio de Recomendaciones
cd enutritrack-microservices
npm run dev:recommendation

# Terminal 9 - Microservicio de Historial Médico
cd enutritrack-microservices
npm run dev:medical

# Terminal 10 - Frontend
cd enutritrack-client
npm run dev
```

#### 8️⃣ Acceder a las Aplicaciones

**Dashboard de Superusuario (Backend)**
- URL: `http://localhost:4000/auth/login`
- Email: `admin@enutritrack.com`
- Password: `admin123`
- Funcionalidades:
  - 📊 Gestión de pacientes (ver detalles completos, asignar doctor, activar/desactivar)
  - 👨‍⚕️ Gestión de doctores (crear nuevos, ver pacientes asignados)
  - 🔐 Gestión de administradores
  - 📈 Estadísticas del sistema en tiempo real
  - ⚡ Acceso directo a BD mediante stored procedures

**Aplicación de Doctores (Frontend)**
- URL: `http://localhost:5174`
- Credenciales: Crear doctor desde el dashboard de superusuario primero

**Documentación API**
- Swagger: `http://localhost:4000/api/docs`

## 📁 Estructura del Proyecto

```
Cliente (enutritrack-client)
enutritrack/enutritrack-client/src/
├── api/
├── components/
├── context/
├── css/
├── hooks/
├── pages/
├── routes/
├── App.jsx
├── ProtectedRoutes.jsx
└── main.jsx
Microservicios (enutritrack-microservices)
enutritrack/enutritrack-microservices/src/
├── activity/
├── auth/
├── medical-history/
├── nutrition/
├── doctor/
├── recommendation/
├── users/
├── app.module.ts
└── main.ts
Servidor (enutritrack-server)
enutritrack/enutritrack-server/src/
├── activity/
├── auth/
├── couchbase/
├── medical-history/
├── doctor/
├── nutrition/
├── recommendation/
├── redis/
├── test/
├── users/
├── app.module.ts
└── main.ts
```

## 🔧 Configuración
### Puertos de los Servicios

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| BACKEND | 4000 | Punto de entrada principal |
| MICROSERVICIOS MAIN | 3000 | MAIN Principal |
| MICROSERVICIOS USUARIO | 3001 | Gestion de usuario |
| MICROSERVICIOS HISTORIAL MEDICO | 3002 | Gestion de historial medico |
| MICROSERVICIOS NUTRICION | 3003 | Gestion de registro de comida |
| MICROSERVICIOS AUTENTICACION | 3004 | Autorizacion y validacion de usuario |
| MICROSERVICIOS ACTIVIDAD FISICA | 3005 | Gestion de actividades fiscias del usuario |
| MICROSERVICIOS RECOMENDACIONES IA | 3006 | Gestion de recomendaciones hechas por IA |
| MICROSERVICIOS DOCTORES | 3007 | Microservicio para los doctores |
| FRONTEND | 5174 | Gestión de usuarios por el doctor |

## 🔧 Troubleshooting

### Problemas Comunes y Soluciones

#### Error de conexión a Couchbase
```bash
# Reinicia el contenedor
docker-compose restart couchbase

# Verifica que las credenciales sean correctas:
# Username: Alfredo (con mayúscula inicial)
# Password: alfredo124 (sin caracteres especiales)
```

#### Error de conexión a PostgreSQL
```bash
# Reinicia el contenedor
docker-compose restart postgres

# Verifica que el puerto 5433 esté disponible
# Credenciales: postgres / 1234
```

#### Error de conexión a Redis
```bash
docker-compose restart redis
```

#### El backend no arranca - Error con stored procedures
Asegúrate de haber ejecutado:
```powershell
cd enutritrack-server/scripts
.\apply-stored-procedures.ps1
```

#### No puedo acceder al dashboard de superusuario
1. Verifica que el backend esté corriendo en `http://localhost:4000`
2. Verifica que el superusuario exista en la base de datos:
   ```sql
   SELECT * FROM cuentas WHERE email = 'admin@enutritrack.com';
   ```
3. Si no existe, ejecuta `scripts/init-db.sql` o `scripts/create-admin.ps1`

#### Error 401 en el frontend
Borra las cookies y vuelve a hacer login. El token JWT puede haber expirado.

### Crear Superusuario Adicional

Si necesitas crear otro administrador manualmente:

```powershell
cd enutritrack-server/scripts
.\create-admin.ps1
```

O ejecuta directamente en PostgreSQL:
```sql
-- 1. Crear cuenta
INSERT INTO cuentas (email, password_hash, tipo_cuenta, activa)
VALUES ('nuevoadmin@example.com', crypt('password123', gen_salt('bf')), 'admin', TRUE)
RETURNING id;

-- 2. Crear perfil de admin (usa el id de arriba)
INSERT INTO perfil_admin (cuenta_id, nombre)
VALUES ('uuid-de-cuenta-aqui', 'Nombre del Admin');
```

### Verificar Estado de Servicios

```powershell
# Ver contenedores Docker activos
docker ps

# Ver logs de un contenedor específico
docker logs enutritrack_postgres
docker logs enutritrack_couchbase
docker logs enutritrack_redis
```
   
## 🏆 Equipo

- **Alfredo José** - Project Manager
- **Contribuidores**
  -- **Juan Carmona**
  -- **Andres Gonzalez**
  -- **Angel Muñoz**
