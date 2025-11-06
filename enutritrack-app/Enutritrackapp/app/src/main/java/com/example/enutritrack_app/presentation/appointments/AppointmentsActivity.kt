package com.example.enutritrack_app.presentation.appointments

import android.app.DatePickerDialog
import android.app.TimePickerDialog
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ArrayAdapter
import android.widget.Spinner
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.ViewModelProvider
import com.example.enutritrack_app.R
import com.example.enutritrack_app.data.local.entities.CitaMedicaEntity
import com.example.enutritrack_app.databinding.ActivityAppointmentsBinding
import com.example.enutritrack_app.presentation.profile.ProfileViewModel
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.tabs.TabLayout
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.filter
import java.text.SimpleDateFormat
import java.util.*

class AppointmentsActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityAppointmentsBinding
    private lateinit var appointmentsViewModel: AppointmentsViewModel
    private lateinit var alertsViewModel: AlertsViewModel
    private lateinit var profileViewModel: ProfileViewModel
    
    private val dateFormat = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault())
    private val dateOnlyFormat = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())
    
    private var currentTab: Int = 0 // 0 = Citas, 1 = Alertas
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        
        binding = ActivityAppointmentsBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        appointmentsViewModel = ViewModelProvider(this)[AppointmentsViewModel::class.java]
        alertsViewModel = ViewModelProvider(this)[AlertsViewModel::class.java]
        profileViewModel = ViewModelProvider(this)[ProfileViewModel::class.java]
        
        setupToolbar()
        setupTabs()
        setupObservers()
        setupListeners()
        loadData()
    }
    
    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = "Citas y Alertas"
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener {
            finish()
        }
    }
    
    private fun setupTabs() {
        // Agregar tabs programáticamente
        binding.tabLayout.addTab(binding.tabLayout.newTab().setText("Citas Médicas"))
        binding.tabLayout.addTab(binding.tabLayout.newTab().setText("Alertas"))
        
        binding.tabLayout.addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener {
            override fun onTabSelected(tab: TabLayout.Tab?) {
                currentTab = tab?.position ?: 0
                if (currentTab == 0) {
                    // Mostrar citas
                    binding.citasCard.visibility = View.VISIBLE
                    binding.alertasCard.visibility = View.GONE
                } else {
                    // Mostrar alertas
                    binding.citasCard.visibility = View.GONE
                    binding.alertasCard.visibility = View.VISIBLE
                    // Sincronizar alertas si es necesario
                    alertsViewModel.syncFromServer()
                }
            }
            
            override fun onTabUnselected(tab: TabLayout.Tab?) {}
            override fun onTabReselected(tab: TabLayout.Tab?) {}
        })
        
        // Mostrar citas por defecto
        binding.citasCard.visibility = View.VISIBLE
        binding.alertasCard.visibility = View.GONE
    }
    
    private fun setupObservers() {
        // Observar estado de UI de citas
        lifecycleScope.launch {
            appointmentsViewModel.uiState.collect { state ->
                binding.progressBar.visibility = if (state.isLoading) View.VISIBLE else View.GONE
                
                state.error?.let { error ->
                    Toast.makeText(this@AppointmentsActivity, error, Toast.LENGTH_SHORT).show()
                    appointmentsViewModel.clearError()
                }
                
                state.successMessage?.let { message ->
                    Toast.makeText(this@AppointmentsActivity, message, Toast.LENGTH_SHORT).show()
                    appointmentsViewModel.clearSuccessMessage()
                }
            }
        }
        
        // Observar citas
        lifecycleScope.launch {
            appointmentsViewModel.citas.collect { citas ->
                binding.citasList.removeAllViews()
                
                if (citas.isNotEmpty()) {
                    binding.noCitasText.visibility = View.GONE
                    
                    citas.forEach { cita ->
                        val citaView = layoutInflater.inflate(
                            R.layout.item_appointment,
                            binding.citasList,
                            false
                        )
                        
                        setupCitaItem(citaView, cita)
                        binding.citasList.addView(citaView)
                    }
                } else {
                    binding.noCitasText.visibility = View.VISIBLE
                }
            }
        }
        
        // Observar estado de UI de alertas
        lifecycleScope.launch {
            alertsViewModel.uiState.collect { state ->
                state.error?.let { error ->
                    Toast.makeText(this@AppointmentsActivity, error, Toast.LENGTH_SHORT).show()
                    alertsViewModel.clearError()
                }
                
                state.successMessage?.let { message ->
                    Toast.makeText(this@AppointmentsActivity, message, Toast.LENGTH_SHORT).show()
                    alertsViewModel.clearSuccessMessage()
                }
            }
        }
        
        // Observar alertas
        lifecycleScope.launch {
            alertsViewModel.alertas.collect { alertas ->
                binding.alertasList.removeAllViews()
                
                if (alertas.isNotEmpty()) {
                    binding.noAlertasText.visibility = View.GONE
                    
                    alertas.forEach { alerta ->
                        val alertaView = layoutInflater.inflate(
                            R.layout.item_alerta,
                            binding.alertasList,
                            false
                        )
                        
                        setupAlertaItem(alertaView, alerta)
                        binding.alertasList.addView(alertaView)
                    }
                } else {
                    binding.noAlertasText.visibility = View.VISIBLE
                }
            }
        }
    }
    
    private fun setupCitaItem(view: View, cita: CitaMedicaEntity) {
        val fechaText = view.findViewById<android.widget.TextView>(R.id.citaFecha)
        val estadoText = view.findViewById<android.widget.TextView>(R.id.citaEstado)
        val tipoText = view.findViewById<android.widget.TextView>(R.id.citaTipo)
        val motivoText = view.findViewById<android.widget.TextView>(R.id.citaMotivo)
        val viewButton = view.findViewById<com.google.android.material.button.MaterialButton>(R.id.viewCitaButton)
        val cancelButton = view.findViewById<com.google.android.material.button.MaterialButton>(R.id.cancelCitaButton)
        
        fechaText.text = dateFormat.format(Date(cita.fecha_hora_programada))
        
        // Obtener nombres de tipo y estado
        lifecycleScope.launch {
            // Esperar a que los catálogos estén cargados
            val tipos = appointmentsViewModel.tiposConsulta
                .filter { it.isNotEmpty() }
                .first()
            
            val estados = appointmentsViewModel.estadosCita
                .filter { it.isNotEmpty() }
                .first()
            
            val tipo = tipos.find { it.id == cita.tipo_consulta_id }
            val estado = estados.find { it.id == cita.estado_cita_id }
            
            tipoText.text = tipo?.nombre ?: "Tipo desconocido"
            estadoText.text = estado?.nombre ?: "Estado desconocido"
            
            // Si no se encontró tipo o estado, intentar sincronizar
            if (tipo == null || estado == null) {
                android.util.Log.w("AppointmentsActivity", "Tipo o estado no encontrado, sincronizando...")
                appointmentsViewModel.syncFromServer()
                kotlinx.coroutines.delay(1000)
                
                // Intentar de nuevo
                val tiposRetry = appointmentsViewModel.tiposConsulta.value
                val estadosRetry = appointmentsViewModel.estadosCita.value
                
                val tipoRetry = tiposRetry.find { it.id == cita.tipo_consulta_id }
                val estadoRetry = estadosRetry.find { it.id == cita.estado_cita_id }
                
                tipoText.text = tipoRetry?.nombre ?: "Tipo desconocido"
                estadoText.text = estadoRetry?.nombre ?: "Estado desconocido"
                
                val estadoNombre = estadoRetry?.nombre?.lowercase() ?: ""
                if (estadoNombre.contains("programada") || estadoNombre.contains("pendiente") || !(estadoRetry?.es_final ?: true)) {
                    cancelButton.visibility = View.VISIBLE
                } else {
                    cancelButton.visibility = View.GONE
                }
            } else {
                // Mostrar botón cancelar solo si el estado lo permite
                val estadoNombre = estado.nombre.lowercase()
                if (estadoNombre.contains("programada") || estadoNombre.contains("pendiente") || !estado.es_final) {
                    cancelButton.visibility = View.VISIBLE
                } else {
                    cancelButton.visibility = View.GONE
                }
            }
        }
        
        motivoText.text = cita.motivo ?: "Sin motivo especificado"
        
        viewButton.setOnClickListener {
            val intent = Intent(this, AppointmentDetailActivity::class.java).apply {
                putExtra("CITA_ID", cita.id)
            }
            startActivity(intent)
        }
        
        cancelButton.setOnClickListener {
            showCancelCitaConfirmation(cita)
        }
    }
    
    private fun setupAlertaItem(view: View, alerta: com.example.enutritrack_app.data.local.entities.AlertaEntity) {
        val tituloText = view.findViewById<android.widget.TextView>(R.id.alertaTitulo)
        val prioridadText = view.findViewById<android.widget.TextView>(R.id.alertaPrioridad)
        val mensajeText = view.findViewById<android.widget.TextView>(R.id.alertaMensaje)
        val fechaText = view.findViewById<android.widget.TextView>(R.id.alertaFecha)
        val estadoText = view.findViewById<android.widget.TextView>(R.id.alertaEstado)
        
        tituloText.text = alerta.titulo
        mensajeText.text = alerta.mensaje
        
        // Obtener nivel de prioridad y estado
        lifecycleScope.launch {
            val niveles = alertsViewModel.nivelesPrioridad.first()
            val estados = alertsViewModel.estadosAlerta.first()
            
            val nivel = niveles.find { it.id == alerta.nivel_prioridad_id }
            val estado = estados.find { it.id == alerta.estado_alerta_id }
            
            prioridadText.text = nivel?.nombre ?: "Prioridad desconocida"
            estadoText.text = estado?.nombre ?: "Estado desconocido"
            
            // Colorear prioridad según nivel
            val nivelNumerico = nivel?.nivel_numerico ?: 0
            when {
                nivelNumerico >= 8 -> prioridadText.setBackgroundColor(getColor(R.color.red_600))
                nivelNumerico >= 5 -> prioridadText.setBackgroundColor(getColor(R.color.amber_600))
                else -> prioridadText.setBackgroundColor(getColor(R.color.blue_600))
            }
        }
        
        fechaText.text = dateFormat.format(Date(alerta.fecha_deteccion))
        
        // Click en la alerta para mostrar detalle
        view.setOnClickListener {
            MaterialAlertDialogBuilder(this)
                .setTitle(alerta.titulo)
                .setMessage(alerta.mensaje)
                .setPositiveButton("Cerrar", null)
                .show()
        }
    }
    
    private fun setupListeners() {
        binding.syncButton.setOnClickListener {
            if (currentTab == 0) {
                appointmentsViewModel.syncFromServer()
            } else {
                alertsViewModel.syncFromServer()
            }
        }
        
        binding.addCitaButton.setOnClickListener {
            android.util.Log.d("AppointmentsActivity", "Botón agregar cita clickeado")
            showCreateCitaDialog()
        }
    }
    
    private fun loadData() {
        appointmentsViewModel.syncFromServer()
        
        // Cargar datos del perfil para obtener doctor_id
        profileViewModel.loadProfile()
    }
    
    private fun showCreateCitaDialog() {
        // Obtener doctor asignado
        lifecycleScope.launch {
            android.util.Log.d("AppointmentsActivity", "Iniciando showCreateCitaDialog")
            
            // Intentar obtener el perfil con timeout
            val profile = try {
                kotlinx.coroutines.withTimeoutOrNull(3000) {
                    profileViewModel.profile
                        .filter { it != null }
                        .first()
                }
            } catch (e: Exception) {
                android.util.Log.e("AppointmentsActivity", "Error obteniendo perfil", e)
                null
            }
            
            if (profile == null) {
                android.util.Log.w("AppointmentsActivity", "Perfil no disponible, intentando cargar...")
                profileViewModel.loadProfile()
                // Esperar un poco más
                kotlinx.coroutines.delay(1000)
                val profileRetry = profileViewModel.profile.value
                
                if (profileRetry == null || profileRetry.doctor_id == null) {
                    Toast.makeText(this@AppointmentsActivity, "No tiene un doctor asignado. Contacte al administrador.", Toast.LENGTH_LONG).show()
                    android.util.Log.w("AppointmentsActivity", "No se pudo obtener doctor_id del perfil")
                    return@launch
                }
                
                // Continuar con el perfil obtenido
                val doctorId = profileRetry.doctor_id
                android.util.Log.d("AppointmentsActivity", "Doctor ID obtenido: $doctorId")
                // Ejecutar en el hilo principal para mostrar el diálogo
                runOnUiThread {
                    mostrarDialogoCita(doctorId)
                }
                return@launch
            }
            
            val doctorId = profile.doctor_id
            
            if (doctorId == null) {
                Toast.makeText(this@AppointmentsActivity, "No tiene un doctor asignado. Contacte al administrador.", Toast.LENGTH_LONG).show()
                android.util.Log.w("AppointmentsActivity", "doctor_id es null")
                return@launch
            }
            
            android.util.Log.d("AppointmentsActivity", "Doctor ID: $doctorId, mostrando diálogo")
            // Ejecutar en el hilo principal para mostrar el diálogo
            runOnUiThread {
                mostrarDialogoCita(doctorId)
            }
        }
    }
    
    private fun mostrarDialogoCita(doctorId: String) {
        android.util.Log.d("AppointmentsActivity", "mostrarDialogoCita llamado con doctorId: $doctorId")
        
        val dialogView = layoutInflater.inflate(R.layout.dialog_create_appointment, null)
        val tipoSpinner = dialogView.findViewById<Spinner>(R.id.tipoConsultaSpinner)
        val estadoSpinner = dialogView.findViewById<Spinner>(R.id.estadoCitaSpinner)
        val fechaHoraInput = dialogView.findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.fechaHoraInput)
        val motivoInput = dialogView.findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.motivoInput)
        val errorText = dialogView.findViewById<android.widget.TextView>(R.id.errorText)
        
        var selectedDateTime = Calendar.getInstance()
        val estadosPermitidos = mutableListOf<com.example.enutritrack_app.data.local.entities.EstadoCitaEntity>()
        
        // Configurar spinners
        setupTiposConsultaSpinner(tipoSpinner)
        
        // Configurar estados y guardar la lista filtrada
        lifecycleScope.launch {
            val estados = try {
                appointmentsViewModel.estadosCita
                    .filter { it.isNotEmpty() }
                    .first()
            } catch (e: Exception) {
                android.util.Log.w("AppointmentsActivity", "No hay estados cargados, sincronizando...")
                appointmentsViewModel.syncFromServer()
                kotlinx.coroutines.delay(1000)
                appointmentsViewModel.estadosCita.value
            }
            
            android.util.Log.d("AppointmentsActivity", "Estados obtenidos: ${estados.size}")
            estados.forEach { estado ->
                android.util.Log.d("AppointmentsActivity", "Estado: ${estado.nombre}, es_final: ${estado.es_final}")
            }
            
            estadosPermitidos.clear()
            // Filtrar estados que NO son finales (es_final = false), que son los que el usuario puede usar para crear citas
            estadosPermitidos.addAll(estados.filter { estado ->
                !estado.es_final
            })
            
            android.util.Log.d("AppointmentsActivity", "Estados permitidos después del filtro: ${estadosPermitidos.size}")
            
            if (estadosPermitidos.isEmpty()) {
                // Intentar sincronizar si no hay estados
                android.util.Log.w("AppointmentsActivity", "No hay estados permitidos, intentando sincronizar...")
                appointmentsViewModel.syncFromServer()
                kotlinx.coroutines.delay(1000)
                val estadosActualizados = try {
                    appointmentsViewModel.estadosCita
                        .filter { it.isNotEmpty() }
                        .first()
                } catch (e: Exception) {
                    appointmentsViewModel.estadosCita.value
                }
                
                estadosPermitidos.clear()
                estadosPermitidos.addAll(estadosActualizados.filter { estado ->
                    !estado.es_final
                })
                
                android.util.Log.d("AppointmentsActivity", "Estados permitidos después de sincronizar: ${estadosPermitidos.size}")
            }
            
            if (estadosPermitidos.isNotEmpty()) {
                val nombres = estadosPermitidos.map { it.nombre }
                android.util.Log.d("AppointmentsActivity", "Configurando spinner con estados: $nombres")
                val adapter = ArrayAdapter(this@AppointmentsActivity, android.R.layout.simple_spinner_item, nombres).apply {
                    setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
                }
                estadoSpinner?.adapter = adapter
                android.util.Log.d("AppointmentsActivity", "Spinner configurado exitosamente")
            } else {
                android.util.Log.e("AppointmentsActivity", "No hay estados permitidos disponibles")
                errorText.text = "No hay estados de cita disponibles. Intente sincronizar."
                errorText.visibility = View.VISIBLE
            }
        }
        
        // Configurar date/time picker
        fechaHoraInput?.setText(dateFormat.format(selectedDateTime.time))
        fechaHoraInput?.setOnClickListener {
            val datePicker = DatePickerDialog(
                this@AppointmentsActivity,
                { _, year, month, dayOfMonth ->
                    selectedDateTime.set(year, month, dayOfMonth)
                    TimePickerDialog(
                        this@AppointmentsActivity,
                        { _, hourOfDay, minute ->
                            selectedDateTime.set(Calendar.HOUR_OF_DAY, hourOfDay)
                            selectedDateTime.set(Calendar.MINUTE, minute)
                            fechaHoraInput.setText(dateFormat.format(selectedDateTime.time))
                        },
                        selectedDateTime.get(Calendar.HOUR_OF_DAY),
                        selectedDateTime.get(Calendar.MINUTE),
                        true
                    ).show()
                },
                selectedDateTime.get(Calendar.YEAR),
                selectedDateTime.get(Calendar.MONTH),
                selectedDateTime.get(Calendar.DAY_OF_MONTH)
            )
            datePicker.show()
        }
        
        android.util.Log.d("AppointmentsActivity", "Mostrando diálogo MaterialAlertDialog")
        MaterialAlertDialogBuilder(this@AppointmentsActivity)
            .setTitle("Nueva Cita Médica")
            .setView(dialogView)
            .setPositiveButton("Guardar") { _, _ ->
                lifecycleScope.launch {
                    val tipoIndex = tipoSpinner?.selectedItemPosition ?: -1
                    val estadoIndex = estadoSpinner?.selectedItemPosition ?: -1
                    
                    val tipos = appointmentsViewModel.tiposConsulta.value
                    
                    if (tipoIndex < 0 || tipoIndex >= tipos.size) {
                        errorText.text = "Debe seleccionar un tipo de consulta"
                        errorText.visibility = View.VISIBLE
                        return@launch
                    }
                    
                    if (estadoIndex < 0 || estadoIndex >= estadosPermitidos.size) {
                        errorText.text = "Debe seleccionar un estado"
                        errorText.visibility = View.VISIBLE
                        return@launch
                    }
                    
                    val tipoSeleccionado = tipos[tipoIndex]
                    val estadoSeleccionado = estadosPermitidos[estadoIndex]
                    
                    errorText.visibility = View.GONE
                    
                    appointmentsViewModel.createCita(
                        doctorId = doctorId,
                        tipoConsultaId = tipoSeleccionado.id,
                        estadoCitaId = estadoSeleccionado.id,
                        fechaHoraProgramada = selectedDateTime.time,
                        motivo = motivoInput?.text?.toString()?.trim()
                    )
                }
            }
            .setNegativeButton("Cancelar", null)
            .show()
        
        android.util.Log.d("AppointmentsActivity", "Diálogo mostrado")
    }
    
    private fun setupTiposConsultaSpinner(spinner: Spinner?) {
        lifecycleScope.launch {
            val tipos = appointmentsViewModel.tiposConsulta
                .filter { it.isNotEmpty() }
                .first()
            
            if (tipos.isEmpty()) {
                appointmentsViewModel.syncFromServer()
                kotlinx.coroutines.delay(500)
                val tiposActualizados = appointmentsViewModel.tiposConsulta
                    .filter { it.isNotEmpty() }
                    .first()
                
                if (tiposActualizados.isNotEmpty()) {
                    val nombres = tiposActualizados.map { it.nombre }
                    val adapter = ArrayAdapter(this@AppointmentsActivity, android.R.layout.simple_spinner_item, nombres).apply {
                        setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
                    }
                    spinner?.adapter = adapter
                }
            } else {
                val nombres = tipos.map { it.nombre }
                val adapter = ArrayAdapter(this@AppointmentsActivity, android.R.layout.simple_spinner_item, nombres).apply {
                    setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
                }
                spinner?.adapter = adapter
            }
        }
    }
    
    private fun showCancelCitaConfirmation(cita: CitaMedicaEntity) {
        MaterialAlertDialogBuilder(this)
            .setTitle("Cancelar Cita")
            .setMessage("¿Está seguro que desea cancelar esta cita?")
            .setPositiveButton("Cancelar Cita") { _, _ ->
                appointmentsViewModel.cancelCita(cita.id)
            }
            .setNegativeButton("No", null)
            .show()
    }
}

