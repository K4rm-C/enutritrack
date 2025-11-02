package com.example.enutritrack_app.presentation.auth

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.example.enutritrack_app.data.repositories.AuthRepository
import com.example.enutritrack_app.domain.models.User
import kotlinx.coroutines.launch

class LoginViewModel(application: Application) : AndroidViewModel(application) {

    private val authRepository = AuthRepository(application)

    private val _loginState = MutableLiveData<LoginState>()
    val loginState: LiveData<LoginState> = _loginState

    fun login(email: String, password: String) {
        if (!isValidEmail(email)) {
            _loginState.value = LoginState.Error("Ingresa un email válido")
            return
        }

        if (password.isBlank()) {
            _loginState.value = LoginState.Error("La contraseña es requerida")
            return
        }

        _loginState.value = LoginState.Loading

        viewModelScope.launch {
            val normalizedEmail = email.trim().lowercase()
            Log.d("LoginViewModel", "Intentando login con email: '$normalizedEmail' (original: '$email')")
            Log.d("LoginViewModel", "Password length: ${password.length}")
            
            val result = authRepository.login(normalizedEmail, password)

            if (result.isSuccess) {
                result.getOrNull()?.let { user ->
                    Log.d("LoginViewModel", "Login exitoso para usuario: ${user.email}")
                    _loginState.value = LoginState.Success(user)
                }
            } else {
                val error = result.exceptionOrNull()
                val errorMessage = error?.message ?: "Error al iniciar sesión"
                Log.e("LoginViewModel", "Error en login: $errorMessage", error)
                Log.e("LoginViewModel", "Email usado: '$normalizedEmail', Password length: ${password.length}")
                _loginState.value = LoginState.Error(errorMessage)
            }
        }
    }

    private fun isValidEmail(email: String): Boolean {
        return android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }
}

sealed class LoginState {
    object Idle : LoginState()
    object Loading : LoginState()
    data class Success(val user: User) : LoginState()
    data class Error(val message: String) : LoginState()
}
