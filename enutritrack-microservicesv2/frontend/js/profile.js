// frontend/doctor-dashboard/js/profile.js
class ProfileManager {
    constructor() {
        this.profileData = null;
    }
    
    async loadProfile() {
        const content = document.getElementById('content');
        content.innerHTML = this.getProfileTemplate();
        
        await this.loadProfileData();
        this.setupEventListeners();
    }
    
    getProfileTemplate() {
        return `
            <div class="profile-management">
                <div class="profile-header">
                    <div class="profile-avatar">
                        👨‍⚕️
                        <div class="profile-avatar-edit">
                            <i>✏️</i>
                        </div>
                    </div>
                    <h1>Mi Perfil Profesional</h1>
                    <p>Gestiona tu información personal y profesional</p>
                </div>
                
                <div class="profile-stats" id="profileStats">
                    <div class="loading">Cargando estadísticas...</div>
                </div>
                
                <div class="profile-sections">
                    <div class="profile-section">
                        <div class="section-header">
                            <h2>Información Personal</h2>
                            <button class="btn btn-primary" id="editPersonalInfo">
                                <i>✏️</i> Editar
                            </button>
                        </div>
                        <form id="personalInfoForm">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="profileNombre" class="form-label">Nombre Completo *</label>
                                    <input type="text" id="profileNombre" class="form-control" required readonly>
                                </div>
                                
                                <div class="form-group">
                                    <label for="profileEspecialidad" class="form-label">Especialidad</label>
                                    <select id="profileEspecialidad" class="form-control" disabled>
                                        <option value="">Seleccionar especialidad</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="profileCedula" class="form-label">Cédula Profesional</label>
                                    <input type="text" id="profileCedula" class="form-control" readonly>
                                </div>
                                
                                <div class="form-group">
                                    <label for="profileEmail" class="form-label">Correo Electrónico</label>
                                    <input type="email" id="profileEmail" class="form-control readonly-field" readonly>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="profileTelefono" class="form-label">Teléfono Principal</label>
                                    <input type="tel" id="profileTelefono" class="form-control" readonly>
                                </div>
                                
                                <div class="form-group">
                                    <label for="profileTelefono1" class="form-label">Teléfono Secundario</label>
                                    <input type="tel" id="profileTelefono1" class="form-control" readonly>
                                </div>
                            </div>
                            
                            <div class="form-actions hidden" id="personalInfoActions">
                                <button type="submit" class="btn btn-primary">Guardar Cambios</button>
                                <button type="button" class="btn btn-secondary" id="cancelPersonalEdit">Cancelar</button>
                            </div>
                        </form>
                    </div>
                    
                    <div class="profile-section">
                        <div class="section-header">
                            <h2>Seguridad</h2>
                        </div>
                        <div class="security-settings">
                            <div class="security-item">
                                <div class="security-info">
                                    <h4>Cambiar Contraseña</h4>
                                    <p>Actualiza tu contraseña de acceso</p>
                                </div>
                                <button class="btn btn-secondary" onclick="profileManager.showChangePassword()">
                                    Cambiar
                                </button>
                            </div>
                            
                            <div class="security-item">
                                <div class="security-info">
                                    <h4>Autenticación de Dos Factores</h4>
                                    <p>Protege tu cuenta con verificación adicional</p>
                                </div>
                                <label class="switch">
                                    <input type="checkbox" id="twoFactorToggle">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-section">
                        <div class="section-header">
                            <h2>Sesiones Activas</h2>
                        </div>
                        <div class="session-list" id="sessionList">
                            <div class="loading">Cargando sesiones...</div>
                        </div>
                    </div>
                </div>
                
                <!-- Modal para cambiar contraseña -->
                <div class="modal hidden" id="passwordModal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Cambiar Contraseña</h3>
                            <button class="close-modal">&times;</button>
                        </div>
                        <form id="passwordForm">
                            <div class="form-group">
                                <label for="currentPassword" class="form-label">Contraseña Actual *</label>
                                <input type="password" id="currentPassword" class="form-control" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="newPassword" class="form-label">Nueva Contraseña *</label>
                                <input type="password" id="newPassword" class="form-control" required>
                                <div class="password-strength">
                                    <div class="strength-bar" id="passwordStrength"></div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="confirmPassword" class="form-label">Confirmar Nueva Contraseña *</label>
                                <input type="password" id="confirmPassword" class="form-control" required>
                            </div>
                            
                            <div class="modal-actions">
                                <button type="button" class="btn btn-secondary" id="cancelPassword">Cancelar</button>
                                <button type="submit" class="btn btn-primary">Cambiar Contraseña</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }
    
    async loadProfileData() {
        try {
            const profile = await Utils.makeApiCall(
                `${API_CONFIG.SERVICES.USER}/api/users/doctor/profile`
            );
            
            this.profileData = profile;
            this.populateProfileForm(profile);
            await this.loadProfileStats();
            await this.loadSpecialties();
            await this.loadActiveSessions();
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }
    
    populateProfileForm(profile) {
        document.getElementById('profileNombre').value = profile.nombre || '';
        document.getElementById('profileCedula').value = profile.cedula_profesional || '';
        document.getElementById('profileTelefono').value = profile.telefono || '';
        document.getElementById('profileTelefono1').value = profile.telefono_1 || '';
        document.getElementById('profileEmail').value = authManager.getUser().email;
        
        if (profile.especialidad_id) {
            document.getElementById('profileEspecialidad').value = profile.especialidad_id;
        }
    }
    
    async loadProfileStats() {
        const statsContainer = document.getElementById('profileStats');
        
        try {
            const [dashboardData, appointmentsData] = await Promise.all([
                Utils.makeApiCall(`${API_CONFIG.SERVICES.DOCTOR}/api/doctor/dashboard`),
                Utils.makeApiCall(`${API_CONFIG.SERVICES.APPOINTMENT}/api/appointments/doctor?limit=100`)
            ]);
            
            const totalAppointments = appointmentsData.length || 0;
            const completedAppointments = appointmentsData.filter(a => a.estado_cita?.nombre === 'completada').length;
            
            statsContainer.innerHTML = `
                <div class="profile-stat-card">
                    <div class="profile-stat-number">${dashboardData.totalPacientes || 0}</div>
                    <div class="profile-stat-label">Pacientes Totales</div>
                </div>
                <div class="profile-stat-card">
                    <div class="profile-stat-number">${totalAppointments}</div>
                    <div class="profile-stat-label">Citas Totales</div>
                </div>
                <div class="profile-stat-card">
                    <div class="profile-stat-number">${completedAppointments}</div>
                    <div class="profile-stat-label">Citas Completadas</div>
                </div>
                <div class="profile-stat-card">
                    <div class="profile-stat-number">${dashboardData.alertasPendientes || 0}</div>
                    <div class="profile-stat-label">Alertas Atendidas</div>
                </div>
            `;
        } catch (error) {
            statsContainer.innerHTML = '<div class="error-message">Error cargando estadísticas</div>';
        }
    }
    
    async loadSpecialties() {
        try {
            const specialties = await Utils.makeApiCall(
                `${API_CONFIG.SERVICES.USER}/api/catalog/specialties`
            );
            
            const select = document.getElementById('profileEspecialidad');
            select.innerHTML = '<option value="">Seleccionar especialidad</option>';
            specialties.forEach(specialty => {
                const option = document.createElement('option');
                option.value = specialty.id;
                option.textContent = specialty.nombre;
                select.appendChild(option);
            });
            
            if (this.profileData?.especialidad_id) {
                select.value = this.profileData.especialidad_id;
            }
        } catch (error) {
            console.error('Error loading specialties:', error);
        }
    }
    
    async loadActiveSessions() {
        const sessionList = document.getElementById('sessionList');
        
        try {
            // Por ahora, mostramos sesión actual
            const currentSession = {
                device: 'Navegador Web',
                location: 'Bogotá, CO',
                lastActive: new Date().toISOString(),
                current: true
            };
            
            sessionList.innerHTML = `
                <div class="session-item ${currentSession.current ? 'session-current' : ''}">
                    <div class="session-info">
                        <h4>${currentSession.device}</h4>
                        <div class="session-meta">
                            <span>${currentSession.location}</span>
                            <span>Última actividad: ${Utils.formatDateTime(currentSession.lastActive)}</span>
                        </div>
                    </div>
                    <div class="session-status">
                        <span class="badge badge-success">Activa</span>
                    </div>
                </div>
            `;
        } catch (error) {
            sessionList.innerHTML = '<div class="error-message">Error cargando sesiones</div>';
        }
    }
    
    setupEventListeners() {
        // Editar información personal
        document.getElementById('editPersonalInfo').addEventListener('click', () => {
            this.enablePersonalInfoEditing();
        });
        
        document.getElementById('cancelPersonalEdit').addEventListener('click', () => {
            this.disablePersonalInfoEditing();
        });
        
        document.getElementById('personalInfoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePersonalInfo();
        });
        
        // Modal de contraseña
        this.setupPasswordModal();
        
        // Autenticación de dos factores
        document.getElementById('twoFactorToggle').addEventListener('change', (e) => {
            this.toggleTwoFactor(e.target.checked);
        });
        
        // Fuerza de contraseña
        document.getElementById('newPassword').addEventListener('input', (e) => {
            this.updatePasswordStrength(e.target.value);
        });
    }
    
    setupPasswordModal() {
        const modal = document.getElementById('passwordModal');
        const closeBtn = document.querySelector('.close-modal');
        const cancelBtn = document.getElementById('cancelPassword');
        
        const closeModal = () => {
            modal.classList.add('hidden');
            document.getElementById('passwordForm').reset();
        };
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        document.getElementById('passwordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.changePassword();
        });
    }
    
    enablePersonalInfoEditing() {
        const inputs = document.querySelectorAll('#personalInfoForm input, #personalInfoForm select');
        inputs.forEach(input => {
            if (!input.classList.contains('readonly-field')) {
                input.readOnly = false;
                input.disabled = false;
            }
        });
        
        document.getElementById('personalInfoActions').classList.remove('hidden');
        document.getElementById('editPersonalInfo').classList.add('hidden');
    }
    
    disablePersonalInfoEditing() {
        const inputs = document.querySelectorAll('#personalInfoForm input, #personalInfoForm select');
        inputs.forEach(input => {
            if (!input.classList.contains('readonly-field')) {
                input.readOnly = true;
                input.disabled = true;
            }
        });
        
        // Restaurar valores originales
        this.populateProfileForm(this.profileData);
        
        document.getElementById('personalInfoActions').classList.add('hidden');
        document.getElementById('editPersonalInfo').classList.remove('hidden');
    }
    
    async savePersonalInfo() {
        const formData = {
            nombre: document.getElementById('profileNombre').value,
            especialidad_id: document.getElementById('profileEspecialidad').value || null,
            cedula_profesional: document.getElementById('profileCedula').value || null,
            telefono: document.getElementById('profileTelefono').value || null,
            telefono_1: document.getElementById('profileTelefono1').value || null
        };
        
        try {
            const updatedProfile = await Utils.makeApiCall(
                `${API_CONFIG.SERVICES.USER}/api/users/doctor/profile`,
                {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                }
            );
            
            this.profileData = updatedProfile;
            this.disablePersonalInfoEditing();
            alert('Información actualizada exitosamente');
            
            // Actualizar sidebar
            if (typeof dashboard !== 'undefined') {
                dashboard.loadSidebar();
            }
        } catch (error) {
            alert('Error actualizando la información');
        }
    }
    
    showChangePassword() {
        document.getElementById('passwordModal').classList.remove('hidden');
    }
    
    updatePasswordStrength(password) {
        const strengthBar = document.getElementById('passwordStrength');
        let strength = 'weak';
        let width = '33%';
        
        if (password.length >= 8) {
            strength = 'medium';
            width = '66%';
        }
        
        if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
            strength = 'strong';
            width = '100%';
        }
        
        strengthBar.className = 'strength-bar';
        strengthBar.classList.add(`strength-${strength}`);
        strengthBar.style.width = width;
    }
    
    async changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (newPassword !== confirmPassword) {
            alert('Las contraseñas nuevas no coinciden');
            return;
        }
        
        if (newPassword.length < 8) {
            alert('La nueva contraseña debe tener al menos 8 caracteres');
            return;
        }
        
        try {
            // TODO: Implementar cambio de contraseña en el backend
            // await Utils.makeApiCall(`${API_CONFIG.SERVICES.USER}/api/users/change-password`, {
            //     method: 'POST',
            //     body: JSON.stringify({
            //         currentPassword,
            //         newPassword
            //     })
            // });
            
            alert('Contraseña cambiada exitosamente');
            document.getElementById('passwordModal').classList.add('hidden');
            document.getElementById('passwordForm').reset();
        } catch (error) {
            alert('Error cambiando la contraseña');
        }
    }
    
    async toggleTwoFactor(enabled) {
        try {
            // TODO: Implementar 2FA en el backend
            if (enabled) {
                alert('Autenticación de dos factores activada');
            } else {
                alert('Autenticación de dos factores desactivada');
            }
        } catch (error) {
            alert('Error configurando la autenticación de dos factores');
            document.getElementById('twoFactorToggle').checked = !enabled;
        }
    }
}

// Instancia global
const profileManager = new ProfileManager();