// frontend/doctor-dashboard/js/login.js
class LoginManager {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.loginBtn = document.getElementById('loginBtn');
        this.loading = document.getElementById('loading');
        this.errorMessage = document.getElementById('errorMessage');
        
        this.init();
    }
    
    async init() {
        // Verificar si ya está autenticado
        if (await authManager.verifyToken()) {
            window.location.href = 'index.html';
            return;
        }
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Limpiar error al escribir
        [this.emailInput, this.passwordInput].forEach(input => {
            input.addEventListener('input', () => {
                this.hideError();
            });
        });
    }
    
    async handleLogin(e) {
        e.preventDefault();
        
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;
        
        if (!this.validateForm(email, password)) {
            return;
        }
        
        this.setLoading(true);
        
        const result = await authManager.login(email, password);
        
        if (result.success) {
            window.location.href = 'index.html';
        } else {
            this.showError(result.error);
        }
        
        this.setLoading(false);
    }
    
    validateForm(email, password) {
        if (!email || !password) {
            this.showError('Por favor complete todos los campos');
            return false;
        }
        
        if (!this.isValidEmail(email)) {
            this.showError('Por favor ingrese un email válido');
            return false;
        }
        
        return true;
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    setLoading(loading) {
        if (loading) {
            this.loginBtn.disabled = true;
            this.loading.classList.remove('hidden');
            this.hideError();
        } else {
            this.loginBtn.disabled = false;
            this.loading.classList.add('hidden');
        }
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.remove('hidden');
    }
    
    hideError() {
        this.errorMessage.classList.add('hidden');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});