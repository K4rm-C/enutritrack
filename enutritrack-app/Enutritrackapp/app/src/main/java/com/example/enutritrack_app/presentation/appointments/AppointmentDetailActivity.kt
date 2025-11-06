package com.example.enutritrack_app.presentation.appointments

import android.app.DatePickerDialog
import android.app.TimePickerDialog
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.ViewModelProvider
import com.example.enutritrack_app.R
import com.example.enutritrack_app.databinding.ActivityAppointmentDetailBinding
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class AppointmentDetailActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityAppointmentDetailBinding
    private lateinit var viewModel: AppointmentsViewModel
    
    private val dateFormat = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault())
    
    private var citaId: String? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        
        binding = ActivityAppointmentDetailBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        viewModel = ViewModelProvider(this)[AppointmentsViewModel::class.java]
        
        citaId = intent.getStringExtra("CITA_ID")
        
        if (citaId == null) {
            Toast.makeText(this, "Error: Cita no encontrada", Toast.LENGTH_SHORT).show()
            finish()
            return
        }
        
        setupToolbar()
        setupObservers()
        setupListeners()
        loadData()
    }
    
    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = "Detalle de Cita"
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener {
            finish()
        }
    }
    
    private fun setupObservers() {
        lifecycleScope.launch {
            viewModel.uiState.collect { state ->
                state.error?.let { error ->
                    Toast.makeText(this@AppointmentDetailActivity, error, Toast.LENGTH_SHORT).show()
                    viewModel.clearError()
                }
                
                state.successMessage?.let { message ->
                    Toast.makeText(this@AppointmentDetailActivity, message, Toast.LENGTH_SHORT).show()
                    viewModel.clearSuccessMessage()
                    // Opcional: regresar a la lista después de cancelar/reprogramar
                    if (message.contains("cancelada") || message.contains("reprogramada")) {
                        kotlinx.coroutines.delay(1000)
                        finish()
                    }
                }
            }
        }
        
        // Observar cita específica
        lifecycleScope.launch {
            // Primero intentar obtener directamente
            val citaDirecta = viewModel.getCitaById(citaId!!)
            if (citaDirecta != null) {
                displayCitaDetails(citaDirecta)
            } else {
                // Si no está en cache, esperar a que llegue desde el Flow
                val citas = viewModel.citas
                    .filter { lista -> lista.any { it.id == citaId } }
                    .first()
                
                val cita = citas.find { it.id == citaId }
                
                if (cita != null) {
                    displayCitaDetails(cita)
                } else {
                    Toast.makeText(this@AppointmentDetailActivity, "Cita no encontrada", Toast.LENGTH_SHORT).show()
                    finish()
                }
            }
        }
    }
    
    private fun displayCitaDetails(cita: com.example.enutritrack_app.data.local.entities.CitaMedicaEntity) {
        binding.detailFechaHora.text = dateFormat.format(Date(cita.fecha_hora_programada))
        
        // Obtener nombres de tipo y estado
        lifecycleScope.launch {
            // Esperar a que los catálogos estén cargados
            val tipos = viewModel.tiposConsulta
                .filter { it.isNotEmpty() }
                .first()
            
            val estados = viewModel.estadosCita
                .filter { it.isNotEmpty() }
                .first()
            
            var tipo = tipos.find { it.id == cita.tipo_consulta_id }
            var estado = estados.find { it.id == cita.estado_cita_id }
            
            // Si no se encontró, intentar sincronizar y buscar de nuevo
            if (tipo == null || estado == null) {
                android.util.Log.w("AppointmentDetailActivity", "Tipo o estado no encontrado, sincronizando...")
                viewModel.syncFromServer()
                kotlinx.coroutines.delay(1000)
                
                val tiposRetry = viewModel.tiposConsulta.value
                val estadosRetry = viewModel.estadosCita.value
                
                tipo = tiposRetry.find { it.id == cita.tipo_consulta_id }
                estado = estadosRetry.find { it.id == cita.estado_cita_id }
            }
            
            binding.detailTipoConsulta.text = tipo?.nombre ?: "Tipo desconocido"
            binding.detailEstado.text = estado?.nombre ?: "Estado desconocido"
            
            binding.detailMotivo.text = cita.motivo ?: "Sin motivo especificado"
            
            // Mostrar diagnóstico y tratamiento si existen (solo lectura)
            if (!cita.diagnostico.isNullOrBlank()) {
                binding.detailDiagnosticoLabel.visibility = View.VISIBLE
                binding.detailDiagnostico.visibility = View.VISIBLE
                binding.detailDiagnostico.text = cita.diagnostico
            }
            
            if (!cita.tratamiento_recomendado.isNullOrBlank()) {
                binding.detailTratamientoLabel.visibility = View.VISIBLE
                binding.detailTratamiento.visibility = View.VISIBLE
                binding.detailTratamiento.text = cita.tratamiento_recomendado
            }
            
            // Mostrar botones según el estado
            val estadoNombre = estado?.nombre?.lowercase() ?: ""
            val esEstadoEditable = estado?.let { !it.es_final } ?: false
            if (esEstadoEditable || estadoNombre.contains("programada") || estadoNombre.contains("pendiente")) {
                binding.cancelCitaButton.visibility = View.VISIBLE
                binding.rescheduleCitaButton.visibility = View.VISIBLE
            }
            
            // Cargar vitales
            loadVitales(cita.id)
            
            // Cargar documentos
            loadDocumentos(cita.id)
        }
    }
    
    private fun loadVitales(citaId: String) {
        lifecycleScope.launch {
            viewModel.getVitalesByCitaFlow(citaId)
                .filter { it.isNotEmpty() }
                .collect { vitales ->
                    if (vitales.isNotEmpty()) {
                        binding.vitalesCard.visibility = View.VISIBLE
                        binding.vitalesList.removeAllViews()
                        
                        vitales.forEach { vital ->
                            val vitalView = android.widget.TextView(this@AppointmentDetailActivity).apply {
                                text = buildVitalesText(vital)
                                textSize = 14f
                                setPadding(0, 8, 0, 8)
                            }
                            binding.vitalesList.addView(vitalView)
                        }
                    }
                }
        }
    }
    
    private fun loadDocumentos(citaId: String) {
        lifecycleScope.launch {
            viewModel.getDocumentosByCitaFlow(citaId)
                .filter { it.isNotEmpty() }
                .collect { documentos ->
                    if (documentos.isNotEmpty()) {
                        binding.documentosCard.visibility = View.VISIBLE
                        binding.documentosList.removeAllViews()
                        
                        documentos.forEach { doc ->
                            val docView = android.widget.TextView(this@AppointmentDetailActivity).apply {
                                text = "${doc.nombre_archivo}\n${doc.tipo_documento ?: "Sin tipo"} - ${formatFileSize(doc.tamano_bytes)}"
                                textSize = 14f
                                setPadding(0, 8, 0, 8)
                            }
                            binding.documentosList.addView(docView)
                        }
                    }
                }
        }
    }
    
    private fun buildVitalesText(vital: com.example.enutritrack_app.data.local.entities.CitaMedicaVitalesEntity): String {
        val parts = mutableListOf<String>()
        
        vital.peso?.let { parts.add("Peso: $it kg") }
        vital.altura?.let { parts.add("Altura: $it cm") }
        vital.tension_arterial_sistolica?.let { sistolica ->
            vital.tension_arterial_diastolica?.let { diastolica ->
                parts.add("TA: $sistolica/$diastolica mmHg")
            }
        }
        vital.frecuencia_cardiaca?.let { parts.add("FC: $it bpm") }
        vital.temperatura?.let { parts.add("Temp: $it °C") }
        vital.saturacion_oxigeno?.let { parts.add("SpO2: $it%") }
        
        return if (parts.isEmpty()) "Sin datos de vitales" else parts.joinToString("\n")
    }
    
    private fun formatFileSize(bytes: Long?): String {
        if (bytes == null) return "Tamaño desconocido"
        val kb = bytes / 1024.0
        val mb = kb / 1024.0
        return when {
            mb >= 1 -> String.format("%.2f MB", mb)
            kb >= 1 -> String.format("%.2f KB", kb)
            else -> "$bytes bytes"
        }
    }
    
    private fun setupListeners() {
        binding.cancelCitaButton.setOnClickListener {
            citaId?.let { id ->
                MaterialAlertDialogBuilder(this)
                    .setTitle("Cancelar Cita")
                    .setMessage("¿Está seguro que desea cancelar esta cita?")
                    .setPositiveButton("Cancelar Cita") { _, _ ->
                        viewModel.cancelCita(id)
                    }
                    .setNegativeButton("No", null)
                    .show()
            }
        }
        
        binding.rescheduleCitaButton.setOnClickListener {
            showRescheduleDialog()
        }
    }
    
    private fun showRescheduleDialog() {
        val calendar = Calendar.getInstance()
        calendar.add(Calendar.DAY_OF_MONTH, 1) // Por defecto, mañana
        
        DatePickerDialog(
            this,
            { _, year, month, dayOfMonth ->
                calendar.set(year, month, dayOfMonth)
                TimePickerDialog(
                    this,
                    { _, hourOfDay, minute ->
                        calendar.set(Calendar.HOUR_OF_DAY, hourOfDay)
                        calendar.set(Calendar.MINUTE, minute)
                        
                        citaId?.let { id ->
                            viewModel.rescheduleCita(id, calendar.time)
                        }
                    },
                    calendar.get(Calendar.HOUR_OF_DAY),
                    calendar.get(Calendar.MINUTE),
                    true
                ).show()
            },
            calendar.get(Calendar.YEAR),
            calendar.get(Calendar.MONTH),
            calendar.get(Calendar.DAY_OF_MONTH)
        ).show()
    }
    
    private fun loadData() {
        viewModel.syncFromServer()
    }
}

