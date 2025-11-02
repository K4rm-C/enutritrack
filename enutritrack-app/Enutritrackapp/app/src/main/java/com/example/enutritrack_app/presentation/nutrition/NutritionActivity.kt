package com.example.enutritrack_app.presentation.nutrition

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.enutritrack_app.databinding.ActivityNutritionBinding
import com.example.enutritrack_app.presentation.nutrition.adapters.RecomendacionesAdapter
import com.example.enutritrack_app.presentation.nutrition.adapters.RegistrosComidaAdapter
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class NutritionActivity : AppCompatActivity() {

    private lateinit var binding: ActivityNutritionBinding
    private lateinit var viewModel: NutritionViewModel

    private val dateFormat = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())
    private lateinit var recomendacionesAdapter: RecomendacionesAdapter
    private lateinit var registrosComidaAdapter: RegistrosComidaAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)

        binding = ActivityNutritionBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel = ViewModelProvider(this)[NutritionViewModel::class.java]

        setupToolbar()
        setupRecyclerViews()
        setupObservers()
        setupListeners()
        loadData()
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = "Nutrición"
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener {
            finish()
        }
    }

    private fun setupRecyclerViews() {
        // RecyclerView de Recomendaciones
        recomendacionesAdapter = RecomendacionesAdapter(dateFormat)
        binding.recomendacionesList.layoutManager = LinearLayoutManager(this)
        binding.recomendacionesList.adapter = recomendacionesAdapter

        // RecyclerView de Registros de Comida
        registrosComidaAdapter = RegistrosComidaAdapter(
            dateFormat = dateFormat,
            onVerDetalleClick = { registroId ->
                val intent = Intent(this, RegistroComidaDetailActivity::class.java)
                intent.putExtra("registroComidaId", registroId)
                startActivity(intent)
            },
            onEditarClick = { registroId ->
                val intent = Intent(this, RegistroComidaFormActivity::class.java)
                intent.putExtra("registroComidaId", registroId)
                startActivity(intent)
            }
        )
        binding.registrosComidaList.layoutManager = LinearLayoutManager(this)
        binding.registrosComidaList.adapter = registrosComidaAdapter
    }

    private fun setupObservers() {
        // Observar estado de UI
        lifecycleScope.launch {
            viewModel.uiState.collect { state ->
                binding.progressBar.visibility = if (state.isLoading) View.VISIBLE else View.GONE

                state.error?.let { error ->
                    Toast.makeText(this@NutritionActivity, error, Toast.LENGTH_SHORT).show()
                    viewModel.clearError()
                }

                state.successMessage?.let { message ->
                    Toast.makeText(this@NutritionActivity, message, Toast.LENGTH_SHORT).show()
                }

                // Si se creó un registro, navegar al formulario de edición
                state.createdRegistroId?.let { registroId ->
                    val intent = Intent(this@NutritionActivity, RegistroComidaFormActivity::class.java)
                    intent.putExtra("registroComidaId", registroId)
                    startActivity(intent)
                }
            }
        }

        // Observar recomendaciones
        lifecycleScope.launch {
            viewModel.recomendaciones.collect { recomendaciones ->
                if (recomendaciones.isNotEmpty()) {
                    recomendacionesAdapter.submitList(recomendaciones)
                    binding.noRecomendacionesText.visibility = View.GONE
                    binding.recomendacionesCard.visibility = View.VISIBLE
                } else {
                    binding.noRecomendacionesText.visibility = View.VISIBLE
                    recomendacionesAdapter.submitList(emptyList())
                    binding.recomendacionesCard.visibility = View.VISIBLE
                }
            }
        }

        // Observar registros de comida
        lifecycleScope.launch {
            viewModel.registrosComida.collect { registros ->
                if (registros.isNotEmpty()) {
                    registrosComidaAdapter.submitList(registros)
                    binding.noRegistrosText.visibility = View.GONE
                } else {
                    binding.noRegistrosText.visibility = View.VISIBLE
                    registrosComidaAdapter.submitList(emptyList())
                }
            }
        }
    }

    private fun setupListeners() {
        binding.syncButton.setOnClickListener {
            viewModel.syncFromServer()
        }

        binding.registrarAlimentoButton.setOnClickListener {
            val intent = Intent(this, AlimentoFormActivity::class.java)
            startActivity(intent)
        }

        binding.verAlimentosButton.setOnClickListener {
            val intent = Intent(this, AlimentoListActivity::class.java)
            startActivity(intent)
        }

        binding.registrarComidaButton.setOnClickListener {
            val intent = Intent(this, RegistroComidaFormActivity::class.java)
            startActivity(intent)
        }
    }

    private fun loadData() {
        viewModel.loadData()
    }
}

