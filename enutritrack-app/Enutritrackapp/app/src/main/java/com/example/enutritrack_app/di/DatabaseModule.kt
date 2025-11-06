package com.example.enutritrack_app.di

import android.content.Context
import com.example.enutritrack_app.data.local.database.EnutritrackDatabase

/**
 * Módulo para proporcionar instancias de base de datos y DAOs
 */
object DatabaseModule {
    
    /**
     * Obtiene la instancia de la base de datos Room
     */
    fun getDatabase(context: Context): EnutritrackDatabase {
        return EnutritrackDatabase.getDatabase(context)
    }
}

