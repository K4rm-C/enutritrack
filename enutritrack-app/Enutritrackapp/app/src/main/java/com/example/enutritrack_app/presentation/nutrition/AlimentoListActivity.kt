package com.example.enutritrack_app.presentation.nutrition

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.enutritrack_app.data.local.entities.AlimentoEntity
import com.example.enutritrack_app.databinding.ActivityAlimentoListBinding
import com.example.enutritrack_app.presentation.nutrition.adapters.AlimentoAdapter
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import kotlinx.coroutines.launch

class AlimentoListActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAlimentoListBinding
    private lateinit var viewModel: NutritionViewModel
    private lateinit var alimentoAdapter: AlimentoAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)

        binding = ActivityAlimentoListBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel = ViewModelProvider(this)[NutritionViewModel::class.java]

        setupToolbar()
        setupRecyclerView()
        setupObservers()
        setupListeners()
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = "Mis Alimentos"
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener {
            finish()
        }
    }

    private fun setupRecyclerView() {
        alimentoAdapter = AlimentoAdapter(
            onEditarClick = { alimentoId ->
                val intent = android.content.Intent(this, AlimentoFormActivity::class.java)
                intent.putExtra("alimentoId", alimentoId)
                startActivity(intent)
            },
            onEliminarClick = { alimento ->
                showDeleteConfirmation(alimento)
            }
        )
        binding.alimentosList.layoutManager = LinearLayoutManager(this)
        binding.alimentosList.adapter = alimentoAdapter
    }

    private fun setupObservers() {
        lifecycleScope.launch {
            viewModel.alimentos.collect { alimentos ->
                if (alimentos.isNotEmpty()) {
                    alimentoAdapter.submitList(alimentos)
                    binding.noAlimentosText.visibility = View.GONE
                } else {
                    binding.noAlimentosText.visibility = View.VISIBLE
                    alimentoAdapter.submitList(emptyList())
                }
            }
        }

        lifecycleScope.launch {
            viewModel.uiState.collect { state ->
                binding.progressBar.visibility = if (state.isLoading) View.VISIBLE else View.GONE

                state.error?.let { error ->
                    Toast.makeText(this@AlimentoListActivity, error, Toast.LENGTH_SHORT).show()
                    viewModel.clearError()
                }

                state.successMessage?.let { message ->
                    Toast.makeText(this@AlimentoListActivity, message, Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun setupListeners() {
        binding.fabAddAlimento.setOnClickListener {
            val intent = android.content.Intent(this, AlimentoFormActivity::class.java)
            startActivity(intent)
        }
    }

    private fun showDeleteConfirmation(alimento: AlimentoEntity) {
        MaterialAlertDialogBuilder(this)
            .setTitle("Eliminar Alimento")
            .setMessage("¿Estás seguro de que deseas eliminar \"${alimento.nombre}\"?")
            .setPositiveButton("Eliminar") { _, _ ->
                viewModel.deleteAlimento(alimento.id)
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }
}

