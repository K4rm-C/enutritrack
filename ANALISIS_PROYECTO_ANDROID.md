# An?lisis del Proyecto Enutritrack para App Android

## ?? Resumen Ejecutivo

Este documento resume la estructura del frontend web y microservicios del proyecto Enutritrack para facilitar el desarrollo de la aplicaci?n Android en Kotlin.

---

## ??? Arquitectura del Sistema

### Frontend Web Actual (`enutritrack-client`)

**Tecnolog?as:**
- React 19.1.1
- Axios para peticiones HTTP
- React Router para navegaci?n
- Recharts para gr?ficas (versi?n 3.1.2)
- React Context API para estado global
- Cookies (js-cookie) para almacenamiento de tokens

**Puertos de Microservicios:**
- **Auth**: `http://localhost:3004/`
- **Users**: `http://localhost:3001/`
- **Medical History**: `http://localhost:3002/`
- **Nutrition**: `http://localhost:3003/`
- **Activity**: `http://localhost:3005/`
- **Recommendation**: `http://localhost:3006/`

---

## ?? Sistema de Autenticaci?n JWT

### Endpoints de Autenticaci?n

**POST `/auth/login`**
- Body: `{ email: string, password: string, userType?: string }`
- Response: 
  ```json
  {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "user": { /* objeto usuario */ }
  }
  ```
- **Tokens**: 
  - `access_token`: Expira en 15 minutos (1/96 d?as)
  - `refresh_token`: Expira en 7 d?as

**POST `/auth/validate`**
- Body: `{ token: string }`
- Response: `{ valid: boolean, user?: User }`

**POST `/auth/refresh`**
- Body: `{ refresh_token: string }`
- Response: Nuevos tokens

**POST `/auth/logout`**
- Elimina tokens del servidor (el cliente debe eliminar cookies/tokens locales)

**GET `/auth/me`** (requiere JWT)
- Response: `{ user: User }`

### Manejo de Tokens en Frontend Web

El frontend web actual:
- Almacena tokens en **cookies del navegador** (HttpOnly recomendado para producci?n)
- Usa `js-cookie` para gesti?n
- Interceptores de Axios a?aden autom?ticamente `Authorization: Bearer {token}`

**Para Android:**
- Usar **EncryptedSharedPreferences** (AndroidX Security)
- Almacenar `access_token` y `refresh_token` de forma cifrada
- Interceptor de Retrofit/OkHttp para a?adir token autom?ticamente
- Renovaci?n autom?tica en caso de 401

---

## ?? Microservicios Disponibles

### 1. Auth Service (Puerto 3004)

**Endpoints:**
- `POST /auth/login` - Iniciar sesi?n
- `POST /auth/validate` - Validar token
- `POST /auth/refresh` - Renovar tokens
- `POST /auth/logout` - Cerrar sesi?n
- `GET /auth/me` - Obtener usuario actual

### 2. Users Service (Puerto 3001)

**Endpoints:**
- `GET /users` - Listar todos los usuarios
- `GET /users/doctor/:doctorId` - Usuarios de un doctor espec?fico
- `GET /users/:id` - Obtener usuario por ID
- `GET /users/email/:email` - Buscar por email
- `POST /users` - Crear usuario
- `POST /users/complete` - Crear usuario completo
- `PATCH /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

**Estructura de Usuario:**
```typescript
{
  id: string (UUID)
  nombre: string
  email: string
  genero: { id, nombre }
  fecha_nacimiento: Date
  altura: number (cm)
  peso_actual: number (kg)
  objetivo_peso: number (kg)
  nivel_actividad: string
  doctorId: string
  imc?: number
}
```

### 3. Nutrition Service (Puerto 3003)

**Endpoints:**
- `POST /nutrition` - Crear registro de comida
- `GET /nutrition/user/:userId` - Todos los registros de un usuario
- `GET /nutrition/daily-summary/:userId?date=YYYY-MM-DD` - Resumen diario
- `GET /nutrition/:id` - Obtener registro por ID
- `PATCH /nutrition/:id` - Actualizar registro
- `DELETE /nutrition/:id` - Eliminar registro

**Modelo FoodRecord:**
```typescript
{
  id: string (UUID)
  usuario: User
  fecha: Date
  tipo_comida: TipoComidaEnum // DESAYUNO, ALMUERZO, CENA, MERIENDA
  descripcion: string
  calorias: number
  proteinas: number (g)
  carbohidratos: number (g)
  grasas: number (g)
  created_at: Date
  updated_at: Date
}
```

**Daily Summary Response:**
```typescript
{
  fecha: Date
  totalCalorias: number
  totalProteinas: number
  totalCarbohidratos: number
  totalGrasas: number
  registros: FoodRecord[]
}
```

### 4. Activity Service (Puerto 3005)

**Endpoints:**
- `POST /physical-activity` - Crear actividad f?sica
- `GET /physical-activity/user/:userId` - Actividades de un usuario
- `GET /physical-activity/weekly-summary/:userId?startDate=YYYY-MM-DD` - Resumen semanal
- `GET /physical-activity/:id` - Obtener actividad por ID
- `PATCH /physical-activity/:id` - Actualizar actividad
- `DELETE /physical-activity/:id` - Eliminar actividad

**Modelo PhysicalActivity:**
```typescript
{
  id: string (UUID)
  usuario_id: string
  tipo_actividad: string // "Caminata", "Ciclismo", "Yoga", etc.
  duracion: number (minutos)
  caloriasQuemadas: number
  fecha: Date
  created_at: Date
}
```

**Weekly Summary Response:**
```typescript
{
  semanaInicio: Date
  semanaFin: Date
  totalMinutos: number
  totalCalorias: number
  actividades: PhysicalActivity[]
  promedioDiarioMinutos: number
}
```

### 5. Recommendation Service (Puerto 3006)

**Endpoints:**
- `POST /recommendations` - Crear recomendaci?n personalizada
- `GET /recommendations/user/:userId` - Todas las recomendaciones de un usuario
- `GET /recommendations/user/:userId/type/:type` - Recomendaciones por tipo
- `POST /recommendations/quick-nutrition/:userId` - Recomendaci?n r?pida nutricional
- `POST /recommendations/quick-exercise/:userId` - Recomendaci?n r?pida ejercicio
- `POST /recommendations/quick-medical/:userId` - Recomendaci?n r?pida m?dica
- `PATCH /recommendations/:id/deactivate` - Desactivar recomendaci?n

**Tipos de Recomendaci?n:**
- `NUTRITION` - Recomendaciones nutricionales
- `EXERCISE` - Recomendaciones de ejercicio
- `MEDICAL` - Recomendaciones m?dicas

**Modelo Recommendation:**
```typescript
{
  id: string (UUID)
  usuarioId: string
  tipo: RecommendationType
  contenido: string
  activa: boolean
  fechaCreacion: Date
  datosEntrada: object
}
```

### 6. Medical History Service (Puerto 3002)

**Endpoints:**
- `POST /medical-history` - Crear historial m?dico
- `GET /medical-history/:userId` - Historial de un usuario
- `PATCH /medical-history/:userId` - Actualizar historial

---

## ?? Datos Disponibles para Gr?ficas

### Gr?ficas Potenciales (6+ requeridas)

#### 1. **Gr?fica de Calor?as Diarias (L?nea o Barras)**
- **Datos**: `/nutrition/daily-summary/:userId?date=YYYY-MM-DD`
- **M?tricas**: Calor?as consumidas por d?a
- **Per?odo**: ?ltimos 7, 14, 30 d?as
- **KPI**: Total semanal, promedio diario, tendencia

#### 2. **Distribuci?n de Macronutrientes (Circular/Dona)**
- **Datos**: Daily Summary
- **M?tricas**: Prote?nas, Carbohidratos, Grasas (en % o gramos)
- **KPI**: Balance nutricional, porcentajes ideales

#### 3. **Actividad F?sica Semanal (Barras)**
- **Datos**: `/physical-activity/weekly-summary/:userId`
- **M?tricas**: Minutos activos, calor?as quemadas por d?a
- **KPI**: Total semanal, promedio diario, meta cumplida

#### 4. **Evoluci?n de Peso (L?nea)**
- **Datos**: Historial de `peso_actual` del usuario
- **M?tricas**: Peso vs objetivo, IMC
- **KPI**: Progreso hacia objetivo, tendencia

#### 5. **Comparativa Mes Actual vs Anterior (Barras Agrupadas)**
- **Datos**: Res?menes diarios/semanales
- **M?tricas**: Comparar calor?as, actividad, etc.
- **KPI**: Crecimiento/mejora, diferencia porcentual

#### 6. **Distribuci?n de Actividades (Circular/Donut)**
- **Datos**: `/physical-activity/user/:userId`
- **M?tricas**: Tipos de actividad m?s frecuentes
- **KPI**: Diversidad de ejercicios, favoritos

#### 7. **Timeline de Comidas (Gr?fica de ?rea)**
- **Datos**: `/nutrition/user/:userId`
- **M?tricas**: Calor?as por tipo de comida (Desayuno, Almuerzo, Cena, Merienda)
- **KPI**: Distribuci?n horaria, balance

#### 8. **Estado de Sincronizaci?n/Cach? (Indicador)**
- **Datos**: Timestamps de ?ltima sincronizaci?n
- **M?tricas**: ?ltima actualizaci?n, estado online/offline
- **KPI**: Datos pendientes de sincronizar

---

## ?? KPIs Clave Identificados

### Dashboard Principal

1. **Total de Pacientes** (para doctores)
   - Fuente: `GET /users/doctor/:doctorId`
   - M?trica: `array.length`

2. **Nuevos Pacientes desde ?ltima Visita**
   - Comparar `created_at` de usuarios vs ?ltima fecha de login del doctor
   - Fuente: Filtrar por fecha

3. **Estado de Conexi?n**
   - Online/Offline (Android NetworkCallback)
   - Indicador visual en header

4. **Total de Contenidos Disponibles**
   - Suma de registros de nutrici?n + actividad + recomendaciones
   - Fuente: Contadores de cada servicio

5. **Resumen Nutricional Diario**
   - Calor?as, prote?nas, carbohidratos, grasas
   - Fuente: `/nutrition/daily-summary/:userId`

6. **Actividad Semanal**
   - Total de minutos, calor?as quemadas
   - Fuente: `/physical-activity/weekly-summary/:userId`

---

## ??? Estructura de Datos para Cach? Offline

### Recomendaciones de Almacenamiento (Room Database)

#### Entities Sugeridas:

1. **UserEntity**
   - Campos del modelo User
   - `lastSyncDate: Date`
   - `isDirty: Boolean` (marcar si necesita sincronizaci?n)

2. **FoodRecordEntity**
   - Todos los campos de FoodRecord
   - `syncStatus: SyncStatus` (SYNCED, PENDING, FAILED)
   - `lastModified: Date`

3. **PhysicalActivityEntity**
   - Todos los campos de PhysicalActivity
   - `syncStatus: SyncStatus`

4. **RecommendationEntity**
   - Todos los campos de Recommendation

5. **MedicalHistoryEntity**
   - Campos del historial m?dico
   - `syncStatus: SyncStatus`

6. **SyncLogEntity** (para observabilidad)
   - `id`, `entityType`, `entityId`, `syncDate`, `status`, `error`

---

## ?? Componentes UI Identificados en Frontend Web

### Dashboard Principal (`dashboard.jsx`)

**Componentes clave:**
1. **DashboardHeader** - Saludo, fecha, hora actual
2. **DashboardStats** - Tarjetas de m?tricas (Pacientes, Consultas, Alertas)
3. **PatientsOverview** - Lista de pacientes recientes
4. **AlertsOverview** - Alertas pendientes
5. **QuickActionsSection** - Acciones r?pidas (Nueva Consulta, Agregar Paciente)
6. **HealthTipsSection** - Recomendaciones m?dicas

### Gesti?n de Usuarios (`users-tracker.jsx`)

**Funcionalidades:**
- Lista paginada de pacientes
- Filtros: g?nero, nivel de actividad, b?squeda por nombre/email
- Modal de detalles con pesta?as:
  - **Personal**: Informaci?n b?sica, m?tricas corporales, IMC
  - **Nutrici?n**: Panel nutricional, registro de comidas
  - **Actividad**: Resumen de actividad, historial de ejercicios
  - **IA Recomendaciones**: Recomendaciones generadas por IA
  - **Historial M?dico**: Historial completo, signos vitales

---

## ??? Stack Tecnol?gico Recomendado para Android

### Core
- **Kotlin** (100%)
- **Android SDK**: MinSdk 24 (Android 7.0), TargetSdk 34
- **Arquitectura**: MVVM con Android Architecture Components

### Networking
- **Retrofit 2** + **OkHttp** - Cliente HTTP
- **Gson/Moshi** - Serializaci?n JSON
- **Interceptor personalizado** para JWT y refresh tokens

### Almacenamiento
- **Room Database** - Base de datos local
- **EncryptedSharedPreferences** (AndroidX Security) - Tokens JWT cifrados
- **DataStore Preferences** - Configuraciones (opcional)

### Gr?ficas
- **MPAndroidChart** - Librer?a robusta y popular
- Alternativa: **Compose Charts** (si se usa Jetpack Compose)
- **Victory Native** (si se usa React Native) - NO aplica aqu?

### UI/UX
- **Jetpack Compose** (Recomendado) o **View System**
- **Material Design 3** - Componentes modernos
- **Navigation Component** - Navegaci?n entre pantallas

### Estado y Reactividad
- **Flow/StateFlow** - Programaci?n reactiva
- **ViewModel** - Gesti?n de estado UI
- **LiveData** (solo si no se usa Compose)

### Sincronizaci?n Offline
- **WorkManager** - Tareas en background para sincronizaci?n
- **NetworkCallback** - Detecci?n de conexi?n
- **SyncAdapter** (legacy) o WorkManager (moderno)

### Seguridad
- **AndroidX Security Crypto** - Encriptaci?n de SharedPreferences
- **Certificate Pinning** - Para producci?n (OkHttp)
- **ProGuard/R8** - Ofuscaci?n de c?digo

### Testing
- **JUnit** - Unit tests
- **Espresso** - UI tests
- **MockWebServer** - Tests de networking

---

## ?? Estructura de Paquetes Recomendada

```
app/src/main/java/com/enutritrack/
??? data/
?   ??? local/
?   ?   ??? database/          # Room Database
?   ?   ??? entities/          # Room Entities
?   ?   ??? daos/              # Data Access Objects
?   ?   ??? preferences/       # EncryptedSharedPreferences
?   ??? remote/
?   ?   ??? api/               # Retrofit interfaces
?   ?   ??? models/            # DTOs/Models de red
?   ?   ??? interceptors/     # JWT interceptor, etc.
?   ??? repository/            # Repositories (fuente ?nica de verdad)
??? domain/
?   ??? models/                # Modelos de dominio
?   ??? usecases/              # Casos de uso
??? ui/
?   ??? login/
?   ??? dashboard/
?   ??? patients/
?   ??? nutrition/
?   ??? activity/
?   ??? reports/
?   ??? components/            # Componentes reutilizables
??? di/                        # Dependency Injection (Hilt/Koin)
??? utils/
    ??? extensions/
    ??? constants/
    ??? security/
```

---

## ?? Flujo de Autenticaci?n Recomendado

### 1. Login
```
Usuario ingresa credenciales
  ?
POST /auth/login
  ?
Guardar tokens en EncryptedSharedPreferences
  ?
Redirigir a Dashboard
```

### 2. Renovaci?n Autom?tica de Token
```
Request falla con 401
  ?
Interceptor detecta 401
  ?
POST /auth/refresh (con refresh_token)
  ?
Actualizar access_token
  ?
Reintentar request original
```

### 3. Validaci?n de Token al Iniciar App
```
App inicia
  ?
Leer token de EncryptedSharedPreferences
  ?
POST /auth/validate
  ?
Si v?lido ? Dashboard
Si inv?lido ? Login
```

---

## ?? Implementaci?n de Gr?ficas

### Librer?a: MPAndroidChart

**Dependencia:**
```gradle
implementation 'com.github.PhilJay:MPAndroidChart:v3.1.0'
```

**Ejemplo de gr?fica de calor?as diarias:**
```kotlin
val lineChart: LineChart = findViewById(R.id.lineChart)

val entries = caloriesData.mapIndexed { index, calories ->
    Entry(index.toFloat(), calories.toFloat())
}

val dataSet = LineDataSet(entries, "Calor?as Diarias")
dataSet.color = Color.rgb(16, 185, 129) // Emerald
dataSet.valueTextColor = Color.BLACK

val lineData = LineData(dataSet)
lineChart.data = lineData
lineChart.description.text = "Calor?as consumidas (?ltimos 7 d?as"
lineChart.animateX(1000)
```

**Tipos de gr?ficas recomendadas:**
1. **LineChart** - Evoluci?n temporal (calor?as, peso, actividad)
2. **BarChart** - Comparativas (mes actual vs anterior)
3. **PieChart/DonutChart** - Distribuciones (macronutrientes, tipos de actividad)
4. **CombinedChart** - M?ltiples m?tricas en una gr?fica

---

## ?? Endpoints Prioritarios para Implementaci?n

### Fase 1: Autenticaci?n y Usuarios
1. `POST /auth/login`
2. `GET /auth/me`
3. `GET /users/doctor/:doctorId`
4. `GET /users/:id`

### Fase 2: Datos B?sicos
1. `GET /nutrition/daily-summary/:userId`
2. `GET /physical-activity/weekly-summary/:userId`
3. `GET /nutrition/user/:userId`
4. `GET /physical-activity/user/:userId`

### Fase 3: Reportes y Gr?ficas
1. M?ltiples llamadas a daily-summary para per?odo extendido
2. M?ltiples llamadas a weekly-summary para comparativas
3. `GET /recommendations/user/:userId`

### Fase 4: Offline y Sincronizaci?n
1. Implementar cach? con Room
2. WorkManager para sincronizaci?n en background
3. Detecci?n de conexi?n con NetworkCallback

---

## ?? Notas Importantes

1. **CORS**: El frontend web usa `withCredentials: true`. En Android, esto no aplica, pero asegurar que las cookies/tokens se manejen correctamente.

2. **URLs Base**: En desarrollo usar `http://localhost`, pero para Android usar:
   - Emulador: `http://10.0.2.2:3001` (puerto correspondiente)
   - Dispositivo f?sico: IP local del servidor (ej: `http://192.168.1.100:3001`)

3. **Timeout**: Configurar timeouts apropiados en OkHttp:
   ```kotlin
   val client = OkHttpClient.Builder()
       .connectTimeout(30, TimeUnit.SECONDS)
       .readTimeout(30, TimeUnit.SECONDS)
       .writeTimeout(30, TimeUnit.SECONDS)
       .build()
   ```

4. **Manejo de Errores**: Implementar manejo centralizado de errores HTTP (401, 403, 404, 500, etc.)

5. **Loading States**: Mostrar indicadores de carga durante peticiones

6. **Empty States**: Dise?ar estados vac?os cuando no hay datos

7. **Pagination**: El frontend web usa paginaci?n en usuarios, considerar implementar en Android

---

## ? Checklist de Implementaci?n

### Funcionalidades M?nimas Requeridas

- [ ] Consumo de microservicios en JSON
- [ ] Gesti?n segura de JWT (EncryptedSharedPreferences)
- [ ] Renovaci?n autom?tica de tokens
- [ ] Interfaz nativa con navegaci?n intuitiva
- [ ] Listas de contenido (pacientes, registros)
- [ ] Vista de detalle
- [ ] Men? de reportes/anal?tica
- [ ] Al menos 6 gr?ficas responsivas
- [ ] KPIs visibles (totales, nuevos, estado conexi?n)
- [ ] Soporte offline (Room + cach?)
- [ ] Visualizaci?n de datos recientes sin conexi?n
- [ ] Sincronizaci?n autom?tica cuando hay conexi?n

---

## ?? Referencias del C?digo

- **Auth Context**: `enutritrack-client/src/context/auth/auth.context.jsx`
- **Dashboard**: `enutritrack-client/src/pages/dashboard.jsx`
- **Users Tracker**: `enutritrack-client/src/components/usuario/users-tracker.jsx`
- **API Config**: `enutritrack-client/src/api/axios.jsx`
- **Nutrition API**: `enutritrack-client/src/api/nutrition/nutrition.api.jsx`
- **Activity API**: `enutritrack-client/src/api/activity/activity.api.jsx`

---

**?ltima actualizaci?n**: Enero 2025
**Versi?n del documento**: 1.0
