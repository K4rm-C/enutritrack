package com.example.enutritrack_app.data.local.mappers

import com.example.enutritrack_app.data.local.entities.UserEntity
import com.example.enutritrack_app.data.remote.dto.UserResponse
import com.example.enutritrack_app.domain.models.User

/**
 * Funciones de extensión para mapear entre modelos de dominio, entidades y DTOs
 */

/**
 * Convierte UserResponse (DTO) a UserEntity (Room)
 * 
 * Nota: UserResponse del login tiene información limitada.
 * Para obtener datos completos, usar el endpoint GET /users/:id
 */
fun UserResponse.toUserEntity(): UserEntity {
    return UserEntity(
        id = id,
        cuenta_id = "", // No disponible en LoginResponse
        doctor_id = null,
        nombre = nombre,
        fecha_nacimiento = 0L, // No disponible en LoginResponse
        genero_id = "",
        genero_nombre = null,
        altura = 0.0, // No disponible en LoginResponse
        telefono = null,
        telefono_1 = null,
        telefono_2 = null,
        doctor_nombre = null,
        doctor_telefono = null,
        doctor_especialidad = null,
        lastSync = System.currentTimeMillis()
    )
}

/**
 * Convierte UserEntity a User (modelo de dominio)
 */
fun UserEntity.toDomain(): User {
    return User(
        id = id,
        email = "", // No almacenamos email en UserEntity por ahora
        nombre = nombre,
        userType = "user" // Asumimos tipo usuario para la app móvil
    )
}

/**
 * Convierte User (modelo de dominio) a UserEntity
 * 
 * Nota: User tiene información limitada, solo usar cuando sea necesario
 */
fun User.toUserEntity(): UserEntity {
    return UserEntity(
        id = id,
        cuenta_id = "",
        doctor_id = null,
        nombre = nombre,
        fecha_nacimiento = 0L,
        genero_id = "",
        genero_nombre = null,
        altura = 0.0,
        telefono = null,
        telefono_1 = null,
        telefono_2 = null,
        doctor_nombre = null,
        doctor_telefono = null,
        doctor_especialidad = null,
        lastSync = System.currentTimeMillis()
    )
}

