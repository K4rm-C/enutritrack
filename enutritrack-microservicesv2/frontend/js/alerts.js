// frontend/doctor-dashboard/js/alerts.js
class AlertsManager {
    constructor() {
        this.currentFilters = {
            estado: '',
            prioridad: ''
        };
    }
    
    async loadAlerts() {
        const content = document.getElementById('content');
        content.innerHTML = this.getAlertsTemplate();
        
        await this.loadAlertsList();
        await this.loadAlertsStats();
        this.setupEventListeners();
    }
    
    getAlertsTemplate() {
        return `
            <div class="alerts-management">
                <div class="header">
                    <h1>Gestión de Alertas</h1>
                    <div class="header-actions">
                        <button class="btn btn-primary" id="configAlertsBtn">
                            <i>⚙️</i> Configurar Alertas
                        </button>
                    </div>
                </div>
                
                <div class="alerts-stats" id="alertsStats">
                    <div class="loading">Cargando estadísticas...</div>
                </div>
                
                <div class="alerts-filters">
                    <div class="filter-row">
                        <div class="form-group">
                            <label for="filterStatus" class="form-label">Estado</label>
                            <select id="filterStatus" class="form-control">
                                <option value="">Todos los estados</option>
                                <option value="pendiente">Pendiente</option>
                                <option value="en_proceso">En Proceso</option>
                                <option value="resuelta">Resuelta</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="filterPriority" class="form-label">Prioridad</label>
                            <select id="filterPriority" class="form-control">
                                <option value="">Todas las prioridades</option>
                                <option value="alta">Alta</option>
                                <option value="media">Media</option>
                                <option value="baja">Baja</option>
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
                
                <div class="alerts-list" id="alertsList">
                    <div class="loading">Cargando alertas...</div>
                </div>
                
                <!-- Modal para acciones de alerta -->
                <div class="modal hidden" id="alertModal">
                    <div class="modal-content alert-modal">
                        <div class="modal-header">
                            <h3 id="modalTitle">Acción en Alerta</h3>
                            <button class="close-modal">&times;</button>
                        </div>
                        <form id="alertActionForm">
                            <div id="modalBody">
                                <!-- Contenido del modal se cargará aquí -->
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
    
    async loadAlertsList(filters = {}) {
        const list = document.getElementById('alertsList');
        Utils.showLoading(list);
        
        try {
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });
            
            const alerts = await Utils.makeApiCall(
                `${API_CONFIG.SERVICES.ALERT}/api/alerts/doctor?${queryParams}`
            );
            
            this.renderAlertsList(alerts);
        } catch (error) {
            Utils.showError(list, 'Error cargando las alertas');
        }
    }
    
    renderAlertsList(alerts) {
        const list = document.getElementById('alertsList');
        
        if (!alerts || alerts.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i>⚠️</i>
                    <p>No se encontraron alertas</p>
                </div>
            `;
            return;
        }
        
        list.innerHTML = alerts.map(alert => `
            <div class="alert-card ${alert.nivel_prioridad?.nombre?.toLowerCase() || 'medium'}">
                <div class="alert-header">
                    <div class="alert-title">
                        <h3>${alert.titulo}</h3>
                        <div class="alert-meta">
                            <span><strong>Paciente:</strong> ${alert.usuario?.nombre || 'N/A'}</span>
                            <span><strong>Fecha:</strong> ${Utils.formatDateTime(alert.fecha_deteccion)}</span>
                            <span><strong>Tipo:</strong> ${alert.tipo_alerta?.nombre || 'N/A'}</span>
                        </div>
                    </div>
                    
                    <div class="alert-priority">
                        <span class="priority-badge priority-${alert.nivel_prioridad?.nombre?.toLowerCase() || 'medium'}">
                            ${alert.nivel_prioridad?.nombre || 'Media'}
                        </span>
                        <span class="status-badge status-${alert.estado_alerta?.nombre?.toLowerCase() || 'pendiente'}">
                            ${alert.estado_alerta?.nombre || 'Pendiente'}
                        </span>
                    </div>
                </div>
                
                <div class="alert-content">
                    <div class="alert-message">
                        ${alert.mensaje}
                    </div>
                    <div class="alert-patient">
                        <i>👤</i>
                        <span>${alert.usuario?.nombre || 'Paciente'} - ${Utils.calculateAge(alert.usuario?.fecha_nacimiento) || 'N/A'} años</span>
                    </div>
                </div>
                
                <div class="alert-actions">
                    <button class="btn btn-primary btn-sm" 
                            onclick="alertsManager.viewAlertDetail('${alert.id}')">
                        <i>👁️</i> Ver Detalle
                    </button>
                    
                    ${alert.estado_alerta?.nombre !== 'resuelta' ? `
                        <button class="btn btn-warning btn-sm" 
                                onclick="alertsManager.takeAction('${alert.id}')">
                            <i>🛠️</i> Tomar Acción
                        </button>
                        
                        <button class="btn btn-success btn-sm" 
                                onclick="alertsManager.resolveAlert('${alert.id}')">
                            <i>✅</i> Resolver
                        </button>
                    ` : ''}
                    
                    ${alert.recomendacion_id ? `
                        <button class="btn btn-info btn-sm" 
                                onclick="alertsManager.viewRecommendation('${alert.recomendacion_id}')">
                            <i>💡</i> Ver Recomendación
                        </button>
                    ` : ''}
                </div>
                
                ${alert.acciones && alert.acciones.length > 0 ? `
                    <div class="alert-details">
                        <h4>Historial de Acciones</h4>
                        <div class="alert-timeline">
                            ${alert.acciones.slice(0, 3).map(action => `
                                <div class="timeline-item">
                                    <div class="timeline-date">
                                        ${Utils.formatDateTime(action.fecha_accion)}
                                    </div>
                                    <div class="timeline-action">
                                        <strong>${action.accion_tomada}</strong>
                                        ${action.descripcion ? `<p>${action.descripcion}</p>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }
    
    async loadAlertsStats() {
        const statsContainer = document.getElementById('alertsStats');
        
        try {
            const alerts = await Utils.makeApiCall(
                `${API_CONFIG.SERVICES.ALERT}/api/alerts/doctor`
            );
            
            const stats = {
                total: alerts.length,
                alta: alerts.filter(a => a.nivel_prioridad?.nombre === 'alta').length,
                media: alerts.filter(a => a.nivel_prioridad?.nombre === 'media').length,
                baja: alerts.filter(a => a.nivel_prioridad?.nombre === 'baja').length,
                pendientes: alerts.filter(a => a.estado_alerta?.nombre === 'pendiente').length
            };
            
            statsContainer.innerHTML = `
                <div class="alert-stat-card high">
                    <div class="alert-stat-number">${stats.alta}</div>
                    <div class="alert-stat-label">Alta Prioridad</div>
                </div>
                <div class="alert-stat-card medium">
                    <div class="alert-stat-number">${stats.media}</div>
                    <div class="alert-stat-label">Media Prioridad</div>
                </div>
                <div class="alert-stat-card low">
                    <div class="alert-stat-number">${stats.baja}</div>
                    <div class="alert-stat-label">Baja Prioridad</div>
                </div>
                <div class="alert-stat-card">
                    <div class="alert-stat-number">${stats.pendientes}</div>
                    <div class="alert-stat-label">Pendientes</div>
                </div>
            `;
        } catch (error) {
            statsContainer.innerHTML = '<div class="error-message">Error cargando estadísticas</div>';
        }
    }
    
    setupEventListeners() {
        // Filtros
        document.getElementById('applyFilters').addEventListener('click', () => {
            this.applyFilters();
        });
        
        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });
        
        // Configuración de alertas
        document.getElementById('configAlertsBtn').addEventListener('click', () => {
            this.showAlertConfig();
        });
        
        // Modal
        this.setupModalEventListeners();
    }
    
    setupModalEventListeners() {
        const modal = document.getElementById('alertModal');
        const closeBtn = document.querySelector('.close-modal');
        const cancelBtn = document.getElementById('cancelBtn');
        
        const closeModal = () => modal.classList.add('hidden');
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        document.getElementById('alertActionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAlertAction();
        });
    }
    
    applyFilters() {
        const filters = {
            estado: document.getElementById('filterStatus').value,
            prioridad: document.getElementById('filterPriority').value
        };
        
        this.currentFilters = filters;
        this.loadAlertsList(filters);
    }
    
    clearFilters() {
        document.getElementById('filterStatus').value = '';
        document.getElementById('filterPriority').value = '';
        
        this.currentFilters = {};
        this.loadAlertsList();
    }
    
    async viewAlertDetail(alertId) {
        try {
            const alert = await Utils.makeApiCall(
                `${API_CONFIG.SERVICES.ALERT}/api/alerts/${alertId}`
            );
            
            this.showAlertDetailModal(alert);
        } catch (error) {
            alert('Error cargando el detalle de la alerta');
        }
    }
    
    showAlertDetailModal(alert) {
        const modal = document.getElementById('alertModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Detalle de Alerta';
        modalBody.innerHTML = this.getAlertDetailTemplate(alert);
        modal.classList.remove('hidden');
    }
    
    getAlertDetailTemplate(alert) {
        return `
            <div class="alert-detail">
                <div class="detail-section">
                    <h4>Información de la Alerta</h4>
                    <p><strong>Título:</strong> ${alert.titulo}</p>
                    <p><strong>Mensaje:</strong> ${alert.mensaje}</p>
                    <p><strong>Prioridad:</strong> ${alert.nivel_prioridad?.nombre || 'N/A'}</p>
                    <p><strong>Estado:</strong> ${alert.estado_alerta?.nombre || 'N/A'}</p>
                    <p><strong>Fecha de Detección:</strong> ${Utils.formatDateTime(alert.fecha_deteccion)}</p>
                </div>
                
                <div class="detail-section">
                    <h4>Información del Paciente</h4>
                    <p><strong>Nombre:</strong> ${alert.usuario?.nombre || 'N/A'}</p>
                    <p><strong>Edad:</strong> ${Utils.calculateAge(alert.usuario?.fecha_nacimiento) || 'N/A'} años</p>
                    <p><strong>Teléfono:</strong> ${alert.usuario?.telefono || 'N/A'}</p>
                </div>
                
                ${alert.acciones && alert.acciones.length > 0 ? `
                    <div class="action-history">
                        <h4>Historial de Acciones</h4>
                        <div class="history-list">
                            ${alert.acciones.map(action => `
                                <div class="history-item">
                                    <div class="history-header">
                                        <span class="history-doctor">${action.doctor?.nombre || 'Doctor'}</span>
                                        <span class="history-date">${Utils.formatDateTime(action.fecha_accion)}</span>
                                    </div>
                                    <div class="history-action">${action.accion_tomada}</div>
                                    ${action.descripcion ? `
                                        <div class="history-desc">${action.descripcion}</div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    async takeAction(alertId) {
        const modal = document.getElementById('alertModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Tomar Acción en Alerta';
        modalBody.innerHTML = this.getActionFormTemplate();
        modal.classList.remove('hidden');
        
        this.currentAlertId = alertId;
    }
    
    getActionFormTemplate() {
        return `
            <div class="action-form">
                <div class="form-group">
                    <label for="actionType" class="form-label">Tipo de Acción *</label>
                    <select id="actionType" class="form-control" required>
                        <option value="">Seleccionar acción</option>
                        <option value="contactar_paciente">Contactar al Paciente</option>
                        <option value="ajustar_medicacion">Ajustar Medicación</option>
                        <option value="programar_cita">Programar Cita</option>
                        <option value="derivar_especialista">Derivar a Especialista</option>
                        <option value="monitorear">Aumentar Monitoreo</option>
                        <option value="otro">Otra Acción</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="actionDescription" class="form-label">Descripción de la Acción *</label>
                    <textarea id="actionDescription" class="form-control" rows="4" required
                              placeholder="Describa la acción tomada..."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="followUpDate" class="form-label">Fecha de Seguimiento (Opcional)</label>
                    <input type="date" id="followUpDate" class="form-control">
                </div>
            </div>
        `;
    }
    
    async saveAlertAction() {
        const actionData = {
            accion_tomada: document.getElementById('actionType').value,
            descripcion: document.getElementById('actionDescription').value,
            fecha_seguimiento: document.getElementById('followUpDate').value || null
        };
        
        try {
            await Utils.makeApiCall(
                `${API_CONFIG.SERVICES.ALERT}/api/alerts/${this.currentAlertId}/action`,
                {
                    method: 'POST',
                    body: JSON.stringify(actionData)
                }
            );
            
            alert('Acción registrada exitosamente');
            document.getElementById('alertModal').classList.add('hidden');
            this.loadAlertsList(this.currentFilters);
            this.loadAlertsStats();
        } catch (error) {
            alert('Error registrando la acción');
        }
    }
    
    async resolveAlert(alertId) {
        if (confirm('¿Está seguro de que desea marcar esta alerta como resuelta?')) {
            try {
                await Utils.makeApiCall(
                    `${API_CONFIG.SERVICES.ALERT}/api/alerts/${alertId}/resolve`,
                    {
                        method: 'PUT',
                        body: JSON.stringify({
                            notas_resolucion: 'Alerta resuelta por el doctor'
                        })
                    }
                );
                
                alert('Alerta marcada como resuelta');
                this.loadAlertsList(this.currentFilters);
                this.loadAlertsStats();
            } catch (error) {
                alert('Error resolviendo la alerta');
            }
        }
    }
    
    async showAlertConfig() {
        const content = document.getElementById('content');
        content.innerHTML = this.getAlertConfigTemplate();
        
        await this.loadAlertConfigurations();
    }
    
    getAlertConfigTemplate() {
        return `
            <div class="alert-config-management">
                <div class="header">
                    <h1>Configuración de Alertas Automáticas</h1>
                    <button class="btn btn-secondary" onclick="alertsManager.loadAlerts()">
                        ← Volver a Alertas
                    </button>
                </div>
                
                <div class="alert-config">
                    <h3>Configuraciones de Pacientes</h3>
                    <div class="config-list" id="configList">
                        <div class="loading">Cargando configuraciones...</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async loadAlertConfigurations() {
        const configList = document.getElementById('configList');
        
        try {
            const configs = await Utils.makeApiCall(
                `${API_CONFIG.SERVICES.ALERT}/api/patient/alert-configurations`
            );
            
            this.renderAlertConfigurations(configs);
        } catch (error) {
            Utils.showError(configList, 'Error cargando las configuraciones');
        }
    }
    
    renderAlertConfigurations(configs) {
        const configList = document.getElementById('configList');
        
        if (!configs || configs.length === 0) {
            configList.innerHTML = `
                <div class="empty-state">
                    <i>⚙️</i>
                    <p>No hay configuraciones de alertas</p>
                </div>
            `;
            return;
        }
        
        configList.innerHTML = configs.map(config => `
            <div class="config-item">
                <div class="config-info">
                    <h4>${config.tipo_alerta?.nombre || 'Alerta'}</h4>
                    <p><strong>Paciente:</strong> ${config.usuario?.nombre || 'N/A'}</p>
                    <p>${config.tipo_alerta?.descripcion || 'Sin descripción'}</p>
                </div>
                <div class="config-switch">
                    <label class="switch">
                        <input type="checkbox" ${config.esta_activa ? 'checked' : ''} 
                               onchange="alertsManager.toggleAlertConfig('${config.id}', this.checked)">
                        <span class="slider"></span>
                    </label>
                    <span>${config.esta_activa ? 'Activa' : 'Inactiva'}</span>
                </div>
            </div>
        `).join('');
    }
    
    async toggleAlertConfig(configId, isActive) {
        try {
            await Utils.makeApiCall(
                `${API_CONFIG.SERVICES.ALERT}/api/patient/alert-configurations/${configId}`,
                {
                    method: 'PUT',
                    body: JSON.stringify({
                        esta_activa: isActive
                    })
                }
            );
            
            // No mostrar alerta para no ser intrusivo
        } catch (error) {
            alert('Error actualizando la configuración');
        }
    }
}

// Instancia global
const alertsManager = new AlertsManager();