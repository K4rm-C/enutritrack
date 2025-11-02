package com.example.enutritrack_app.presentation.auth

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.example.enutritrack_app.data.repositories.AuthRepository
import com.example.enutritrack_app.domain.models.User
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class RegisterViewModel(application: Application) : AndroidViewModel(application) {

    private val authRepository = AuthRepository(application)

    private val _registerState = MutableLiveData<RegisterState>()
    val registerState: LiveData<RegisterState> = _registerState

    fun register(
        nombre: String,
        email: String,
        password: String,
        confirmPassword: String,
        fechaNacimiento: Date,
        generoId: String?,
        altura: Double,
        telefono: String?
    ) {
        // Validaciones
        val validationError = validateInputs(
            nombre, email, password, confirmPassword,
            fechaNacimiento, generoId, altura
        )

        if (validationError != null) {
            _registerState.value = RegisterState.Error(validationError)
            return
        }

        _registerState.value = RegisterState.Loading

        viewModelScope.launch {
            // Formatear fecha a ISO 8601 (YYYY-MM-DD)
            val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.US)
            val fechaNacimientoStr = dateFormat.format(fechaNacimiento)

            val result = authRepository.register(
                nombre = nombre.trim(),
                email = email.trim().lowercase(),
                password = password,
                fechaNacimiento = fechaNacimientoStr,
                generoId = null, // No usar generoId, usar genero legacy
                genero = generoId, // Usar valor legacy "M", "F", "O"
                altura = altura,
                telefono = telefono?.trim()
            )

            if (result.isSuccess) {
                result.getOrNull()?.let { user ->
                    _registerState.value = RegisterState.Success(user)
                }
            } else {
                val error = result.exceptionOrNull()
                _registerState.value = RegisterState.Error(error?.message ?: "Error al registrar")
            }
        }
    }

    private fun validateInputs(
        nombre: String,
        email: String,
        password: String,
        confirmPassword: String,
        fechaNacimiento: Date,
        generoId: String?,
        altura: Double
    ): String? {
        if (nombre.isBlank()) {
            return "El nombre es requerido"
        }
        if (nombre.length < 2) {
            return "El nombre debe tener al menos 2 caracteres"
        }

        if (!isValidEmail(email)) {
            return "Ingresa un email válido"
        }

        if (password.length < 6) {
            return "La contraseña debe tener al menos 6 caracteres"
        }

        if (password != confirmPassword) {
            return "Las contraseñas no coinciden"
        }

        // Validar edad mínima (18 años)
        val calendar = Calendar.getInstance()
        calendar.add(Calendar.YEAR, -18)
        if (fechaNacimiento.after(calendar.time)) {
            return "Debes tener al menos 18 años"
        }

        // Validar edad máxima (120 años)
        calendar.time = Date()
        calendar.add(Calendar.YEAR, -120)
        if (fechaNacimiento.before(calendar.time)) {
            return "Fecha de nacimiento inválida"
        }

        if (generoId.isNullOrBlank()) {
            return "El género es requerido"
        }

        if (altura <= 0 || altura > 300) {
            return "La altura debe estar entre 1 y 300 cm"
        }

        return null
    }

    private fun isValidEmail(email: String): Boolean {
        return android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }
}

sealed class RegisterState {
    object Idle : RegisterState()
    object Loading : RegisterState()
    data class Success(val user: User) : RegisterState()
    data class Error(val message: String) : RegisterState()
}

