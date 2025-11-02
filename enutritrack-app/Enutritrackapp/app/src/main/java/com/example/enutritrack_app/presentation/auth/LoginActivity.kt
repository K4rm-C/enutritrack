package com.example.enutritrack_app.presentation.auth

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import com.example.enutritrack_app.R
import com.example.enutritrack_app.data.repositories.AuthRepository
import com.example.enutritrack_app.databinding.ActivityLoginBinding
import com.example.enutritrack_app.presentation.dashboard.DashboardActivity
import com.google.android.material.textfield.TextInputLayout
import java.text.SimpleDateFormat
import java.util.*

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private val viewModel: LoginViewModel by viewModels()
    private lateinit var authRepository: AuthRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        authRepository = AuthRepository(applicationContext)

        // Verificar si ya está logueado
        if (authRepository.isLoggedIn()) {
            navigateToDashboard()
            return
        }

        setupUI()
        observeViewModel()
    }

    private fun setupUI() {
        // Email input listener
        binding.emailEditText.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                binding.emailInputLayout.error = null
                hideErrorCard()
            }
        })

        // Password input listener
        binding.passwordEditText.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                binding.passwordInputLayout.error = null
                hideErrorCard()
            }
        })

        // Enter key en password para hacer login
        binding.passwordEditText.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_DONE) {
                performLogin()
                true
            } else {
                false
            }
        }

        // Login button
        binding.loginButton.setOnClickListener {
            performLogin()
        }

        // Register link
        binding.registerLink.setOnClickListener {
            val intent = Intent(this, RegisterActivity::class.java)
            startActivity(intent)
        }

        // Forgot password (placeholder)
        binding.forgotPasswordText.setOnClickListener {
            Toast.makeText(this, "Función próximamente disponible", Toast.LENGTH_SHORT).show()
        }
    }

    private fun performLogin() {
        val email = binding.emailEditText.text?.toString() ?: ""
        val password = binding.passwordEditText.text?.toString() ?: ""

        // Validación básica
        var hasError = false

        if (email.isBlank()) {
            binding.emailInputLayout.error = "El email es requerido"
            hasError = true
        } else if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            binding.emailInputLayout.error = "Ingresa un email válido"
            hasError = true
        }

        if (password.isBlank()) {
            binding.passwordInputLayout.error = "La contraseña es requerida"
            hasError = true
        }

        if (!hasError) {
            viewModel.login(email, password)
        }
    }

    private fun observeViewModel() {
        viewModel.loginState.observe(this) { state ->
            when (state) {
                is LoginState.Loading -> {
                    showLoading(true)
                    hideErrorCard()
                    hideSuccessCard()
                }
                is LoginState.Success -> {
                    showLoading(false)
                    showSuccessCard("¡Inicio de sesión exitoso! Redirigiendo...")
                    // Navegar después de un breve delay
                    binding.root.postDelayed({
                        navigateToDashboard()
                    }, 1500)
                }
                is LoginState.Error -> {
                    showLoading(false)
                    showErrorCard(state.message)
                }
                is LoginState.Idle -> {
                    showLoading(false)
                    hideErrorCard()
                    hideSuccessCard()
                }
            }
        }
    }

    private fun showLoading(show: Boolean) {
        binding.loginButton.isEnabled = !show
        binding.loginButton.text = if (show) "Iniciando sesión..." else "Iniciar Sesión"
    }

    private fun showErrorCard(message: String) {
        binding.errorCard.visibility = View.VISIBLE
        binding.errorText.text = message
    }

    private fun hideErrorCard() {
        binding.errorCard.visibility = View.GONE
    }

    private fun showSuccessCard(message: String) {
        binding.successCard.visibility = View.VISIBLE
        binding.successText.text = message
    }

    private fun hideSuccessCard() {
        binding.successCard.visibility = View.GONE
    }

    private fun navigateToDashboard() {
        val intent = Intent(this, DashboardActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}
