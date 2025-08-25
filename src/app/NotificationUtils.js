import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class NotificationUtils {
  // Tipos de notificaciones
  static NOTIFICATION_TYPES = {
    PUSH: 'push',
    EMAIL: 'email',
    PAYMENT_REMINDER: 'payment_reminder',
    CONSUMPTION_ALERT: 'consumption_alert',
    PROMOTION: 'promotion',
    SYSTEM_UPDATE: 'system_update',
  };

  // Estados de notificaciones
  static NOTIFICATION_STATUS = {
    PENDING: 'pending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    FAILED: 'failed',
    READ: 'read',
  };

  /**
   * Inicializa el sistema de notificaciones
   */
  static async initialize() {
    try {
      // Cargar configuraciones de notificaciones
      const settings = await this.getNotificationSettings();
      
      // Configurar permisos según la plataforma
      if (Platform.OS === 'ios') {
        await this.requestIOSPermissions();
      } else {
        await this.requestAndroidPermissions();
      }

      // Programar notificaciones recurrentes si están habilitadas
      await this.scheduleRecurringNotifications(settings);

      return { success: true };
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Solicita permisos para iOS
   */
  static async requestIOSPermissions() {
    try {
      // Aquí iría la implementación específica para iOS
      // usando @react-native-async-storage/async-storage o similar
      console.log('Requesting iOS notification permissions...');
      return { success: true };
    } catch (error) {
      console.error('Error requesting iOS permissions:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Solicita permisos para Android
   */
  static async requestAndroidPermissions() {
    try {
      // Aquí iría la implementación específica para Android
      console.log('Requesting Android notification permissions...');
      return { success: true };
    } catch (error) {
      console.error('Error requesting Android permissions:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtiene configuraciones de notificaciones
   */
  static async getNotificationSettings() {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      if (settings) {
        return JSON.parse(settings);
      }
      
      // Configuraciones por defecto
      return {
        pushNotifications: true,
        emailNotifications: true,
        paymentReminders: true,
        consumptionAlerts: true,
        promotions: false,
        systemUpdates: true,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '07:00',
        },
        frequency: {
          paymentReminders: 'weekly',
          consumptionAlerts: 'daily',
          promotions: 'monthly',
        },
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return {};
    }
  }

  /**
   * Guarda configuraciones de notificaciones
   * @param {Object} settings - Configuraciones a guardar
   */
  static async saveNotificationSettings(settings) {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
      
      // Reprogramar notificaciones con las nuevas configuraciones
      await this.scheduleRecurringNotifications(settings);
      
      return { success: true };
    } catch (error) {
      console.error('Error saving notification settings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Programa notificaciones recurrentes
   * @param {Object} settings - Configuraciones de notificaciones
   */
  static async scheduleRecurringNotifications(settings) {
    try {
      // Cancelar notificaciones existentes
      await this.cancelAllScheduledNotifications();

      // Programar recordatorios de pago
      if (settings.paymentReminders) {
        await this.schedulePaymentReminders(settings.frequency.paymentReminders);
      }

      // Programar alertas de consumo
      if (settings.consumptionAlerts) {
        await this.scheduleConsumptionAlerts(settings.frequency.consumptionAlerts);
      }

      // Programar promociones
      if (settings.promotions) {
        await this.schedulePromotions(settings.frequency.promotions);
      }

      return { success: true };
    } catch (error) {
      console.error('Error scheduling recurring notifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Programa recordatorios de pago
   * @param {string} frequency - Frecuencia de los recordatorios
   */
  static async schedulePaymentReminders(frequency) {
    try {
      const notifications = this.generatePaymentReminderSchedule(frequency);
      
      for (const notification of notifications) {
        await this.scheduleLocalNotification(notification);
      }

      return { success: true };
    } catch (error) {
      console.error('Error scheduling payment reminders:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Programa alertas de consumo
   * @param {string} frequency - Frecuencia de las alertas
   */
  static async scheduleConsumptionAlerts(frequency) {
    try {
      const notifications = this.generateConsumptionAlertSchedule(frequency);
      
      for (const notification of notifications) {
        await this.scheduleLocalNotification(notification);
      }

      return { success: true };
    } catch (error) {
      console.error('Error scheduling consumption alerts:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Programa promociones
   * @param {string} frequency - Frecuencia de las promociones
   */
  static async schedulePromotions(frequency) {
    try {
      const notifications = this.generatePromotionSchedule(frequency);
      
      for (const notification of notifications) {
        await this.scheduleLocalNotification(notification);
      }

      return { success: true };
    } catch (error) {
      console.error('Error scheduling promotions:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Programa una notificación local
   * @param {Object} notification - Datos de la notificación
   */
  static async scheduleLocalNotification(notification) {
    try {
      // Aquí iría la implementación específica para programar notificaciones
      // usando una librería como @react-native-async-storage/async-storage
      console.log('Scheduling notification:', notification);
      
      // Guardar en AsyncStorage para simular programación
      const scheduledNotifications = await this.getScheduledNotifications();
      scheduledNotifications.push({
        ...notification,
        id: this.generateNotificationId(),
        scheduledAt: new Date().toISOString(),
        status: this.NOTIFICATION_STATUS.PENDING,
      });
      
      await AsyncStorage.setItem('scheduledNotifications', JSON.stringify(scheduledNotifications));
      
      return { success: true };
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancela todas las notificaciones programadas
   */
  static async cancelAllScheduledNotifications() {
    try {
      await AsyncStorage.removeItem('scheduledNotifications');
      return { success: true };
    } catch (error) {
      console.error('Error canceling scheduled notifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtiene notificaciones programadas
   */
  static async getScheduledNotifications() {
    try {
      const notifications = await AsyncStorage.getItem('scheduledNotifications');
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Envía notificación push
   * @param {Object} notification - Datos de la notificación
   */
  static async sendPushNotification(notification) {
    try {
      // Verificar si las notificaciones push están habilitadas
      const settings = await this.getNotificationSettings();
      if (!settings.pushNotifications) {
        return { success: false, error: 'Push notifications disabled' };
      }

      // Verificar horario silencioso
      if (this.isQuietHours(settings.quietHours)) {
        return { success: false, error: 'Quiet hours active' };
      }

      // Simular envío de notificación push
      console.log('Sending push notification:', notification);
      
      // Guardar en historial
      await this.saveNotificationToHistory(notification, this.NOTIFICATION_TYPES.PUSH);
      
      return { success: true };
    } catch (error) {
      console.error('Error sending push notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envía notificación por email
   * @param {Object} notification - Datos de la notificación
   */
  static async sendEmailNotification(notification) {
    try {
      // Verificar si las notificaciones por email están habilitadas
      const settings = await this.getNotificationSettings();
      if (!settings.emailNotifications) {
        return { success: false, error: 'Email notifications disabled' };
      }

      // Simular envío de email
      console.log('Sending email notification:', notification);
      
      // Guardar en historial
      await this.saveNotificationToHistory(notification, this.NOTIFICATION_TYPES.EMAIL);
      
      return { success: true };
    } catch (error) {
      console.error('Error sending email notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Guarda notificación en el historial
   * @param {Object} notification - Datos de la notificación
   * @param {string} type - Tipo de notificación
   */
  static async saveNotificationToHistory(notification, type) {
    try {
      const history = await this.getNotificationHistory();
      
      history.unshift({
        ...notification,
        id: this.generateNotificationId(),
        type,
        sentAt: new Date().toISOString(),
        status: this.NOTIFICATION_STATUS.SENT,
      });

      // Mantener solo las últimas 100 notificaciones
      if (history.length > 100) {
        history.splice(100);
      }

      await AsyncStorage.setItem('notificationHistory', JSON.stringify(history));
      
      return { success: true };
    } catch (error) {
      console.error('Error saving notification to history:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtiene historial de notificaciones
   */
  static async getNotificationHistory() {
    try {
      const history = await AsyncStorage.getItem('notificationHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting notification history:', error);
      return [];
    }
  }

  /**
   * Marca notificación como leída
   * @param {string} notificationId - ID de la notificación
   */
  static async markAsRead(notificationId) {
    try {
      const history = await this.getNotificationHistory();
      const notification = history.find(n => n.id === notificationId);
      
      if (notification) {
        notification.status = this.NOTIFICATION_STATUS.READ;
        notification.readAt = new Date().toISOString();
        
        await AsyncStorage.setItem('notificationHistory', JSON.stringify(history));
      }

      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Limpia historial de notificaciones
   */
  static async clearNotificationHistory() {
    try {
      await AsyncStorage.removeItem('notificationHistory');
      return { success: true };
    } catch (error) {
      console.error('Error clearing notification history:', error);
      return { success: false, error: error.message };
    }
  }

  // Métodos auxiliares privados

  /**
   * Verifica si está en horario silencioso
   * @param {Object} quietHours - Configuración de horario silencioso
   */
  static isQuietHours(quietHours) {
    if (!quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMinute] = quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Horario que cruza medianoche
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Genera horario para recordatorios de pago
   * @param {string} frequency - Frecuencia
   */
  static generatePaymentReminderSchedule(frequency) {
    const notifications = [];
    const now = new Date();

    switch (frequency) {
      case 'daily':
        for (let i = 1; i <= 30; i++) {
          const date = new Date(now);
          date.setDate(date.getDate() + i);
          date.setHours(10, 0, 0, 0); // 10:00 AM
          
          notifications.push({
            title: 'Recordatorio de Pago',
            body: 'No olvides revisar tu factura de electricidad',
            scheduledDate: date.toISOString(),
            type: this.NOTIFICATION_TYPES.PAYMENT_REMINDER,
          });
        }
        break;
        
      case 'weekly':
        for (let i = 1; i <= 12; i++) {
          const date = new Date(now);
          date.setDate(date.getDate() + (i * 7));
          date.setHours(10, 0, 0, 0);
          
          notifications.push({
            title: 'Recordatorio Semanal de Pago',
            body: 'Revisa tu consumo eléctrico de esta semana',
            scheduledDate: date.toISOString(),
            type: this.NOTIFICATION_TYPES.PAYMENT_REMINDER,
          });
        }
        break;
        
      case 'monthly':
        for (let i = 1; i <= 12; i++) {
          const date = new Date(now);
          date.setMonth(date.getMonth() + i);
          date.setDate(1);
          date.setHours(10, 0, 0, 0);
          
          notifications.push({
            title: 'Recordatorio Mensual de Pago',
            body: 'Tu factura mensual está disponible',
            scheduledDate: date.toISOString(),
            type: this.NOTIFICATION_TYPES.PAYMENT_REMINDER,
          });
        }
        break;
    }

    return notifications;
  }

  /**
   * Genera horario para alertas de consumo
   * @param {string} frequency - Frecuencia
   */
  static generateConsumptionAlertSchedule(frequency) {
    const notifications = [];
    const now = new Date();

    switch (frequency) {
      case 'daily':
        for (let i = 1; i <= 30; i++) {
          const date = new Date(now);
          date.setDate(date.getDate() + i);
          date.setHours(18, 0, 0, 0); // 6:00 PM
          
          notifications.push({
            title: 'Alerta de Consumo',
            body: 'Revisa tu consumo eléctrico del día',
            scheduledDate: date.toISOString(),
            type: this.NOTIFICATION_TYPES.CONSUMPTION_ALERT,
          });
        }
        break;
        
      case 'weekly':
        for (let i = 1; i <= 12; i++) {
          const date = new Date(now);
          date.setDate(date.getDate() + (i * 7));
          date.setHours(18, 0, 0, 0);
          
          notifications.push({
            title: 'Resumen Semanal de Consumo',
            body: 'Tu consumo de esta semana vs. la anterior',
            scheduledDate: date.toISOString(),
            type: this.NOTIFICATION_TYPES.CONSUMPTION_ALERT,
          });
        }
        break;
    }

    return notifications;
  }

  /**
   * Genera horario para promociones
   * @param {string} frequency - Frecuencia
   */
  static generatePromotionSchedule(frequency) {
    const notifications = [];
    const now = new Date();

    switch (frequency) {
      case 'weekly':
        for (let i = 1; i <= 12; i++) {
          const date = new Date(now);
          date.setDate(date.getDate() + (i * 7));
          date.setHours(12, 0, 0, 0); // 12:00 PM
          
          notifications.push({
            title: 'Ofertas Especiales',
            body: 'Descubre nuestras promociones de la semana',
            scheduledDate: date.toISOString(),
            type: this.NOTIFICATION_TYPES.PROMOTION,
          });
        }
        break;
        
      case 'monthly':
        for (let i = 1; i <= 12; i++) {
          const date = new Date(now);
          date.setMonth(date.getMonth() + i);
          date.setDate(15);
          date.setHours(12, 0, 0, 0);
          
          notifications.push({
            title: 'Promociones del Mes',
            body: 'No te pierdas nuestras ofertas especiales',
            scheduledDate: date.toISOString(),
            type: this.NOTIFICATION_TYPES.PROMOTION,
          });
        }
        break;
    }

    return notifications;
  }

  /**
   * Genera ID único para notificación
   */
  static generateNotificationId() {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Muestra alerta nativa
   * @param {string} title - Título de la alerta
   * @param {string} message - Mensaje de la alerta
   * @param {Array} buttons - Botones de la alerta
   */
  static showAlert(title, message, buttons = [{ text: 'OK' }]) {
    Alert.alert(title, message, buttons);
  }

  /**
   * Procesa notificaciones pendientes
   */
  static async processPendingNotifications() {
    try {
      const scheduled = await this.getScheduledNotifications();
      const now = new Date();

      for (const notification of scheduled) {
        const scheduledDate = new Date(notification.scheduledDate);
        
        if (scheduledDate <= now && notification.status === this.NOTIFICATION_STATUS.PENDING) {
          // Enviar notificación
          await this.sendPushNotification(notification);
          
          // Actualizar estado
          notification.status = this.NOTIFICATION_STATUS.SENT;
          notification.sentAt = now.toISOString();
        }
      }

      // Guardar notificaciones actualizadas
      await AsyncStorage.setItem('scheduledNotifications', JSON.stringify(scheduled));

      return { success: true };
    } catch (error) {
      console.error('Error processing pending notifications:', error);
      return { success: false, error: error.message };
    }
  }
}

