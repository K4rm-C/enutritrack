package com.example.enutritrack_app.data.repositories

import android.content.Context
import android.util.Log
import com.example.enutritrack_app.data.local.SecurityManager
import com.example.enutritrack_app.data.local.database.EnutritrackDatabase
import com.example.enutritrack_app.data.local.mappers.toUserEntity
import com.example.enutritrack_app.data.local.repositories.UserLocalRepository
import com.example.enutritrack_app.data.remote.api.AuthApiService
import com.example.enutritrack_app.data.remote.api.UserApiService
import com.example.enutritrack_app.data.remote.dto.*
import com.example.enutritrack_app.domain.models.User
import com.example.enutritrack_app.di.DatabaseModule
import com.example.enutritrack_app.di.NetworkModule
import retrofit2.HttpException
import java.io.IOException

class AuthRepository(private val context: Context) {

    private val authApiService: AuthApiService = NetworkModule.createAuthApiService(context)
    private val userApiService: UserApiService = NetworkModule.createUserApiService(context)
    private val securityManager: SecurityManager = SecurityManager(context)
    
    // Room Database y repositorio local
    private val database = DatabaseModule.getDatabase(context)
    private val userLocalRepository = UserLocalRepository(database.userDao(), context)

    suspend fun login(email: String, password: String): Result<User> {
        return try {
            Log.d("AuthRepository", "=== INICIO LOGIN ===")
            Log.d("AuthRepository", "Email recibido: '$email'")
            Log.d("AuthRepository", "Password length: ${password.length}")
            
            val request = LoginRequest(email = email, password = password, userType = "user")
            Log.d("AuthRepository", "LoginRequest - Email: '${request.email}', UserType: '${request.userType}'")
            
            val response = authApiService.login(request)
            Log.d("AuthRepository", "Respuesta recibida - Código: ${response.code()}, Success: ${response.isSuccessful}")
            Log.d("AuthRepository", "Headers: ${response.headers()}")

            if (response.isSuccessful && response.body() != null) {
                val loginResponse = response.body()!!
                
                // Guardar tokens de forma segura
                securityManager.saveAccessToken(loginResponse.accessToken)
                securityManager.saveRefreshToken(loginResponse.refreshToken)
                securityManager.saveUserInfo(
                    loginResponse.user.id,
                    loginResponse.user.email,
                    loginResponse.user.nombre,
                    loginResponse.user.userType
                )
                
                // Calcular tiempo de expiración (15 minutos para access token)
                val expiryTime = System.currentTimeMillis() + (15 * 60 * 1000)
                securityManager.saveTokenExpiry(expiryTime)
                
                // Guardar usuario en Room (con datos básicos del login)
                // Nota: Los datos completos se pueden obtener después con GET /users/:id
                val userEntity = loginResponse.user.toUserEntity()
                userLocalRepository.saveUser(userEntity)
                Log.d("AuthRepository", "Usuario guardado en Room: ${userEntity.id}")

                Result.success(
                    User(
                        id = loginResponse.user.id,
                        email = loginResponse.user.email,
                        nombre = loginResponse.user.nombre,
                        userType = loginResponse.user.userType
                    )
                )
            } else {
                val errorBody = response.errorBody()?.string()
                Log.e("AuthRepository", "Login falló - Código: ${response.code()}, Mensaje: ${response.message()}")
                Log.e("AuthRepository", "Error body: $errorBody")
                
                val errorMessage = parseError(response.code(), response.message(), errorBody)
                Result.failure(Exception(errorMessage))
            }
        } catch (e: HttpException) {
            val errorBody = e.response()?.errorBody()?.string()
            Log.e("AuthRepository", "HttpException en login: ${e.code()}, ${e.message()}")
            Log.e("AuthRepository", "Error body: $errorBody")
            Result.failure(Exception("Error de conexión: ${e.message()} (Código: ${e.code()})"))
        } catch (e: IOException) {
            Log.e("AuthRepository", "IOException en login", e)
            Result.failure(Exception("No se pudo conectar con el servidor. Verifica tu conexión a internet."))
        } catch (e: Exception) {
            Log.e("AuthRepository", "Exception inesperada en login", e)
            Result.failure(Exception("Error inesperado: ${e.message}"))
        }
    }

    suspend fun register(
        nombre: String,
        email: String,
        password: String,
        fechaNacimiento: String,
        generoId: String?,
        genero: String?,
        altura: Double,
        telefono: String?
    ): Result<User> {
        return try {
            Log.d("AuthRepository", "=== INICIO REGISTRO ===")
            Log.d("AuthRepository", "Email: '$email', Nombre: '$nombre'")
            Log.d("AuthRepository", "Género ID: $generoId, Género: $genero")
            
            val request = RegisterRequest(
                nombre = nombre,
                email = email,
                password = password,
                fechaNacimiento = fechaNacimiento,
                generoId = generoId,
                genero = genero,
                altura = altura,
                telefono = telefono
            )
            
            Log.d("AuthRepository", "RegisterRequest creado - Género: ${request.genero}, GéneroId: ${request.generoId}")
            
            // Intentar crear el usuario
            val registerResponse = userApiService.register(request)

            if (registerResponse.isSuccessful) {
                // Después del registro exitoso, hacer login automático
                val loginResult = login(email, password)
                loginResult
            } else {
                val errorBody = registerResponse.errorBody()?.string()
                Log.e("AuthRepository", "Registro falló - Código: ${registerResponse.code()}, Mensaje: ${registerResponse.message()}")
                Log.e("AuthRepository", "Error body: $errorBody")
                val errorMessage = parseError(registerResponse.code(), registerResponse.message(), errorBody)
                Result.failure(Exception(errorMessage))
            }
        } catch (e: HttpException) {
            when (e.code()) {
                409 -> Result.failure(Exception("Este email ya está registrado"))
                else -> Result.failure(Exception("Error de conexión: ${e.message()}"))
            }
        } catch (e: IOException) {
            Result.failure(Exception("No se pudo conectar con el servidor. Verifica tu conexión a internet."))
        } catch (e: Exception) {
            Result.failure(Exception("Error inesperado: ${e.message}"))
        }
    }

    suspend fun validateToken(): Result<User?> {
        return try {
            val token = securityManager.getAccessToken()
            if (token == null) {
                return Result.success(null)
            }

            val request = ValidateTokenRequest(token)
            val response = authApiService.validateToken(request)

            if (response.isSuccessful && response.body()?.valid == true) {
                val userResponse = response.body()!!.user
                if (userResponse != null) {
                    Result.success(
                        User(
                            id = userResponse.id,
                            email = userResponse.email,
                            nombre = userResponse.nombre,
                            userType = userResponse.userType
                        )
                    )
                } else {
                    Result.success(null)
                }
            } else {
                Result.success(null)
            }
        } catch (e: Exception) {
            Result.success(null)
        }
    }

    suspend fun logout(): Result<Unit> {
        return try {
            authApiService.logout()
            securityManager.clearAll()
            Result.success(Unit)
        } catch (e: Exception) {
            // Aún así limpiamos localmente aunque falle el logout remoto
            securityManager.clearAll()
            Result.success(Unit)
        }
    }

    fun isLoggedIn(): Boolean {
        return securityManager.isLoggedIn()
    }

    fun getCurrentUser(): User? {
        val userId = securityManager.getUserId()
        val email = securityManager.getUserEmail()
        val name = securityManager.getUserName()
        val userType = securityManager.getUserType()

        return if (userId != null && email != null && name != null && userType != null) {
            User(
                id = userId,
                email = email,
                nombre = name,
                userType = userType
            )
        } else {
            null
        }
    }

    private fun parseError(code: Int, message: String, errorBody: String? = null): String {
        val baseMessage = when (code) {
            401 -> "Email o contraseña incorrectos"
            400 -> "Datos inválidos: $message"
            404 -> "Servicio no encontrado"
            500 -> "Error del servidor. Intenta más tarde"
            else -> "Error: $message"
        }
        
        // Agregar detalles del error si están disponibles
        return if (errorBody != null && errorBody.isNotBlank()) {
            "$baseMessage (Detalles: $errorBody)"
        } else {
            baseMessage
        }
    }
}
