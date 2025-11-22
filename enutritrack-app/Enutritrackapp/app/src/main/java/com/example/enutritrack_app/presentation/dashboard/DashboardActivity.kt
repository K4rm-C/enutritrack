package com.example.enutritrack_app.presentation.dashboard

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import com.example.enutritrack_app.R
import com.example.enutritrack_app.data.repositories.AuthRepository
import com.example.enutritrack_app.databinding.ActivityDashboardBinding
import com.example.enutritrack_app.presentation.auth.LoginActivity
import com.example.enutritrack_app.presentation.health.HealthActivity
import com.example.enutritrack_app.presentation.profile.ProfileActivity
import com.example.enutritrack_app.presentation.nutrition.NutritionActivity
import com.example.enutritrack_app.presentation.appointments.AppointmentsActivity
import com.github.mikephil.charting.charts.*
import com.github.mikephil.charting.components.*
import com.github.mikephil.charting.data.*
import com.github.mikephil.charting.formatter.ValueFormatter
import kotlinx.coroutines.launch
import java.text.DecimalFormat
import java.util.Calendar
import kotlin.math.abs

class DashboardActivity : AppCompatActivity() {

    private lateinit var binding: ActivityDashboardBinding
    private lateinit var authRepository: AuthRepository
    private lateinit var viewModel: DashboardViewModel

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

        viewModel = ViewModelProvider(this)[DashboardViewModel::class.java]

        setupToolbar()
        setupUI()
        setupNavigation()
        setupObservers()
        setupCharts()
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
        
        // Navegación a Citas y Alertas
        binding.appointmentsCard.setOnClickListener {
            val intent = Intent(this, AppointmentsActivity::class.java)
            startActivity(intent)
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
    
    private fun setupObservers() {
        // Observar KPIs de peso
        lifecycleScope.launch {
            viewModel.weightKPI.collect { kpi ->
                kpi.currentWeight?.let {
                    binding.currentWeightKPI.text = "${String.format("%.1f", it)} kg"
                } ?: run {
                    binding.currentWeightKPI.text = "-- kg"
                }
                
                kpi.difference?.let { diff ->
                    val trendText = when (kpi.trend) {
                        "down" -> "↓ ${String.format("%.1f", abs(diff))} kg"
                        "up" -> "↑ ${String.format("%.1f", abs(diff))} kg"
                        else -> "→ Estable"
                    }
                    binding.weightTrendKPI.text = trendText
                } ?: run {
                    binding.weightTrendKPI.text = ""
                }
            }
        }
        
        // Observar nutrición diaria
        lifecycleScope.launch {
            viewModel.dailyNutrition.collect { nutrition ->
                binding.dailyCaloriesKPI.text = "${nutrition.calories.toInt()} / ${nutrition.caloriesGoal.toInt()}"
                binding.dailyCaloriesText.text = "${nutrition.calories.toInt()} / ${nutrition.caloriesGoal.toInt()} kcal"
                binding.dailyProteinText.text = "${String.format("%.1f", nutrition.protein)} g"
                binding.dailyCarbsText.text = "${String.format("%.1f", nutrition.carbs)} g"
                binding.dailyFatText.text = "${String.format("%.1f", nutrition.fat)} g"
                
                val progress = ((nutrition.calories / nutrition.caloriesGoal) * 100).toInt().coerceIn(0, 100)
                binding.caloriesProgressBar.progress = progress
            }
        }
        
        // Observar actividad semanal
        lifecycleScope.launch {
            viewModel.activityKPI.collect { kpi ->
                binding.weeklyActivityKPI.text = "${kpi.totalMinutes} min"
                binding.activeDaysKPI.text = "${kpi.activeDays}/7 días"
            }
        }
        
        // Observar racha de días
        lifecycleScope.launch {
            viewModel.consecutiveDays.collect { days ->
                binding.consecutiveDaysKPI.text = "$days días"
            }
        }
        
        // Observar evolución de peso y actualizar gráfica
        lifecycleScope.launch {
            viewModel.weightEvolution.collect { data ->
                updateWeightChart(data)
            }
        }
        
        // Observar distribución de comidas
        lifecycleScope.launch {
            viewModel.mealDistribution.collect { distribution ->
                updateMealDistributionChart(distribution)
            }
        }
        
        // Observar actividad semanal
        lifecycleScope.launch {
            viewModel.weeklyActivity.collect { activity ->
                updateWeeklyActivityChart(activity)
            }
        }
        
        // Observar balance semanal
        lifecycleScope.launch {
            viewModel.weeklyBalance.collect { balance ->
                updateWeeklyBalanceChart(balance)
            }
        }
    }
    
    private fun setupCharts() {
        setupWeightChart()
        setupMealDistributionChart()
        setupWeeklyActivityChart()
        setupWeeklyBalanceChart()
    }
    
    private fun setupWeightChart() {
        val chart = binding.weightEvolutionChart
        chart.description.isEnabled = false
        chart.setTouchEnabled(true)
        chart.setDragEnabled(true)
        chart.setScaleEnabled(true)
        chart.setPinchZoom(true)
        chart.setDrawGridBackground(false)
        
        val xAxis = chart.xAxis
        xAxis.position = XAxis.XAxisPosition.BOTTOM
        xAxis.setDrawGridLines(false)
        xAxis.textColor = Color.GRAY
        xAxis.textSize = 10f
        
        val leftAxis = chart.axisLeft
        leftAxis.setDrawGridLines(true)
        leftAxis.textColor = Color.GRAY
        leftAxis.textSize = 10f
        leftAxis.axisMinimum = 0f
        
        val rightAxis = chart.axisRight
        rightAxis.isEnabled = false
        
        chart.legend.isEnabled = false
    }
    
    private fun updateWeightChart(data: List<DashboardViewModel.WeightDataPoint>) {
        if (data.isEmpty()) return
        
        val entries = data.mapIndexed { index, point ->
            Entry(index.toFloat(), point.weight.toFloat())
        }
        
        val dataSet = LineDataSet(entries, "Peso (kg)")
        dataSet.color = Color.parseColor("#10B981") // emerald_600
        dataSet.lineWidth = 2f
        dataSet.setCircleColor(Color.parseColor("#10B981"))
        dataSet.circleRadius = 4f
        dataSet.setDrawCircleHole(false)
        dataSet.valueTextColor = Color.GRAY
        dataSet.valueTextSize = 10f
        dataSet.mode = LineDataSet.Mode.CUBIC_BEZIER
        
        val lineData = LineData(dataSet)
        binding.weightEvolutionChart.data = lineData
        binding.weightEvolutionChart.xAxis.valueFormatter = object : ValueFormatter() {
            override fun getFormattedValue(value: Float): String {
                val index = value.toInt()
                return if (index < data.size) data[index].dayLabel else ""
            }
        }
        binding.weightEvolutionChart.invalidate()
    }
    
    private fun setupMealDistributionChart() {
        val chart = binding.mealDistributionChart
        chart.description.isEnabled = false
        chart.setUsePercentValues(true)
        chart.setDrawEntryLabels(false)
        chart.legend.isEnabled = true
        chart.legend.textSize = 12f
        chart.legend.textColor = Color.GRAY
        chart.setHoleColor(Color.TRANSPARENT)
    }
    
    private fun updateMealDistributionChart(distribution: List<DashboardViewModel.MealDistribution>) {
        if (distribution.isEmpty()) return
        
        val entries = distribution.map { 
            PieEntry(it.percentage, it.tipo)
        }
        
        val dataSet = PieDataSet(entries, "")
        dataSet.colors = listOf(
            Color.parseColor("#F59E0B"), // amber
            Color.parseColor("#10B981"), // emerald
            Color.parseColor("#3B82F6"), // blue
            Color.parseColor("#8B5CF6"), // purple
            Color.parseColor("#EF4444")  // red
        )
        dataSet.valueTextColor = Color.WHITE
        dataSet.valueTextSize = 12f
        
        val pieData = PieData(dataSet)
        pieData.setValueFormatter(object : ValueFormatter() {
            override fun getFormattedValue(value: Float): String {
                return "${value.toInt()}%"
            }
        })
        
        binding.mealDistributionChart.data = pieData
        binding.mealDistributionChart.invalidate()
    }
    
    private fun setupWeeklyActivityChart() {
        val chart = binding.weeklyActivityChart
        chart.description.isEnabled = false
        chart.setTouchEnabled(true)
        chart.setDragEnabled(true)
        chart.setScaleEnabled(false)
        chart.setPinchZoom(false)
        chart.setDrawGridBackground(false)
        
        val xAxis = chart.xAxis
        xAxis.position = XAxis.XAxisPosition.BOTTOM
        xAxis.setDrawGridLines(false)
        xAxis.textColor = Color.GRAY
        xAxis.textSize = 10f
        
        val leftAxis = chart.axisLeft
        leftAxis.setDrawGridLines(true)
        leftAxis.textColor = Color.GRAY
        leftAxis.textSize = 10f
        leftAxis.axisMinimum = 0f
        
        val rightAxis = chart.axisRight
        rightAxis.isEnabled = false
        
        chart.legend.isEnabled = false
    }
    
    private fun updateWeeklyActivityChart(activity: List<DashboardViewModel.WeeklyActivity>) {
        if (activity.isEmpty()) return
        
        val entries = activity.mapIndexed { index, day ->
            BarEntry(index.toFloat(), day.minutes.toFloat())
        }
        
        val dataSet = BarDataSet(entries, "Minutos")
        dataSet.color = Color.parseColor("#3B82F6") // blue_500
        dataSet.valueTextColor = Color.GRAY
        dataSet.valueTextSize = 10f
        
        val barData = BarData(dataSet)
        barData.barWidth = 0.6f
        binding.weeklyActivityChart.data = barData
        binding.weeklyActivityChart.xAxis.valueFormatter = object : ValueFormatter() {
            override fun getFormattedValue(value: Float): String {
                val index = value.toInt()
                return if (index < activity.size) activity[index].day else ""
            }
        }
        binding.weeklyActivityChart.invalidate()
    }
    
    private fun setupWeeklyBalanceChart() {
        val chart = binding.weeklyBalanceChart
        chart.description.isEnabled = false
        chart.setTouchEnabled(true)
        chart.setDragEnabled(true)
        chart.setScaleEnabled(false)
        chart.setPinchZoom(false)
        chart.setDrawGridBackground(false)
        
        val xAxis = chart.xAxis
        xAxis.position = XAxis.XAxisPosition.BOTTOM
        xAxis.setDrawGridLines(false)
        xAxis.textColor = Color.GRAY
        xAxis.textSize = 10f
        
        val leftAxis = chart.axisLeft
        leftAxis.setDrawGridLines(true)
        leftAxis.textColor = Color.GRAY
        leftAxis.textSize = 10f
        
        val rightAxis = chart.axisRight
        rightAxis.isEnabled = false
        
        val legend = chart.legend
        legend.isEnabled = true
        legend.textSize = 12f
        legend.textColor = Color.GRAY
    }
    
    private fun updateWeeklyBalanceChart(balance: List<DashboardViewModel.WeeklyBalance>) {
        if (balance.isEmpty()) return
        
        val consumedEntries = balance.mapIndexed { index, day ->
            BarEntry(index.toFloat(), day.caloriesConsumed.toFloat())
        }
        
        val burnedEntries = balance.mapIndexed { index, day ->
            BarEntry(index.toFloat(), day.caloriesBurned.toFloat())
        }
        
        val consumedDataSet = BarDataSet(consumedEntries, "Consumidas")
        consumedDataSet.color = Color.parseColor("#F59E0B") // amber
        
        val burnedDataSet = BarDataSet(burnedEntries, "Quemadas")
        burnedDataSet.color = Color.parseColor("#10B981") // emerald
        
        val groupSpace = 0.1f
        val barSpace = 0.02f
        val barWidth = 0.43f
        
        val barData = BarData(consumedDataSet, burnedDataSet)
        barData.barWidth = barWidth
        
        binding.weeklyBalanceChart.data = barData
        binding.weeklyBalanceChart.xAxis.valueFormatter = object : ValueFormatter() {
            override fun getFormattedValue(value: Float): String {
                val index = value.toInt()
                return if (index < balance.size) balance[index].day else ""
            }
        }
        binding.weeklyBalanceChart.groupBars(0f, groupSpace, barSpace)
        binding.weeklyBalanceChart.invalidate()
    }
}
