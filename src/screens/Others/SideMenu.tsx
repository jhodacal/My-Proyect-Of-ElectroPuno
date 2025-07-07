import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../utils/ThemeContext';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../../utils/LanguageContext';
import { useTranslation } from 'react-i18next';
import handleNotifications from '../../app/Settings/NotificationSystem';

interface SideMenuProps {
  isVisible: boolean;
  onClose: () => void;
  username: string;
  email?: string;
  phone?: string;
  loading?: boolean;
  error?: string | null;
  onUpdate?: (email: string, phone: string) => Promise<boolean>;
}

const SideMenu: React.FC<SideMenuProps> = ({ 
  isVisible, 
  onClose, 
  username,
  email, 
  phone, 
  loading,
  error,
  onUpdate
}) => {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { language, setLanguage, availableLanguages } = useLanguage();
  const { t, i18n } = useTranslation(); // Usar directamente useTranslation
  const [editMode, setEditMode] = useState(false);
  const [editedPhone, setEditedPhone] = useState(phone || '');
  const [editedEmail, setEditedEmail] = useState(email || '');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Actualizar campos cuando cambian las props
  useEffect(() => {
    setEditedPhone(phone || '');
    setEditedEmail(email || '');
  }, [phone, email]);

  const handleLogout = async () => {
    try{ 
    await AsyncStorage.removeItem('isLoggedIn');
     await AsyncStorage.removeItem('loginUsername');
    router.replace('./');
    } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }

  };
  
  // Validación de email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    setEmailError(isValid ? null : t('invalidEmailFormat'));
    return isValid;
  };

  // Validación de teléfono
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{9,15}$/;
    const isValid = phoneRegex.test(phone);
    setPhoneError(isValid ? null : t('phoneDigitsRequired'));
    return isValid;
  };
  
  const updateProfile = async () => {
    // Validar campos antes de enviar
    const isEmailValid = validateEmail(editedEmail);
    const isPhoneValid = validatePhone(editedPhone);
    
    if (!isEmailValid || !isPhoneValid) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Usar la función onUpdate proporcionada desde el componente padre
      if (onUpdate) {
        const success = await onUpdate(editedEmail, editedPhone);
        
        if (success) {
          // Guardar en AsyncStorage para persistencia local
          await AsyncStorage.setItem('userEmail', editedEmail);
          await AsyncStorage.setItem('userPhone', editedPhone);
          
          setEditMode(false);
          Alert.alert(t('success'), t('profileUpdatedSuccessfully'));
        }
      } else {
        throw new Error(t('updateFunctionNotAvailable'));
      }
    } catch (error) {
      Alert.alert(t('error'), Error.name || t('couldNotUpdateProfile'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para cambiar el idioma
const changeLanguage = async (lang: string) => {
  try {
    console.log(`Attempting to change language to: ${lang}`);
    await setLanguage(lang);
    console.log(`Language changed to: ${lang} from SideMenu`);
    setTimeout(() => {
      onClose();
    }, 500);
  } catch (error) {
    console.error(`Error changing language to ${lang}:`, error);
  }
}

  if (!isVisible) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Icon name="close" size={30} color={theme === 'dark' ? '#fff' : '#000'} />
      </TouchableOpacity>

      <View style={styles.profileSection}>
        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} 
          style={styles.profileImage} 
        />
        <Text style={[styles.username, { color: theme === 'dark' ? '#fff' : '#000' }]}>{username}</Text>
      </View>

    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={true} contentContainerStyle={styles.scrollContent}>

      <View style={styles.menuSection}>
        {/* Perfil */}
        <View style={styles.menuItem}>
          <Text style={[styles.menuTitle, { color: theme === 'dark' ? '#fff' : '#000' }]}>{t('myProfile')}</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3498db" />
              <Text style={[styles.loadingText, { color: theme === 'dark' ? '#ccc' : '#666' }]}>
                {t('loadingData')}
              </Text>
            </View>
          ) : editMode ? (
            <>
              <View style={styles.editField}>
                <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>{t('phone')}:</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { color: theme === 'dark' ? '#fff' : '#000', borderColor: phoneError ? '#e74c3c' : theme === 'dark' ? '#555' : '#ddd' }
                  ]}
                  value={editedPhone}
                  onChangeText={(text) => {
                    setEditedPhone(text);
                    if (phoneError) validatePhone(text);
                  }}
                  keyboardType="phone-pad"
                  placeholder={t('enterYourPhone')}
                  placeholderTextColor={theme === 'dark' ? '#888' : '#aaa'}
                />
                {phoneError && <Text style={styles.errorText}>{phoneError}</Text>}
              </View>
              <View style={styles.editField}>
                <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>{t('email')}:</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { color: theme === 'dark' ? '#fff' : '#000', borderColor: emailError ? '#e74c3c' : theme === 'dark' ? '#555' : '#ddd' }
                  ]}
                  value={editedEmail}
                  onChangeText={(text) => {
                    setEditedEmail(text);
                    if (emailError) validateEmail(text);
                  }}
                  keyboardType="email-address"
                  placeholder={t('enterYourEmail')}
                  placeholderTextColor={theme === 'dark' ? '#888' : '#aaa'}
                />
                {emailError && <Text style={styles.errorText}>{emailError}</Text>}
              </View>
              <View style={styles.buttonGroup}>
                <TouchableOpacity 
                  style={[styles.saveButton, isSubmitting && styles.disabledButton]} 
                  onPress={updateProfile}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>{t('save')}</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => {
                    setEditMode(false);
                    setEditedPhone(phone || '');
                    setEditedEmail(email || '');
                    setEmailError(null);
                    setPhoneError(null);
                  }}
                  disabled={isSubmitting}
                >
                  <Text style={styles.buttonText}>{t('cancel')}</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.profileInfo, { color: theme === 'dark' ? '#ccc' : '#666' }]}>
                {t('phone')}: {phone || t('notRegistered')}
              </Text>
              <Text style={[styles.profileInfo, { color: theme === 'dark' ? '#ccc' : '#666' }]}>
                {t('email')}: {email || t('notRegistered')}
              </Text>
              {error && (
                <Text style={styles.errorText}>{t('error')}: {error}</Text>
              )}
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => setEditMode(true)}
              >
                <Icon name="edit" size={20} color="#3498db" />
                <Text style={[styles.editText, { color: '#3498db' }]}>{t('edit')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Configuración */}
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => {  onClose();
            router.push('../../Ventana9');
          }}
        >
          <Icon name="settings" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
          <Text style={[styles.menuText, { color: theme === 'dark' ? '#fff' : '#000' }]}>        {t('settings')}</Text>
        </TouchableOpacity>
        
        {/* Idioma */}
        <View style={styles.menuItem}>
          <Icon name="language" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
          <Text style={[styles.menuText, { color: theme === 'dark' ? '#fff' : '#000' }]}>        {t('language')}</Text>
          <View style={styles.languageButtons}>
            <TouchableOpacity 
              style={[styles.langButton, language === 'es' && styles.activeLang]}
              onPress={() => changeLanguage('es')}
            >
              <Text style={styles.langText}>ES</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.langButton, language === 'en' && styles.activeLang]}
              onPress={() => changeLanguage('en')}
            >
              <Text style={styles.langText}>EN</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.langButton, language === 'qu' && styles.activeLang]}
              onPress={() => changeLanguage('qu')}
            >
              <Text style={styles.langText}>QU</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.langButton, language === 'ay' && styles.activeLang]}
              onPress={() => changeLanguage('ay')}
            >
              <Text style={styles.langText}>AY</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Medios de pago */}
        <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              onClose();
              router.push('./../Settings/PaymentMethods');
            }}
          >
            <Icon name="payment" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
            <Text style={[styles.menuText, { color: theme === 'dark' ? '#fff' : '#000' }]}>        {t('paymentMethods')}</Text>
          </TouchableOpacity>

        <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              onClose();
              router.push('../../Settings/QRTrasactions');
            }}
          >
            <Icon name="qr-code" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
            <Text style={[styles.menuText, { color: theme === 'dark' ? '#fff' : '#000' }]}>        {t('qrTransactions')}</Text>
          
          </TouchableOpacity>

          {/* Notificaciones */}
          <TouchableOpacity style={styles.menuItem} onPress={() => {  onClose();
            router.push('../../Settings/ventanaNotificacionesOnly'); }}>
            <Icon name="notifications" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
            
            <Text style={[styles.menuText, { color: theme === 'dark' ? '#fff' : '#000' }]}>        {t('notifications')}</Text>
            {notificationCount > 0 && (
            <TouchableOpacity 
              style={styles.notificationBadge}
              onPress={handleNotifications}
            >
              <Text style={styles.notificationCount}>{notificationCount}</Text>
            </TouchableOpacity>
          )}
          </TouchableOpacity>

          {/* Ayuda */}
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="help" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
            <Text style={[styles.menuText, { color: theme === 'dark' ? '#fff' : '#000' }]}>        {t('help')}</Text>
          </TouchableOpacity>
          {/* Acerca de */}
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="info" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
            <Text style={[styles.menuText, { color: theme === 'dark' ? '#fff' : '#000' }]}>        {t('about')}</Text>
          </TouchableOpacity>

          {/* Términos y condiciones */}
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="description" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
            <Text style={[styles.menuText, { color: theme === 'dark' ? '#fff' : '#000' }]}>        {t('termsAndConditions')}</Text>
          </TouchableOpacity>

          {/* Política de privacidad */}
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="security" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
            <Text style={[styles.menuText, { color: theme === 'dark' ? '#fff' : '#000' }]}>        {t('privacy')}</Text>
          </TouchableOpacity>
        {/* Cerrar sesión */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: theme === 'dark' ? '#d9534f' : '#e74c3c' }]}
          onPress={handleLogout}
        >
          <Icon name="exit-to-app" size={24} color="#fff" />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </View>
  </ScrollView>
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '80%',
    height: '100%',
    zIndex: 1000,
    padding: 20,
    elevation: 5,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // Estilos para notificaciones
    notificationBadge: {
      position: 'absolute',
      top: 45,
      right: 15,
      backgroundColor: 'red',
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 101,
    },
    notificationCount: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
    },
  menuSection: {
    width: '100%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
 
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 10,
    marginTop:-22
  },
  profileInfo: {
    fontSize: 14,
    marginVertical: 5,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  editText: {
    marginLeft: 5,
    fontSize: 14,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
  },
  editField: {
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  saveButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  languageButtons: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'flex-end',
  },
  langButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0',
  },
  activeLang: {
    backgroundColor: '#3498db',
  },
  langText: {
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 20,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default SideMenu;

