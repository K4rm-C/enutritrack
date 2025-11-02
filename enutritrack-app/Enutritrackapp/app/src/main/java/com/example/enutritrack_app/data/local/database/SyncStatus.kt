package com.example.enutritrack_app.data.local.database

/**
 * Estado de sincronización de una entidad con el servidor
 */
enum class SyncStatus {
    /**
     * Entidad sincronizada correctamente con el servidor
     */
    SYNCED,
    
    /**
     * Entidad creada offline, pendiente de creación en servidor
     */
    PENDING_CREATE,
    
    /**
     * Entidad modificada offline, pendiente de actualización en servidor
     */
    PENDING_UPDATE,
    
    /**
     * Entidad eliminada offline, pendiente de borrado en servidor
     */
    PENDING_DELETE,
    
    /**
     * Error en sincronización después de múltiples intentos
     */
    FAILED
}

