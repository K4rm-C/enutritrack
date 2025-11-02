package com.example.enutritrack_app.presentation.profile

import android.os.Bundle
import android.text.TextUtils
import android.util.Patterns
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.ViewModelProvider
import com.example.enutritrack_app.R
import com.example.enutritrack_app.databinding.ActivityProfileBinding
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import kotlinx.coroutines.launch

class ProfileActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityProfileBinding
    private lateinit var viewModel: ProfileViewModel
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        
        binding = ActivityProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        viewModel = ViewModelProvider(this)[ProfileViewModel::class.java]
        
        setupToolbar()
        setupObservers()
        setupListeners()
    }
    
    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = "Mi Perfil"
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener {
            finish()
        }
    }
    
    private fun setupObservers() {
        // Observar estado de UI
        lifecycleScope.launch {
            viewModel.uiState.collect { state ->
                binding.progressBar.visibility = if (state.isLoading) View.VISIBLE else View.GONE
                
                state.error?.let { error ->
                    Toast.makeText(this@ProfileActivity, error, Toast.LENGTH_SHORT).show()
                    viewModel.clearError()
                }
                
                state.successMessage?.let { message ->
                    Toast.makeText(this@ProfileActivity, message, Toast.LENGTH_SHORT).show()
                }
            }
        }
        
        // Observar perfil
        lifecycleScope.launch {
            viewModel.profile.collect { profile ->
                profile?.let {
                    updateUI(it)
                } ?: run {
                    // Perfil no cargado aún
                    binding.personalInfoCard.visibility = View.GONE
                    binding.accountInfoCard.visibility = View.GONE
                }
            }
        }
    }
    
    private fun updateUI(profile: com.example.enutritrack_app.data.local.entities.ProfileEntity) {
        // Información Personal
        binding.nombreInput.setText(profile.nombre)
        binding.alturaInput.setText(profile.altura.toString())
        binding.telefonoInput.setText(profile.telefono ?: "")
        binding.telefono1Input.setText(profile.telefono_1 ?: "")
        binding.telefono2Input.setText(profile.telefono_2 ?: "")
        
        // Información de Cuenta
        binding.emailInput.setText(profile.email)
        binding.email1Input.setText(profile.email_1 ?: "")
        binding.email2Input.setText(profile.email_2 ?: "")
        
        // Doctor Asignado
        if (profile.doctor_nombre != null) {
            binding.doctorNombreText.text = profile.doctor_nombre
            binding.doctorEspecialidadText.text = profile.doctor_especialidad ?: "Sin especialidad"
            
            // Teléfonos del doctor
            val telefonos = mutableListOf<String>()
            profile.doctor_telefono?.let { telefonos.add(it) }
            profile.doctor_telefono_1?.let { telefonos.add(it) }
            profile.doctor_telefono_2?.let { telefonos.add(it) }
            binding.doctorTelefonosText.text = if (telefonos.isNotEmpty()) {
                telefonos.joinToString(", ")
            } else {
                "No disponible"
            }
            
            // Correos del doctor
            val correos = mutableListOf<String>()
            profile.doctor_email?.let { correos.add(it) }
            profile.doctor_email_1?.let { correos.add(it) }
            profile.doctor_email_2?.let { correos.add(it) }
            binding.doctorCorreosText.text = if (correos.isNotEmpty()) {
                correos.joinToString(", ")
            } else {
                "No disponible"
            }
            
            binding.noDoctorText.visibility = View.GONE
            binding.doctorInfoCard.visibility = View.VISIBLE
        } else {
            binding.noDoctorText.visibility = View.VISIBLE
            binding.doctorNombreText.visibility = View.GONE
            binding.doctorEspecialidadText.visibility = View.GONE
            binding.doctorTelefonosText.visibility = View.GONE
            binding.doctorCorreosText.visibility = View.GONE
        }
        
        binding.personalInfoCard.visibility = View.VISIBLE
        binding.accountInfoCard.visibility = View.VISIBLE
        binding.doctorInfoCard.visibility = View.VISIBLE
    }
    
    private fun setupListeners() {
        // Botón Sincronizar
        binding.syncButton.setOnClickListener {
            viewModel.syncFromServer()
        }
        
        // Botón Guardar Información Personal
        binding.savePersonalInfoButton.setOnClickListener {
            savePersonalInfo()
        }
        
        // Botón Guardar Información de Cuenta
        binding.saveAccountInfoButton.setOnClickListener {
            saveAccountInfo()
        }
        
        // Botón Cambiar Contraseña
        binding.changePasswordButton.setOnClickListener {
            showChangePasswordDialog()
        }
    }
    
    private fun savePersonalInfo() {
        val nombre = binding.nombreInput.text?.toString()?.trim() ?: ""
        val alturaStr = binding.alturaInput.text?.toString()?.trim() ?: ""
        val telefono = binding.telefonoInput.text?.toString()?.trim()?.takeIf { it.isNotEmpty() }
        val telefono1 = binding.telefono1Input.text?.toString()?.trim()?.takeIf { it.isNotEmpty() }
        val telefono2 = binding.telefono2Input.text?.toString()?.trim()?.takeIf { it.isNotEmpty() }
        
        // Validaciones
        if (nombre.isBlank()) {
            Toast.makeText(this, "El nombre es obligatorio", Toast.LENGTH_SHORT).show()
            return
        }
        
        val altura = try {
            alturaStr.toDouble()
        } catch (e: NumberFormatException) {
            Toast.makeText(this, "La altura debe ser un número válido", Toast.LENGTH_SHORT).show()
            return
        }
        
        if (altura <= 0) {
            Toast.makeText(this, "La altura debe ser mayor a 0", Toast.LENGTH_SHORT).show()
            return
        }
        
        viewModel.updateProfile(
            nombre = nombre,
            altura = altura,
            telefono = telefono,
            telefono1 = telefono1,
            telefono2 = telefono2
        )
    }
    
    private fun saveAccountInfo() {
        val email = binding.emailInput.text?.toString()?.trim() ?: ""
        val email1 = binding.email1Input.text?.toString()?.trim()?.takeIf { it.isNotEmpty() }
        val email2 = binding.email2Input.text?.toString()?.trim()?.takeIf { it.isNotEmpty() }
        
        // Validaciones
        if (email.isBlank()) {
            Toast.makeText(this, "El email principal es obligatorio", Toast.LENGTH_SHORT).show()
            return
        }
        
        if (!isValidEmail(email)) {
            Toast.makeText(this, "El email principal no es válido", Toast.LENGTH_SHORT).show()
            return
        }
        
        email1?.let {
            if (!isValidEmail(it)) {
                Toast.makeText(this, "El email secundario 1 no es válido", Toast.LENGTH_SHORT).show()
                return
            }
        }
        
        email2?.let {
            if (!isValidEmail(it)) {
                Toast.makeText(this, "El email secundario 2 no es válido", Toast.LENGTH_SHORT).show()
                return
            }
        }
        
        viewModel.updateAccount(
            email = email,
            email1 = email1,
            email2 = email2
        )
    }
    
    private fun showChangePasswordDialog() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_change_password, null)
        val currentPasswordInput = dialogView.findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.currentPasswordInput)
        val newPasswordInput = dialogView.findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.newPasswordInput)
        val confirmPasswordInput = dialogView.findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.confirmPasswordInput)
        val errorText = dialogView.findViewById<android.widget.TextView>(R.id.passwordErrorText)
        
        MaterialAlertDialogBuilder(this)
            .setTitle("Cambiar Contraseña")
            .setView(dialogView)
            .setPositiveButton("Cambiar") { dialog, _ ->
                errorText.visibility = View.GONE
                
                val currentPassword = currentPasswordInput.text?.toString() ?: ""
                val newPassword = newPasswordInput.text?.toString() ?: ""
                val confirmPassword = confirmPasswordInput.text?.toString() ?: ""
                
                // Validaciones
                if (currentPassword.isBlank()) {
                    errorText.text = "La contraseña actual es obligatoria"
                    errorText.visibility = View.VISIBLE
                    return@setPositiveButton
                }
                
                if (newPassword.isBlank()) {
                    errorText.text = "La nueva contraseña es obligatoria"
                    errorText.visibility = View.VISIBLE
                    return@setPositiveButton
                }
                
                if (newPassword.length < 6) {
                    errorText.text = "La nueva contraseña debe tener al menos 6 caracteres"
                    errorText.visibility = View.VISIBLE
                    return@setPositiveButton
                }
                
                if (newPassword != confirmPassword) {
                    errorText.text = "Las contraseñas no coinciden"
                    errorText.visibility = View.VISIBLE
                    return@setPositiveButton
                }
                
                // Actualizar contraseña
                viewModel.updateAccount(password = newPassword)
                dialog.dismiss()
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }
    
    private fun isValidEmail(email: String): Boolean {
        return !TextUtils.isEmpty(email) && Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }
}

