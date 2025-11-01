// frontend/doctor-dashboard/js/appointments.js
class AppointmentsManager {
    constructor() {
        this.currentView = 'list';
        this.currentFilters = {
            fecha: '',
            estado: '',
            tipo: ''
        };
    }
    
    async loadAppointments() {
        const content = document.getElementById('content');
        content.innerHTML = this.getAppointmentsTemplate();
        
        await this.loadAppointmentsList();
        this.setupEventListeners();
    }
    
    getAppointmentsTemplate() {
        return `
            <div class="appointments-management">
                <div class="header">
                    <h1>Gestión de Citas Médicas</h1>
                    <div class="header-actions">
                        <button class="btn btn-primary" id="newAppointmentBtn">
                            <i>➕</i> Nueva Cita
                        </button>
                    </div>
                </div>
                
                <div class="quick-actions">
                    <div class="view-toggle">
                        <button class="view-toggle-btn active" data-view="list">
                            <i>📋</i> Lista
                        </button>
                        <button class="view-toggle-btn" data-view="calendar">
                            <i>📅</i> Calendario
                        </button>
                    </div>
                    <button class="btn btn-secondary" id="todayBtn">
                        <i>📌</i> Hoy
                    </button>
                </div>
                
                <div class="appointments-filters">
                    <div class="filter-row">
                        <div class="form-group">
                            <label for="filterDate" class="form-label">Fecha</label>
                            <input type="date" id="filterDate" class="form-control">
                        </div>
                        
                        <div class="form-group">
                            <label for="filterStatus" class="form-label">Estado</label>
                            <select id="filterStatus" class="form-control">
                                <option value="">Todos los estados</option>
                                <option value="pendiente">Pendiente</option>
                                <option value="confirmada">Confirmada</option>
                                <option value="completada">Completada</option>
                                <option value="cancelada">Cancelada</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="filterType" class="form-label">Tipo de Consulta</label>
                            <select id="filterType" class="form-control">
                                <option value="">Todos los tipos</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <button class="btn btn-primary" id="applyFilters">
                                <i>🔍</i> Aplicar
                            </button>
                            <button class="btn btn-secondary" id="clearFilters">
                                <i>🔄</i> Limpiar
                            </button>
                        </div>
                    </div>
                </div>
                
                <div id="listView" class="appointments-view">
                    <div class="appointments-list" id="appointmentsList">
                        <div class="loading">Cargando citas...</div>
                    </div>
                </div>
                
                <div id="calendarView" class="calendar-view hidden">
                    <div class="calendar-header">
                        <h2 id="calendarMonth">Mes Actual</h2>
                        <div class="calendar-nav">
                            <button class="btn btn-secondary" id="prevMonth">
                                <i>◀</i> Anterior
                            </button>
                            <button class="btn btn-secondary" id="nextMonth">
                                Siguiente <i>▶</i>
                            </button>
                        </div>
                    </div>
                    <div id="calendarGrid" class="calendar-grid">
                        <!-- Calendario se generará aquí -->
                    </div>
                </div>
                
                <!-- Modal para citas -->
                <div class="modal hidden" id="appointmentModal">
                    <div class="modal-content appointment-modal">
                        <div class="modal-header">
                            <h3 id="modalTitle">Nueva Cita</h3>
                            <button class="close-modal">&times;</button>
                        </div>
                        <form id="appointmentForm">
                            <div id="modalBody">
                                <!-- Formulario se cargará aquí -->
                            </div>
                            <div class="modal-actions">
                                <button type="button" class="btn btn-secondary" id="cancelBtn">Cancelar</button>
                                <button type="submit" class="btn btn-primary" id="saveBtn">Guardar Cita</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }
    
    async loadAppointmentsList(filters = {}) {
        const list = document.getElementById('appointmentsList');
        Utils.showLoading(list);
        
        try {
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });
            
            const appointments = await Utils.makeApiCall(
                `${API_CONFIG.SERVICES.APPOINTMENT}/api/appointments/doctor?${queryParams}`
            );
            
            this.renderAppointmentsList(appointments);
        } catch (error) {
            Utils.showError(list, 'Error cargando las citas');
        }
    }
    
    renderAppointmentsList(appointments) {
        const list = document.getElementById('appointmentsList');
        
        if (!appointments || appointments.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i>📅</i>
                    <p>No se encontraron citas</p>
                    <button class="btn btn-primary mt-2" onclick="appointmentsManager.showNewAppointmentModal()">
                        Agendar primera cita
                    </button>
                </div>
            `;
            return;
        }
        
        list.innerHTML = appointments.map(appointment => `
            <div class="appointment-card">
                <div class="appointment-header">
                    <div class="appointment-patient">
                        <h3>${appointment.usuario?.nombre || 'Paciente'}</h3>
                        <div class="appointment-meta">
                            <span><strong>Tipo:</strong> ${appointment.tipo_consulta?.nombre || 'Consulta'}</span>
                            <span><strong>Duración:</strong> ${appointment.tipo_consulta?.duracion_minutos || 30} min</span>
                        </div>
                    </div>
                    
                    <div class="appointment-datetime">
                        <div class="appointment-date">
                            ${Utils.formatDate(appointment.fecha_hora_programada)}
                        </div>
                        <div class="appointment-time">
                            ${new Date(appointment.fecha_hora_programada).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                </div>
                
                <div class="appointment-details">
                    ${appointment.motivo ? `
                        <div class="appointment-motivo">
                            <strong>Motivo:</strong> ${appointment.motivo}
                        </div>
                    ` : ''}
                    
                    <div class="appointment-actions">
                        <span class="status-badge status-${appointment.estado_cita?.nombre?.toLowerCase() || 'pendiente'}">
                            ${appointment.estado_cita?.nombre || 'Pendiente'}
                        </span>
                        
                        <button class="btn btn-primary btn-sm" 
                                onclick="appointmentsManager.viewAppointmentDetail('${appointment.id}')">
                            <i>👁️</i> Ver
                        </button>
                        
                        ${appointment.estado_cita?.nombre !== 'completada' ? `
                            <button class="btn btn-secondary btn-sm" 
                                    onclick="appointmentsManager.editAppointment('${appointment.id}')">
                                <i>✏️</i> Editar
                            </button>
                        ` : ''}
                        
                        ${appointment.estado_cita?.nombre === 'pendiente' ? `
                            <button class="btn btn-success btn-sm" 
                                    onclick="appointmentsManager.updateStatus('${appointment.id}', 'confirmada')">
                                <i>✅</i> Confirmar
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    setupEventListeners() {
        // Cambio de vista
        document.querySelectorAll('.view-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.closest('.view-toggle-btn').getAttribute('data-view');
                this.switchView(view);
            });
        });
        
        // Filtros
        document.getElementById('applyFilters').addEventListener('click', () => {
            this.applyFilters();
        });
        
        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });
        
        // Nueva cita
        document.getElementById('newAppointmentBtn').addEventListener('click', () => {
            this.showNewAppointmentModal();
        });
        
        // Hoy
        document.getElementById('todayBtn').addEventListener('click', () => {
            this.goToToday();
        });
        
        // Calendario
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.changeMonth(-1);
        });
        
        document.getElementById('nextMonth').addEventListener('click', () => {
            this.changeMonth(1);
        });
        
        this.loadFilterCatalogs();
    }
    
    switchView(view) {
        this.currentView = view;
        
        // Actualizar botones de vista
        document.querySelectorAll('.view-toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        // Mostrar/ocultar vistas
        document.getElementById('listView').classList.toggle('hidden', view !== 'list');
        document.getElementById('calendarView').classList.toggle('hidden', view !== 'calendar');
        
        if (view === 'calendar') {
            this.loadCalendar();
        }
    }
    
    async loadFilterCatalogs() {
        try {
            const [consultationTypes] = await Promise.all([
                Utils.makeApiCall(`${API_CONFIG.SERVICES.APPOINTMENT}/api/catalog/consultation-types`)
            ]);
            
            const typeSelect = document.getElementById('filterType');
            consultationTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type.id;
                option.textContent = type.nombre;
                typeSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading catalogs:', error);
        }
    }
    
    applyFilters() {
        const filters = {
            fecha: document.getElementById('filterDate').value,
            estado: document.getElementById('filterStatus').value,
            tipo_consulta_id: document.getElementById('filterType').value
        };
        
        this.currentFilters = filters;
        this.loadAppointmentsList(filters);
    }
    
    clearFilters() {
        document.getElementById('filterDate').value = '';
        document.getElementById('filterStatus').value = '';
        document.getElementById('filterType').value = '';
        
        this.currentFilters = {};
        this.loadAppointmentsList();
    }
    
    async showNewAppointmentModal() {
        const modal = document.getElementById('appointmentModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Nueva Cita Médica';
        modalBody.innerHTML = this.getAppointmentFormTemplate();
        modal.classList.remove('hidden');
        
        await this.loadAppointmentFormCatalogs();
    }
    
    getAppointmentFormTemplate() {
        return `
            <div class="appointment-form">
                <div class="form-group">
                    <label for="appointmentPaciente" class="form-label">Paciente *</label>
                    <select id="appointmentPaciente" class="form-control" required>
                        <option value="">Seleccionar paciente</option>
                    </select>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="appointmentFecha" class="form-label">Fecha *</label>
                        <input type="date" id="appointmentFecha" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="appointmentHora" class="form-label">Hora *</label>
                        <input type="time" id="appointmentHora" class="form-control" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="appointmentTipo" class="form-label">Tipo de Consulta *</label>
                        <select id="appointmentTipo" class="form-control" required>
                            <option value="">Seleccionar tipo</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="appointmentEstado" class="form-label">Estado</label>
                        <select id="appointmentEstado" class="form-control">
                            <option value="pendiente">Pendiente</option>
                            <option value="confirmada">Confirmada</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="appointmentMotivo" class="form-label">Motivo de la Consulta</label>
                    <textarea id="appointmentMotivo" class="form-control" rows="3" 
                              placeholder="Describa el motivo de la consulta..."></textarea>
                </div>
            </div>
        `;
    }
    
    // frontend/doctor-dashboard/js/appointments.js (continuación)

    async loadAppointmentFormCatalogs() {
        try {
            const [patients, consultationTypes] = await Promise.all([
                Utils.makeApiCall(`${API_CONFIG.SERVICES.DOCTOR}/api/doctor/patients`),
                Utils.makeApiCall(`${API_CONFIG.SERVICES.APPOINTMENT}/api/catalog/consultation-types`)
            ]);
            
            // Cargar pacientes
            const patientSelect = document.getElementById('appointmentPaciente');
            patientSelect.innerHTML = '<option value="">Seleccionar paciente</option>';
            patients.forEach(patient => {
                const option = document.createElement('option');
                option.value = patient.id;
                option.textContent = patient.nombre;
                patientSelect.appendChild(option);
            });
            
            // Cargar tipos de consulta
            const typeSelect = document.getElementById('appointmentTipo');
            typeSelect.innerHTML = '<option value="">Seleccionar tipo</option>';
            consultationTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type.id;
                option.textContent = type.nombre;
                typeSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading appointment catalogs:', error);
        }
    }
    
    async saveAppointment() {
        const formData = {
            usuario_id: document.getElementById('appointmentPaciente').value,
            tipo_consulta_id: document.getElementById('appointmentTipo').value,
            estado_cita_id: 'pendiente', // Por defecto
            fecha_hora_programada: new Date(
                `${document.getElementById('appointmentFecha').value}T${document.getElementById('appointmentHora').value}`
            ).toISOString(),
            motivo: document.getElementById('appointmentMotivo').value
        };
        
        try {
            await Utils.makeApiCall(`${API_CONFIG.SERVICES.APPOINTMENT}/api/appointments`, {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            
            alert('Cita creada exitosamente');
            document.getElementById('appointmentModal').classList.add('hidden');
            this.loadAppointmentsList(this.currentFilters);
        } catch (error) {
            alert('Error creando la cita');
        }
    }
    
    async viewAppointmentDetail(appointmentId) {
        try {
            const appointment = await Utils.makeApiCall(
                `${API_CONFIG.SERVICES.APPOINTMENT}/api/appointments/${appointmentId}`
            );
            
            this.showAppointmentDetailModal(appointment);
        } catch (error) {
            alert('Error cargando el detalle de la cita');
        }
    }
    
    showAppointmentDetailModal(appointment) {
        const modal = document.getElementById('appointmentModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Detalle de Cita';
        modalBody.innerHTML = this.getAppointmentDetailTemplate(appointment);
        modal.classList.remove('hidden');
    }
    
    getAppointmentDetailTemplate(appointment) {
        return `
            <div class="appointment-detail">
                <div class="detail-section">
                    <h4>Información del Paciente</h4>
                    <p><strong>Nombre:</strong> ${appointment.usuario?.nombre || 'N/A'}</p>
                    <p><strong>Teléfono:</strong> ${appointment.usuario?.telefono || 'N/A'}</p>
                </div>
                
                <div class="detail-section">
                    <h4>Información de la Cita</h4>
                    <p><strong>Fecha y Hora:</strong> ${Utils.formatDateTime(appointment.fecha_hora_programada)}</p>
                    <p><strong>Tipo:</strong> ${appointment.tipo_consulta?.nombre || 'N/A'}</p>
                    <p><strong>Estado:</strong> ${appointment.estado_cita?.nombre || 'N/A'}</p>
                    <p><strong>Duración:</strong> ${appointment.tipo_consulta?.duracion_minutos || 30} minutos</p>
                </div>
                
                ${appointment.motivo ? `
                    <div class="detail-section">
                        <h4>Motivo de la Consulta</h4>
                        <p>${appointment.motivo}</p>
                    </div>
                ` : ''}
                
                ${appointment.observaciones ? `
                    <div class="detail-section">
                        <h4>Observaciones</h4>
                        <p>${appointment.observaciones}</p>
                    </div>
                ` : ''}
                
                ${appointment.diagnostico ? `
                    <div class="detail-section">
                        <h4>Diagnóstico</h4>
                        <p>${appointment.diagnostico}</p>
                    </div>
                ` : ''}
                
                <div class="detail-actions">
                    <button class="btn btn-primary" onclick="appointmentsManager.editAppointment('${appointment.id}')">
                        Editar Cita
                    </button>
                    <button class="btn btn-secondary" onclick="appointmentsManager.addVitals('${appointment.id}')">
                        Agregar Signos Vitales
                    </button>
                </div>
            </div>
        `;
    }
    
    async updateStatus(appointmentId, newStatus) {
        try {
            await Utils.makeApiCall(`${API_CONFIG.SERVICES.APPOINTMENT}/api/appointments/${appointmentId}`, {
                method: 'PUT',
                body: JSON.stringify({ estado: newStatus })
            });
            
            alert('Estado actualizado exitosamente');
            this.loadAppointmentsList(this.currentFilters);
        } catch (error) {
            alert('Error actualizando el estado');
        }
    }
    
    // Métodos para calendario
    loadCalendar() {
        this.currentDate = new Date();
        this.renderCalendar();
    }
    
    renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const monthYear = document.getElementById('calendarMonth');
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        monthYear.textContent = this.currentDate.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long'
        });
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();
        
        // Encabezados de días
        const dayHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        let calendarHTML = '';
        
        // Agregar encabezados
        dayHeaders.forEach(day => {
            calendarHTML += `<div class="calendar-day-header">${day}</div>`;
        });
        
        // Días vacíos al inicio
        for (let i = 0; i < startingDay; i++) {
            calendarHTML += `<div class="calendar-day other-month"></div>`;
        }
        
        // Días del mes
        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(year, month, day);
            const hasAppointments = this.hasAppointmentsOnDate(date);
            
            calendarHTML += `
                <div class="calendar-day" data-date="${date.toISOString()}">
                    <div class="calendar-day-number">${day}</div>
                    ${hasAppointments ? `
                        <div class="calendar-appointments">
                            <div class="calendar-appointment" onclick="appointmentsManager.showDateAppointments('${date.toISOString()}')">
                                Tiene citas
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        calendarGrid.innerHTML = calendarHTML;
    }
    
    hasAppointmentsOnDate(date) {
        // Implementar lógica para verificar citas en una fecha
        return Math.random() > 0.7; // Ejemplo aleatorio
    }
    
    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }
    
    goToToday() {
        this.currentDate = new Date();
        this.renderCalendar();
    }
}

// Instancia global
const appointmentsManager = new AppointmentsManager();