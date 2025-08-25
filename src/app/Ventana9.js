import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
  Vibration,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../herramientasDeLaApp/ThemeContext';
import { useLanguage } from '../herramientasDeLaApp//LanguageContext';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackButton from '../herramientasDeLaApp/BackButton';
import { useGlobalDeviceId, validateDeviceIdWithAPI } from '../services/useGlobalDeviceId';

const { width, height } = Dimensions.get('window');

export default function Ventana9() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  
  // Hook para gestión global del device ID
  const { deviceId, isLoading: deviceIdLoading, updateDeviceId, resetDeviceId } = useGlobalDeviceId();

  // Estados existentes
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [paymentReminders, setPaymentReminders] = useState(true);
  const [consumptionAlerts, setConsumptionAlerts] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [systemUpdates, setSystemUpdates] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [autoLogout, setAutoLogout] = useState(true);
  const [fontSize, setFontSize] = useState('medium');
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [cacheModalVisible, setCacheModalVisible] = useState(false);
  const [storageInfo, setStorageInfo] = useState({
    cache: '24.5 MB',
    data: '156 MB',
    total: '180.5 MB',
  });

  // Nuevos estados para funcionalidades mejoradas
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [deviceCode, setDeviceCode] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [wifiModalVisible, setWifiModalVisible] = useState(false);
  const [deviceModalVisible, setDeviceModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [fontModalVisible, setFontModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [autoBackup, setAutoBackup] = useState(true);
  const [dataSync, setDataSync] = useState(true);
  const [locationServices, setLocationServices] = useState(false);
  const [crashReports, setCrashReports] = useState(true);

  // Estados específicos para configuración de dispositivo
  const [globalDeviceModalVisible, setGlobalDeviceModalVisible] = useState(false);
  const [tempDeviceId, setTempDeviceId] = useState('');
  const [isValidatingDevice, setIsValidatingDevice] = useState(false);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const clientRef = useRef(null);

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Cargar configuraciones guardadas
    loadSavedSettings();

    return () => {
      if (clientRef.current) {
        clientRef.current.end(true);
        clientRef.current = null;
      }
    };
  }, []);

  // Función para cargar configuraciones guardadas
  const loadSavedSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('userSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setPushNotifications(settings.pushNotifications ?? true);
        setEmailNotifications(settings.emailNotifications ?? true);
        setPaymentReminders(settings.paymentReminders ?? true);
        setConsumptionAlerts(settings.consumptionAlerts ?? true);
        setPromotions(settings.promotions ?? false);
        setSystemUpdates(settings.systemUpdates ?? true);
        setBiometricAuth(settings.biometricAuth ?? false);
        setAutoLogout(settings.autoLogout ?? true);
        setFontSize(settings.fontSize ?? 'medium');
        setAutoBackup(settings.autoBackup ?? true);
        setDataSync(settings.dataSync ?? true);
        setLocationServices(settings.locationServices ?? false);
        setCrashReports(settings.crashReports ?? true);
        setSelectedLanguage(settings.language ?? 'es');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Función para guardar configuraciones
  const saveSettings = async () => {
    try {
      const settings = {
        pushNotifications,
        emailNotifications,
        paymentReminders,
        consumptionAlerts,
        promotions,
        systemUpdates,
        biometricAuth,
        autoLogout,
        fontSize,
        autoBackup,
        dataSync,
        locationServices,
        crashReports,
        language: selectedLanguage,
      };
      await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Función para abrir modal de configuración de dispositivo global
  const openGlobalDeviceModal = () => {
    setTempDeviceId(deviceId);
    setGlobalDeviceModalVisible(true);
  };

  // Función para validar y guardar el device ID global
  const saveGlobalDeviceId = async () => {
    if (!tempDeviceId.trim()) {
      Alert.alert('Error', 'Por favor ingresa un ID de dispositivo válido');
      return;
    }

    setIsValidatingDevice(true);
    
    try {
      // Validar que el dispositivo existe en la base de datos
      await validateDeviceIdWithAPI(tempDeviceId.trim());
      
      // Si la validación es exitosa, actualizar el device ID global
      await updateDeviceId(tempDeviceId.trim());
      
      setGlobalDeviceModalVisible(false);
      setTempDeviceId('');
      
      Alert.alert(
        'Éxito', 
        `Dispositivo configurado correctamente: ${tempDeviceId.trim()}\n\nEste dispositivo será usado en todas las ventanas de monitoreo.`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Error validando device ID:', error);
      
      let errorMessage = 'Error al validar el dispositivo';
      if (error.message.includes('no encontrado')) {
        errorMessage = 'El dispositivo no existe en la base de datos. Verifica el ID ingresado.';
      } else if (error.message.includes('Timeout') || error.message.includes('Network')) {
        errorMessage = 'Error de conexión. Verifica que el servidor esté funcionando.';
      } else if (error.message.includes('autenticación')) {
        errorMessage = 'Error de autenticación con el servidor.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsValidatingDevice(false);
    }
  };

  // Función para resetear device ID a valor por defecto
  const resetGlobalDeviceId = async () => {
    Alert.alert(
      'Resetear Dispositivo',
      '¿Estás seguro de que quieres resetear el dispositivo al valor por defecto (ESP32_EnergyMonitor)?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetear',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetDeviceId();
              Alert.alert('Éxito', 'Dispositivo reseteado al valor por defecto');
            } catch (error) {
              Alert.alert('Error', 'No se pudo resetear el dispositivo');
            }
          }
        }
      ]
    );
  };

  // Función mejorada para limpiar caché
  const clearCache = async () => {
    setIsLoading(true);
    try {
      // Simular limpieza de caché
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Limpiar AsyncStorage específico
      const keysToRemove = ['tempData', 'imageCache', 'apiCache'];
      await AsyncStorage.multiRemove(keysToRemove);
      
      setStorageInfo({
        ...storageInfo,
        cache: '0 MB',
        total: '156 MB',
      });
      
      setCacheModalVisible(false);
      setIsLoading(false);
      
      // Vibración de feedback
      if (Platform.OS === 'ios') {
        Vibration.vibrate();
      } else {
        Vibration.vibrate(100);
      }
      
      Alert.alert(t('success'), t('cacheCleared'));
    } catch (error) {
      setIsLoading(false);
      Alert.alert(t('error'), t('cacheClearError'));
    }
  };

  // Función mejorada para resetear configuraciones
  const resetSettings = async () => {
    setIsLoading(true);
    try {
      // Resetear todos los estados
      setPushNotifications(true);
      setEmailNotifications(true);
      setPaymentReminders(true);
      setConsumptionAlerts(true);
      setPromotions(false);
      setSystemUpdates(true);
      setBiometricAuth(false);
      setAutoLogout(true);
      setFontSize('medium');
      setAutoBackup(true);
      setDataSync(true);
      setLocationServices(false);
      setCrashReports(true);
      setSelectedLanguage('es');

      // Limpiar AsyncStorage
      await AsyncStorage.removeItem('userSettings');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setResetModalVisible(false);
      setIsLoading(false);
      
      Alert.alert(t('success'), t('settingsReset'));
    } catch (error) {
      setIsLoading(false);
      Alert.alert(t('error'), t('resetError'));
    }
  };

  // Función para configurar WiFi
  const saveWifiConfig = async () => {
    if (!ssid.trim()) {
      Alert.alert(t('error'), t('ssidRequired'));
      return;
    }

    setIsSavingConfig(true);
    try {
      // Simular guardado de configuración WiFi
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await AsyncStorage.setItem('wifiConfig', JSON.stringify({ ssid, password }));
      
      setWifiModalVisible(false);
      setIsSavingConfig(false);
      setSsid('');
      setPassword('');
      
      Alert.alert(t('success'), t('wifiConfigSaved'));
    } catch (error) {
      setIsSavingConfig(false);
      Alert.alert(t('error'), t('wifiConfigError'));
    }
  };

  // Función para configurar dispositivo (legacy)
  const saveDeviceConfig = async () => {
    if (!deviceCode.trim()) {
      Alert.alert(t('error'), t('deviceCodeRequired'));
      return;
    }

    setIsSavingConfig(true);
    try {
      // Simular guardado de configuración de dispositivo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await AsyncStorage.setItem('deviceConfig', JSON.stringify({ deviceCode }));
      
      setDeviceModalVisible(false);
      setIsSavingConfig(false);
      setDeviceCode('');
      
      Alert.alert(t('success'), t('deviceConfigSaved'));
    } catch (error) {
      setIsSavingConfig(false);
      Alert.alert(t('error'), t('deviceConfigError'));
    }
  };

  // Función para cambiar idioma
  const changeLanguage = async (language) => {
    setSelectedLanguage(language);
    setLanguageModalVisible(false);
    await saveSettings();
    Alert.alert(t('success'), t('languageChanged'));
  };

  // Función para cambiar tamaño de fuente
  const changeFontSize = async (size) => {
    setFontSize(size);
    setFontModalVisible(false);
    await saveSettings();
    Alert.alert(t('success'), t('fontSizeChanged'));
  };

  // Función mejorada para logout
  const handleLogout = async () => {
    Alert.alert(
      t('logout'),
      t('logoutConfirmation'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await AsyncStorage.multiRemove(['isLoggedIn', 'userToken', 'userSession']);
              await new Promise(resolve => setTimeout(resolve, 1000));
              router.replace('./');
            } catch (error) {
              setIsLoading(false);
              Alert.alert(t('error'), t('logoutError'));
            }
          },
        },
      ]
    );
  };

  // Función para exportar configuraciones
  const exportSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('userSettings');
      if (settings) {
        // Aquí podrías implementar la lógica para exportar/compartir
        Alert.alert(t('success'), t('settingsExported'));
      }
    } catch (error) {
      Alert.alert(t('error'), t('exportError'));
    }
  };

  // Función para importar configuraciones
  const importSettings = () => {
    Alert.alert(
      t('importSettings'),
      t('importSettingsDescription'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('import'), onPress: () => {
          // Aquí implementarías la lógica de importación
          Alert.alert(t('success'), t('settingsImported'));
        }},
      ]
    );
  };

  // Componente para renderizar secciones de configuración
  const renderSettingsSection = (title, children) => (
    <Animated.View 
      style={[
        styles.settingsSection, 
        themedStyles.settingsSection(theme),
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
      ]}
    >
      <Text style={[styles.sectionTitle, themedStyles.sectionTitle(theme)]}>{title}</Text>
      <View style={[styles.sectionContent, themedStyles.sectionContent(theme)]}>
        {children}
      </View>
    </Animated.View>
  );

  // Componente mejorado para items con switch
  const renderSwitchItem = (icon, textKey, value, onValueChange, description = null) => (
    <TouchableOpacity 
      style={[styles.settingsItem, themedStyles.borderBottom(theme)]}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.7}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.iconContainer, themedStyles.iconContainer(theme)]}>
          <Icon name={icon} size={22} color={themedStyles.iconColor(theme)} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.settingsText, themedStyles.text(theme)]}>{t(textKey)}</Text>
          {description && (
            <Text style={[styles.descriptionText, themedStyles.descriptionText(theme)]}>
              {t(description)}
            </Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: '#00FFFF' }}
        thumbColor={value ? '#FFFFFF' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
      />
    </TouchableOpacity>
  );

  // Componente mejorado para items de acción
  const renderActionItem = (icon, textKey, onPress, description = null, showChevron = true) => (
    <TouchableOpacity 
      style={[styles.settingsItem, themedStyles.borderBottom(theme)]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.iconContainer, themedStyles.iconContainer(theme)]}>
          <Icon name={icon} size={22} color={themedStyles.iconColor(theme)} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.settingsText, themedStyles.text(theme)]}>{t(textKey)}</Text>
          {description && (
            <Text style={[styles.descriptionText, themedStyles.descriptionText(theme)]}>
              {t(description)}
            </Text>
          )}
        </View>
      </View>
      {showChevron && (
        <Icon name="chevron-right" size={24} color={themedStyles.chevronColor(theme)} />
      )}
    </TouchableOpacity>
  );

  // Componente para items de input
  const renderInputItem = (icon, placeholderKey, value, onChangeText, secureTextEntry = false) => (
    <View style={[styles.inputItem, themedStyles.borderBottom(theme)]}>
      <View style={[styles.iconContainer, themedStyles.iconContainer(theme)]}>
        <Icon name={icon} size={22} color={themedStyles.iconColor(theme)} />
      </View>
      <TextInput
        style={[styles.textInput, themedStyles.textInput(theme)]}
        placeholder={t(placeholderKey)}
        placeholderTextColor={themedStyles.placeholderColor(theme)}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
      />
    </View>
  );

  return (
    <View style={[styles.container, themedStyles.container(theme)]}>
      {/* Header */}
      <View style={[styles.header, themedStyles.header(theme)]}>
        <BackButton onPress={() => router.back()} tintColor={themedStyles.text(theme).color} />
        <Text style={[styles.title, themedStyles.text(theme)]}>{t('settings')}</Text>
      </View>

      {/* Header decorativo */}
      <Animated.View style={[styles.headerDown, { opacity: fadeAnim }]}>
        <Icon name="settings" size={60} color="#00FFFF" style={styles.headerIcon} />
        <Text style={styles.titleDown}>CONFIGURACIÓN</Text>
        <Text style={styles.subtitle}>Personaliza tu experiencia</Text>
      </Animated.View>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* NUEVA SECCIÓN: Configuración de Dispositivo Global */}
        {renderSettingsSection('Configuración de Dispositivo', (
          <>
            <View style={[styles.settingsItem, themedStyles.borderBottom(theme)]}>
              <View style={styles.settingsItemLeft}>
                <View style={[styles.iconContainer, themedStyles.iconContainer(theme)]}>
                  <Icon name="router" size={22} color={themedStyles.iconColor(theme)} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[styles.settingsText, themedStyles.text(theme)]}>
                    Dispositivo Actual
                  </Text>
                  <Text style={[styles.descriptionText, themedStyles.descriptionText(theme)]}>
                    {deviceIdLoading ? 'Cargando...' : deviceId}
                  </Text>
                </View>
              </View>
              <View style={styles.deviceStatusContainer}>
                <View style={[styles.deviceStatusDot, { backgroundColor: '#2ecc71' }]} />
                <Text style={[styles.deviceStatusText, { color: '#2ecc71' }]}>
                  Conectado
                </Text>
              </View>
            </View>
            
            {renderActionItem('edit', 'Cambiar Dispositivo', openGlobalDeviceModal, 'Configurar un nuevo dispositivo para monitoreo')}
            {renderActionItem('refresh', 'Resetear Dispositivo', resetGlobalDeviceId, 'Volver al dispositivo por defecto')}
          </>
        ))}

        {/* Configuraciones de Notificaciones */}
        {renderSettingsSection(t('notificationSettings'), (
          <>
            {renderSwitchItem('notifications', 'pushNotifications', pushNotifications, setPushNotifications, 'pushNotificationsDesc')}
            {renderSwitchItem('email', 'emailNotifications', emailNotifications, setEmailNotifications, 'emailNotificationsDesc')}
            {renderSwitchItem('alarm', 'paymentReminders', paymentReminders, setPaymentReminders, 'paymentRemindersDesc')}
            {renderSwitchItem('trending-up', 'consumptionAlerts', consumptionAlerts, setConsumptionAlerts, 'consumptionAlertsDesc')}
            {renderSwitchItem('local-offer', 'promotions', promotions, setPromotions, 'promotionsDesc')}
            {renderSwitchItem('system-update', 'systemUpdates', systemUpdates, setSystemUpdates, 'systemUpdatesDesc')}
          </>
        ))}

        {/* Configuraciones de la App */}
        {renderSettingsSection(t('appSettings'), (
          <>
            <TouchableOpacity 
              style={[styles.settingsItem, themedStyles.borderBottom(theme)]} 
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              <View style={styles.settingsItemLeft}>
                <View style={[styles.iconContainer, themedStyles.iconContainer(theme)]}>
                  <Icon
                    name={theme === 'dark' ? 'brightness-7' : 'brightness-3'}
                    size={22}
                    color={themedStyles.iconColor(theme)}
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[styles.settingsText, themedStyles.text(theme)]}>
                    {t('theme')}
                  </Text>
                  <Text style={[styles.descriptionText, themedStyles.descriptionText(theme)]}>
                    {theme === 'dark' ? t('darkMode') : t('lightMode')}
                  </Text>
                </View>
              </View>
              <Icon name="chevron-right" size={24} color={themedStyles.chevronColor(theme)} />
            </TouchableOpacity>
            
            {renderActionItem('language', 'language', () => setLanguageModalVisible(true), 'languageDesc')}
            {renderActionItem('font-download', 'fontSize', () => setFontModalVisible(true), 'fontSizeDesc')}
          </>
        ))}

        {/* Configuraciones de Conectividad */}
        {renderSettingsSection(t('connectivitySettings'), (
          <>
            {renderActionItem('wifi', 'wifiSettings', () => setWifiModalVisible(true), 'wifiSettingsDesc')}
            {renderActionItem('devices', 'deviceSettings', () => setDeviceModalVisible(true), 'deviceSettingsDesc')}
          </>
        ))}

        {/* Configuraciones de Seguridad */}
        {renderSettingsSection(t('securitySettings'), (
          <>
            {renderSwitchItem('fingerprint', 'biometricAuth', biometricAuth, setBiometricAuth, 'biometricAuthDesc')}
            {renderSwitchItem('timer', 'autoLogout', autoLogout, setAutoLogout, 'autoLogoutDesc')}
            {renderActionItem('security', 'terms', () => router.push('./terms'), 'termsDesc')}
            {renderActionItem('privacy-tip', 'privacy', () => router.push('./privacy'), 'privacyDesc')}
          </>
        ))}

        {/* Configuraciones de Datos */}
        {renderSettingsSection(t('dataSettings'), (
          <>
            {renderSwitchItem('backup', 'autoBackup', autoBackup, setAutoBackup, 'autoBackupDesc')}
            {renderSwitchItem('sync', 'dataSync', dataSync, setDataSync, 'dataSyncDesc')}
            {renderSwitchItem('location-on', 'locationServices', locationServices, setLocationServices, 'locationServicesDesc')}
            {renderSwitchItem('bug-report', 'crashReports', crashReports, setCrashReports, 'crashReportsDesc')}
          </>
        ))}

        {/* Uso de Datos */}
        {renderSettingsSection(t('dataUsage'), (
          <>
            {renderActionItem('storage', 'storageUsage', () => {
              Alert.alert(
                t('storageUsage'),
                `${t('cache')}: ${storageInfo.cache}\n${t('data')}: ${storageInfo.data}\n${t('total')}: ${storageInfo.total}`,
                [{ text: t('ok') }]
              );
            }, 'storageUsageDesc')}
            {renderActionItem('cleaning-services', 'clearCache', () => setCacheModalVisible(true), 'clearCacheDesc')}
            {renderActionItem('restore', 'resetSettings', () => setResetModalVisible(true), 'resetSettingsDesc')}
            {renderActionItem('file-upload', 'exportSettings', exportSettings, 'exportSettingsDesc')}
            {renderActionItem('file-download', 'importSettings', importSettings, 'importSettingsDesc')}
          </>
        ))}

        {/* Acerca de */}
        {renderSettingsSection(t('about'), (
          <>
            {renderActionItem('info', 'about', () => {
              Alert.alert(
                t('about'),
                `Electro Puno App\n${t('version')}: 1.0.0\n${t('buildNumber')}: 100\n${t('developer')}: Electro Puno Team`
              );
            }, 'aboutDesc')}
            {renderActionItem('help', 'help', () => router.push('./help'), 'helpDesc')}
            {renderActionItem('rate-review', 'rateApp', () => {
              Alert.alert(t('rateApp'), t('rateAppDescription'));
            }, 'rateAppDesc')}
            {renderActionItem('share', 'shareApp', () => {
              Alert.alert(t('shareApp'), t('shareAppDescription'));
            }, 'shareAppDesc')}
          </>
        ))}

        {/* Botón de Logout */}
        <TouchableOpacity
          style={[styles.logoutButton, themedStyles.logoutButton(theme)]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Icon name="exit-to-app" size={24} color="#fff" />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal para configuración de dispositivo global */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={globalDeviceModalVisible}
        onRequestClose={() => setGlobalDeviceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, themedStyles.modalContent(theme), styles.globalDeviceModal]}>
            <Icon name="router" size={48} color="#00FFFF" style={styles.modalIcon} />
            <Text style={[styles.modalTitle, themedStyles.text(theme)]}>
              Configurar Dispositivo Global
            </Text>
            <Text style={[styles.modalText, themedStyles.modalText(theme)]}>
              Ingresa el ID del dispositivo que será usado en todas las ventanas de monitoreo energético.
            </Text>
            
            <View style={[styles.currentDeviceInfo, themedStyles.currentDeviceInfo(theme)]}>
              <Text style={[styles.currentDeviceLabel, themedStyles.descriptionText(theme)]}>
                Dispositivo actual:
              </Text>
              <Text style={[styles.currentDeviceValue, themedStyles.text(theme)]}>
                {deviceId}
              </Text>
            </View>
            
            <View style={[styles.inputItem, themedStyles.borderBottom(theme)]}>
              <View style={[styles.iconContainer, themedStyles.iconContainer(theme)]}>
                <Icon name="router" size={22} color={themedStyles.iconColor(theme)} />
              </View>
              <TextInput
                style={[styles.textInput, themedStyles.textInput(theme)]}
                placeholder="Ej: ESP32_EnergyMonitor"
                placeholderTextColor={themedStyles.placeholderColor(theme)}
                value={tempDeviceId}
                onChangeText={setTempDeviceId}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            
            {isValidatingDevice ? (
              <View style={styles.validatingContainer}>
                <ActivityIndicator size="large" color="#00FFFF" />
                <Text style={[styles.validatingText, themedStyles.text(theme)]}>
                  Validando dispositivo...
                </Text>
              </View>
            ) : (
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setGlobalDeviceModalVisible(false);
                    setTempDeviceId('');
                  }}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={saveGlobalDeviceId}
                >
                  <Text style={styles.modalButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal para limpiar caché */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={cacheModalVisible}
        onRequestClose={() => setCacheModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, themedStyles.modalContent(theme)]}>
            <Icon name="cleaning-services" size={48} color="#00FFFF" style={styles.modalIcon} />
            <Text style={[styles.modalTitle, themedStyles.text(theme)]}>{t('clearCache')}</Text>
            <Text style={[styles.modalText, themedStyles.modalText(theme)]}>
              {t('clearCacheConfirmation')}
            </Text>
            <Text style={[styles.modalSubtext, themedStyles.modalText(theme)]}>
              {t('currentCacheSize')}: {storageInfo.cache}
            </Text>
            
            {isLoading ? (
              <ActivityIndicator size="large" color="#00FFFF" style={styles.loader} />
            ) : (
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setCacheModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={clearCache}
                >
                  <Text style={styles.modalButtonText}>{t('clear')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal para resetear configuraciones */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={resetModalVisible}
        onRequestClose={() => setResetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, themedStyles.modalContent(theme)]}>
            <Icon name="restore" size={48} color="#FF6B6B" style={styles.modalIcon} />
            <Text style={[styles.modalTitle, themedStyles.text(theme)]}>{t('resetSettings')}</Text>
            <Text style={[styles.modalText, themedStyles.modalText(theme)]}>
              {t('resetSettingsConfirmation')}
            </Text>
            <Text style={[styles.modalSubtext, themedStyles.modalText(theme)]}>
              {t('resetWarning')}
            </Text>
            
            {isLoading ? (
              <ActivityIndicator size="large" color="#FF6B6B" style={styles.loader} />
            ) : (
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setResetModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.dangerButton]}
                  onPress={resetSettings}
                >
                  <Text style={styles.modalButtonText}>{t('reset')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal para configuración WiFi */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={wifiModalVisible}
        onRequestClose={() => setWifiModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, themedStyles.modalContent(theme), styles.wifiModal]}>
            <Icon name="wifi" size={48} color="#00FFFF" style={styles.modalIcon} />
            <Text style={[styles.modalTitle, themedStyles.text(theme)]}>{t('wifiSettings')}</Text>
            
            {renderInputItem('wifi', 'ssidPlaceholder', ssid, setSsid)}
            {renderInputItem('lock', 'passwordPlaceholder', password, setPassword, true)}
            
            {isSavingConfig ? (
              <ActivityIndicator size="large" color="#00FFFF" style={styles.loader} />
            ) : (
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setWifiModalVisible(false);
                    setSsid('');
                    setPassword('');
                  }}
                >
                  <Text style={styles.modalButtonText}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={saveWifiConfig}
                >
                  <Text style={styles.modalButtonText}>{t('save')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal para configuración de dispositivo (legacy) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={deviceModalVisible}
        onRequestClose={() => setDeviceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, themedStyles.modalContent(theme), styles.deviceModal]}>
            <Icon name="devices" size={48} color="#00FFFF" style={styles.modalIcon} />
            <Text style={[styles.modalTitle, themedStyles.text(theme)]}>{t('deviceSettings')}</Text>
            <Text style={[styles.modalText, themedStyles.modalText(theme)]}>
              {t('deviceCodeDescription')}
            </Text>
            
            {renderInputItem('qr-code', 'deviceCodePlaceholder', deviceCode, setDeviceCode)}
            
            {isSavingConfig ? (
              <ActivityIndicator size="large" color="#00FFFF" style={styles.loader} />
            ) : (
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setDeviceModalVisible(false);
                    setDeviceCode('');
                  }}
                >
                  <Text style={styles.modalButtonText}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={saveDeviceConfig}
                >
                  <Text style={styles.modalButtonText}>{t('save')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal para selección de idioma */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, themedStyles.modalContent(theme), styles.languageModal]}>
            <Icon name="language" size={48} color="#00FFFF" style={styles.modalIcon} />
            <Text style={[styles.modalTitle, themedStyles.text(theme)]}>{t('selectLanguage')}</Text>
            
            <ScrollView style={styles.languageList}>
              {[
                { code: 'es', name: 'Español', flag: '🇪🇸' },
                { code: 'en', name: 'English', flag: '🇺🇸' },
                { code: 'fr', name: 'Français', flag: '🇫🇷' },
                { code: 'pt', name: 'Português', flag: '🇧🇷' },
                { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
                { code: 'it', name: 'Italiano', flag: '🇮🇹' },
              ].map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageItem,
                    themedStyles.languageItem(theme),
                    selectedLanguage === language.code && styles.selectedLanguageItem
                  ]}
                  onPress={() => changeLanguage(language.code)}
                >
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <Text style={[styles.languageName, themedStyles.text(theme)]}>
                    {language.name}
                  </Text>
                  {selectedLanguage === language.code && (
                    <Icon name="check" size={20} color="#00FFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { width: '100%' }]}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para selección de tamaño de fuente */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={fontModalVisible}
        onRequestClose={() => setFontModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, themedStyles.modalContent(theme), styles.fontModal]}>
            <Icon name="font-download" size={48} color="#00FFFF" style={styles.modalIcon} />
            <Text style={[styles.modalTitle, themedStyles.text(theme)]}>{t('selectFontSize')}</Text>
            
            {[
              { size: 'small', label: t('fontSizeSmall'), example: '14px' },
              { size: 'medium', label: t('fontSizeMedium'), example: '16px' },
              { size: 'large', label: t('fontSizeLarge'), example: '18px' },
              { size: 'xlarge', label: t('fontSizeXLarge'), example: '20px' },
            ].map((font) => (
              <TouchableOpacity
                key={font.size}
                style={[
                  styles.fontItem,
                  themedStyles.fontItem(theme),
                  fontSize === font.size && styles.selectedFontItem
                ]}
                onPress={() => changeFontSize(font.size)}
              >
                <View style={styles.fontItemLeft}>
                  <Text style={[styles.fontLabel, themedStyles.text(theme)]}>
                    {font.label}
                  </Text>
                  <Text style={[styles.fontExample, themedStyles.descriptionText(theme)]}>
                    {font.example}
                  </Text>
                </View>
                {fontSize === font.size && (
                  <Icon name="check" size={20} color="#00FFFF" />
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { width: '100%' }]}
              onPress={() => setFontModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00FFFF" />
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerDown: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerIcon: {
    marginBottom: 15,
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  titleDown: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  settingsSection: {
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    marginTop: 20,
    marginHorizontal: 20,
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  sectionContent: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  settingsText: {
    fontSize: 16,
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
  inputItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    width: '100%',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 30,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  confirmButton: {
    backgroundColor: '#00FFFF',
  },
  dangerButton: {
    backgroundColor: '#dc3545',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 12,
  },
  wifiModal: {
    maxHeight: height * 0.7,
  },
  deviceModal: {
    maxHeight: height * 0.6,
  },
  languageModal: {
    maxHeight: height * 0.8,
  },
  fontModal: {
    maxHeight: height * 0.7,
  },
  globalDeviceModal: {
    maxHeight: height * 0.8,
  },
  languageList: {
    width: '100%',
    maxHeight: 300,
    marginBottom: 20,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedLanguageItem: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#00FFFF',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    flex: 1,
  },
  fontItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    width: '100%',
  },
  selectedFontItem: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#00FFFF',
  },
  fontItemLeft: {
    flex: 1,
  },
  fontLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  fontExample: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
  },
  // Nuevos estilos para la configuración de dispositivo
  deviceStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  deviceStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  currentDeviceInfo: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  currentDeviceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  currentDeviceValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  validatingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  validatingText: {
    marginTop: 12,
    fontSize: 16,
  },
});

const themedStyles = {
  container: (theme) => ({
    backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f8f9fa',
  }),
  header: (theme) => ({
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
    borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  }),
  settingsSection: (theme) => ({
    backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)',
  }),
  sectionTitle: (theme) => ({
    color: theme === 'dark' ? '#FFFFFF' : '#2c3e50',
  }),
  sectionContent: (theme) => ({
    backgroundColor: 'transparent',
  }),
  text: (theme) => ({
    color: theme === 'dark' ? '#ffffff' : '#2c3e50',
  }),
  descriptionText: (theme) => ({
    color: theme === 'dark' ? '#cccccc' : '#6c757d',
  }),
  iconContainer: (theme) => ({
    backgroundColor: theme === 'dark' ? 'rgba(0,255,255,0.1)' : 'rgba(0,255,255,0.05)',
  }),
  iconColor: (theme) => (theme === 'dark' ? '#00FFFF' : '#007bff'),
  chevronColor: (theme) => (theme === 'dark' ? '#666666' : '#999999'),
  borderBottom: (theme) => ({
    borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  }),
  textInput: (theme) => ({
    color: theme === 'dark' ? '#ffffff' : '#2c3e50',
    backgroundColor: 'transparent',
  }),
  placeholderColor: (theme) => (theme === 'dark' ? '#666666' : '#999999'),
  logoutButton: (theme) => ({
    backgroundColor: theme === 'dark' ? '#dc3545' : '#e74c3c',
  }),
  modalContent: (theme) => ({
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
  }),
  modalText: (theme) => ({
    color: theme === 'dark' ? '#cccccc' : '#6c757d',
  }),
  languageItem: (theme) => ({
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
  }),
  fontItem: (theme) => ({
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
  }),
  currentDeviceInfo: (theme) => ({
    backgroundColor: theme === 'dark' ? 'rgba(0,255,255,0.05)' : 'rgba(0,255,255,0.02)',
  }),
};

