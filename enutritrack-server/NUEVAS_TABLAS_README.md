# Nuevas Tablas - Citas Médicas y Alertas

## Descripción General

Se han agregado nuevas funcionalidades al sistema para gestionar citas médicas y alertas automáticas/manuales. Esto incluye tanto tablas en PostgreSQL como documentos en Couchbase.

## Tablas PostgreSQL

### Catálogos Base

1. **`tipos_consulta`** - Tipos de consultas médicas (General, Primera Vez, Control, etc.)
2. **`estados_cita`** - Estados de las citas (Programada, En Proceso, Completada, etc.)
3. **`categorias_alerta`** - Categorías de alertas (Peso, Nutrición, Actividad Física, etc.)
4. **`tipos_alerta`** - Tipos específicos de alertas con configuración JSON
5. **`niveles_prioridad_alerta`** - Niveles de prioridad (Baja, Media, Alta, Crítica)
6. **`estados_alerta`** - Estados de las alertas (Pendiente, En Revisión, Resuelta, etc.)

### Entidades Principales

7. **`citas_medicas`** - Citas médicas principales
8. **`citas_medicas_vitales`** - Signos vitales de las citas
9. **`citas_medicas_documentos`** - Documentos adjuntos a citas
10. **`alertas`** - Sistema de alertas
11. **`alertas_acciones`** - Acciones tomadas sobre alertas
12. **`configuracion_alertas_automaticas`** - Configuración de alertas automáticas

### Modificaciones Existentes

- **`recomendacion`** - Se agregaron campos `cita_medica_id` y `alerta_generadora_id`

## Documentos Couchbase

### `cita_medica_completa`
Almacena información completa de citas médicas incluyendo:
- Datos básicos de la cita
- Documentos adjuntos con metadatos
- Observaciones detalladas del médico

### `alerta_contexto`
Almacena el contexto completo que generó una alerta automática:
- Historial de pesos reciente
- Registros nutricionales
- Actividad física
- Configuración del algoritmo aplicado

## Modelos TypeORM

Todos los modelos están implementados con:
- Decoradores de validación apropiados
- Relaciones correctas entre entidades
- Campos de auditoría (created_at, updated_at)
- Campos UUID como claves primarias

## Servicios

Cada entidad tiene su servicio correspondiente con operaciones CRUD básicas:

### Servicios de Catálogos
- `TiposConsultaService`
- `EstadosCitaService`
- `CategoriasAlertaService`
- `NivelesPrioridadAlertaService`
- `EstadosAlertaService`
- `TiposAlertaService`

### Servicios Complejos
- `CitasMedicasService` - Maneja citas, vitales y documentos
- `AlertasService` - Maneja alertas y acciones relacionadas
- `AlertasAccionesService` - Gestiona acciones sobre alertas
- `ConfiguracionAlertasAutomaticasService` - Configura alertas automáticas
- `CouchbaseAlertsCitasService` - Maneja documentos en Couchbase

## Controladores

Cada entidad tiene su controlador REST con endpoints estándar:
- `GET /entidad` - Listar todos
- `GET /entidad/:id` - Obtener por ID
- `POST /entidad` - Crear nuevo
- `PATCH /entidad/:id` - Actualizar
- `DELETE /entidad/:id` - Eliminar

### Endpoints Especializados

**Citas Médicas:**
- `GET /citas-medicas/usuario/:userId` - Citas de un usuario
- `GET /citas-medicas/doctor/:doctorId` - Citas de un doctor

**Alertas:**
- `GET /alertas/usuario/:userId` - Alertas de un usuario
- `GET /alertas/doctor/:doctorId` - Alertas de un doctor
- `PATCH /alertas/:id/resolver/:doctorId` - Resolver alerta
- `POST /alertas/:id/accion/:doctorId` - Agregar acción

**Configuración de Alertas:**
- `GET /configuracion-alertas-automaticas/usuario/:userId` - Config por usuario
- `GET /configuracion-alertas-automaticas/activas` - Solo activas
- `PATCH /configuracion-alertas-automaticas/:id/toggle-activa` - Activar/desactivar

## Configuración JSON para Alertas Automáticas

El campo `config_validacion` en `tipos_alerta` usa JSON para definir lógica:

```json
{
  "condiciones": [
    {
      "tabla": "historial_peso",
      "campos_evaluacion": ["peso"],
      "operacion": "calcular_perdida_porcentual",
      "parametros": {
        "umbral_porcentaje": 5.0,
        "periodo_dias": 7,
        "minimo_registros": 2
      }
    }
  ],
  "mensaje_template": "Se ha detectado una pérdida de peso del {porcentaje}% en los últimos {dias} días",
  "nivel_prioridad_default": "alta"
}
```

## Relaciones Importantes

1. **Citas ↔ Alertas:** Las recomendaciones pueden originarse de citas o alertas
2. **Alertas ↔ Configuración:** Las alertas automáticas dependen de configuración por usuario
3. **Alertas ↔ Acciones:** Historial de acciones tomadas sobre alertas
4. **Citas ↔ Documentos:** Documentos adjuntos a citas médicas

## Base de Datos

Las tablas se crean automáticamente al ejecutar:
```sql
-- Desde scripts/init-db.sql
psql -U postgres -h localhost -p 5433 -d enutritrack -f scripts/init-db.sql
```

O mediante TypeORM synchronize (modo desarrollo).

## Próximos Pasos

1. Implementar lógica de detección automática de alertas
2. Crear interfaces de usuario para gestión de citas
3. Implementar notificaciones en tiempo real
4. Agregar reportes y dashboards
5. Configurar Couchbase para queries N1QL avanzadas
