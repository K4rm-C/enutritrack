package com.example.enutritrack_app.presentation.dashboard

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.enutritrack_app.data.local.SecurityManager
import com.example.enutritrack_app.data.local.database.EnutritrackDatabase
import com.example.enutritrack_app.data.local.entities.*
import com.example.enutritrack_app.data.local.repositories.UserLocalRepository
import com.example.enutritrack_app.data.repositories.HealthRepository
import com.example.enutritrack_app.data.repositories.NutritionRepository
import com.example.enutritrack_app.di.DatabaseModule
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.first
import java.util.*
import kotlin.math.abs

/**
 * ViewModel para el Dashboard
 * Calcula estadísticas y prepara datos para las gráficas
 */
class DashboardViewModel(application: Application) : AndroidViewModel(application) {
    
    private val database = DatabaseModule.getDatabase(application)
    private val securityManager = SecurityManager(application)
    private val userLocalRepository = UserLocalRepository(database.userDao(), application)
    
    private val healthRepository = HealthRepository(
        context = application,
        historialPesoDao = database.historialPesoDao(),
        objetivoUsuarioDao = database.objetivoUsuarioDao(),
        medicalHistoryDao = database.medicalHistoryDao(),
        medicamentoDao = database.medicamentoDao(),
        alergiaDao = database.alergiaDao(),
        actividadFisicaDao = database.actividadFisicaDao(),
        tipoActividadDao = database.tipoActividadDao(),
        userLocalRepository = userLocalRepository
    )
    
    private val nutritionRepository = NutritionRepository(
        context = application,
        alimentoDao = database.alimentoDao(),
        registroComidaDao = database.registroComidaDao(),
        registroComidaItemDao = database.registroComidaItemDao(),
        recomendacionDao = database.recomendacionDao()
    )
    
    private val userId: String? = securityManager.getUserId()
    
    // Estados de carga
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    // ========== DATOS PARA GRÁFICAS ==========
    
    /**
     * Gráfica 1: Evolución de Peso (últimos 30 días)
     */
    data class WeightDataPoint(
        val date: Date,
        val weight: Double,
        val dayLabel: String
    )
    
    val weightEvolution: StateFlow<List<WeightDataPoint>> = if (userId != null) {
        healthRepository.getWeightHistory(userId)
            .map { weights ->
                val thirtyDaysAgo = Calendar.getInstance().apply {
                    add(Calendar.DAY_OF_YEAR, -30)
                }.time
                
                weights
                    .filter { Date(it.fecha_registro) >= thirtyDaysAgo }
                    .sortedBy { it.fecha_registro }
                    .map { weight ->
                        val date = Date(weight.fecha_registro)
                        val calendar = Calendar.getInstance().apply { time = date }
                        WeightDataPoint(
                            date = date,
                            weight = weight.peso,
                            dayLabel = "${calendar.get(Calendar.DAY_OF_MONTH)}/${calendar.get(Calendar.MONTH) + 1}"
                        )
                    }
            }
            .stateIn(
                viewModelScope,
                SharingStarted.WhileSubscribed(5000),
                emptyList()
            )
    } else {
        MutableStateFlow(emptyList())
    }
    
    /**
     * KPI: Peso actual vs objetivo
     */
    data class WeightKPI(
        val currentWeight: Double?,
        val targetWeight: Double?,
        val difference: Double?,
        val progressPercent: Float,
        val trend: String // "up", "down", "stable"
    )
    
    val weightKPI: StateFlow<WeightKPI> = if (userId != null) {
        combine(
            healthRepository.getLastWeight(userId),
            healthRepository.getCurrentObjective(userId),
            healthRepository.getWeightHistory(userId)
        ) { currentWeight, objective, history ->
            val target = objective?.peso_objetivo
            val current = currentWeight?.peso
            
            // Calcular tendencia comparando con peso de hace 7 días
            val sevenDaysAgo = Calendar.getInstance().apply {
                add(Calendar.DAY_OF_YEAR, -7)
            }.timeInMillis
            
            val weight7DaysAgo = history
                .filter { it.fecha_registro <= sevenDaysAgo }
                .maxByOrNull { it.fecha_registro }?.peso
            
            val trend = when {
                current == null || weight7DaysAgo == null -> "stable"
                current < weight7DaysAgo -> "down"
                current > weight7DaysAgo -> "up"
                else -> "stable"
            }
            
            val diff = if (current != null && target != null) {
                target - current
            } else null
            
            val progress = if (current != null && target != null && target > 0) {
                val range = abs(target - (history.minByOrNull { it.fecha_registro }?.peso ?: current))
                if (range > 0) {
                    val progressValue = abs(target - current) / range
                    ((1.0 - progressValue.coerceIn(0.0, 1.0)) * 100.0).toFloat()
                } else 0f
            } else 0f
            
            WeightKPI(
                currentWeight = current,
                targetWeight = target,
                difference = diff,
                progressPercent = progress,
                trend = trend
            )
        }.stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            WeightKPI(null, null, null, 0f, "stable")
        )
    } else {
        MutableStateFlow(WeightKPI(null, null, null, 0f, "stable"))
    }
    
    /**
     * Gráfica 2: Resumen Nutricional Diario
     */
    data class DailyNutrition(
        val calories: Double,
        val caloriesGoal: Double,
        val protein: Double,
        val carbs: Double,
        val fat: Double,
        val fiber: Double,
        val status: String // "good", "low", "over"
    )
    
    val dailyNutrition: StateFlow<DailyNutrition> = if (userId != null) {
        nutritionRepository.getRegistrosComida(userId)
            .map { registros ->
                val today = Calendar.getInstance().apply {
                    set(Calendar.HOUR_OF_DAY, 0)
                    set(Calendar.MINUTE, 0)
                    set(Calendar.SECOND, 0)
                    set(Calendar.MILLISECOND, 0)
                }.timeInMillis
                
                val tomorrow = today + (24 * 60 * 60 * 1000)
                
                val todayRegistros = registros.filter { 
                    it.fecha >= today && it.fecha < tomorrow 
                }
                
                // Por ahora, usamos un estimado basado en el número de registros
                // Para obtener valores exactos, necesitaríamos los items de forma asíncrona
                // Esto se puede mejorar en el futuro con una mejor estructura de datos
                val estimatedCaloriesPerMeal = 500.0
                val totalCalories = todayRegistros.size * estimatedCaloriesPerMeal
                val totalProtein = totalCalories * 0.15 / 4.0 // 15% de calorías de proteína
                val totalCarbs = totalCalories * 0.50 / 4.0 // 50% de calorías de carbohidratos
                val totalFat = totalCalories * 0.30 / 9.0 // 30% de calorías de grasa
                val totalFiber = 25.0 // Estimado
                
                // Calorías objetivo basado en objetivo del usuario (estimado)
                val caloriesGoal = 2000.0 // Valor por defecto, debería venir del objetivo
                
                val status = when {
                    totalCalories < caloriesGoal * 0.8 -> "low"
                    totalCalories > caloriesGoal * 1.2 -> "over"
                    else -> "good"
                }
                
                DailyNutrition(
                    calories = totalCalories,
                    caloriesGoal = caloriesGoal,
                    protein = totalProtein,
                    carbs = totalCarbs,
                    fat = totalFat,
                    fiber = totalFiber,
                    status = status
                )
            }
            .stateIn(
                viewModelScope,
                SharingStarted.WhileSubscribed(5000),
                DailyNutrition(0.0, 2000.0, 0.0, 0.0, 0.0, 0.0, "low")
            )
    } else {
        MutableStateFlow(DailyNutrition(0.0, 2000.0, 0.0, 0.0, 0.0, 0.0, "low"))
    }
    
    /**
     * Gráfica 3: Actividad Física Semanal
     */
    data class WeeklyActivity(
        val day: String,
        val minutes: Int,
        val calories: Double
    )
    
    val weeklyActivity: StateFlow<List<WeeklyActivity>> = if (userId != null) {
        healthRepository.getActividadesFisicas(userId)
            .map { actividades ->
                val calendar = Calendar.getInstance()
                val weekData = mutableListOf<WeeklyActivity>()
                
                // Obtener datos de los últimos 7 días
                for (i in 6 downTo 0) {
                    calendar.time = Date()
                    calendar.add(Calendar.DAY_OF_YEAR, -i)
                    calendar.set(Calendar.HOUR_OF_DAY, 0)
                    calendar.set(Calendar.MINUTE, 0)
                    calendar.set(Calendar.SECOND, 0)
                    calendar.set(Calendar.MILLISECOND, 0)
                    val dayStart = calendar.timeInMillis
                    val dayEnd = dayStart + (24 * 60 * 60 * 1000)
                    
                    val dayActivities = actividades.filter {
                        it.fecha >= dayStart && it.fecha < dayEnd
                    }
                    
                    val totalMinutes = dayActivities.sumOf { it.duracion_min.toLong() }.toInt()
                    val totalCalories = dayActivities.sumOf { it.calorias_quemadas }
                    
                    val dayName = when (calendar.get(Calendar.DAY_OF_WEEK)) {
                        Calendar.MONDAY -> "Lun"
                        Calendar.TUESDAY -> "Mar"
                        Calendar.WEDNESDAY -> "Mié"
                        Calendar.THURSDAY -> "Jue"
                        Calendar.FRIDAY -> "Vie"
                        Calendar.SATURDAY -> "Sáb"
                        Calendar.SUNDAY -> "Dom"
                        else -> ""
                    }
                    
                    weekData.add(WeeklyActivity(dayName, totalMinutes, totalCalories))
                }
                
                weekData
            }
            .stateIn(
                viewModelScope,
                SharingStarted.WhileSubscribed(5000),
                emptyList()
            )
    } else {
        MutableStateFlow(emptyList())
    }
    
    /**
     * KPI: Actividad Semanal
     */
    data class ActivityKPI(
        val totalMinutes: Int,
        val totalCalories: Double,
        val activeDays: Int,
        val mostFrequentType: String?
    )
    
    val activityKPI: StateFlow<ActivityKPI> = if (userId != null) {
        combine(
            healthRepository.getActividadesFisicas(userId),
            healthRepository.getTiposActividad()
        ) { actividades, tipos ->
            val sevenDaysAgo = Calendar.getInstance().apply {
                add(Calendar.DAY_OF_YEAR, -7)
            }.timeInMillis
            
            val weekActivities = actividades.filter { it.fecha >= sevenDaysAgo }
            
            val totalMinutes = weekActivities.sumOf { it.duracion_min.toLong() }.toInt()
            val totalCalories = weekActivities.sumOf { it.calorias_quemadas }
            
            // Días únicos con actividad
            val uniqueDays = weekActivities.map { activity ->
                Calendar.getInstance().apply { timeInMillis = activity.fecha }
                    .get(Calendar.DAY_OF_YEAR)
            }.distinct().size
            
            // Tipo más frecuente
            val tipoCounts = weekActivities.groupingBy { it.tipo_actividad_id }
                .eachCount()
            val mostFrequentTipoId = tipoCounts.maxByOrNull { it.value }?.key
            val mostFrequentType = tipos.firstOrNull { it.id == mostFrequentTipoId }?.nombre
            
            ActivityKPI(
                totalMinutes = totalMinutes,
                totalCalories = totalCalories,
                activeDays = uniqueDays,
                mostFrequentType = mostFrequentType
            )
        }.stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            ActivityKPI(0, 0.0, 0, null)
        )
    } else {
        MutableStateFlow(ActivityKPI(0, 0.0, 0, null))
    }
    
    /**
     * Gráfica 4: Distribución de Comidas por Tipo
     */
    data class MealDistribution(
        val tipo: String,
        val count: Int,
        val percentage: Float
    )
    
    val mealDistribution: StateFlow<List<MealDistribution>> = if (userId != null) {
        nutritionRepository.getRegistrosComida(userId)
            .map { registros ->
                val sevenDaysAgo = Calendar.getInstance().apply {
                    add(Calendar.DAY_OF_YEAR, -7)
                }.timeInMillis
                
                val weekRegistros = registros.filter { it.fecha >= sevenDaysAgo }
                
                val distribution = weekRegistros.groupingBy { it.tipo_comida }
                    .eachCount()
                
                val total = weekRegistros.size
                
                if (total > 0) {
                    distribution.map { (tipo, count) ->
                        MealDistribution(
                            tipo = tipo.name,
                            count = count,
                            percentage = (count.toFloat() / total) * 100f
                        )
                    }
                } else {
                    emptyList()
                }
            }
            .stateIn(
                viewModelScope,
                SharingStarted.WhileSubscribed(5000),
                emptyList()
            )
    } else {
        MutableStateFlow(emptyList())
    }
    
    /**
     * Gráfica 5: Comparativa Semanal: Nutrición vs Actividad
     */
    data class WeeklyBalance(
        val day: String,
        val caloriesConsumed: Double,
        val caloriesBurned: Double,
        val balance: Double
    )
    
    val weeklyBalance: StateFlow<List<WeeklyBalance>> = if (userId != null) {
        combine(
            nutritionRepository.getRegistrosComida(userId),
            healthRepository.getActividadesFisicas(userId)
        ) { registros, actividades ->
            val calendar = Calendar.getInstance()
            val weekData = mutableListOf<WeeklyBalance>()
            
            // Para cada día de la semana
            for (i in 6 downTo 0) {
                calendar.time = Date()
                calendar.add(Calendar.DAY_OF_YEAR, -i)
                calendar.set(Calendar.HOUR_OF_DAY, 0)
                calendar.set(Calendar.MINUTE, 0)
                calendar.set(Calendar.SECOND, 0)
                calendar.set(Calendar.MILLISECOND, 0)
                val dayStart = calendar.timeInMillis
                val dayEnd = dayStart + (24 * 60 * 60 * 1000)
                
                // Calorías consumidas - estimado basado en número de registros
                // Nota: Para obtener calorías exactas necesitaríamos los items, 
                // pero esto requeriría operaciones suspend dentro del map
                val dayRegistros = registros.filter {
                    it.fecha >= dayStart && it.fecha < dayEnd
                }
                // Estimado: promedio de 500 kcal por registro de comida
                val caloriesConsumed = dayRegistros.size * 500.0
                
                // Calorías quemadas
                val dayActivities = actividades.filter {
                    it.fecha >= dayStart && it.fecha < dayEnd
                }
                val caloriesBurned = dayActivities.sumOf { it.calorias_quemadas }
                
                val dayName = when (calendar.get(Calendar.DAY_OF_WEEK)) {
                    Calendar.MONDAY -> "Lun"
                    Calendar.TUESDAY -> "Mar"
                    Calendar.WEDNESDAY -> "Mié"
                    Calendar.THURSDAY -> "Jue"
                    Calendar.FRIDAY -> "Vie"
                    Calendar.SATURDAY -> "Sáb"
                    Calendar.SUNDAY -> "Dom"
                    else -> ""
                }
                
                weekData.add(WeeklyBalance(
                    day = dayName,
                    caloriesConsumed = caloriesConsumed,
                    caloriesBurned = caloriesBurned,
                    balance = caloriesConsumed - caloriesBurned
                ))
            }
            
            weekData
        }.stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            emptyList()
        )
    } else {
        MutableStateFlow(emptyList())
    }
    
    /**
     * KPI: Racha de días consecutivos
     */
    val consecutiveDays: StateFlow<Int> = if (userId != null) {
        combine(
            nutritionRepository.getRegistrosComida(userId),
            healthRepository.getActividadesFisicas(userId)
        ) { registros, actividades ->
            val calendar = Calendar.getInstance()
            var consecutive = 0
            var dayOffset = 0
            
            while (true) {
                calendar.time = Date()
                calendar.add(Calendar.DAY_OF_YEAR, -dayOffset)
                calendar.set(Calendar.HOUR_OF_DAY, 0)
                calendar.set(Calendar.MINUTE, 0)
                calendar.set(Calendar.SECOND, 0)
                calendar.set(Calendar.MILLISECOND, 0)
                val dayStart = calendar.timeInMillis
                val dayEnd = dayStart + (24 * 60 * 60 * 1000)
                
                val hasRegistro = registros.any { 
                    it.fecha >= dayStart && it.fecha < dayEnd 
                }
                val hasActividad = actividades.any {
                    it.fecha >= dayStart && it.fecha < dayEnd
                }
                
                if (hasRegistro || hasActividad) {
                    consecutive++
                    dayOffset++
                } else {
                    break
                }
            }
            
            consecutive
        }.stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            0
        )
    } else {
        MutableStateFlow(0)
    }
    
    init {
        if (userId != null) {
            viewModelScope.launch {
                // Sincronizar datos al iniciar
                _isLoading.value = true
                try {
                    healthRepository.syncFromServer(userId)
                    nutritionRepository.syncRegistrosComidaFromServer(userId)
                    healthRepository.syncActividadesFisicasFromServer(userId)
                } catch (e: Exception) {
                    Log.e("DashboardViewModel", "Error sincronizando datos", e)
                } finally {
                    _isLoading.value = false
                }
            }
        }
    }
}

