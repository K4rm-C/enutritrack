// frontend/doctor-dashboard/js/dashboard.js
class Dashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.init();
    }
    
    async init() {
        // Verificar autenticación
        if (!authManager.isAuthenticated() || !await authManager.verifyToken()) {
            window.location.href = 'login.html';
            return;
        }
        
        await this.loadSidebar();
        await this.loadDashboard();
        this.setupEventListeners();
    }
    
    async loadSidebar() {
        const sidebar = document.getElementById('sidebar');
        const user = authManager.getUser();
        
        try {
            // Cargar perfil completo del doctor
            const profile = await Utils.makeApiCall(
                `${API_CONFIG.SERVICES.USER}/api/users/doctor/profile`
            );
            
            sidebar.innerHTML = `
                <div class="user-profile">
                    <div class="user-avatar">👨‍⚕️</div>
                    <div class="user-info">
                        <h3>Dr. ${profile.nombre}</h3>
                        <p>${profile.especialidad?.nombre || 'Especialista'}</p>
                    </div>
                </div>
                
                <nav class="nav-menu">
                    <a class="nav-item active" data-section="dashboard">
                        <i>📊</i> Dashboard
                    </a>
                    <a class="nav-item" data-section="patients">
                        <i>👥</i> Mis Pacientes
                    </a>
                    <a class="nav-item" data-section="appointments">
                        <i>📅</i> Citas Médicas
                    </a>
                    <a class="nav-item" data-section="alerts">
                        <i>⚠️</i> Alertas
                    </a>
                    <a class="nav-item" data-section="profile">
                        <i>👤</i> Mi Perfil
                    </a>
                </nav>
                
                <div class="logout-section">
                    <button class="btn btn-danger btn-block" id="logoutBtn">
                        <i>🚪</i> Cerrar Sesión
                    </button>
                </div>
            `;
        } catch (error) {
            console.error('Error loading sidebar:', error);
            sidebar.innerHTML = '<div class="error-message">Error cargando la barra lateral</div>';
        }
    }
    
    async loadDashboard() {
        const content = document.getElementById('content');
        Utils.showLoading(content);
        
        try {
            const dashboardData = await Utils.makeApiCall(
                `${API_CONFIG.SERVICES.DOCTOR}/api/doctor/dashboard`
            );
            
            content.innerHTML = this.renderDashboard(dashboardData);
            this.loadDashboardData(dashboardData);
        } catch (error) {
            Utils.showError(content, 'Error cargando el dashboard');
        }
    }
    
    renderDashboard(data) {
        return `
            <div class="header">
                <h1>Dashboard</h1>
                <div class="header-info">
                    <span id="currentDate"></span>
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3 id="totalPatients">${data.totalPacientes || 0}</h3>
                    <p>Pacientes Totales</p>
                </div>
                <div class="stat-card">
                    <h3 id="todayAppointments">${data.citasHoy || 0}</h3>
                    <p>Citas para Hoy</p>
                </div>
                <div class="stat-card">
                    <h3 id="pendingAlerts">${data.alertasPendientes || 0}</h3>
                    <p>Alertas Pendientes</p>
                </div>
                <div class="stat-card">
                    <h3 id="recentActivity">${data.pacientesRecientes || 0}</h3>
                    <p>Actividad Reciente</p>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h2>Próximas Citas</h2>
                    <button class="btn btn-primary" onclick="dashboard.showSection('appointments')">
                        Ver Todas
                    </button>
                </div>
                <div class="appointments-list" id="upcomingAppointments">
                    <div class="loading">Cargando citas...</div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h2>Alertas Recientes</h2>
                    <button class="btn btn-primary" onclick="dashboard.showSection('alerts')">
                        Ver Todas
                    </button>
                </div>
                <div class="alerts-list" id="recentAlerts">
                    <div class="loading">Cargando alertas...</div>
                </div>
            </div>
        `;
    }
    
    async loadDashboardData(data) {
        this.updateCurrentDate();
        await this.loadUpcomingAppointments(data.proximasCitas);
        await this.loadRecentAlerts(data.alertasRecientes);
    }
    
    updateCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('es-ES', options);
        }
    }
    
    async loadUpcomingAppointments(appointments) {
        const container = document.getElementById('upcomingAppointments');
        
        if (!appointments || appointments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i>📅</i>
                    <p>No hay citas programadas</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = appointments.slice(0, 5).map(appointment => `
            <div class="appointment-item">
                <div class="appointment-info">
                    <h4>${appointment.usuario?.nombre || 'Paciente'}</h4>
                    <p>${Utils.formatDateTime(appointment.fecha_hora_programada)}</p>
                    <p>${appointment.tipo_consulta?.nombre || 'Consulta general'}</p>
                </div>
                <div class="badge badge-${this.getAppointmentStatusClass(appointment.estado_cita?.nombre)}">
                    ${appointment.estado_cita?.nombre || 'Pendiente'}
                </div>
            </div>
        `).join('');
    }
    
    async loadRecentAlerts(alerts) {
        const container = document.getElementById('recentAlerts');
        
        if (!alerts || alerts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i>⚠️</i>
                    <p>No hay alertas recientes</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = alerts.slice(0, 5).map(alert => `
            <div class="alert-item">
                <div class="alert-info">
                    <h4>${alert.titulo}</h4>
                    <p>${alert.mensaje}</p>
                    <p><strong>Paciente:</strong> ${alert.usuario?.nombre || 'N/A'}</p>
                </div>
                <div class="badge badge-${this.getAlertPriorityClass(alert.nivel_prioridad?.nombre)}">
                    ${alert.nivel_prioridad?.nombre || 'Media'}
                </div>
            </div>
        `).join('');
    }
    
    getAppointmentStatusClass(status) {
        const statusMap = {
            'confirmada': 'success',
            'pendiente': 'warning',
            'cancelada': 'danger',
            'completada': 'primary'
        };
        return statusMap[status?.toLowerCase()] || 'warning';
    }
    
    getAlertPriorityClass(priority) {
        const priorityMap = {
            'alta': 'danger',
            'media': 'warning',
            'baja': 'primary'
        };
        return priorityMap[priority?.toLowerCase()] || 'warning';
    }
    
    setupEventListeners() {
        // Navegación
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-item')) {
                const navItem = e.target.closest('.nav-item');
                const section = navItem.getAttribute('data-section');
                this.showSection(section);
            }
        });
        
        // Logout
        document.addEventListener('click', (e) => {
            if (e.target.closest('#logoutBtn')) {
                authManager.logout();
            }
        });
    }
    
    async showSection(sectionName) {
        this.currentSection = sectionName;
        
        // Actualizar navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
        
        // Cargar sección
        await this.loadSection(sectionName);
    }
    
    async loadSection(sectionName) {
        const content = document.getElementById('content');
        Utils.showLoading(content);
        
        try {
            switch(sectionName) {
                case 'dashboard':
                    await this.loadDashboard();
                    break;
                case 'patients':
                    await this.loadPatientsSection();
                    break;
                case 'appointments':
                    await this.loadAppointmentsSection();
                    break;
                case 'alerts':
                    await this.loadAlertsSection();
                    break;
                case 'profile':
                    await this.loadProfileSection();
                    break;
                default:
                    await this.loadDashboard();
            }
        } catch (error) {
            console.error(`Error loading section ${sectionName}:`, error);
            Utils.showError(content, `Error cargando la sección ${sectionName}`);
        }
    }
    
    async loadPatientsSection() {
        // Se implementará en patients.js
        const content = document.getElementById('content');
        content.innerHTML = '<div class="loading">Cargando gestión de pacientes...</div>';
        
        // Cargar el script de pacientes si no está cargado
        if (typeof PatientsManager === 'undefined') {
            await this.loadScript('js/patients.js');
        }
        
        if (typeof patientsManager !== 'undefined') {
            patientsManager.loadPatients();
        }
    }
    
    async loadAppointmentsSection() {
        // Similar implementación para citas
        const content = document.getElementById('content');
        content.innerHTML = '<div class="loading">Cargando gestión de citas...</div>';
        
        if (typeof AppointmentsManager === 'undefined') {
            await this.loadScript('js/appointments.js');
        }
        
        if (typeof appointmentsManager !== 'undefined') {
            appointmentsManager.loadAppointments();
        }
    }
    
    async loadAlertsSection() {
        // Similar implementación para alertas
        const content = document.getElementById('content');
        content.innerHTML = '<div class="loading">Cargando gestión de alertas...</div>';
        
        if (typeof AlertsManager === 'undefined') {
            await this.loadScript('js/alerts.js');
        }
        
        if (typeof alertsManager !== 'undefined') {
            alertsManager.loadAlerts();
        }
    }
    
    async loadProfileSection() {
        // Similar implementación para perfil
        const content = document.getElementById('content');
        content.innerHTML = '<div class="loading">Cargando perfil...</div>';
        
        if (typeof ProfileManager === 'undefined') {
            await this.loadScript('js/profile.js');
        }
        
        if (typeof profileManager !== 'undefined') {
            profileManager.loadProfile();
        }
    }
    
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
}

// Instancia global
const dashboard = new Dashboard();