package com.example.enutritrack_app.presentation.health

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.ViewModelProvider
import com.example.enutritrack_app.R
import com.example.enutritrack_app.data.local.entities.ActivityLevel
import com.example.enutritrack_app.databinding.ActivityHealthBinding
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class HealthActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityHealthBinding
    private lateinit var viewModel: HealthViewModel
    
    private val dateFormat = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        
        binding = ActivityHealthBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        viewModel = ViewModelProvider(this)[HealthViewModel::class.java]
        
        setupToolbar()
        setupObservers()
        setupListeners()
        loadData()
    }
    
    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = "Salud"
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
                binding.syncProgressBar.visibility = if (state.isSyncing) View.VISIBLE else View.GONE
                
                state.error?.let { error ->
                    Toast.makeText(this@HealthActivity, error, Toast.LENGTH_SHORT).show()
                    viewModel.clearError()
                }
                
                state.successMessage?.let { message ->
                    Toast.makeText(this@HealthActivity, message, Toast.LENGTH_SHORT).show()
                }
            }
        }
        
        // Observar peso actual
        lifecycleScope.launch {
            viewModel.currentWeight.collect { weight ->
                if (weight != null) {
                    binding.currentWeightText.text = "${weight.peso} kg"
                    binding.currentWeightDate.text = dateFormat.format(Date(weight.fecha_registro))
                    binding.currentWeightCard.visibility = View.VISIBLE
                } else {
                    // Mostrar card vacío con mensaje
                    binding.currentWeightText.text = "No registrado"
                    binding.currentWeightDate.text = ""
                    binding.currentWeightCard.visibility = View.VISIBLE
                }
            }
        }
        
        // Observar objetivo actual
        lifecycleScope.launch {
            viewModel.currentObjective.collect { objective ->
                if (objective != null) {
                    objective.peso_objetivo?.let {
                        binding.targetWeightText.text = "$it kg"
                    } ?: run {
                        binding.targetWeightText.text = "No establecido"
                    }
                    binding.activityLevelText.text = formatActivityLevel(objective.nivel_actividad)
                    binding.targetWeightCard.visibility = View.VISIBLE
                    binding.activityLevelCard.visibility = View.VISIBLE
                } else {
                    // Mostrar cards con valores por defecto
                    binding.targetWeightText.text = "No establecido"
                    binding.activityLevelText.text = "No configurado"
                    binding.targetWeightCard.visibility = View.VISIBLE
                    binding.activityLevelCard.visibility = View.VISIBLE
                }
            }
        }
        
        // Observar historial médico (solo condiciones)
        lifecycleScope.launch {
            viewModel.medicalHistory.collect { history ->
                // Mostrar condiciones médicas (solo lectura)
                val condiciones = if (history?.condiciones != null) {
                    parseJsonToList(history.condiciones)
                } else {
                    emptyList()
                }
                
                if (condiciones.isNotEmpty()) {
                    binding.conditionsText.text = condiciones.joinToString(", ")
                } else {
                    binding.conditionsText.text = "No hay condiciones médicas registradas"
                }
                binding.medicalConditionsCard.visibility = View.VISIBLE
            }
        }
        
        // Observar alergias (lista completa)
        lifecycleScope.launch {
            viewModel.alergias.collect { alergias ->
                binding.allergiesList.removeAllViews()
                
                if (alergias.isNotEmpty()) {
                    binding.noAlergiasText.visibility = View.GONE
                    
                    alergias.forEach { alergia ->
                        val alergiaView = layoutInflater.inflate(
                            R.layout.item_alergia,
                            binding.allergiesList,
                            false
                        )
                        
                        val nombreText = alergiaView.findViewById<android.widget.TextView>(R.id.alergiaNombre)
                        val tipoText = alergiaView.findViewById<android.widget.TextView>(R.id.alergiaTipo)
                        val severidadText = alergiaView.findViewById<android.widget.TextView>(R.id.alergiaSeveridad)
                        val reaccionText = alergiaView.findViewById<android.widget.TextView>(R.id.alergiaReaccion)
                        val notasText = alergiaView.findViewById<android.widget.TextView>(R.id.alergiaNotas)
                        val editButton = alergiaView.findViewById<com.google.android.material.button.MaterialButton>(R.id.editAlergiaButton)
                        val deleteButton = alergiaView.findViewById<com.google.android.material.button.MaterialButton>(R.id.deleteAlergiaButton)
                        
                        nombreText.text = alergia.nombre
                        tipoText.text = alergia.tipo ?: "Sin tipo"
                        severidadText.text = "Severidad: ${formatSeveridad(alergia.severidad)}"
                        reaccionText.text = "Reacción: ${alergia.reaccion}"
                        
                        if (alergia.notas.isNullOrBlank()) {
                            notasText.visibility = View.GONE
                        } else {
                            notasText.text = "Notas: ${alergia.notas}"
                            notasText.visibility = View.VISIBLE
                        }
                        
                        editButton.setOnClickListener {
                            showAddEditAlergiaDialog(alergia)
                        }
                        
                        deleteButton.setOnClickListener {
                            showDeleteAlergiaConfirmation(alergia.id, alergia.nombre)
                        }
                        
                        binding.allergiesList.addView(alergiaView)
                    }
                } else {
                    binding.noAlergiasText.visibility = View.VISIBLE
                }
                
                binding.allergiesCard.visibility = View.VISIBLE
            }
        }
        
        // Observar medicamentos activos
        lifecycleScope.launch {
            viewModel.activeMedications.collect { medications ->
                binding.medicationsList.removeAllViews()
                if (medications.isNotEmpty()) {
                    medications.forEach { med ->
                        val medView = layoutInflater.inflate(
                            R.layout.item_medication,
                            binding.medicationsList,
                            false
                        )
                        val medName = medView.findViewById<android.widget.TextView>(R.id.medName)
                        val medDose = medView.findViewById<android.widget.TextView>(R.id.medDose)
                        medName.text = med.nombre
                        medDose.text = "${med.dosis ?: "N/A"} - ${med.frecuencia ?: "N/A"}"
                        binding.medicationsList.addView(medView)
                    }
                    binding.medicationsCard.visibility = View.VISIBLE
                } else {
                    // Mostrar mensaje de que no hay medicamentos
                    val noMedView = layoutInflater.inflate(
                        android.R.layout.simple_list_item_1,
                        binding.medicationsList,
                        false
                    )
                    val noMedText = noMedView.findViewById<android.widget.TextView>(android.R.id.text1)
                    noMedText.text = "No hay medicamentos asignados"
                    noMedText.textSize = 14f
                    noMedText.setTextColor(resources.getColor(android.R.color.darker_gray, null))
                    binding.medicationsList.addView(noMedView)
                    binding.medicationsCard.visibility = View.VISIBLE
                }
            }
        }
    }
    
    private fun setupListeners() {
        // Botón agregar peso
        binding.addWeightButton.setOnClickListener {
            showAddWeightDialog()
        }
        
        // Botón establecer objetivo
        binding.setObjectiveButton.setOnClickListener {
            showSetObjectiveDialog()
        }
        
        // Botón sincronizar
        binding.syncButton.setOnClickListener {
            viewModel.syncFromServer()
        }
        
        // Botón agregar alergia
        binding.addAlergiaButton.setOnClickListener {
            showAddEditAlergiaDialog(null)
        }
    }
    
    private fun loadData() {
        // Los datos se cargan automáticamente en el ViewModel
    }
    
    private fun showAddWeightDialog() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_add_weight, null)
        val weightInput = dialogView.findViewById<com.google.android.material.textfield.TextInputLayout>(R.id.weightInputLayout)
        val notesInput = dialogView.findViewById<com.google.android.material.textfield.TextInputLayout>(R.id.notesInputLayout)
        
        MaterialAlertDialogBuilder(this)
            .setTitle("Agregar Peso")
            .setView(dialogView)
            .setPositiveButton("Guardar") { _, _ ->
                val weightText = weightInput?.editText?.text?.toString()
                val notes = notesInput?.editText?.text?.toString()
                
                weightText?.toDoubleOrNull()?.let { weight ->
                    viewModel.addWeight(weight, Date(), notes.takeIf { !it.isNullOrBlank() })
                } ?: run {
                    Toast.makeText(this, "Ingrese un peso válido", Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }
    
    private fun showSetObjectiveDialog() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_set_objective, null)
        val weightGoalInput = dialogView.findViewById<com.google.android.material.textfield.TextInputLayout>(R.id.weightGoalInputLayout)
        val activityLevelSpinner = dialogView.findViewById<android.widget.Spinner>(R.id.activityLevelSpinner)
        
        // Configurar spinner de nivel de actividad
        val activityLevels = arrayOf(
            "Sedentario",
            "Moderado",
            "Activo",
            "Muy Activo"
        )
        val adapter = android.widget.ArrayAdapter(
            this,
            android.R.layout.simple_spinner_item,
            activityLevels
        ).apply {
            setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        }
        activityLevelSpinner?.adapter = adapter
        
        MaterialAlertDialogBuilder(this)
            .setTitle("Establecer Objetivo")
            .setView(dialogView)
            .setPositiveButton("Guardar") { _, _ ->
                val weightGoalText = weightGoalInput?.editText?.text?.toString()
                val selectedPosition = activityLevelSpinner?.selectedItemPosition ?: 1
                
                val activityLevel = when (selectedPosition) {
                    0 -> ActivityLevel.SEDENTARY
                    1 -> ActivityLevel.MODERATE
                    2 -> ActivityLevel.ACTIVE
                    3 -> ActivityLevel.VERY_ACTIVE
                    else -> ActivityLevel.MODERATE
                }
                
                val weightGoal = weightGoalText?.toDoubleOrNull()
                
                viewModel.setObjective(weightGoal, activityLevel)
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }
    
    private fun formatActivityLevel(level: String): String {
        return when (level.lowercase()) {
            "sedentario" -> "Sedentario"
            "moderado" -> "Moderado"
            "activo" -> "Activo"
            "muy_activo" -> "Muy Activo"
            else -> level
        }
    }
    
    private fun showAddEditAlergiaDialog(existingAlergia: com.example.enutritrack_app.data.local.entities.AlergiaEntity?) {
        val dialogView = layoutInflater.inflate(R.layout.dialog_add_edit_alergia, null)
        val tipoSpinner = dialogView.findViewById<android.widget.Spinner>(R.id.tipoSpinner)
        val nombreInput = dialogView.findViewById<com.google.android.material.textfield.TextInputLayout>(R.id.nombreInputLayout)
        val severidadSpinner = dialogView.findViewById<android.widget.Spinner>(R.id.severidadSpinner)
        val reaccionInput = dialogView.findViewById<com.google.android.material.textfield.TextInputLayout>(R.id.reaccionInputLayout)
        val notasInput = dialogView.findViewById<com.google.android.material.textfield.TextInputLayout>(R.id.notasInputLayout)
        val nombreErrorText = dialogView.findViewById<android.widget.TextView>(R.id.nombreErrorText)
        val reaccionErrorText = dialogView.findViewById<android.widget.TextView>(R.id.reaccionErrorText)
        
        // Configurar spinner de tipo (con opción "Seleccione un tipo")
        val tipoAlergiasList = listOf("Seleccione un tipo") + com.example.enutritrack_app.data.local.entities.TipoAlergia.values().map { it.displayName }
        val tipoAdapter = android.widget.ArrayAdapter(this, android.R.layout.simple_spinner_item, tipoAlergiasList).apply {
            setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        }
        tipoSpinner.adapter = tipoAdapter
        
        // Seleccionar tipo existente si hay
        if (existingAlergia?.tipo != null) {
            val tipoIndex = tipoAlergiasList.indexOfFirst { it == existingAlergia.tipo }
            if (tipoIndex != -1) {
                tipoSpinner.setSelection(tipoIndex)
            } else {
                tipoSpinner.setSelection(0) // Seleccionar "Seleccione un tipo"
            }
        } else {
            tipoSpinner.setSelection(0) // Seleccionar "Seleccione un tipo" por defecto
        }
        
        // Configurar spinner de severidad
        val severidades = com.example.enutritrack_app.data.local.entities.SeveridadAlergia.values().map { it.displayName }
        val severidadAdapter = android.widget.ArrayAdapter(this, android.R.layout.simple_spinner_item, severidades).apply {
            setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        }
        severidadSpinner.adapter = severidadAdapter
        
        // Seleccionar severidad existente si hay
        if (existingAlergia != null) {
            val severidad = com.example.enutritrack_app.data.local.entities.SeveridadAlergia.fromValue(existingAlergia.severidad)
            val severidadIndex = com.example.enutritrack_app.data.local.entities.SeveridadAlergia.values().indexOf(severidad)
            if (severidadIndex != -1) {
                severidadSpinner.setSelection(severidadIndex)
            }
            nombreInput?.editText?.setText(existingAlergia.nombre)
            reaccionInput?.editText?.setText(existingAlergia.reaccion)
            notasInput?.editText?.setText(existingAlergia.notas)
        }
        
        MaterialAlertDialogBuilder(this)
            .setTitle(if (existingAlergia != null) "Editar Alergia" else "Agregar Alergia")
            .setView(dialogView)
            .setPositiveButton("Guardar") { _, _ ->
                nombreErrorText.visibility = View.GONE
                reaccionErrorText.visibility = View.GONE
                
                val nombre = nombreInput?.editText?.text?.toString()?.trim() ?: ""
                val reaccion = reaccionInput?.editText?.text?.toString()?.trim() ?: ""
                val notas = notasInput?.editText?.text?.toString()?.trim()
                val tipo = if (tipoSpinner.selectedItemPosition > 0) {
                    // Restar 1 porque el primer elemento es "Seleccione un tipo"
                    com.example.enutritrack_app.data.local.entities.TipoAlergia.values()[tipoSpinner.selectedItemPosition - 1].displayName
                } else {
                    null
                }
                val severidad = com.example.enutritrack_app.data.local.entities.SeveridadAlergia.values()[severidadSpinner.selectedItemPosition].value
                
                var hasError = false
                
                if (nombre.isBlank()) {
                    nombreErrorText.text = "El nombre es obligatorio"
                    nombreErrorText.visibility = View.VISIBLE
                    hasError = true
                }
                
                if (reaccion.isBlank()) {
                    reaccionErrorText.text = "La reacción es obligatoria"
                    reaccionErrorText.visibility = View.VISIBLE
                    hasError = true
                }
                
                if (!hasError) {
                    if (existingAlergia != null) {
                        viewModel.updateAlergia(existingAlergia.id, tipo, nombre, severidad, reaccion, notas)
                    } else {
                        viewModel.addAlergia(tipo, nombre, severidad, reaccion, notas)
                    }
                } else {
                    // Mostrar mensaje de error
                    Toast.makeText(this, "Por favor, completa los campos obligatorios", Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }
    
    private fun showDeleteAlergiaConfirmation(alergiaId: String, alergiaNombre: String) {
        MaterialAlertDialogBuilder(this)
            .setTitle("Eliminar Alergia")
            .setMessage("¿Estás seguro de que deseas eliminar la alergia \"$alergiaNombre\"?")
            .setPositiveButton("Eliminar") { _, _ ->
                viewModel.deleteAlergia(alergiaId)
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }
    
    private fun formatSeveridad(severidad: String): String {
        return com.example.enutritrack_app.data.local.entities.SeveridadAlergia.fromValue(severidad).displayName
    }
    
    /**
     * Parsea un string JSON a List<String>
     */
    private fun parseJsonToList(jsonString: String): List<String> {
        return try {
            val gson = com.google.gson.Gson()
            val array = gson.fromJson(jsonString, Array<String>::class.java)
            array.toList()
        } catch (e: Exception) {
            emptyList()
        }
    }
}

