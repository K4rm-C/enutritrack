package com.example.enutritrack_app.data.local.mappers

import com.example.enutritrack_app.data.local.database.SyncStatus
import com.example.enutritrack_app.data.local.entities.ProfileEntity
import com.example.enutritrack_app.data.remote.dto.*
import java.text.SimpleDateFormat
import java.util.*

/**
 * Funciones de mapeo para Profile
 */

/**
 * Formato de fecha ISO 8601 para API con milisegundos
 */
private val isoDateFormatWithMillis = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

/**
 * Formato de fecha ISO 8601 para API sin milisegundos (fallback)
 */
private val isoDateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

/**
 * Convierte ProfileResponse del servidor a ProfileEntity
 */
fun toProfileEntity(
    profileResponse: ProfileResponse,
    syncStatus: SyncStatus = SyncStatus.SYNCED
): ProfileEntity {
    // Parsear fecha de nacimiento
    val fechaNacimientoMillis = try {
        isoDateFormatWithMillis.parse(profileResponse.fechaNacimiento)?.time 
            ?: isoDateFormat.parse(profileResponse.fechaNacimiento)?.time 
            ?: System.currentTimeMillis()
    } catch (e: Exception) {
        System.currentTimeMillis()
    }
    
    return ProfileEntity(
        id = profileResponse.id,
        cuenta_id = profileResponse.cuentaId,
        doctor_id = profileResponse.doctorId,
        nombre = profileResponse.nombre,
        fecha_nacimiento = fechaNacimientoMillis,
        genero_id = profileResponse.generoId,
        genero_nombre = profileResponse.genero?.nombre ?: "",
        altura = profileResponse.altura,
        telefono = profileResponse.telefono,
        telefono_1 = profileResponse.telefono1,
        telefono_2 = profileResponse.telefono2,
        // Datos de cuenta
        email = profileResponse.cuenta?.email ?: "",
        email_1 = profileResponse.cuenta?.email1,
        email_2 = profileResponse.cuenta?.email2,
        // Datos del doctor (si existe)
        doctor_nombre = profileResponse.doctor?.nombre,
        doctor_especialidad = profileResponse.doctor?.especialidad?.nombre,
        doctor_telefono = profileResponse.doctor?.telefono,
        doctor_telefono_1 = profileResponse.doctor?.telefono1,
        doctor_telefono_2 = profileResponse.doctor?.telefono2,
        doctor_email = profileResponse.doctor?.cuenta?.email,
        doctor_email_1 = profileResponse.doctor?.cuenta?.email1,
        doctor_email_2 = profileResponse.doctor?.cuenta?.email2,
        syncStatus = syncStatus,
        serverId = profileResponse.id,
        retryCount = 0,
        lastSyncAttempt = System.currentTimeMillis(),
        createdAt = try {
            isoDateFormatWithMillis.parse(profileResponse.createdAt)?.time 
                ?: isoDateFormat.parse(profileResponse.createdAt)?.time 
                ?: System.currentTimeMillis()
        } catch (e: Exception) {
            System.currentTimeMillis()
        },
        updatedAt = try {
            isoDateFormatWithMillis.parse(profileResponse.updatedAt)?.time 
                ?: isoDateFormat.parse(profileResponse.updatedAt)?.time 
                ?: System.currentTimeMillis()
        } catch (e: Exception) {
            System.currentTimeMillis()
        }
    )
}

/**
 * Convierte ProfileEntity a UpdateProfileRequest para API
 */
fun ProfileEntity.toUpdateProfileRequest(): UpdateProfileRequest {
    return UpdateProfileRequest(
        nombre = nombre,
        altura = altura,
        telefono = telefono,
        telefono1 = telefono_1,
        telefono2 = telefono_2
    )
}

/**
 * Convierte ProfileEntity a UpdateAccountRequest para API
 */
fun ProfileEntity.toUpdateAccountRequest(): UpdateAccountRequest {
    return UpdateAccountRequest(
        email = email.takeIf { it.isNotBlank() },
        email1 = email_1?.takeIf { it.isNotBlank() },
        email2 = email_2?.takeIf { it.isNotBlank() }
        // password se maneja por separado
    )
}

