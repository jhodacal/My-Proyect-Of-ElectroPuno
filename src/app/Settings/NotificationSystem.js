import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Switch,
  Alert,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../utils/ThemeContext';
import { useLanguage } from '../../utils/LanguageContext';
import { useRouter } from 'expo-router';
import BackButton from '../../utils/BackButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

function NotificationSystem  () {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Estados para las configuraciones de notificaciones
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [paymentReminders, setPaymentReminders] = useState(true);
  const [consumptionAlerts, setConsumptionAlerts] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [systemUpdates, setSystemUpdates] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  
  // Estado para las notificaciones de ejemplo
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        // Simulación de carga de notificaciones
        // En una implementación real, esto vendría de la base de datos
        const count = Math.floor(Math.random() * 5) + 1; // 1-5 notificaciones
        setNotificationCount(count);
      } catch (error) {
        console.error('Error al cargar notificaciones:', error);
      }
    };
    
    if (isLoggedIn) {
      loadNotifications();
    }
  }, [isLoggedIn]);
  // Cargar configuraciones guardadas
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await AsyncStorage.getItem('notificationSettings');
        if (settings) {
          const parsedSettings = JSON.parse(settings);
          setPushEnabled(parsedSettings.pushEnabled);
          setEmailEnabled(parsedSettings.emailEnabled);
          setPaymentReminders(parsedSettings.paymentReminders);
          setConsumptionAlerts(parsedSettings.consumptionAlerts);
          setPromotions(parsedSettings.promotions);
          setSystemUpdates(parsedSettings.systemUpdates);
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    };
    
    loadSettings();
    loadExampleNotifications();
  }, []);
  
  // Guardar configuraciones cuando cambien
  useEffect(() => {
    const saveSettings = async () => {
      try {
        const settings = {
          pushEnabled,
          emailEnabled,
          paymentReminders,
          consumptionAlerts,
          promotions,
          systemUpdates
        };
        await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
      } catch (error) {
        console.error('Error saving notification settings:', error);
      }
    };
    
    saveSettings();
  }, [pushEnabled, emailEnabled, paymentReminders, consumptionAlerts, promotions, systemUpdates]);
  
  // Cargar notificaciones de ejemplo
  const loadExampleNotifications = () => {
    const exampleNotifications = [
      {
        id: '1',
        type: 'payment',
        title: t('paymentReminder'),
        message: t('paymentReminderMessage'),
        date: '2025-05-18',
        read: false
      },
      {
        id: '2',
        type: 'consumption',
        title: t('consumptionAlert'),
        message: t('consumptionAlertMessage'),
        date: '2025-05-17',
        read: true
      },
      {
        id: '3',
        type: 'system',
        title: t('systemUpdate'),
        message: t('systemUpdateMessage'),
        date: '2025-05-15',
        read: true
      },
      {
        id: '4',
        type: 'promotion',
        title: t('promotionOffer'),
        message: t('promotionOfferMessage'),
        date: '2025-05-10',
        read: false
      }
    ];
    
    setNotifications(exampleNotifications);
  };
  
  // Marcar notificación como leída
  const markAsRead = (id) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  // Eliminar notificación
  const deleteNotification = (id) => {
    setNotifications(
      notifications.filter(notification => notification.id !== id)
    );
  };
  
  // Limpiar todas las notificaciones
  const clearAllNotifications = () => {
    Alert.alert(
      t('clearNotifications'),
      t('clearNotificationsConfirmation'),
      [
        {
          text: t('cancel'),
          style: 'cancel'
        },
        {
          text: t('confirm'),
          onPress: () => setNotifications([])
        }
      ]
    );
  };
  
  // Obtener icono según tipo de notificación
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment':
        return 'payment';
      case 'consumption':
        return 'trending-up';
      case 'system':
        return 'system-update';
      case 'promotion':
        return 'local-offer';
      default:
        return 'notifications';
    }
  };

  // Obtener color según tipo de notificación
  const getNotificationColor = (type) => {
    switch (type) {
      case 'payment':
        return '#3498db';
      case 'consumption':
        return '#e74c3c';
      case 'system':
        return '#2ecc71';
      case 'promotion':
        return '#f39c12';
      default:
        return '#95a5a6';
    }
  };
  
  return (
    <View style={[
      styles.container, 
      { backgroundColor: theme === 'dark' ? '#121212' : '#f5f5f5' }
    ]}>
      <View style={styles.header}>
        <BackButton 
          onPress={() => router.back()} 
          tintColor={theme === 'dark' ? '#fff' : '#000'} 
        />
        <Text style={[
          styles.headerTitle, 
          { color: theme === 'dark' ? '#fff' : '#000' }
        ]}>
          {t('Notificaciones')}
        </Text>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        {/* Sección de configuración de notificaciones */}
        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle, 
            { color: theme === 'dark' ? '#fff' : '#000' }
          ]}>
            {t('')}
          </Text>
          
          <View style={[
            styles.settingsCard, 
            { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
          ]}>
            {/* Canales de notificación */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="notifications" size={24} color="#3498db" />
                <Text style={[
                  styles.settingText, 
                  { color: theme === 'dark' ? '#fff' : '#000' }
                ]}>
                  {t('pushNotifications')}
                </Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={pushEnabled ? '#3498db' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="email" size={24} color="#3498db" />
                <Text style={[
                  styles.settingText, 
                  { color: theme === 'dark' ? '#fff' : '#000' }
                ]}>
                  {t('emailNotifications')}
                </Text>
              </View>
              <Switch
                value={emailEnabled}
                onValueChange={setEmailEnabled}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={emailEnabled ? '#3498db' : '#f4f3f4'}
              />
            </View>
            
            {/* Tipos de notificaciones */}
            <View style={styles.divider} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="payment" size={24} color="#3498db" />
                <Text style={[
                  styles.settingText, 
                  { color: theme === 'dark' ? '#fff' : '#000' }
                ]}>
                  {t('paymentReminders')}
                </Text>
              </View>
              <Switch
                value={paymentReminders}
                onValueChange={setPaymentReminders}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={paymentReminders ? '#3498db' : '#f4f3f4'}
                disabled={!pushEnabled && !emailEnabled}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="trending-up" size={24} color="#3498db" />
                <Text style={[
                  styles.settingText, 
                  { color: theme === 'dark' ? '#fff' : '#000' }
                ]}>
                  {t('consumptionAlerts')}
                </Text>
              </View>
              <Switch
                value={consumptionAlerts}
                onValueChange={setConsumptionAlerts}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={consumptionAlerts ? '#3498db' : '#f4f3f4'}
                disabled={!pushEnabled && !emailEnabled}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="local-offer" size={24} color="#3498db" />
                <Text style={[
                  styles.settingText, 
                  { color: theme === 'dark' ? '#fff' : '#000' }
                ]}>
                  {t('promotions')}
                </Text>
              </View>
              <Switch
                value={promotions}
                onValueChange={setPromotions}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={promotions ? '#3498db' : '#f4f3f4'}
                disabled={!pushEnabled && !emailEnabled}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="system-update" size={24} color="#3498db" />
                <Text style={[
                  styles.settingText, 
                  { color: theme === 'dark' ? '#fff' : '#000' }
                ]}>
                  {t('systemUpdates')}
                </Text>
              </View>
              <Switch
                value={systemUpdates}
                onValueChange={setSystemUpdates}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={systemUpdates ? '#3498db' : '#f4f3f4'}
                disabled={!pushEnabled && !emailEnabled}
              />
            </View>
          </View>
        </View>
        
        {/* Sección de notificaciones recientes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[
              styles.sectionTitle, 
              { color: theme === 'dark' ? '#fff' : '#000' }
            ]}>
              {t('recentNotifications')}
            </Text>
            
            {notifications.length > 0 && (
              <TouchableOpacity onPress={clearAllNotifications}>
                <Text style={styles.clearAllText}>{t('clearAll')}</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {notifications.length === 0 ? (
            <View style={[
              styles.emptyContainer, 
              { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
            ]}>
              <Icon name="notifications-off" size={48} color="#95a5a6" />
              <Text style={[
                styles.emptyText, 
                { color: theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                {t('noNotifications')}
              </Text>
            </View>
          ) : (
            notifications.map(notification => (
              <TouchableOpacity 
                key={notification.id}
                style={[
                  styles.notificationCard, 
                  { 
                    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
                    borderLeftColor: getNotificationColor(notification.type)
                  },
                  !notification.read && styles.unreadNotification
                ]}
                onPress={() => {
                  if (!notification.read) {
                    markAsRead(notification.id);
                  }
                  
                  // Mostrar detalles de la notificación
                  Alert.alert(
                    notification.title,
                    notification.message,
                    [
                      {
                        text: t('delete'),
                        onPress: () => deleteNotification(notification.id),
                        style: 'destructive'
                      },
                      {
                        text: t('ok')
                      }
                    ]
                  );
                }}
              >
                <View style={styles.notificationIcon}>
                  <Icon 
                    name={getNotificationIcon(notification.type)} 
                    size={24} 
                    color={getNotificationColor(notification.type)} 
                  />
                </View>
                
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={[
                      styles.notificationTitle, 
                      { color: theme === 'dark' ? '#fff' : '#000' },
                      !notification.read && styles.boldText
                    ]}>
                      {notification.title}
                    </Text>
                    
                    {!notification.read && (
                      <View style={styles.unreadDot} />
                    )}
                  </View>
                  
                  <Text style={[
                    styles.notificationMessage, 
                    { color: theme === 'dark' ? '#ccc' : '#666' }
                  ]} numberOfLines={2}>
                    {notification.message}
                  </Text>
                  
                  <Text style={[
                    styles.notificationDate, 
                    { color: theme === 'dark' ? '#aaa' : '#999' }
                  ]}>
                    {notification.date}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                >
                  <Icon name="close" size={20} color={theme === 'dark' ? '#ccc' : '#999'} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  notificationBadge:{

  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearAllText: {
    color: '#3498db',
    fontSize: 14,
  },
  settingsCard: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  emptyContainer: {
    padding: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  notificationCard: {
    flexDirection: 'row',
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    borderLeftWidth: 4,
  },
  unreadNotification: {
    borderLeftWidth: 4,
  },
  notificationIcon: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
    padding: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationTitle: {
    fontSize: 16,
    marginBottom: 4,
    flex: 1,
  },
  boldText: {
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3498db',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 8,
  },
  notificationDate: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationSystem;
