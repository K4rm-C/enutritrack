package com.example.enutritrack_app.data.local.mappers

import com.example.enutritrack_app.data.local.database.SyncStatus
import com.example.enutritrack_app.data.local.entities.MedicalHistoryEntity
import com.example.enutritrack_app.data.remote.dto.CreateMedicalHistoryDto
import com.example.enutritrack_app.data.remote.dto.MedicalHistoryResponse
import com.google.gson.Gson

/**
 * Funciones de mapeo para MedicalHistory
 */

private val gson = Gson()

/**
 * Convierte List<String>? a JSON string para almacenar en Room
 */
private fun listToString(value: List<String>?): String? {
    return value?.let { gson.toJson(it) }
}

/**
 * Convierte JSON string a List<String>? desde Room
 */
private fun stringToList(value: String?): List<String>? {
    return value?.let {
        if (it.isBlank()) return null
        gson.fromJson(it, Array<String>::class.java).toList()
    }
}

/**
 * Convierte MedicalHistoryEntity a CreateMedicalHistoryDto para API
 */
fun MedicalHistoryEntity.toRequest(): CreateMedicalHistoryDto {
    return CreateMedicalHistoryDto(
        condiciones = stringToList(condiciones),
        alergias = stringToList(alergias),
        medicamentos = stringToList(medicamentos)
    )
}

/**
 * Convierte MedicalHistoryResponse del servidor a MedicalHistoryEntity
 */
fun MedicalHistoryResponse.toEntity(
    usuarioId: String,
    syncStatus: SyncStatus = SyncStatus.SYNCED,
    serverId: String? = null
): MedicalHistoryEntity {
    return MedicalHistoryEntity(
        id = serverId ?: id,
        usuario_id = usuarioId,
        condiciones = listToString(condiciones),
        alergias = listToString(alergias),
        medicamentos = listToString(medicamentos),
        syncStatus = syncStatus,
        serverId = id,
        retryCount = 0,
        lastSyncAttempt = System.currentTimeMillis(),
        createdAt = System.currentTimeMillis(),
        updatedAt = System.currentTimeMillis()
    )
}

/**
 * Helper para actualizar arrays específicos del historial médico
 */
data class MedicalHistoryUpdate(
    val condiciones: List<String>? = null,
    val alergias: List<String>? = null,
    val medicamentos: List<String>? = null
)

