import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

export class SecurityUtils {
  // Configuraciones de seguridad
  static SECURITY_CONFIG = {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutos
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
    AUTO_LOGOUT_WARNING: 5 * 60 * 1000, // 5 minutos antes
    PASSWORD_MIN_LENGTH: 8,
    BIOMETRIC_TIMEOUT: 30 * 1000, // 30 segundos
  };

  // Estados de autenticación
  static AUTH_STATES = {
    AUTHENTICATED: 'authenticated',
    UNAUTHENTICATED: 'unauthenticated',
    LOCKED: 'locked',
    EXPIRED: 'expired',
    BIOMETRIC_REQUIRED: 'biometric_required',
  };

  // Tipos de autenticación biométrica
  static BIOMETRIC_TYPES = {
    FINGERPRINT: 'fingerprint',
    FACE_ID: 'faceId',
    IRIS: 'iris',
    VOICE: 'voice',
  };

  /**
   * Inicializa el sistema de seguridad
   */
  static async initialize() {
    try {
      // Verificar estado de autenticación
      const authState = await this.checkAuthenticationState();
      
      // Configurar auto-logout si está habilitado
      const settings = await this.getSecuritySettings();
      if (settings.autoLogout) {
        this.setupAutoLogout();
      }

      // Verificar intentos de login fallidos
      await this.checkLoginAttempts();

      return { success: true, authState };
    } catch (error) {
      console.error('Error initializing security:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verifica el estado de autenticación actual
   */
  static async checkAuthenticationState() {
    try {
      const session = await AsyncStorage.getItem('userSession');
      if (!session) {
        return this.AUTH_STATES.UNAUTHENTICATED;
      }

      const sessionData = JSON.parse(session);
      const now = Date.now();

      // Verificar si la sesión ha expirado
      if (sessionData.expiresAt && now > sessionData.expiresAt) {
        await this.clearSession();
        return this.AUTH_STATES.EXPIRED;
      }

      // Verificar si la cuenta está bloqueada
      const isLocked = await this.isAccountLocked();
      if (isLocked) {
        return this.AUTH_STATES.LOCKED;
      }

      // Verificar si se requiere autenticación biométrica
      const settings = await this.getSecuritySettings();
      if (settings.biometricAuth && !sessionData.biometricVerified) {
        return this.AUTH_STATES.BIOMETRIC_REQUIRED;
      }

      return this.AUTH_STATES.AUTHENTICATED;
    } catch (error) {
      console.error('Error checking authentication state:', error);
      return this.AUTH_STATES.UNAUTHENTICATED;
    }
  }

  /**
   * Autentica al usuario con credenciales
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   */
  static async authenticateWithCredentials(username, password) {
    try {
      // Verificar si la cuenta está bloqueada
      const isLocked = await this.isAccountLocked();
      if (isLocked) {
        const lockInfo = await this.getLockInfo();
        return {
          success: false,
          error: 'Account locked',
          lockInfo,
        };
      }

      // Validar credenciales (simulado)
      const isValid = await this.validateCredentials(username, password);
      
      if (!isValid) {
        await this.recordFailedAttempt();
        const attempts = await this.getFailedAttempts();
        
        if (attempts >= this.SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
          await this.lockAccount();
          return {
            success: false,
            error: 'Account locked due to too many failed attempts',
          };
        }

        return {
          success: false,
          error: 'Invalid credentials',
          attemptsRemaining: this.SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - attempts,
        };
      }

      // Limpiar intentos fallidos
      await this.clearFailedAttempts();

      // Crear sesión
      const session = await this.createSession(username);

      return {
        success: true,
        session,
        requiresBiometric: await this.requiresBiometricAuth(),
      };
    } catch (error) {
      console.error('Error authenticating with credentials:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Autentica con biometría
   */
  static async authenticateWithBiometrics() {
    try {
      // Verificar disponibilidad de biometría
      const biometricAvailable = await this.isBiometricAvailable();
      if (!biometricAvailable.available) {
        return {
          success: false,
          error: 'Biometric authentication not available',
          reason: biometricAvailable.reason,
        };
      }

      // Simular autenticación biométrica
      const biometricResult = await this.performBiometricAuth();
      
      if (!biometricResult.success) {
        return biometricResult;
      }

      // Actualizar sesión con verificación biométrica
      await this.updateSessionBiometricStatus(true);

      return { success: true };
    } catch (error) {
      console.error('Error authenticating with biometrics:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  static async logout() {
    try {
      // Limpiar sesión
      await this.clearSession();
      
      // Limpiar datos sensibles
      await this.clearSensitiveData();
      
      // Cancelar auto-logout
      this.cancelAutoLogout();

      return { success: true };
    } catch (error) {
      console.error('Error during logout:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtiene configuraciones de seguridad
   */
  static async getSecuritySettings() {
    try {
      const settings = await AsyncStorage.getItem('securitySettings');
      if (settings) {
        return JSON.parse(settings);
      }

      // Configuraciones por defecto
      return {
        biometricAuth: false,
        autoLogout: true,
        sessionTimeout: this.SECURITY_CONFIG.SESSION_TIMEOUT,
        requirePasswordChange: false,
        twoFactorAuth: false,
        loginNotifications: true,
        deviceTrust: false,
      };
    } catch (error) {
      console.error('Error getting security settings:', error);
      return {};
    }
  }

  /**
   * Guarda configuraciones de seguridad
   * @param {Object} settings - Configuraciones a guardar
   */
  static async saveSecuritySettings(settings) {
    try {
      await AsyncStorage.setItem('securitySettings', JSON.stringify(settings));
      
      // Reconfigurar auto-logout si cambió
      if (settings.autoLogout) {
        this.setupAutoLogout();
      } else {
        this.cancelAutoLogout();
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving security settings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verifica si la biometría está disponible
   */
  static async isBiometricAvailable() {
    try {
      // Simular verificación de disponibilidad biométrica
      if (Platform.OS === 'ios') {
        // En iOS verificaríamos Touch ID / Face ID
        return {
          available: true,
          type: this.BIOMETRIC_TYPES.FACE_ID,
        };
      } else {
        // En Android verificaríamos huella dactilar
        return {
          available: true,
          type: this.BIOMETRIC_TYPES.FINGERPRINT,
        };
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return {
        available: false,
        reason: error.message,
      };
    }
  }

  /**
   * Realiza autenticación biométrica
   */
  static async performBiometricAuth() {
    try {
      // Simular proceso de autenticación biométrica
      return new Promise((resolve) => {
        setTimeout(() => {
          // Simular éxito (en producción sería la respuesta real del sensor)
          const success = Math.random() > 0.1; // 90% de éxito
          
          if (success) {
            resolve({ success: true });
          } else {
            resolve({
              success: false,
              error: 'Biometric authentication failed',
            });
          }
        }, 2000);
      });
    } catch (error) {
      console.error('Error performing biometric auth:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Configura auto-logout
   */
  static setupAutoLogout() {
    try {
      // Cancelar timer existente
      this.cancelAutoLogout();

      const settings = this.getSecuritySettings();
      const timeout = settings.sessionTimeout || this.SECURITY_CONFIG.SESSION_TIMEOUT;

      // Configurar advertencia antes del logout
      this.warningTimer = setTimeout(() => {
        this.showAutoLogoutWarning();
      }, timeout - this.SECURITY_CONFIG.AUTO_LOGOUT_WARNING);

      // Configurar logout automático
      this.logoutTimer = setTimeout(() => {
        this.performAutoLogout();
      }, timeout);

    } catch (error) {
      console.error('Error setting up auto logout:', error);
    }
  }

  /**
   * Cancela auto-logout
   */
  static cancelAutoLogout() {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
  }

  /**
   * Muestra advertencia de auto-logout
   */
  static showAutoLogoutWarning() {
    Alert.alert(
      'Sesión por Expirar',
      'Tu sesión expirará en 5 minutos por inactividad. ¿Deseas continuar?',
      [
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => this.performAutoLogout(),
        },
        {
          text: 'Continuar',
          onPress: () => this.extendSession(),
        },
      ]
    );
  }

  /**
   * Realiza logout automático
   */
  static async performAutoLogout() {
    try {
      await this.logout();
      
      Alert.alert(
        'Sesión Expirada',
        'Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error performing auto logout:', error);
    }
  }

  /**
   * Extiende la sesión actual
   */
  static async extendSession() {
    try {
      const session = await AsyncStorage.getItem('userSession');
      if (session) {
        const sessionData = JSON.parse(session);
        const settings = await this.getSecuritySettings();
        const timeout = settings.sessionTimeout || this.SECURITY_CONFIG.SESSION_TIMEOUT;
        
        sessionData.expiresAt = Date.now() + timeout;
        sessionData.lastActivity = Date.now();
        
        await AsyncStorage.setItem('userSession', JSON.stringify(sessionData));
        
        // Reconfigurar auto-logout
        this.setupAutoLogout();
      }

      return { success: true };
    } catch (error) {
      console.error('Error extending session:', error);
      return { success: false, error: error.message };
    }
  }

  // Métodos auxiliares privados

  /**
   * Valida credenciales (simulado)
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   */
  static async validateCredentials(username, password) {
    // Simulación de validación de credenciales
    // En producción esto se haría contra un servidor
    const validCredentials = {
      'admin': 'admin123',
      'user': 'user123',
      'demo': 'demo123',
    };

    return validCredentials[username] === password;
  }

  /**
   * Crea una nueva sesión
   * @param {string} username - Nombre de usuario
   */
  static async createSession(username) {
    try {
      const settings = await this.getSecuritySettings();
      const timeout = settings.sessionTimeout || this.SECURITY_CONFIG.SESSION_TIMEOUT;
      
      const session = {
        username,
        loginTime: Date.now(),
        expiresAt: Date.now() + timeout,
        lastActivity: Date.now(),
        sessionId: this.generateSessionId(),
        biometricVerified: false,
      };

      await AsyncStorage.setItem('userSession', JSON.stringify(session));
      await AsyncStorage.setItem('isLoggedIn', 'true');

      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Limpia la sesión actual
   */
  static async clearSession() {
    try {
      await AsyncStorage.multiRemove(['userSession', 'isLoggedIn']);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  /**
   * Limpia datos sensibles
   */
  static async clearSensitiveData() {
    try {
      const sensitiveKeys = [
        'userToken',
        'biometricData',
        'tempCredentials',
        'sessionCache',
      ];
      
      await AsyncStorage.multiRemove(sensitiveKeys);
    } catch (error) {
      console.error('Error clearing sensitive data:', error);
    }
  }

  /**
   * Registra intento fallido de login
   */
  static async recordFailedAttempt() {
    try {
      const attempts = await this.getFailedAttempts();
      const newAttempts = attempts + 1;
      
      await AsyncStorage.setItem('failedAttempts', newAttempts.toString());
      await AsyncStorage.setItem('lastFailedAttempt', Date.now().toString());

    } catch (error) {
      console.error('Error recording failed attempt:', error);
    }
  }

  /**
   * Obtiene número de intentos fallidos
   */
  static async getFailedAttempts() {
    try {
      const attempts = await AsyncStorage.getItem('failedAttempts');
      return attempts ? parseInt(attempts, 10) : 0;
    } catch (error) {
      console.error('Error getting failed attempts:', error);
      return 0;
    }
  }

  /**
   * Limpia intentos fallidos
   */
  static async clearFailedAttempts() {
    try {
      await AsyncStorage.multiRemove(['failedAttempts', 'lastFailedAttempt']);
    } catch (error) {
      console.error('Error clearing failed attempts:', error);
    }
  }

  /**
   * Bloquea la cuenta
   */
  static async lockAccount() {
    try {
      const lockInfo = {
        lockedAt: Date.now(),
        unlockAt: Date.now() + this.SECURITY_CONFIG.LOCKOUT_DURATION,
        reason: 'Too many failed login attempts',
      };

      await AsyncStorage.setItem('accountLock', JSON.stringify(lockInfo));
    } catch (error) {
      console.error('Error locking account:', error);
    }
  }

  /**
   * Verifica si la cuenta está bloqueada
   */
  static async isAccountLocked() {
    try {
      const lockInfo = await AsyncStorage.getItem('accountLock');
      if (!lockInfo) {
        return false;
      }

      const lock = JSON.parse(lockInfo);
      const now = Date.now();

      if (now >= lock.unlockAt) {
        // El bloqueo ha expirado
        await AsyncStorage.removeItem('accountLock');
        await this.clearFailedAttempts();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking account lock:', error);
      return false;
    }
  }

  /**
   * Obtiene información del bloqueo
   */
  static async getLockInfo() {
    try {
      const lockInfo = await AsyncStorage.getItem('accountLock');
      if (lockInfo) {
        const lock = JSON.parse(lockInfo);
        const remainingTime = lock.unlockAt - Date.now();
        
        return {
          ...lock,
          remainingTime,
          remainingMinutes: Math.ceil(remainingTime / (60 * 1000)),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting lock info:', error);
      return null;
    }
  }

  /**
   * Verifica si se requiere autenticación biométrica
   */
  static async requiresBiometricAuth() {
    try {
      const settings = await this.getSecuritySettings();
      const available = await this.isBiometricAvailable();
      
      return settings.biometricAuth && available.available;
    } catch (error) {
      console.error('Error checking biometric requirement:', error);
      return false;
    }
  }

  /**
   * Actualiza estado biométrico de la sesión
   * @param {boolean} verified - Si fue verificado biométricamente
   */
  static async updateSessionBiometricStatus(verified) {
    try {
      const session = await AsyncStorage.getItem('userSession');
      if (session) {
        const sessionData = JSON.parse(session);
        sessionData.biometricVerified = verified;
        sessionData.biometricVerifiedAt = Date.now();
        
        await AsyncStorage.setItem('userSession', JSON.stringify(sessionData));
      }
    } catch (error) {
      console.error('Error updating biometric status:', error);
    }
  }

  /**
   * Verifica intentos de login
   */
  static async checkLoginAttempts() {
    try {
      const attempts = await this.getFailedAttempts();
      const lastAttempt = await AsyncStorage.getItem('lastFailedAttempt');
      
      if (attempts > 0 && lastAttempt) {
        const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt, 10);
        const resetTime = 60 * 60 * 1000; // 1 hora
        
        if (timeSinceLastAttempt > resetTime) {
          await this.clearFailedAttempts();
        }
      }
    } catch (error) {
      console.error('Error checking login attempts:', error);
    }
  }

  /**
   * Genera ID único para sesión
   */
  static generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Valida fortaleza de contraseña
   * @param {string} password - Contraseña a validar
   */
  static validatePasswordStrength(password) {
    const minLength = this.SECURITY_CONFIG.PASSWORD_MIN_LENGTH;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const score = [
      password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    ].filter(Boolean).length;

    let strength = 'weak';
    if (score >= 4) strength = 'strong';
    else if (score >= 3) strength = 'medium';

    return {
      score,
      strength,
      requirements: {
        minLength: password.length >= minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar,
      },
    };
  }

  /**
   * Genera hash de contraseña (simulado)
   * @param {string} password - Contraseña a hashear
   */
  static async hashPassword(password) {
    // En producción usar una librería real como bcrypt
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Registra evento de seguridad
   * @param {string} event - Tipo de evento
   * @param {Object} details - Detalles del evento
   */
  static async logSecurityEvent(event, details = {}) {
    try {
      const events = await this.getSecurityEvents();
      
      events.unshift({
        event,
        details,
        timestamp: Date.now(),
        id: this.generateEventId(),
      });

      // Mantener solo los últimos 50 eventos
      if (events.length > 50) {
        events.splice(50);
      }

      await AsyncStorage.setItem('securityEvents', JSON.stringify(events));
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  /**
   * Obtiene eventos de seguridad
   */
  static async getSecurityEvents() {
    try {
      const events = await AsyncStorage.getItem('securityEvents');
      return events ? JSON.parse(events) : [];
    } catch (error) {
      console.error('Error getting security events:', error);
      return [];
    }
  }

  /**
   * Genera ID único para evento
   */
  static generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

