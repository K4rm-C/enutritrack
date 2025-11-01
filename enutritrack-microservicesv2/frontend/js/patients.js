// frontend/doctor-dashboard/js/patients.js
class PatientsManager {
    constructor() {
        this.currentPatient = null;
        this.patients = [];
    }
    
    async loadPatients() {
        const content = document.getElementById('content');
        content.innerHTML = this.getPatientsTemplate();
        
        await this.loadPatientsList();
        this.setupPatientsEventListeners();
    }
    
    getPatientsTemplate() {
        return `
            <div class="patients-management">
                <div class="header">
                    <h1>Gestión de Pacientes</h1>
                    <div class="header-actions">
                        <button class="btn btn-primary" id="addPatientBtn">
                            <i>➕</i> Agregar Paciente
                        </button>
                    </div>
                </div>
                
                <div class="search-bar">
                    <input type="text" id="patientSearch" class="form-control" 
                           placeholder="Buscar pacientes por nombre...">
                    <button class="btn btn-secondary" id="searchBtn">
                        <i>🔍</i> Buscar
                    </button>
                </div>
                
                <div class="patients-grid" id="patientsGrid">
                    <div class="loading">Cargando pacientes...</div>
                </div>
                
                <div class="patient-detail hidden" id="patientDetail">
                    <!-- Detalle del paciente se cargará aquí -->
                </div>
                
                <!-- Modal para agregar/editar paciente -->
                <div class="modal hidden" id="patientModal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 id="modalTitle">Agregar Paciente</h3>
                            <button class="close-modal">&times;</button>
                        </div>
                        <form id="patientForm">
                            <div id="modalBody">
                                <!-- Formulario se cargará aquí -->
                            </div>
                            <div class="modal-actions">
                                <button type="button" class="btn btn-secondary" id="cancelBtn">Cancelar</button>
                                <button type="submit" class="btn btn-primary" id="saveBtn">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }
    
    async loadPatientsList(searchTerm = '') {
        const grid = document.getElementById('patientsGrid');
        Utils.showLoading(grid);
        
        try {
            let url = `${API_CONFIG.SERVICES.DOCTOR}/api/doctor/patients`;
            if (searchTerm) {
                url += `?search=${encodeURIComponent(searchTerm)}`;
            }
            
            const patients = await Utils.makeApiCall(url);
            this.patients = patients;
            this.renderPatientsGrid(patients);
        } catch (error) {
            Utils.showError(grid, 'Error cargando la lista de pacientes');
        }
    }
    
    renderPatientsGrid(patients) {
        const grid = document.getElementById('patientsGrid');
        
        if (!patients || patients.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i>👥</i>
                    <p>No se encontraron pacientes</p>
                    <button class="btn btn-primary mt-2" onclick="patientsManager.showAddPatientModal()">
                        Agregar primer paciente
                    </button>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = patients.map(patient => `
            <div class="patient-card" data-patient-id="${patient.id}">
                <h3>${patient.nombre}</h3>
                <div class="patient-info">
                    <p><strong>Edad:</strong> ${Utils.calculateAge(patient.fecha_nacimiento)} años</p>
                    <p><strong>Altura:</strong> ${patient.altura} cm</p>
                    <p><strong>Género:</strong> ${patient.genero?.nombre || 'No especificado'}</p>
                    <p><strong>Teléfono:</strong> ${patient.telefono || 'No disponible'}</p>
                </div>
                <div class="actions-bar">
                    <button class="btn btn-primary btn-sm" onclick="patientsManager.viewPatientDetail('${patient.id}')">
                        Ver Detalle
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    setupPatientsEventListeners() {
        // Búsqueda
        const searchInput = document.getElementById('patientSearch');
        const searchBtn = document.getElementById('searchBtn');
        
        searchBtn.addEventListener('click', () => {
            this.loadPatientsList(searchInput.value.trim());
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.loadPatientsList(searchInput.value.trim());
            }
        });
        
        // Agregar paciente
        document.getElementById('addPatientBtn').addEventListener('click', () => {
            this.showAddPatientModal();
        });
        
        // Modal
        this.setupModalEventListeners();
    }
    
    setupModalEventListeners() {
        const modal = document.getElementById('patientModal');
        const closeBtn = document.querySelector('.close-modal');
        const cancelBtn = document.getElementById('cancelBtn');
        
        const closeModal = () => modal.classList.add('hidden');
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Formulario
        document.getElementById('patientForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePatient();
        });
    }
    
    async viewPatientDetail(patientId) {
        const detailContainer = document.getElementById('patientDetail');
        const grid = document.getElementById('patientsGrid');
        
        grid.classList.add('hidden');
        detailContainer.classList.remove('hidden');
        Utils.showLoading(detailContainer);
        
        try {
            const patient = await Utils.makeApiCall(
                `${API_CONFIG.SERVICES.DOCTOR}/api/doctor/patients/${patientId}`
            );
            
            this.currentPatient = patient;
            detailContainer.innerHTML = this.getPatientDetailTemplate(patient);
            await this.loadPatientTabs(patientId);
        } catch (error) {
            Utils.showError(detailContainer, 'Error cargando el detalle del paciente');
        }
    }
    
    getPatientDetailTemplate(patient) {
        return `
            <div class="detail-header">
                <div class="patient-basic-info">
                    <h2>${patient.nombre}</h2>
                    <p><strong>Edad:</strong> ${Utils.calculateAge(patient.fecha_nacimiento)} años</p>
                    <p><strong>Altura:</strong> ${patient.altura} cm</p>
                    <p><strong>Género:</strong> ${patient.genero?.nombre || 'No especificado'}</p>
                    <p><strong>Teléfono:</strong> ${patient.telefono || 'No disponible'}</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" onclick="patientsManager.hidePatientDetail()">
                        ← Volver a la lista
                    </button>
                    <button class="btn btn-primary" onclick="patientsManager.editPatient('${patient.id}')">
                        ✏️ Editar
                    </button>
                </div>
            </div>
            
            <div class="detail-tabs">
                <div class="tab active" data-tab="overview">Resumen General</div>
                <div class="tab" data-tab="medical">Historial Médico</div>
                <div class="tab" data-tab="appointments">Citas</div>
                <div class="tab" data-tab="nutrition">Nutrición</div>
                <div class="tab" data-tab="activity">Actividad</div>
                <div class="tab" data-tab="alerts">Alertas</div>
            </div>
            
            <div class="tab-content active" id="overviewTab">
                <div class="loading">Cargando resumen...</div>
            </div>
            <div class="tab-content" id="medicalTab">
                <div class="loading">Cargando historial médico...</div>
            </div>
            <div class="tab-content" id="appointmentsTab">
                <div class="loading">Cargando citas...</div>
            </div>
            <div class="tab-content" id="nutritionTab">
                <div class="loading">Cargando información nutricional...</div>
            </div>
            <div class="tab-content" id="activityTab">
                <div class="loading">Cargando actividad física...</div>
            </div>
            <div class="tab-content" id="alertsTab">
                <div class="loading">Cargando alertas...</div>
            </div>
        `;
    }
    
    hidePatientDetail() {
        const detailContainer = document.getElementById('patientDetail');
        const grid = document.getElementById('patientsGrid');
        
        detailContainer.classList.add('hidden');
        grid.classList.remove('hidden');
        this.currentPatient = null;
    }
    
    async loadPatientTabs(patientId) {
        this.setupTabEventListeners(patientId);
        await this.loadOverviewTab(patientId);
    }
    
    setupTabEventListeners(patientId) {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                this.switchPatientTab(tabName, patientId);
            });
        });
    }
    
    switchPatientTab(tabName, patientId) {
        // Actualizar pestañas activas
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
        
        // Cargar contenido de la pestaña
        this.loadTabContent(tabName, patientId);
    }
    
    async loadTabContent(tabName, patientId) {
        const tabContent = document.getElementById(`${tabName}Tab`);
        Utils.showLoading(tabContent);
        
        try {
            switch(tabName) {
                case 'overview':
                    await this.loadOverviewTab(patientId);
                    break;
                case 'medical':
                    await this.loadMedicalTab(patientId);
                    break;
                case 'appointments':
                    await this.loadAppointmentsTab(patientId);
                    break;
                case 'nutrition':
                    await this.loadNutritionTab(patientId);
                    break;
                case 'activity':
                    await this.loadActivityTab(patientId);
                    break;
                case 'alerts':
                    await this.loadAlertsTab(patientId);
                    break;
            }
        } catch (error) {
            Utils.showError(tabContent, `Error cargando ${tabName}`);
        }
    }
    
    async loadOverviewTab(patientId) {
        const tabContent = document.getElementById('overviewTab');
        
        try {
            const [medicalHistory, recentAppointments, recentAlerts] = await Promise.all([
                Utils.makeApiCall(`${API_CONFIG.SERVICES.DOCTOR}/api/doctor/patients/${patientId}/medical-history`),
                Utils.makeApiCall(`${API_CONFIG.SERVICES.APPOINTMENT}/api/appointments/patient?pacienteId=${patientId}&limit=3`),
                Utils.makeApiCall(`${API_CONFIG.SERVICES.ALERT}/api/alerts/patient?pacienteId=${patientId}&limit=3`)
            ]);
            
            tabContent.innerHTML = `
                <div class="grid grid-3">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Condiciones Médicas</h3>
                            <span class="badge badge-primary">${medicalHistory.condiciones?.length || 0}</span>
                        </div>
                        ${this.renderConditionsList(medicalHistory.condiciones)}
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Alergias</h3>
                            <span class="badge badge-warning">${medicalHistory.alergias?.length || 0}</span>
                        </div>
                        ${this.renderAllergiesList(medicalHistory.alergias)}
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Medicamentos</h3>
                            <span class="badge badge-primary">${medicalHistory.medicamentos?.length || 0}</span>
                        </div>
                        ${this.renderMedicationsList(medicalHistory.medicamentos)}
                    </div>
                </div>
                
                <div class="grid grid-2 mt-3">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Últimas Citas</h3>
                        </div>
                        ${this.renderRecentAppointments(recentAppointments)}
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Alertas Recientes</h3>
                        </div>
                        ${this.renderRecentAlerts(recentAlerts)}
                    </div>
                </div>
            `;
        } catch (error) {
            Utils.showError(tabContent, 'Error cargando el resumen');
        }
    }
    
    renderConditionsList(conditions) {
        if (!conditions || conditions.length === 0) {
            return '<p class="text-center">No hay condiciones médicas registradas</p>';
        }
        
        return `
            <div class="medical-list">
                ${conditions.slice(0, 3).map(condition => `
                    <div class="medical-card">
                        <h4>${condition.nombre}</h4>
                        <p><strong>Severidad:</strong> ${condition.severidad}</p>
                        <p><strong>Estado:</strong> ${condition.activa ? 'Activa' : 'Inactiva'}</p>
                        ${condition.fecha_diagnostico ? 
                            `<p><strong>Diagnosticado:</strong> ${Utils.formatDate(condition.fecha_diagnostico)}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // ... más métodos para renderizar otras listas
    
    showAddPatientModal() {
        const modal = document.getElementById('patientModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Agregar Nuevo Paciente';
        modalBody.innerHTML = this.getPatientFormTemplate();
        modal.classList.remove('hidden');
        
        this.loadFormCatalogs();
    }
    
    getPatientFormTemplate() {
        return `
            <div class="form-group">
                <label for="patientNombre" class="form-label">Nombre Completo *</label>
                <input type="text" id="patientNombre" class="form-control" required>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="patientFechaNacimiento" class="form-label">Fecha de Nacimiento *</label>
                    <input type="date" id="patientFechaNacimiento" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label for="patientGenero" class="form-label">Género *</label>
                    <select id="patientGenero" class="form-control" required>
                        <option value="">Seleccionar género</option>
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="patientAltura" class="form-label">Altura (cm) *</label>
                    <input type="number" id="patientAltura" class="form-control" step="0.1" required>
                </div>
                
                <div class="form-group">
                    <label for="patientTelefono" class="form-label">Teléfono</label>
                    <input type="tel" id="patientTelefono" class="form-control">
                </div>
            </div>
            
            <div class="form-group">
                <label for="patientEmail" class="form-label">Correo Electrónico *</label>
                <input type="email" id="patientEmail" class="form-control" required>
            </div>
            
            <div class="form-group">
                <label for="patientPassword" class="form-label">Contraseña Temporal *</label>
                <input type="password" id="patientPassword" class="form-control" required>
                <small class="form-text">El paciente podrá cambiar esta contraseña después</small>
            </div>
        `;
    }
    
    async loadFormCatalogs() {
        try {
            const genders = await Utils.makeApiCall(
                `${API_CONFIG.SERVICES.USER}/api/catalog/genders`
            );
            
            const genderSelect = document.getElementById('patientGenero');
            genderSelect.innerHTML = '<option value="">Seleccionar género</option>';
            genders.forEach(gender => {
                const option = document.createElement('option');
                option.value = gender.id;
                option.textContent = gender.nombre;
                genderSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading catalogs:', error);
        }
    }
    
    async savePatient() {
        const formData = {
            nombre: document.getElementById('patientNombre').value,
            fecha_nacimiento: document.getElementById('patientFechaNacimiento').value,
            genero_id: document.getElementById('patientGenero').value,
            altura: parseFloat(document.getElementById('patientAltura').value),
            telefono: document.getElementById('patientTelefono').value,
            email: document.getElementById('patientEmail').value,
            password: document.getElementById('patientPassword').value
        };
        
        try {
            // Aquí se implementaría la llamada al API para crear el paciente
            // await Utils.makeApiCall(`${API_CONFIG.SERVICES.PATIENT}/api/patients`, {
            //     method: 'POST',
            //     body: JSON.stringify(formData)
            // });
            
            alert('Paciente creado exitosamente');
            document.getElementById('patientModal').classList.add('hidden');
            this.loadPatientsList(); // Recargar lista
        } catch (error) {
            alert('Error creando el paciente');
        }
    }
}

// Instancia global
const patientsManager = new PatientsManager();