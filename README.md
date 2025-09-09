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
- **PostgreSQL**: Datos transaccionales y relaciones complejas
- **Couchbase**: Documentos JSON y perfiles de usuarios
- **Redis**: Caché, sesiones y colas de mensajes

## 🚀 Comenzando

### Prerrequisitos

- **Node.js** 18+ 
- **NestJs**
- **Docker** y **Docker Compose** - deberia dejar prendido
- **npm (para la instalacion de dependencias)**
- **VSCODE**

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/AlfredoPerez73/enutritrack.git
```

2. **Iniciar contenedores Docker**
```bash
docker-compose up -d
  - REDIS
  - COUCHBASE
  - POSTGRES
```

3. **Instalar dependencias**
```bash
# Instalar para cada directorio:
cd enutrireack-client && npm install
cd enutrireack-server && npm install
cd enutrireack-microservices && npm install
```

4. **Clonar el repositorio**
```bash
git clone https://github.com/AlfredoPerez73/enutritrack.git
EN LA CONSOLA DE VSCODE O EL CMD IR A ESTOS DIRECTORIOS
cd enutritrack
cd enutritrack-client (FRONTEND)
cd enutritrack-server (BACKEND)
cd enutritrack-microservices (MICROSERVICIOS) MAIN
    cd enutritrack-microservices/src/auth
    cd enutritrack-microservices/src/users
    cd enutritrack-microservices/src/nutrition
    cd enutritrack-microservices/src/activity
    cd enutritrack-microservices/src/recommendation
    cd enutritrack-microservices/src/medical-history
    cd enutritrack-microservices/src/doctor

```

5. **Iniciar los microservicios**
```bash
# En terminales separadas
PARA EL BACKEND: npm run start:dev Y MICROSERVICIOS (MAIN): npm run dev:gateway
  -- MICROSERVICIO DE USUARIOS: npm run dev:user
  -- MICROSERVICIO DE HISTORIAL MEDICO: npm run dev:medical
  -- MICROSERVICIO DE NUTRICION: npm run dev:nutrition
  -- MICROSERVICIO DE AUNTENTICACION: npm run dev:auth
  -- MICROSERVICIO DE ACTIVIDAD: npm run dev:activity
  -- MICROSERVICIO DE RECOMENDACIONES: npm run dev:recommendation
  -- MICROSERVICIO DE DOCTOR: npm run dev:doctor
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

### Problemas comunes

1. **Error de conexión a Couchbase**
   ```bash
   docker-compose restart couchbase
   ```

2. **Error de conexión a Redis**
   ```bash
   docker-compose restart redis
   ```

2. **Error de conexión a postgres**
   ```bash
   docker-compose restart postgres
   ```
   
## 🏆 Equipo

- **Alfredo José** - Project Manager
- **Contribuidores**
  -- **Juan Carmona**
  -- **Andres Gonzalez**
  -- **Angel Muñoz**
