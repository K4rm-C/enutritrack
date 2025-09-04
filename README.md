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

### Microservicios
```

```

### Bases de Datos
- **PostgreSQL**: Datos transaccionales y relaciones complejas
- **Couchbase**: Documentos JSON y perfiles de usuarios
- **Redis**: Caché, sesiones y colas de mensajes

## 🚀 Comenzando

### Prerrequisitos

- **Node.js** 18+ 
- **Docker** y **Docker Compose**
- **npm**

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tuusuario/enutritrack.git
cd enutritrack
cd enutritrack-client (FRONTEND)
cd enutritrack-server (BACKEND)
cd enutritrack-microservices (MICROSERVICIOS)
```

2. **Instalar dependencias**
```bash
# Instalar en cada microservicio
cd enutrireack-client && npm install
cd enutrireack-server && npm install
cd enutrireack-microservices && npm install
```

3. **Iniciar contenedores Docker**
```bash
docker-compose up -d
```

4. **Iniciar los microservicios**
```bash
# En terminales separadas
PARA EL BACKEND Y MICROSERVICIOSnpm run start:dev
PARA EL FRONTEND: npm run dev

```

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
├── nutrition/
├── recommendation/
├── redis/
├── test/
├── users/
├── app.module.ts
└── main.ts
```

## 🔧 Configuración

### Variables de Entorno

```env
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=1234
DB_DATABASE=enutritrack

# Couchbase
COUCHBASE_URL=couchbase://localhost
COUCHBASE_USERNAME=admin
COUCHBASE_PASSWORD=password
COUCHBASE_BUCKET=enutritrack

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redispassword

# JWT
JWT_SECRET=tu-token-super-secreto
JWT_EXPIRES_IN=24h
```

### Puertos de los Servicios

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| BACKEND | 4000 | Punto de entrada principal |
| MICROSERVICIOS | 3000 | Autenticación y autorización |
| FRONTEND | 5174 | Gestión de usuarios |

### Endpoints Principales

#### Autenticación
```http
POST /auth/login
POST /auth/register
POST /auth/refresh
```

### Problemas comunes

1. **Error de conexión a Couchbase**
   ```bash
   docker-compose restart couchbase
   ```

2. **Error de conexión a Redis**
   ```bash
   docker-compose restart redis
   ```

3. **Microservicios no se comunican**
   Verificar que RabbitMQ esté ejecutándose:
   ```bash
   docker-compose logs rabbitmq
   ```

### Logs y Monitoreo

Ver logs de un servicio específico:
```bash
docker-compose logs [nombre-servicio]
```

## 🏆 Equipo

- **Alfredo José** - Desarrollo Backend & Arquitectura
- **Contribuidores** - [Lista de contribuidores](https://github.com/tuusuario/enutritrack/contributors)

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:

- 📧 **Email**: soporte@enutritrack.com}
---

**Enutritrack** - Transformando la salud preventiva through tecnología inteligente 🚀
