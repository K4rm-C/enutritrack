package com.example.enutritrack_app.presentation.dashboard

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.lifecycle.lifecycleScope
import com.example.enutritrack_app.R
import com.example.enutritrack_app.data.repositories.AuthRepository
import com.example.enutritrack_app.databinding.ActivityDashboardBinding
import com.example.enutritrack_app.presentation.auth.LoginActivity
import com.example.enutritrack_app.presentation.health.HealthActivity
import com.example.enutritrack_app.presentation.profile.ProfileActivity
import com.example.enutritrack_app.presentation.nutrition.NutritionActivity
import kotlinx.coroutines.launch
import java.util.Calendar

class DashboardActivity : AppCompatActivity() {

    private lateinit var binding: ActivityDashboardBinding
    private lateinit var authRepository: AuthRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)

        binding = ActivityDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)

        authRepository = AuthRepository(applicationContext)

        // Verificar si está logueado
        if (!authRepository.isLoggedIn()) {
            navigateToLogin()
            return
        }

        setupToolbar()
        setupUI()
        setupNavigation()
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = "EnutriTrack"
        supportActionBar?.setDisplayHomeAsUpEnabled(false)
    }

    private fun setupUI() {
        // Obtener información del usuario
        val user = authRepository.getCurrentUser()
        
        // Configurar saludo según hora
        val greeting = getGreeting()
        binding.welcomeText.text = greeting
        
        // Nombre del usuario
        val userName = user?.nombre ?: "Usuario"
        binding.userNameText.text = userName
    }
    
    private fun setupNavigation() {
        // Navegación a Salud
        binding.healthCard.setOnClickListener {
            val intent = Intent(this, HealthActivity::class.java)
            startActivity(intent)
        }
        
        // Navegación a Nutrición
        binding.nutritionCard.setOnClickListener {
            val intent = Intent(this, NutritionActivity::class.java)
            startActivity(intent)
        }
        
        // Navegación a Citas (placeholder)
        binding.appointmentsCard.setOnClickListener {
            // TODO: Implementar AppointmentsActivity
            android.widget.Toast.makeText(
                this,
                "Módulo de Citas próximamente",
                android.widget.Toast.LENGTH_SHORT
            ).show()
        }
        
        // Navegación a Perfil
        binding.profileCard.setOnClickListener {
            val intent = Intent(this, ProfileActivity::class.java)
            startActivity(intent)
        }
    }

    private fun getGreeting(): String {
        val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        return when {
            hour < 12 -> "Buenos días"
            hour < 18 -> "Buenas tardes"
            else -> "Buenas noches"
        }
    }

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.dashboard_menu, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.menu_logout -> {
                performLogout()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    private fun performLogout() {
        // Cerrar sesión
        lifecycleScope.launch {
            authRepository.logout()
            navigateToLogin()
        }
    }

    private fun navigateToLogin() {
        val intent = Intent(this, LoginActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}
