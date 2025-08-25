import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageUtils {
  // Claves de almacenamiento
  static KEYS = {
    USER_SETTINGS: 'userSettings',
    WIFI_CONFIG: 'wifiConfig',
    DEVICE_CONFIG: 'deviceConfig',
    USER_SESSION: 'userSession',
    CACHE_DATA: 'cacheData',
    TEMP_DATA: 'tempData',
    IMAGE_CACHE: 'imageCache',
    API_CACHE: 'apiCache',
    LANGUAGE_PREFERENCE: 'languagePreference',
    THEME_PREFERENCE: 'themePreference',
    FONT_SIZE_PREFERENCE: 'fontSizePreference',
    NOTIFICATION_SETTINGS: 'notificationSettings',
    SECURITY_SETTINGS: 'securitySettings',
    BACKUP_DATA: 'backupData',
  };

  // Configuraciones por defecto
  static DEFAULT_SETTINGS = {
    pushNotifications: true,
    emailNotifications: true,
    paymentReminders: true,
    consumptionAlerts: true,
    promotions: false,
    systemUpdates: true,
    biometricAuth: false,
    autoLogout: true,
    fontSize: 'medium',
    autoBackup: true,
    dataSync: true,
    locationServices: false,
    crashReports: true,
    language: 'es',
    theme: 'dark',
  };

  /**
   * Guarda configuraciones del usuario
   * @param {Object} settings - Configuraciones a guardar
   */
  static async saveUserSettings(settings) {
    try {
      const mergedSettings = { ...this.DEFAULT_SETTINGS, ...settings };
      await AsyncStorage.setItem(this.KEYS.USER_SETTINGS, JSON.stringify(mergedSettings));
      return { success: true };
    } catch (error) {
      console.error('Error saving user settings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Carga configuraciones del usuario
   */
  static async loadUserSettings() {
    try {
      const settings = await AsyncStorage.getItem(this.KEYS.USER_SETTINGS);
      if (settings) {
        return { success: true, data: JSON.parse(settings) };
      }
      return { success: true, data: this.DEFAULT_SETTINGS };
    } catch (error) {
      console.error('Error loading user settings:', error);
      return { success: false, error: error.message, data: this.DEFAULT_SETTINGS };
    }
  }

  /**
   * Guarda configuración WiFi
   * @param {Object} wifiConfig - Configuración WiFi
   */
  static async saveWifiConfig(wifiConfig) {
    try {
      const encryptedConfig = this.encryptSensitiveData(wifiConfig);
      await AsyncStorage.setItem(this.KEYS.WIFI_CONFIG, JSON.stringify(encryptedConfig));
      return { success: true };
    } catch (error) {
      console.error('Error saving WiFi config:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Carga configuración WiFi
   */
  static async loadWifiConfig() {
    try {
      const config = await AsyncStorage.getItem(this.KEYS.WIFI_CONFIG);
      if (config) {
        const decryptedConfig = this.decryptSensitiveData(JSON.parse(config));
        return { success: true, data: decryptedConfig };
      }
      return { success: true, data: null };
    } catch (error) {
      console.error('Error loading WiFi config:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Guarda configuración de dispositivo
   * @param {Object} deviceConfig - Configuración del dispositivo
   */
  static async saveDeviceConfig(deviceConfig) {
    try {
      await AsyncStorage.setItem(this.KEYS.DEVICE_CONFIG, JSON.stringify(deviceConfig));
      return { success: true };
    } catch (error) {
      console.error('Error saving device config:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Carga configuración de dispositivo
   */
  static async loadDeviceConfig() {
    try {
      const config = await AsyncStorage.getItem(this.KEYS.DEVICE_CONFIG);
      if (config) {
        return { success: true, data: JSON.parse(config) };
      }
      return { success: true, data: null };
    } catch (error) {
      console.error('Error loading device config:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calcula el uso de almacenamiento
   */
  static async calculateStorageUsage() {
    try {
      let totalSize = 0;
      let cacheSize = 0;
      let dataSize = 0;

      const allKeys = await AsyncStorage.getAllKeys();
      
      for (const key of allKeys) {
        const value = await AsyncStorage.getItem(key);
        const size = new Blob([value]).size;
        totalSize += size;

        if (this.isCacheKey(key)) {
          cacheSize += size;
        } else {
          dataSize += size;
        }
      }

      return {
        success: true,
        data: {
          cache: this.formatBytes(cacheSize),
          data: this.formatBytes(dataSize),
          total: this.formatBytes(totalSize),
          cacheBytes: cacheSize,
          dataBytes: dataSize,
          totalBytes: totalSize,
        }
      };
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return {
        success: false,
        error: error.message,
        data: {
          cache: '0 MB',
          data: '0 MB',
          total: '0 MB',
        }
      };
    }
  }

  /**
   * Limpia el caché
   */
  static async clearCache() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => this.isCacheKey(key));
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }

      return { success: true, clearedKeys: cacheKeys.length };
    } catch (error) {
      console.error('Error clearing cache:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Resetea todas las configuraciones
   */
  static async resetAllSettings() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const settingsKeys = allKeys.filter(key => 
        key.includes('Settings') || 
        key.includes('Config') || 
        key.includes('Preference')
      );
      
      if (settingsKeys.length > 0) {
        await AsyncStorage.multiRemove(settingsKeys);
      }

      // Restaurar configuraciones por defecto
      await this.saveUserSettings(this.DEFAULT_SETTINGS);

      return { success: true, resetKeys: settingsKeys.length };
    } catch (error) {
      console.error('Error resetting settings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Exporta todas las configuraciones
   */
  static async exportSettings() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const settingsKeys = allKeys.filter(key => 
        key.includes('Settings') || 
        key.includes('Config') || 
        key.includes('Preference')
      );

      const exportData = {};
      for (const key of settingsKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          exportData[key] = JSON.parse(value);
        }
      }

      return {
        success: true,
        data: {
          exportDate: new Date().toISOString(),
          version: '1.0.0',
          settings: exportData,
        }
      };
    } catch (error) {
      console.error('Error exporting settings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Importa configuraciones
   * @param {Object} importData - Datos a importar
   */
  static async importSettings(importData) {
    try {
      if (!importData.settings) {
        throw new Error('Invalid import data format');
      }

      for (const [key, value] of Object.entries(importData.settings)) {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      }

      return { success: true, importedKeys: Object.keys(importData.settings).length };
    } catch (error) {
      console.error('Error importing settings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Crea backup de datos
   */
  static async createBackup() {
    try {
      const exportResult = await this.exportSettings();
      if (!exportResult.success) {
        throw new Error(exportResult.error);
      }

      const backupData = {
        ...exportResult.data,
        backupId: this.generateBackupId(),
      };

      await AsyncStorage.setItem(this.KEYS.BACKUP_DATA, JSON.stringify(backupData));

      return { success: true, backupId: backupData.backupId };
    } catch (error) {
      console.error('Error creating backup:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Restaura desde backup
   */
  static async restoreFromBackup() {
    try {
      const backupData = await AsyncStorage.getItem(this.KEYS.BACKUP_DATA);
      if (!backupData) {
        throw new Error('No backup found');
      }

      const backup = JSON.parse(backupData);
      const importResult = await this.importSettings(backup);

      return importResult;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return { success: false, error: error.message };
    }
  }

  // Métodos auxiliares privados

  /**
   * Determina si una clave es de caché
   * @param {string} key - Clave a verificar
   */
  static isCacheKey(key) {
    const cacheKeywords = ['cache', 'temp', 'temporary', 'session'];
    return cacheKeywords.some(keyword => key.toLowerCase().includes(keyword));
  }

  /**
   * Formatea bytes a formato legible
   * @param {number} bytes - Bytes a formatear
   */
  static formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Encripta datos sensibles (implementación básica)
   * @param {Object} data - Datos a encriptar
   */
  static encryptSensitiveData(data) {
    // Implementación básica de "encriptación" (en producción usar una librería real)
    const encoded = btoa(JSON.stringify(data));
    return { encrypted: true, data: encoded };
  }

  /**
   * Desencripta datos sensibles
   * @param {Object} encryptedData - Datos encriptados
   */
  static decryptSensitiveData(encryptedData) {
    if (!encryptedData.encrypted) {
      return encryptedData;
    }
    
    try {
      const decoded = atob(encryptedData.data);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decrypting data:', error);
      return null;
    }
  }

  /**
   * Genera ID único para backup
   */
  static generateBackupId() {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Valida configuraciones antes de guardar
   * @param {Object} settings - Configuraciones a validar
   */
  static validateSettings(settings) {
    const validFontSizes = ['small', 'medium', 'large', 'xlarge'];
    const validLanguages = ['es', 'en', 'fr', 'pt', 'de', 'it'];
    const validThemes = ['light', 'dark'];

    const errors = [];

    if (settings.fontSize && !validFontSizes.includes(settings.fontSize)) {
      errors.push('Invalid font size');
    }

    if (settings.language && !validLanguages.includes(settings.language)) {
      errors.push('Invalid language');
    }

    if (settings.theme && !validThemes.includes(settings.theme)) {
      errors.push('Invalid theme');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Limpia datos antiguos automáticamente
   */
  static async cleanupOldData() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const now = Date.now();
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días

      for (const key of allKeys) {
        if (this.isCacheKey(key)) {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            try {
              const data = JSON.parse(value);
              if (data.timestamp && (now - data.timestamp) > maxAge) {
                await AsyncStorage.removeItem(key);
              }
            } catch (error) {
              // Si no se puede parsear, eliminar la clave
              await AsyncStorage.removeItem(key);
            }
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error cleaning up old data:', error);
      return { success: false, error: error.message };
    }
  }
}

