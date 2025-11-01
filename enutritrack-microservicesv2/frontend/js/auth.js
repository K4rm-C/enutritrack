// frontend/doctor-dashboard/js/auth.js
class AuthManager {
    constructor() {
        this.token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        this.user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null');
    }

    async login(email, password) {
        try {
            const response = await fetch(`${API_CONFIG.SERVICES.AUTH}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email, 
                    password,
                    tipo: 'doctor'
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                
                localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
                
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data.error || 'Error en el inicio de sesión' };
            }
        } catch (error) {
            return { success: false, error: 'Error de conexión' };
        }
    }

    async verifyToken() {
        if (!this.token) return false;

        try {
            const response = await fetch(`${API_CONFIG.SERVICES.AUTH}/api/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    logout() {
        // Intentar hacer logout en el servidor
        fetch(`${API_CONFIG.SERVICES.AUTH}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        }).catch(console.error);
        
        // Limpiar localStorage
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        
        this.token = null;
        this.user = null;
        
        window.location.href = 'login.html';
    }

    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    getUser() {
        return this.user;
    }

    getToken() {
        return this.token;
    }
}

// Instancia global
const authManager = new AuthManager();