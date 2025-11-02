package com.example.enutritrack_app.data.local.database

import androidx.room.TypeConverter
import com.example.enutritrack_app.data.local.entities.TipoComidaEnum
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * Type converters para Room Database
 */
class Converters {
    
    private val gson = Gson()
    
    /**
     * Convierte SyncStatus a String para almacenar en Room
     */
    @TypeConverter
    fun fromSyncStatus(value: SyncStatus): String {
        return value.name
    }
    
    /**
     * Convierte String a SyncStatus desde Room
     */
    @TypeConverter
    fun toSyncStatus(value: String): SyncStatus {
        return SyncStatus.valueOf(value)
    }
    
    /**
     * Convierte TipoComidaEnum a String para almacenar en Room
     */
    @TypeConverter
    fun fromTipoComidaEnum(value: TipoComidaEnum): String {
        return value.name
    }
    
    /**
     * Convierte String a TipoComidaEnum desde Room
     */
    @TypeConverter
    fun toTipoComidaEnum(value: String): TipoComidaEnum {
        return TipoComidaEnum.valueOf(value)
    }
    
    /**
     * Convierte List<String> a JSON String para almacenar en Room
     * Maneja valores nulos devolviendo null
     */
    @TypeConverter
    fun fromStringList(value: List<String>?): String? {
        return value?.let { gson.toJson(it) } ?: null
    }
    
    /**
     * Convierte JSON String a List<String> desde Room
     * Maneja valores nulos devolviendo null
     */
    @TypeConverter
    fun toStringList(value: String?): List<String>? {
        if (value == null || value.isBlank()) {
            return null
        }
        val listType = object : TypeToken<List<String>>() {}.type
        return gson.fromJson(value, listType)
    }
}
