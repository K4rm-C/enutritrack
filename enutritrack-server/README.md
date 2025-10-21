<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

EnutriTrack Backend Server - Sistema de gestión nutricional con dashboard de superusuario que accede directamente a la base de datos mediante stored procedures.

## ✅ Checklist de Setup Inicial

Para nuevos desarrolladores que clonan el repositorio:

- [ ] Instalar Node.js 18+ y Docker Desktop
- [ ] Clonar repositorio y ejecutar `npm install`
- [ ] Iniciar Docker: `docker-compose up -d`
- [ ] Configurar Couchbase en `http://localhost:8091` (Usuario: `Alfredo`, Password: `alfredo124`)
- [ ] **Primero:** Iniciar backend con `npm run start:dev` (para que TypeORM cree tablas base)
- [ ] **Luego:** Detener servidor y ejecutar `scripts/init-db.sql` para poblar datos
- [ ] Ejecutar `scripts/apply-stored-procedures.ps1` para habilitar el dashboard
- [ ] Reiniciar backend: `npm run start:dev`
- [ ] Acceder al dashboard: `http://localhost:4000/auth/login` (admin@enutritrack.com / admin123)

Ver instrucciones detalladas abajo ⬇️

## Project setup

```bash
$ npm install
```

## Initial Setup - Configuración Completa

### 1. Levantar Servicios de Base de Datos

```powershell
# Inicia PostgreSQL, Couchbase y Redis con Docker Compose
docker-compose up -d
```

Espera unos 30-60 segundos para que los servicios estén completamente iniciados.

### 2. Inicializar la Base de Datos

> **⚠️ CRÍTICO: Orden de Ejecución**

El archivo `scripts/init-db.sql` modifica y popula tablas existentes, por lo que **DEBE ejecutarse DESPUÉS** de que TypeORM haya creado la estructura base.

#### **Paso 2A: Primero ejecutar TypeORM (Obligatorio)**

```bash
# Esto crea las tablas base (cuentas, perfil_usuario, perfil_doctor, etc.)
npm run start:dev
```

Espera unos 10-15 segundos hasta que veas mensajes como:
- `Database connection established`
- `Schema synchronization completed`

Luego **detén el servidor** (Ctrl+C).

#### **Paso 2B: Luego ejecutar init-db.sql**

**Opción A: Ejecución manual con pgAdmin**
1. Abre pgAdmin y conecta a `localhost:5433`
2. Abre y ejecuta `scripts/init-db.sql` en la base de datos `enutritrack`

**Opción B: Usando psql**
```bash
psql -U postgres -d enutritrack -p 5433 -f scripts/init-db.sql
```

> **¿Por qué este orden?** El script `init-db.sql` modifica tablas existentes mediante `ALTER TABLE` y `INSERT`. Si se ejecuta antes de que TypeORM cree la estructura base, fallará con errores como "relation does not exist".

### 3. Configurar Couchbase Manualmente

Abre `http://localhost:8091` y configura:
- Username: `Alfredo`
- Password: `alfredo124`
- Bucket: `enutritrack`
- Crear Primary Index en Query Workbench:
  ```sql
  CREATE PRIMARY INDEX ON `enutritrack`;
  ```

### 4. Crear Superusuario (Si no usaste init-db.sql)

Si prefieres crear el admin vía API en lugar de SQL directo:

```powershell
cd scripts
.\create-admin.ps1
```

**Credenciales por defecto del superusuario:**
- Email: `admin@enutritrack.com`
- Password: `admin123`

### 5. Aplicar Stored Procedures para el Dashboard

El dashboard de superusuario utiliza **stored procedures** para acceso directo a la base de datos (sin pasar por microservicios). Estos deben aplicarse después de inicializar la base de datos.

### Opción 1: Script Automático (PowerShell)

```powershell
cd scripts
.\apply-stored-procedures.ps1
```

### Opción 2: Manual con psql

```bash
psql -U postgres -d enutritrack -p 5433 -f scripts/stored-procedures.sql
```

### Opción 3: Desde pgAdmin

1. Abre pgAdmin y conecta a la base de datos `enutritrack`
2. Abre el archivo `scripts/stored-procedures.sql`
3. Ejecuta el script completo

### Stored Procedures Incluidos

**Dashboard & Estadísticas:**
- `sp_get_dashboard_stats()` - Estadísticas generales del sistema
- `sp_get_patients_by_gender()` - Distribución de pacientes por género
- `sp_get_recent_registrations()` - Últimos registros de pacientes y doctores

**Gestión de Pacientes:**
- `sp_get_all_patients()` - Listado completo de pacientes
- `sp_get_patient_details(patient_id)` - Detalles completos de un paciente
- `sp_update_patient_doctor(patient_id, doctor_id)` - Asignar/cambiar doctor
- `sp_toggle_patient_status(patient_id)` - Activar/desactivar cuenta de paciente

**Gestión de Doctores:**
- `sp_get_all_doctors()` - Listado completo de doctores con estadísticas
- `sp_get_doctor_patients(doctor_id)` - Pacientes de un doctor específico
- `sp_create_doctor(...)` - Crear nuevo doctor

**Gestión de Administradores:**
- `sp_get_all_admins()` - Listado de administradores
- `sp_get_admin_details(email)` - Detalles de un administrador

### 6. Iniciar el Backend (Reiniciar)

Después de haber ejecutado todos los scripts anteriores:

```bash
# watch mode (recomendado para desarrollo)
$ npm run start:dev

# production mode
$ npm run start:prod
```

> **Nota:** Este será el segundo inicio del backend en el proceso de setup. El primero fue necesario para crear las tablas base antes de ejecutar `init-db.sql`.

### 7. Acceder al Dashboard de Superusuario

Una vez que el backend esté corriendo:

1. **URL de Login**: `http://localhost:4000/auth/login`
2. **Credenciales**: Usa las del superusuario creado
3. **Dashboard**: Después del login, te redirige automáticamente a `http://localhost:4000/auth/dashboard`

**Funcionalidades del Dashboard:**
- 📊 **Dashboard**: Estadísticas generales y registros recientes
- 👥 **Pacientes**: Gestión completa de pacientes (ver detalles, asignar doctor, activar/desactivar)
- 👨‍⚕️ **Doctores**: Gestión de doctores (crear nuevos, ver pacientes asignados)
- 🔐 **Administradores**: Ver información de administradores del sistema
- 📚 **Documentación API**: Enlace directo a Swagger (`/api/docs`)

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
