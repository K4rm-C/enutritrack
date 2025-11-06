package com.example.enutritrack_app.presentation.nutrition

import android.app.DatePickerDialog
import android.os.Bundle
import android.view.View
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.ViewModelProvider
import com.example.enutritrack_app.data.local.entities.*
import com.example.enutritrack_app.data.repositories.NutritionRepository
import com.example.enutritrack_app.databinding.*
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class RegistroComidaFormActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRegistroComidaFormBinding
    private lateinit var viewModel: NutritionViewModel

    private var registroComidaId: String? = null
    private var isEditMode: Boolean = false

    private val dateFormat = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())
    private var selectedDate: Long = System.currentTimeMillis()
    private var selectedTipoComida: TipoComidaEnum = TipoComidaEnum.DESAYUNO

    // Items actuales del registro (solo en modo edición)
    private val currentItems = mutableListOf<RegistroComidaItemEntity>()
    
    // Items temporales para modo creación (antes de guardar el registro)
    private val itemsTemporales = mutableListOf<ItemTemporal>()
    
    /**
     * Data class para items temporales en modo creación
     */
    private data class ItemTemporal(
        val id: String,
        val alimento: AlimentoEntity,
        val cantidadGramos: Double,
        val calorias: Double,
        val proteinas_g: Double,
        val carbohidratos_g: Double,
        val grasas_g: Double,
        val fibra_g: Double?,
        val notas: String?
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)

        binding = ActivityRegistroComidaFormBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel = ViewModelProvider(this)[NutritionViewModel::class.java]

        registroComidaId = intent.getStringExtra("registroComidaId")
        isEditMode = registroComidaId != null

        setupToolbar()
        setupTipoComidaSpinner()
        setupDatePicker()
        setupListeners()
        setupObservers()
        
        // Limpiar estado residual y cargar datos si es necesario
        lifecycleScope.launch {
            kotlinx.coroutines.delay(50) // Pequeño delay para asegurar que observers están configurados
            viewModel.clearError()
            // Asegurar que los alimentos estén cargados
            if (viewModel.alimentos.value.isEmpty()) {
                viewModel.loadData()
            }
        }

        if (isEditMode) {
            supportActionBar?.title = "Editar Registro de Comida"
            registroComidaId?.let { id ->
                lifecycleScope.launch {
                    viewModel.getRegistroComidaById(id).collect { registro ->
                        registro?.let { loadRegistroComida(it) }
                    }
                }
            }
        } else {
            supportActionBar?.title = "Nuevo Registro de Comida"
            binding.fechaInput.setText(dateFormat.format(Date(selectedDate)))
            updateResumenNutricional()
        }
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener {
            finish()
        }
    }

    private fun setupTipoComidaSpinner() {
        val tiposComida = listOf(
            "Desayuno" to TipoComidaEnum.DESAYUNO,
            "Almuerzo" to TipoComidaEnum.ALMUERZO,
            "Cena" to TipoComidaEnum.CENA,
            "Merienda" to TipoComidaEnum.MERIENDA
        )

        val adapter = ArrayAdapter(
            this,
            android.R.layout.simple_spinner_item,
            tiposComida.map { it.first }
        ).apply {
            setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        }

        binding.tipoComidaSpinner.adapter = adapter
        binding.tipoComidaSpinner.setSelection(0) // Desayuno por defecto

        binding.tipoComidaSpinner.onItemSelectedListener = object : android.widget.AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: android.widget.AdapterView<*>?, view: View?, position: Int, id: Long) {
                selectedTipoComida = tiposComida[position].second
            }
            override fun onNothingSelected(parent: android.widget.AdapterView<*>?) {}
        }
    }

    private fun setupDatePicker() {
        binding.fechaInput.setOnClickListener {
            val calendar = Calendar.getInstance().apply {
                timeInMillis = selectedDate
            }

            DatePickerDialog(
                this,
                { _, year, month, dayOfMonth ->
                    calendar.set(year, month, dayOfMonth)
                    selectedDate = calendar.timeInMillis
                    binding.fechaInput.setText(dateFormat.format(Date(selectedDate)))
                },
                calendar.get(Calendar.YEAR),
                calendar.get(Calendar.MONTH),
                calendar.get(Calendar.DAY_OF_MONTH)
            ).show()
        }
    }

    private fun setupListeners() {
        binding.agregarItemButton.setOnClickListener {
            showAddItemDialog()
        }

        binding.guardarButton.setOnClickListener {
            guardarRegistro()
        }
    }

    private fun setupObservers() {
        lifecycleScope.launch {
            viewModel.uiState.collect { state ->
                binding.progressBar.visibility = if (state.isLoading) View.VISIBLE else View.GONE

                state.error?.let { error ->
                    Toast.makeText(this@RegistroComidaFormActivity, error, Toast.LENGTH_SHORT).show()
                    viewModel.clearError()
                }

                // Solo cerrar en modo edición cuando hay mensaje de éxito de actualización
                // En modo creación, el cierre se maneja en guardarRegistro() después de agregar items
                if (isEditMode) {
                    state.successMessage?.let { message ->
                        // Solo cerrar si es un mensaje de actualización (no otros tipos de mensaje)
                        if (message.contains("actualizado") || message.contains("Registro de comida actualizado")) {
                            Toast.makeText(this@RegistroComidaFormActivity, message, Toast.LENGTH_SHORT).show()
                            // Delay pequeño para mostrar el toast antes de cerrar
                            lifecycleScope.launch {
                                kotlinx.coroutines.delay(1000)
                                finish()
                            }
                        }
                    }
                }
            }
        }

        // Observar alimentos para el spinner
        lifecycleScope.launch {
            viewModel.alimentos.collect { alimentos ->
                if (alimentos.isEmpty()) {
                    // Cargar alimentos si no hay
                    viewModel.loadData()
                }
            }
        }

        // En modo edición: observar items del registro
        if (isEditMode) {
            registroComidaId?.let { id ->
                lifecycleScope.launch {
                    viewModel.getItemsByRegistroComida(id).collect { items ->
                        currentItems.clear()
                        currentItems.addAll(items)
                        updateItemsList()
                        updateResumenNutricional()
                    }
                }
            }
        } else {
            // En modo creación, inicializar lista vacía
            updateItemsList()
        }
    }

    private fun loadRegistroComida(registro: RegistroComidaEntity) {
        // Cargar datos del registro
        selectedDate = registro.fecha
        binding.fechaInput.setText(dateFormat.format(Date(selectedDate)))

        // Tipo de comida
        val tipoIndex = when (registro.tipo_comida) {
            TipoComidaEnum.DESAYUNO -> 0
            TipoComidaEnum.ALMUERZO -> 1
            TipoComidaEnum.CENA -> 2
            TipoComidaEnum.MERIENDA -> 3
        }
        binding.tipoComidaSpinner.setSelection(tipoIndex)
        selectedTipoComida = registro.tipo_comida

        // Notas
        binding.notasInput.setText(registro.notas)
    }

    private fun showAddItemDialog() {
        val alimentos = viewModel.alimentos.value
        if (alimentos.isEmpty()) {
            Toast.makeText(this, "Primero debes registrar al menos un alimento", Toast.LENGTH_SHORT).show()
            return
        }

        val dialogBinding = DialogAddItemComidaBinding.inflate(layoutInflater)

        // Configurar spinner de alimentos
        val alimentoAdapter = ArrayAdapter(
            this,
            android.R.layout.simple_spinner_item,
            alimentos.map { it.nombre }
        ).apply {
            setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        }
        dialogBinding.alimentoSpinner.adapter = alimentoAdapter

        // Actualizar vista previa cuando cambie cantidad o alimento
        var selectedAlimentoIndex = 0
        dialogBinding.alimentoSpinner.onItemSelectedListener = object : android.widget.AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: android.widget.AdapterView<*>?, view: View?, position: Int, id: Long) {
                selectedAlimentoIndex = position
                updatePreview(dialogBinding, alimentos[position])
            }
            override fun onNothingSelected(parent: android.widget.AdapterView<*>?) {}
        }

        dialogBinding.cantidadInput.addTextChangedListener(object : android.text.TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: android.text.Editable?) {
                val cantidad = s?.toString()?.toDoubleOrNull() ?: 0.0
                if (cantidad > 0 && selectedAlimentoIndex < alimentos.size) {
                    updatePreview(dialogBinding, alimentos[selectedAlimentoIndex], cantidad)
                }
            }
        })

        AlertDialog.Builder(this)
            .setTitle("Agregar Alimento")
            .setView(dialogBinding.root)
            .setPositiveButton("Agregar") { dialog, _ ->
                val cantidad = dialogBinding.cantidadInput.text?.toString()?.toDoubleOrNull()
                if (cantidad == null || cantidad <= 0) {
                    dialogBinding.errorText.text = "La cantidad debe ser mayor a 0"
                    dialogBinding.errorText.visibility = View.VISIBLE
                    return@setPositiveButton
                }

                val alimento = alimentos[selectedAlimentoIndex]
                val notas = dialogBinding.notasInput.text?.toString()?.trim()?.takeIf { it.isNotBlank() }

                if (isEditMode && registroComidaId != null) {
                    // Modo edición: agregar item directamente
                    viewModel.addItemToRegistroComida(
                        registroComidaId = registroComidaId!!,
                        alimentoId = alimento.id,
                        cantidadGramos = cantidad,
                        notas = notas
                    )
                } else {
                    // Modo creación: agregar item temporalmente (se guardará cuando se cree el registro)
                    val valoresNutricionales = calcularValoresNutricionalesTemporal(alimento, cantidad)
                    val itemTemporal = ItemTemporal(
                        id = UUID.randomUUID().toString(),
                        alimento = alimento,
                        cantidadGramos = cantidad,
                        calorias = valoresNutricionales.calorias,
                        proteinas_g = valoresNutricionales.proteinas_g,
                        carbohidratos_g = valoresNutricionales.carbohidratos_g,
                        grasas_g = valoresNutricionales.grasas_g,
                        fibra_g = valoresNutricionales.fibra_g,
                        notas = notas
                    )
                    itemsTemporales.add(itemTemporal)
                    updateItemsList()
                    updateResumenNutricional()
                }
                dialog.dismiss()
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun updatePreview(dialogBinding: DialogAddItemComidaBinding, alimento: AlimentoEntity, cantidad: Double = 100.0) {
        val factor = cantidad / 100.0
        val calorias = (alimento.calorias_por_100g * factor).let { kotlin.math.round(it * 100.0) / 100.0 }
        val proteinas = (alimento.proteinas_g_por_100g * factor).let { kotlin.math.round(it * 100.0) / 100.0 }
        val carbohidratos = (alimento.carbohidratos_g_por_100g * factor).let { kotlin.math.round(it * 100.0) / 100.0 }
        val grasas = (alimento.grasas_g_por_100g * factor).let { kotlin.math.round(it * 100.0) / 100.0 }

        dialogBinding.previewCaloriasText.text = "Calorías: ${calorias} kcal"
        dialogBinding.previewProteinasText.text = "Proteínas: ${proteinas} g"
        dialogBinding.previewCarbohidratosText.text = "Carbohidratos: ${carbohidratos} g"
        dialogBinding.previewGrasasText.text = "Grasas: ${grasas} g"

        dialogBinding.previewCard.visibility = View.VISIBLE
    }

    private fun updateItemsList() {
        binding.itemsList.removeAllViews()
        
        val hasItems = if (isEditMode) currentItems.isNotEmpty() else itemsTemporales.isNotEmpty()
        
        if (!hasItems) {
            binding.noItemsText.visibility = View.VISIBLE
            return
        }

        binding.noItemsText.visibility = View.GONE

        if (isEditMode) {
            // Modo edición: mostrar items desde BD
            lifecycleScope.launch {
                val alimentos = viewModel.alimentos.value.associateBy { it.id }

                currentItems.forEach { item ->
                    val alimento = alimentos[item.alimento_id]
                    val itemBinding = ItemRegistroComidaItemBinding.inflate(layoutInflater)

                    itemBinding.alimentoNombreText.text = alimento?.nombre ?: "Alimento desconocido"
                    itemBinding.cantidadText.text = "Cantidad: ${item.cantidad_gramos} g"
                    itemBinding.caloriasText.text = "Cal: ${item.calorias} kcal"
                    itemBinding.proteinasText.text = "Prot: ${item.proteinas_g}g"
                    itemBinding.carbohidratosText.text = "Carb: ${item.carbohidratos_g}g"
                    itemBinding.grasasText.text = "Gras: ${item.grasas_g}g"

                    itemBinding.eliminarItemButton.setOnClickListener {
                        viewModel.deleteItem(item.id)
                    }

                    binding.itemsList.addView(itemBinding.root)
                }
            }
        } else {
            // Modo creación: mostrar items temporales
            itemsTemporales.forEach { item ->
                val itemBinding = ItemRegistroComidaItemBinding.inflate(layoutInflater)

                itemBinding.alimentoNombreText.text = item.alimento.nombre
                itemBinding.cantidadText.text = "Cantidad: ${item.cantidadGramos} g"
                itemBinding.caloriasText.text = "Cal: ${item.calorias} kcal"
                itemBinding.proteinasText.text = "Prot: ${item.proteinas_g}g"
                itemBinding.carbohidratosText.text = "Carb: ${item.carbohidratos_g}g"
                itemBinding.grasasText.text = "Gras: ${item.grasas_g}g"

                itemBinding.eliminarItemButton.setOnClickListener {
                    itemsTemporales.remove(item)
                    updateItemsList()
                    updateResumenNutricional()
                }

                binding.itemsList.addView(itemBinding.root)
            }
        }
    }
    
    private fun calcularValoresNutricionalesTemporal(alimento: AlimentoEntity, cantidadGramos: Double): NutritionRepository.CalculatedNutrition {
        val factor = cantidadGramos / 100.0
        return NutritionRepository.CalculatedNutrition(
            calorias = kotlin.math.round(alimento.calorias_por_100g * factor * 100.0) / 100.0,
            proteinas_g = kotlin.math.round(alimento.proteinas_g_por_100g * factor * 100.0) / 100.0,
            carbohidratos_g = kotlin.math.round(alimento.carbohidratos_g_por_100g * factor * 100.0) / 100.0,
            grasas_g = kotlin.math.round(alimento.grasas_g_por_100g * factor * 100.0) / 100.0,
            fibra_g = alimento.fibra_g_por_100g?.let { kotlin.math.round(it * factor * 100.0) / 100.0 }
        )
    }

    private fun updateResumenNutricional() {
        lifecycleScope.launch {
            val total = if (isEditMode && registroComidaId != null) {
                viewModel.getTotalNutricional(registroComidaId!!)
            } else {
                // Calcular desde items temporales en modo creación
                val calorias = itemsTemporales.sumOf { it.calorias }
                val proteinas = itemsTemporales.sumOf { it.proteinas_g }
                val carbohidratos = itemsTemporales.sumOf { it.carbohidratos_g }
                val grasas = itemsTemporales.sumOf { it.grasas_g }
                val fibra = itemsTemporales.sumOf { it.fibra_g ?: 0.0 }

                NutritionRepository.CalculatedNutrition(
                    calorias = kotlin.math.round(calorias * 100.0) / 100.0,
                    proteinas_g = kotlin.math.round(proteinas * 100.0) / 100.0,
                    carbohidratos_g = kotlin.math.round(carbohidratos * 100.0) / 100.0,
                    grasas_g = kotlin.math.round(grasas * 100.0) / 100.0,
                    fibra_g = if (fibra > 0) kotlin.math.round(fibra * 100.0) / 100.0 else null
                )
            }

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

    private fun guardarRegistro() {
        val notas = binding.notasInput.text?.toString()?.trim()?.takeIf { it.isNotBlank() }

        if (isEditMode && registroComidaId != null) {
            viewModel.updateRegistroComida(
                registroComidaId = registroComidaId!!,
                fecha = selectedDate,
                tipoComida = selectedTipoComida,
                notas = notas
            )
        } else {
            // Modo creación: crear registro primero, luego agregar items
            if (itemsTemporales.isEmpty()) {
                Toast.makeText(this, "Agrega al menos un alimento antes de guardar", Toast.LENGTH_SHORT).show()
                return
            }
            
            lifecycleScope.launch {
                try {
                    val itemsToAdd = itemsTemporales.toList() // Copiar lista antes de limpiar
                    
                    // Crear registro
                    viewModel.createRegistroComida(
                        fecha = selectedDate,
                        tipoComida = selectedTipoComida,
                        notas = notas
                    )
                    
                    // Esperar a que se cree el registro usando first() para evitar collectors anidados
                    val state = viewModel.uiState
                        .filter { it.createdRegistroId != null || it.error != null }
                        .first()
                    
                    state.createdRegistroId?.let { id ->
                        // Agregar todos los items temporales
                        itemsToAdd.forEach { item ->
                            viewModel.addItemToRegistroComida(
                                registroComidaId = id,
                                alimentoId = item.alimento.id,
                                cantidadGramos = item.cantidadGramos,
                                notas = item.notas
                            )
                        }
                        itemsTemporales.clear()
                        
                        // Esperar un poco para que los items se agreguen antes de cerrar
                        kotlinx.coroutines.delay(500)
                        Toast.makeText(
                            this@RegistroComidaFormActivity, 
                            "Registro de comida creado exitosamente", 
                            Toast.LENGTH_SHORT
                        ).show()
                        finish()
                    } ?: state.error?.let {
                        Toast.makeText(this@RegistroComidaFormActivity, it, Toast.LENGTH_SHORT).show()
                    }
                } catch (e: Exception) {
                    android.util.Log.e("RegistroComidaForm", "Error al guardar registro", e)
                    Toast.makeText(
                        this@RegistroComidaFormActivity, 
                        "Error al guardar el registro: ${e.message}", 
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }
}
