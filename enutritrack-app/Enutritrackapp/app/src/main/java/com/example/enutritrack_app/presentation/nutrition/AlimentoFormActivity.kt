package com.example.enutritrack_app.presentation.nutrition

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.ViewModelProvider
import com.example.enutritrack_app.databinding.ActivityAlimentoFormBinding
import kotlinx.coroutines.launch

class AlimentoFormActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAlimentoFormBinding
    private lateinit var viewModel: NutritionViewModel
    private var alimentoId: String? = null
    private var isEditMode = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)

        binding = ActivityAlimentoFormBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel = ViewModelProvider(this)[NutritionViewModel::class.java]

        alimentoId = intent.getStringExtra("alimentoId")
        isEditMode = alimentoId != null

        setupToolbar()
        setupObservers()
        setupListeners()
        
        // Cargar datos iniciales si es necesario
        lifecycleScope.launch {
            if (viewModel.alimentos.value.isEmpty()) {
                viewModel.loadData()
            }
        }
        
        loadAlimentoData()
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = if (isEditMode) "Editar Alimento" else "Nuevo Alimento"
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener {
            finish()
        }
    }

    private fun setupObservers() {
        lifecycleScope.launch {
            viewModel.uiState.collect { state ->
                binding.progressBar.visibility = if (state.isLoading) View.VISIBLE else View.GONE

                state.error?.let { error ->
                    Toast.makeText(this@AlimentoFormActivity, error, Toast.LENGTH_SHORT).show()
                    viewModel.clearError()
                }

                state.successMessage?.let { message ->
                    Toast.makeText(this@AlimentoFormActivity, message, Toast.LENGTH_SHORT).show()
                    if (message.contains("exitosamente")) {
                        finish()
                    }
                }
            }
        }
    }

    private fun setupListeners() {
        binding.saveButton.setOnClickListener {
            saveAlimento()
        }
    }

    private fun loadAlimentoData() {
        if (!isEditMode) return

        alimentoId?.let { id ->
            lifecycleScope.launch {
                // Observar alimentos hasta encontrar el que necesitamos
                var alimentoCargado = false
                viewModel.alimentos.collect { alimentos ->
                    if (!alimentoCargado) {
                        alimentos.find { it.id == id }?.let { alimento ->
                            // Solo cargar una vez
                            binding.nombreInput.setText(alimento.nombre)
                            binding.descripcionInput.setText(alimento.descripcion ?: "")
                            binding.categoriaInput.setText(alimento.categoria ?: "")
                            binding.caloriasInput.setText(alimento.calorias_por_100g.toString())
                            binding.proteinasInput.setText(alimento.proteinas_g_por_100g.toString())
                            binding.carbohidratosInput.setText(alimento.carbohidratos_g_por_100g.toString())
                            binding.grasasInput.setText(alimento.grasas_g_por_100g.toString())
                            binding.fibraInput.setText(alimento.fibra_g_por_100g?.toString() ?: "")
                            alimentoCargado = true
                        }
                    }
                }
            }
        }
    }

    private fun saveAlimento() {
        val nombre = binding.nombreInput.text?.toString()?.trim()
        val descripcion = binding.descripcionInput.text?.toString()?.trim()
        val categoria = binding.categoriaInput.text?.toString()?.trim()
        val calorias = binding.caloriasInput.text?.toString()?.toDoubleOrNull()
        val proteinas = binding.proteinasInput.text?.toString()?.toDoubleOrNull()
        val carbohidratos = binding.carbohidratosInput.text?.toString()?.toDoubleOrNull()
        val grasas = binding.grasasInput.text?.toString()?.toDoubleOrNull()
        val fibra = binding.fibraInput.text?.toString()?.toDoubleOrNull()

        if (nombre.isNullOrBlank()) {
            Toast.makeText(this, "El nombre es obligatorio", Toast.LENGTH_SHORT).show()
            return
        }

        if (calorias == null || proteinas == null || carbohidratos == null || grasas == null) {
            Toast.makeText(this, "Todos los valores nutricionales son obligatorios", Toast.LENGTH_SHORT).show()
            return
        }

        if (isEditMode && alimentoId != null) {
            viewModel.updateAlimento(
                alimentoId = alimentoId!!,
                nombre = nombre,
                descripcion = descripcion?.takeIf { it.isNotBlank() },
                caloriasPor100g = calorias,
                proteinasGPor100g = proteinas,
                carbohidratosGPor100g = carbohidratos,
                grasasGPor100g = grasas,
                fibraGPor100g = fibra,
                categoria = categoria?.takeIf { it.isNotBlank() }
            )
        } else {
            viewModel.createAlimento(
                nombre = nombre,
                descripcion = descripcion?.takeIf { it.isNotBlank() },
                caloriasPor100g = calorias,
                proteinasGPor100g = proteinas,
                carbohidratosGPor100g = carbohidratos,
                grasasGPor100g = grasas,
                fibraGPor100g = fibra,
                categoria = categoria?.takeIf { it.isNotBlank() }
            )
        }
    }
}

