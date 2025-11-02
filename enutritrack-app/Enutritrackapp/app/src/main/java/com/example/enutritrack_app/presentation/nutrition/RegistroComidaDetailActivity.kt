package com.example.enutritrack_app.presentation.nutrition

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.ViewModelProvider
import com.example.enutritrack_app.data.local.entities.*
import com.example.enutritrack_app.data.repositories.NutritionRepository
import com.example.enutritrack_app.databinding.*
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class RegistroComidaDetailActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRegistroComidaDetailBinding
    private lateinit var viewModel: NutritionViewModel

    private var registroComidaId: String? = null
    private val dateFormat = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault())

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)

        binding = ActivityRegistroComidaDetailBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel = ViewModelProvider(this)[NutritionViewModel::class.java]

        registroComidaId = intent.getStringExtra("registroComidaId")
        
        if (registroComidaId == null) {
            Toast.makeText(this, "Error: ID de registro no encontrado", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        setupToolbar()
        setupObservers()
        loadInitialData()
    }
    
    private fun loadInitialData() {
        // Asegurar que los alimentos estén cargados antes de mostrar items
        lifecycleScope.launch {
            if (viewModel.alimentos.value.isEmpty()) {
                viewModel.loadData()
            }
        }
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = "Detalle de Registro"
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
                    Toast.makeText(this@RegistroComidaDetailActivity, error, Toast.LENGTH_SHORT).show()
                    viewModel.clearError()
                }
            }
        }

        // Observar registro de comida
        registroComidaId?.let { id ->
            lifecycleScope.launch {
                viewModel.getRegistroComidaById(id).collect { registro ->
                    if (registro != null) {
                        loadRegistroComida(registro)
                    }
                }
            }
        }

        // Observar items del registro y alimentos juntos para mostrar nombres correctamente
        registroComidaId?.let { id ->
            lifecycleScope.launch {
                // Combinar ambos flows para actualizar cuando cambie cualquiera
                kotlinx.coroutines.flow.combine(
                    viewModel.getItemsByRegistroComida(id),
                    viewModel.alimentos
                ) { items, alimentos ->
                    Pair(items, alimentos)
                }.collect { (items, alimentos) ->
                    updateItemsList(items, alimentos)
                    updateResumenNutricional(id)
                }
            }
        }
    }

    private fun loadRegistroComida(registro: RegistroComidaEntity) {
        // Tipo de comida
        val tipoComidaText = when (registro.tipo_comida) {
            TipoComidaEnum.DESAYUNO -> "Desayuno"
            TipoComidaEnum.ALMUERZO -> "Almuerzo"
            TipoComidaEnum.CENA -> "Cena"
            TipoComidaEnum.MERIENDA -> "Merienda"
        }
        binding.tipoComidaText.text = tipoComidaText

        // Fecha
        binding.fechaText.text = dateFormat.format(Date(registro.fecha))

        // Notas
        if (!registro.notas.isNullOrBlank()) {
            binding.notasText.text = registro.notas
            binding.notasText.visibility = View.VISIBLE
        } else {
            binding.notasText.visibility = View.GONE
        }
    }

    private fun updateItemsList(items: List<RegistroComidaItemEntity>, alimentos: List<AlimentoEntity>) {
        binding.itemsList.removeAllViews()

        if (items.isEmpty()) {
            binding.noItemsText.visibility = View.VISIBLE
            return
        }

        binding.noItemsText.visibility = View.GONE

        val alimentosMap = alimentos.associateBy { it.id }

        items.forEach { item ->
            val alimento = alimentosMap[item.alimento_id]
            val itemBinding = ItemRegistroComidaItemBinding.inflate(layoutInflater)

            itemBinding.alimentoNombreText.text = alimento?.nombre ?: "Alimento desconocido (ID: ${item.alimento_id.take(8)}...)"
            itemBinding.cantidadText.text = "Cantidad: ${item.cantidad_gramos} g"
            itemBinding.caloriasText.text = "Cal: ${item.calorias} kcal"
            itemBinding.proteinasText.text = "Prot: ${item.proteinas_g}g"
            itemBinding.carbohidratosText.text = "Carb: ${item.carbohidratos_g}g"
            itemBinding.grasasText.text = "Gras: ${item.grasas_g}g"

            // Ocultar botón eliminar en vista de detalle
            itemBinding.eliminarItemButton.visibility = View.GONE

            binding.itemsList.addView(itemBinding.root)
        }
    }

    private fun updateResumenNutricional(registroComidaId: String) {
        lifecycleScope.launch {
            val total = viewModel.getTotalNutricional(registroComidaId)

            binding.totalCaloriasText.text = "Calorías: ${total.calorias} kcal"
            binding.totalProteinasText.text = "Proteínas: ${total.proteinas_g} g"
            binding.totalCarbohidratosText.text = "Carbohidratos: ${total.carbohidratos_g} g"
            binding.totalGrasasText.text = "Grasas: ${total.grasas_g} g"
            binding.totalFibraText.text = "Fibra: ${total.fibra_g ?: 0.0} g"

            if (total.calorias > 0 || total.proteinas_g > 0) {
                binding.resumenCard.visibility = View.VISIBLE
            } else {
                binding.resumenCard.visibility = View.GONE
            }
        }
    }
}
