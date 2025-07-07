import React, { useState, useEffect, useRef } from 'react';
import {View,Text,Switch,TouchableOpacity,StyleSheet,Alert,ScrollView,Modal,TextInput,ActivityIndicator,} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from 'C:/Users/amigo/Downloads/PROYECTO PYTHON/PROYECTOS CON REACT NATIVE/MyApp/src/utils/ThemeContext';
import { useLanguage } from 'C:/Users/amigo/Downloads/PROYECTO PYTHON/PROYECTOS CON REACT NATIVE/MyApp/src/utils/LanguageContext';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackButton from 'C:/Users/amigo/Downloads/PROYECTO PYTHON/PROYECTOS CON REACT NATIVE/MyApp/src/utils/BackButton';




export default function Ventana9() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

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
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [deviceCode, setDeviceCode] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const clientRef = useRef(null);

  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.end(true);
        clientRef.current = null;
      }
    };
  }, []);

  const clearCache = () => {
    setTimeout(() => {
      setStorageInfo({
        ...storageInfo,
        cache: '0 MB',
        total: '156 MB',
      });
      setCacheModalVisible(false);
      Alert.alert(t('success'), t('cacheCleared'));
    }, 1000);
  };

  const resetSettings = () => {
    setPushNotifications(true);
    setEmailNotifications(true);
    setPaymentReminders(true);
    setConsumptionAlerts(true);
    setPromotions(false);
    setSystemUpdates(true);
    setBiometricAuth(false);
    setAutoLogout(true);
    setFontSize('medium');
    setResetModalVisible(false);
    Alert.alert(t('success'), t('settingsReset'));
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('isLoggedIn');
    router.replace('./');
  };

  

  const renderSettingsSection = (title, children) => (
    <View style={styles.settingsSection}>
      <Text style={[styles.sectionTitle, themedStyles.text(theme)]}>{title}</Text>
      <View style={[styles.sectionContent, themedStyles.sectionContent(theme)]}>{children}</View>
    </View>
  );

  const renderSwitchItem = (icon, textKey, value, onValueChange) => (
    <View style={[styles.settingsItem, themedStyles.borderBottom(theme)]}>
      <View style={styles.settingsItemLeft}>
        <Icon name={icon} size={24} color={themedStyles.iconColor(theme)} />
        <Text style={[styles.settingsText, themedStyles.text(theme)]}>{t(textKey)}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={value ? '#3498db' : '#f4f3f4'}
      />
    </View>
  );

  const renderActionItem = (icon, textKey, onPress) => (
    <TouchableOpacity style={[styles.settingsItem, themedStyles.borderBottom(theme)]} onPress={onPress}>
      <View style={styles.settingsItemLeft}>
        <Icon name={icon} size={24} color={themedStyles.iconColor(theme)} />
        <Text style={[styles.settingsText, themedStyles.text(theme)]}>{t(textKey)}</Text>
      </View>
      <Icon name="chevron-right" size={24} color={themedStyles.chevronColor(theme)} />
    </TouchableOpacity>
  );

  const renderInputItem = (icon, placeholderKey, value, onChangeText, secureTextEntry = false) => (
    <View style={[styles.inputItem, themedStyles.borderBottom(theme)]}>
      <Icon name={icon} size={24} color={themedStyles.iconColor(theme)} style={styles.inputIcon} />
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
      <View style={[styles.header, themedStyles.header(theme)]}>
        <BackButton onPress={() => router.back()} tintColor={themedStyles.text(theme).color} />
        <Text style={[styles.title, themedStyles.text(theme)]}>{t('settings')}</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
  
        {/* Other settings sections remain unchanged */}
        {renderSettingsSection(t('notificationSettings'), (
          <>
            {renderSwitchItem('notifications', 'pushNotifications', pushNotifications, setPushNotifications)}
            {renderSwitchItem('email', 'emailNotifications', emailNotifications, setEmailNotifications)}
            {renderSwitchItem('alarm', 'paymentReminders', paymentReminders, setPaymentReminders)}
            {renderSwitchItem('trending-up', 'consumptionAlerts', consumptionAlerts, setConsumptionAlerts)}
            {renderSwitchItem('local-offer', 'promotions', promotions, setPromotions)}
            {renderSwitchItem('system-update', 'systemUpdates', systemUpdates, setSystemUpdates)}
          </>
        ))}

        {renderSettingsSection(t('appSettings'), (
          <>
            <TouchableOpacity style={[styles.settingsItem, themedStyles.borderBottom(theme)]} onPress={toggleTheme}>
              <View style={styles.settingsItemLeft}>
                <Icon
                  name={theme === 'dark' ? 'brightness-7' : 'brightness-3'}
                  size={24}
                  color={themedStyles.iconColor(theme)}
                />
                <Text style={[styles.settingsText, themedStyles.text(theme)]}>
                  {theme === 'dark' ? t('lightMode') : t('darkMode')}
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color={themedStyles.chevronColor(theme)} />
            </TouchableOpacity>
            {renderActionItem('font-download', 'fontSettings', () => {
              Alert.alert(
                t('fontSettings'),
                t('selectFontSize'),
                [
                  { text: t('fontSizeSmall'), onPress: () => setFontSize('small') },
                  { text: t('fontSizeMedium'), onPress: () => setFontSize('medium') },
                  { text: t('fontSizeLarge'), onPress: () => setFontSize('large') },
                  { text: t('cancel'), style: 'cancel' },
                ]
              );
            })}
            {renderActionItem('language', 'language', () => {
              Alert.alert(t('language'), 'Language selection is available in the side menu.');
            })}
          </>
        ))}

        {renderSettingsSection(t('securitySettings'), (
          <>
            {renderSwitchItem('fingerprint', 'biometricAuth', biometricAuth, setBiometricAuth)}
            {renderSwitchItem('timer', 'autoLogout', autoLogout, setAutoLogout)}
            {renderActionItem('security', 'terms', () => router.push('./terms'))}
            {renderActionItem('privacy-tip', 'privacy', () => router.push('./privacy'))}
          </>
        ))}

        {renderSettingsSection(t('dataUsage'), (
          <>
            {renderActionItem('storage', 'storageUsage', () => {
              Alert.alert(
                t('storageUsage'),
                `${t('cache')}: ${storageInfo.cache}\n${t('data')}: ${storageInfo.data}\n${t('total')}: ${storageInfo.total}`
              );
            })}
            {renderActionItem('cleaning-services', 'clearCache', () => setCacheModalVisible(true))}
            {renderActionItem('restore', 'resetSettings', () => setResetModalVisible(true))}
          </>
        ))}

        {renderSettingsSection(t('about'), (
          <>
            {renderActionItem('info', 'about', () => {
              Alert.alert(
                t('about'),
                `Electro Puno App\n${t('version')}: 1.0.0`
              );
            })}
            {renderActionItem('help', 'help', () => router.push('./help'))}
          </>
        ))}

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme === 'dark' ? '#d9534f' : '#e74c3c' }]}
          onPress={handleLogout}
        >
          <Icon name="exit-to-app" size={24} color="#fff" />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={cacheModalVisible}
        onRequestClose={() => setCacheModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, themedStyles.modalContent(theme)]}>
            <Text style={[styles.modalTitle, themedStyles.text(theme)]}>{t('clearCache')}</Text>
            <Text style={[styles.modalText, themedStyles.modalText(theme)]}>{t('clearCacheConfirmation')}</Text>
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
                <Text style={styles.modalButtonText}>{t('confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={resetModalVisible}
        onRequestClose={() => setResetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, themedStyles.modalContent(theme)]}>
            <Text style={[styles.modalTitle, themedStyles.text(theme)]}>{t('resetSettings')}</Text>
            <Text style={[styles.modalText, themedStyles.modalText(theme)]}>{t('resetSettingsConfirmation')}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setResetModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={resetSettings}
              >
                <Text style={styles.modalButtonText}>{t('confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginLeft: 16 },
  scrollContainer: { flex: 1 },
  settingsSection: { marginTop: 16, marginHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, marginLeft: 8 },
  sectionContent: { borderRadius: 8, overflow: 'hidden' },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingsItemLeft: { flexDirection: 'row', alignItems: 'center' },
  settingsText: { marginLeft: 16, fontSize: 16 },
  inputItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  inputIcon: { marginRight: 16 },
  textInput: { flex: 1, fontSize: 16, paddingVertical: 10 },
  saveButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: { width: '80%', borderRadius: 10, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalText: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: { flex: 1, paddingVertical: 10, borderRadius: 5, alignItems: 'center', marginHorizontal: 5 },
  cancelButton: { backgroundColor: '#aaa' },
  confirmButton: { backgroundColor: '#d9534f' },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

const themedStyles = {
  container: (theme) => ({ backgroundColor: theme === 'dark' ? '#121212' : '#f8f9fa' }),
  header: (theme) => ({
    backgroundColor: theme === 'dark' ? '#1f1f1f' : '#ffffff',
    borderBottomColor: theme === 'dark' ? '#333' : '#eee',
  }),
  text: (theme) => ({ color: theme === 'dark' ? '#ffffff' : '#000000' }),
  sectionContent: (theme) => ({ backgroundColor: theme === 'dark' ? '#1f1f1f' : '#ffffff' }),
  borderBottom: (theme) => ({ borderBottomColor: theme === 'dark' ? '#333' : '#eee' }),
  iconColor: (theme) => (theme === 'dark' ? '#aaa' : '#555'),
  chevronColor: (theme) => (theme === 'dark' ? '#777' : '#aaa'),
  textInput: (theme) => ({
    color: theme === 'dark' ? '#ffffff' : '#000000',
    backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0',
    borderRadius: 5,
    paddingHorizontal: 10,
  }),
  placeholderColor: (theme) => (theme === 'dark' ? '#888' : '#999'),
  buttonBackground: (theme) => (theme === 'dark' ? '#3498db' : '#007bff'),
  modalContent: (theme) => ({ backgroundColor: theme === 'dark' ? '#2c2c2c' : '#ffffff' }),
  modalText: (theme) => ({ color: theme === 'dark' ? '#ccc' : '#333' }),
};