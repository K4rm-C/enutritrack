package com.example.enutritrack_app.presentation.auth

import android.app.DatePickerDialog
import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import com.example.enutritrack_app.databinding.ActivityRegisterBinding
import com.example.enutritrack_app.presentation.dashboard.DashboardActivity
import java.text.SimpleDateFormat
import java.util.*

class RegisterActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRegisterBinding
    private val viewModel: RegisterViewModel by viewModels()
    private val dateFormat = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)

        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupUI()
        observeViewModel()
    }

    private fun setupUI() {
        // Setup text watchers para limpiar errores
        setupTextWatcher(binding.nombreEditText, binding.nombreInputLayout)
        setupTextWatcher(binding.emailEditText, binding.emailInputLayout)
        setupTextWatcher(binding.passwordEditText, binding.passwordInputLayout)
        setupTextWatcher(binding.confirmPasswordEditText, binding.confirmPasswordInputLayout)
        setupTextWatcher(binding.alturaEditText, binding.alturaInputLayout)
        
        // Setup género spinner
        setupGeneroSpinner()
        setupGeneroSpinnerListener()

        // Fecha de nacimiento picker
        binding.fechaNacimientoEditText.apply {
            isFocusable = false
            isClickable = true
            setOnClickListener {
                showDatePicker()
            }
        }

        // Register button
        binding.registerButton.setOnClickListener {
            performRegister()
        }

        // Login link
        binding.loginLink.setOnClickListener {
            finish()
        }
    }

    private fun setupTextWatcher(
        editText: com.google.android.material.textfield.TextInputEditText,
        inputLayout: com.google.android.material.textfield.TextInputLayout
    ) {
        editText.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                inputLayout.error = null
                hideErrorCard()
            }
        })
    }
    
    private fun setupGeneroSpinnerListener() {
        binding.generoSpinner.onItemSelectedListener = object : android.widget.AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: android.widget.AdapterView<*>?, view: android.view.View?, position: Int, id: Long) {
                if (position > 0) {
                    binding.generoErrorText.visibility = android.view.View.GONE
                    hideErrorCard()
                }
            }
            override fun onNothingSelected(parent: android.widget.AdapterView<*>?) {}
        }
    }

    private fun setupGeneroSpinner() {
        val generos = arrayOf("Seleccione un género", "Masculino", "Femenino", "Otro")
        val generoValues = arrayOf("", "M", "F", "O")
        
        val adapter = android.widget.ArrayAdapter(
            this,
            android.R.layout.simple_spinner_item,
            generos
        ).apply {
            setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        }
        
        binding.generoSpinner.adapter = adapter
        binding.generoSpinner.tag = generoValues // Guardar valores en el tag
    }
    
    private fun getSelectedGenero(): String? {
        val position = binding.generoSpinner.selectedItemPosition
        val generoValues = binding.generoSpinner.tag as? Array<String>
        return if (position > 0 && generoValues != null && position < generoValues.size) {
            generoValues[position]
        } else {
            null
        }
    }

    private fun showDatePicker() {
        val calendar = Calendar.getInstance()
        val year = calendar.get(Calendar.YEAR) - 25 // Default: 25 años
        val month = calendar.get(Calendar.MONTH)
        val day = calendar.get(Calendar.DAY_OF_MONTH)

        DatePickerDialog(
            this,
            { _, selectedYear, selectedMonth, selectedDay ->
                calendar.set(selectedYear, selectedMonth, selectedDay)
                binding.fechaNacimientoEditText.setText(dateFormat.format(calendar.time))
            },
            year,
            month,
            day
        ).apply {
            // Limitar a personas mayores de 18 años
            val maxDate = Calendar.getInstance().apply {
                add(Calendar.YEAR, -18)
            }
            datePicker.maxDate = maxDate.timeInMillis
            
            // Limitar a personas menores de 120 años
            val minDate = Calendar.getInstance().apply {
                add(Calendar.YEAR, -120)
            }
            datePicker.minDate = minDate.timeInMillis
        }.show()
    }

    private fun performRegister() {
        val nombre = binding.nombreEditText.text?.toString()?.trim() ?: ""
        val email = binding.emailEditText.text?.toString()?.trim() ?: ""
        val password = binding.passwordEditText.text?.toString() ?: ""
        val confirmPassword = binding.confirmPasswordEditText.text?.toString() ?: ""
        val fechaNacimientoStr = binding.fechaNacimientoEditText.text?.toString() ?: ""
        val alturaStr = binding.alturaEditText.text?.toString() ?: ""
        val telefono = binding.telefonoEditText.text?.toString()?.trim()

        // Validación básica UI
        var hasError = false

        if (nombre.isBlank()) {
            binding.nombreInputLayout.error = "El nombre es requerido"
            hasError = true
        }

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
        } else if (password.length < 6) {
            binding.passwordInputLayout.error = "La contraseña debe tener al menos 6 caracteres"
            hasError = true
        }

        if (confirmPassword.isBlank()) {
            binding.confirmPasswordInputLayout.error = "Confirma tu contraseña"
            hasError = true
        } else if (password != confirmPassword) {
            binding.confirmPasswordInputLayout.error = "Las contraseñas no coinciden"
            hasError = true
        }

        if (fechaNacimientoStr.isBlank()) {
            binding.fechaNacimientoInputLayout.error = "La fecha de nacimiento es requerida"
            hasError = true
        }
        
        val genero = getSelectedGenero()
        if (genero.isNullOrBlank()) {
            binding.generoErrorText.apply {
                text = "El género es requerido"
                visibility = android.view.View.VISIBLE
            }
            hasError = true
        } else {
            binding.generoErrorText.visibility = android.view.View.GONE
        }

        if (alturaStr.isBlank()) {
            binding.alturaInputLayout.error = "La altura es requerida"
            hasError = true
        }

        if (hasError) {
            return
        }

        // Parsear fecha
        val fechaNacimiento = try {
            dateFormat.parse(fechaNacimientoStr) ?: Date()
        } catch (e: Exception) {
            binding.fechaNacimientoInputLayout.error = "Fecha inválida"
            return
        }

        // Parsear altura
        val altura = try {
            alturaStr.toDouble()
        } catch (e: Exception) {
            binding.alturaInputLayout.error = "Altura inválida"
            return
        }

        // Registrar
        viewModel.register(
            nombre = nombre,
            email = email,
            password = password,
            confirmPassword = confirmPassword,
            fechaNacimiento = fechaNacimiento,
            generoId = genero,
            altura = altura,
            telefono = telefono
        )
    }

    private fun observeViewModel() {
        viewModel.registerState.observe(this) { state ->
            when (state) {
                is RegisterState.Loading -> {
                    showLoading(true)
                    hideErrorCard()
                }
                is RegisterState.Success -> {
                    showLoading(false)
                    Toast.makeText(
                        this,
                        "¡Registro exitoso! Redirigiendo...",
                        Toast.LENGTH_SHORT
                    ).show()
                    // Navegar al dashboard
                    binding.root.postDelayed({
                        navigateToDashboard()
                    }, 1500)
                }
                is RegisterState.Error -> {
                    showLoading(false)
                    showErrorCard(state.message)
                }
                is RegisterState.Idle -> {
                    showLoading(false)
                    hideErrorCard()
                }
            }
        }
    }

    private fun showLoading(show: Boolean) {
        binding.registerButton.isEnabled = !show
        binding.registerButton.text = if (show) "Registrando..." else "Registrarse"
    }

    private fun showErrorCard(message: String) {
        binding.errorCard.visibility = View.VISIBLE
        binding.errorText.text = message
    }

    private fun hideErrorCard() {
        binding.errorCard.visibility = View.GONE
    }

    private fun navigateToDashboard() {
        val intent = Intent(this, DashboardActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}

