import React, { useState, useEffect, useRef } from 'react';
import {View, Text, TextInput, TouchableOpacity, ImageBackground,Animated, Dimensions, StyleSheet, Alert,StatusBar, Platform, KeyboardAvoidingView, ScrollView} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../herramientasDeLaApp/LanguageContext';

const { width, height } = Dimensions.get('window');

const AuthScreen = ({ navigation }) => {
  const [currentView, setCurrentView] = useState("login"); // 'login', 'register', 'recovery'
  const [isLoading, setIsLoading] = useState(false);
  const { t, setLanguage, language } = useLanguage();

  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("appLanguage");
        if (savedLanguage && savedLanguage !== language) {
          setLanguage(savedLanguage);
        }
      } catch (error) {
        console.error("Error loading saved language in AuthScreen:", error);
      }
    };
    loadSavedLanguage();
  }, [setLanguage, language]);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Animación de pulso continua
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Animación de brillo continua
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    );
    glowAnimation.start();

    return () => {
      pulseAnimation.stop();
      glowAnimation.stop();
    };
  }, []);
  const handleLogin = async () => {
    if (!loginData.username || !loginData.password) {
      Alert.alert(t('error'), t('complete_all_fields'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://10.10.7.245:4000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: loginData.username,
          password: loginData.password,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        await AsyncStorage.setItem('loginUsername', loginData.username);
        await AsyncStorage.setItem('isLoggedIn', 'true');
        Alert.alert(t('welcome'), `${t('hello')}, ${loginData.username}`);
        navigation.replace('Home');
      } else {
        Alert.alert(t('error'), data.error || t('invalid_credentials'));
      }
    } catch (error) {
      Alert.alert(t('error'), t('connection_error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar registro
  const handleRegister = async () => {
    const { name, lastnamePaterno, lastnameMaterno, dni, email, phone, username, password, confirmPassword, termsAccepted } = registerData;

    if (!name || !lastnamePaterno || !lastnameMaterno || !dni || !email || !phone || !username || !password || !confirmPassword) {
      Alert.alert(t('error'), t('complete_all_fields'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('error'), t('passwords_not_match'));
      return;
    }

    if (!termsAccepted) {
      Alert.alert(t('error'), t('accept_terms'));
      return;
    }

    if (!/^\d{8}$/.test(dni)) {
      Alert.alert(t('error'), t('dni_8_digits'));
      return;
    }

    if (!email.includes('@')) {
      Alert.alert(t('error'), t('valid_email'));
      return;
    }

    if (!/^\d{9}$/.test(phone)) {
      Alert.alert(t('error'), t('valid_phone'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://10.10.7.245:4000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          lastnamePaterno,
          lastnameMaterno,
          dni,
          email,
          phone,
          username,
          password,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert(t('success'), t('registration_success'));
        setCurrentView('login');
        setRegisterData({
          name: '',
          lastnamePaterno: '',
          lastnameMaterno: '',
          dni: '',
          email: '',
          phone: '',
          username: '',
          password: '',
          confirmPassword: '',
          showPassword: false,
          showConfirmPassword: false,
          termsAccepted: false,
        });
      } else {
        Alert.alert(t('error'), data.message || t('registration_error'));
      }
    } catch (error) {
      Alert.alert(t('error'), t('connection_error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Función para solicitar token de recuperación
  const handleRecoveryRequest = async () => {
    if (!/^\d{8}$/.test(recoveryData.dni)) {
      Alert.alert(t('error'), t('dni_8_digits'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://10.10.7.245:4000/recover-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dni: recoveryData.dni }),
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert(t('success'), data.message);
        setRecoveryData(prev => ({ ...prev, step: 2 }));
      } else {
        Alert.alert(t('error'), data.message || t('recovery_error'));
      }
    } catch (error) {
      Alert.alert(t('error'), t('connection_error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Función para actualizar contraseña
  const handlePasswordUpdate = async () => {
    const { dni, token, newPassword, confirmPassword } = recoveryData;

    if (!token || !newPassword || !confirmPassword) {
      Alert.alert(t('error'), t('complete_all_fields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('error'), t('passwords_not_match'));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t('error'), t('password_min_length'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://10.10.7.245:4000/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dni,
          token,
          newPassword,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert(t('success'), t('password_updated'));
        setCurrentView('login');
        setRecoveryData({
          dni: '',
          token: '',
          newPassword: '',
          confirmPassword: '',
          showPassword: false,
          step: 1,
        });
      } else {
        Alert.alert(t('error'), data.message || t('update_error'));
      }
    } catch (error) {
      Alert.alert(t('error'), t('connection_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>{t('login').toUpperCase()}</Text>
      <Text style={styles.subtitle}>{t('access_account')}</Text>

      <View style={styles.inputContainer}>
        <Icon name="person" size={20} color="#00FFFF" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={t('username')}
          placeholderTextColor="#666"
          value={loginData.username}
          onChangeText={(text) => setLoginData(prev => ({ ...prev, username: text }))}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color="#00FFFF" style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder={t('password')}
          placeholderTextColor="#666"
          value={loginData.password}
          onChangeText={(text) => setLoginData(prev => ({ ...prev, password: text }))}
          secureTextEntry={!loginData.showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          onPress={() => setLoginData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
          style={styles.eyeButton}
        >
          <Icon
            name={loginData.showPassword ? "visibility-off" : "visibility"}
            size={20}
            color="#00FFFF"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, isLoading && styles.disabledButton]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <LinearGradient
          colors={['#00FFFF', '#0080FF', '#8000FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={styles.buttonText}>
            {isLoading ? t('logging_in').toUpperCase() + '...' : t('login').toUpperCase()}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.linkContainer}>
        <TouchableOpacity onPress={() => setCurrentView('recovery')}>
          <Text style={styles.linkText}>{t('forgot_password')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCurrentView('register')}>
          <Text style={styles.linkText}>{t('no_account_register')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRegisterForm = () => (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>{t('register').toUpperCase()}</Text>
        <Text style={styles.subtitle}>{t('create_account')}</Text>

        <View style={styles.inputContainer}>
          <Icon name="person" size={20} color="#00FFFF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={t('name')}
            placeholderTextColor="#666"
            value={registerData.name}
            onChangeText={(text) => setRegisterData(prev => ({ ...prev, name: text }))}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="person" size={20} color="#00FFFF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={t('paternal_surname')}
            placeholderTextColor="#666"
            value={registerData.lastnamePaterno}
            onChangeText={(text) => setRegisterData(prev => ({ ...prev, lastnamePaterno: text }))}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="person" size={20} color="#00FFFF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={t('maternal_surname')}
            placeholderTextColor="#666"
            value={registerData.lastnameMaterno}
            onChangeText={(text) => setRegisterData(prev => ({ ...prev, lastnameMaterno: text }))}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="credit-card" size={20} color="#00FFFF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={t('dni')}
            placeholderTextColor="#666"
            value={registerData.dni}
            onChangeText={(text) => setRegisterData(prev => ({ ...prev, dni: text }))}
            keyboardType="numeric"
            maxLength={8}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="email" size={20} color="#00FFFF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={t('email')}
            placeholderTextColor="#666"
            value={registerData.email}
            onChangeText={(text) => setRegisterData(prev => ({ ...prev, email: text }))}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="phone" size={20} color="#00FFFF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={t('phone')}
            placeholderTextColor="#666"
            value={registerData.phone}
            onChangeText={(text) => setRegisterData(prev => ({ ...prev, phone: text }))}
            keyboardType="phone-pad"
            maxLength={9}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="account-circle" size={20} color="#00FFFF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={t('username')}
            placeholderTextColor="#666"
            value={registerData.username}
            onChangeText={(text) => setRegisterData(prev => ({ ...prev, username: text }))}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#00FFFF" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder={t('password')}
            placeholderTextColor="#666"
            value={registerData.password}
            onChangeText={(text) => setRegisterData(prev => ({ ...prev, password: text }))}
            secureTextEntry={!registerData.showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setRegisterData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
            style={styles.eyeButton}
          >
            <Icon
              name={registerData.showPassword ? "visibility-off" : "visibility"}
              size={20}
              color="#00FFFF"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#00FFFF" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder={t('confirm_password')}
            placeholderTextColor="#666"
            value={registerData.confirmPassword}
            onChangeText={(text) => setRegisterData(prev => ({ ...prev, confirmPassword: text }))}
            secureTextEntry={!registerData.showConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setRegisterData(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
            style={styles.eyeButton}
          >
            <Icon
              name={registerData.showConfirmPassword ? "visibility-off" : "visibility"}
              size={20}
              color="#00FFFF"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setRegisterData(prev => ({ ...prev, termsAccepted: !prev.termsAccepted }))}
        >
          <View style={[styles.checkbox, registerData.termsAccepted && styles.checkboxChecked]}>
            {registerData.termsAccepted && (
              <Icon name="check" size={16} color="#000" />
            )}
          </View>
          <Text style={styles.checkboxText}>{t('accept_terms_conditions')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.disabledButton]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['#00FFFF', '#0080FF', '#8000FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>
              {isLoading ? t('registering').toUpperCase() + '...' : t('register').toUpperCase()}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setCurrentView('login')}>
          <Text style={styles.linkText}>{t('have_account_login')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderRecoveryForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>{t('recover_password').toUpperCase()}</Text>
      <Text style={styles.subtitle}>
        {recoveryData.step === 1 ? t('enter_dni') : t('enter_code_new_password')}
      </Text>

      {recoveryData.step === 1 ? (
        <>
          <View style={styles.inputContainer}>
            <Icon name="credit-card" size={20} color="#00FFFF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('dni')}
              placeholderTextColor="#666"
              value={recoveryData.dni}
              onChangeText={(text) => setRecoveryData(prev => ({ ...prev, dni: text }))}
              keyboardType="numeric"
              maxLength={8}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.disabledButton]}
            onPress={handleRecoveryRequest}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#00FFFF', '#0080FF', '#8000FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>
                {isLoading ? t('sending').toUpperCase() + '...' : t('send_code').toUpperCase()}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.inputContainer}>
            <Icon name="vpn-key" size={20} color="#00FFFF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('recovery_code')}
              placeholderTextColor="#666"
              value={recoveryData.token}
              onChangeText={(text) => setRecoveryData(prev => ({ ...prev, token: text }))}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#00FFFF" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder={t('new_password')}
              placeholderTextColor="#666"
              value={recoveryData.newPassword}
              onChangeText={(text) => setRecoveryData(prev => ({ ...prev, newPassword: text }))}
              secureTextEntry={!recoveryData.showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setRecoveryData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
              style={styles.eyeButton}
            >
              <Icon
                name={recoveryData.showPassword ? "visibility-off" : "visibility"}
                size={20}
                color="#00FFFF"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#00FFFF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('confirm_new_password')}
              placeholderTextColor="#666"
              value={recoveryData.confirmPassword}
              onChangeText={(text) => setRecoveryData(prev => ({ ...prev, confirmPassword: text }))}
              secureTextEntry={!recoveryData.showPassword}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.disabledButton]}
            onPress={handlePasswordUpdate}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#00FFFF', '#0080FF', '#8000FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>
                {isLoading ? t('updating').toUpperCase() + '...' : t('update_password').toUpperCase()}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={() => setCurrentView('login')}>
        <Text style={styles.linkText}>{t('back_to_login')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'rgba(0,0,50,0.6)', 'rgba(0,0,0,0.8)']}
          style={styles.overlay}
        >
          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: pulseAnim },
                ],
              },
            ]}
          >
            <BlurView intensity={20} style={styles.blurContainer}>
              <Animated.View
                style={[
                  styles.glowContainer,
                  {
                    shadowOpacity: glowAnim,
                  },
                ]}
              >
                <View style={styles.logoContainer}>
                  <Text style={styles.logoText}>⚡ {t('electro_space')} ⚡</Text>
                  <Text style={styles.logoSubtext}>{t('authentication_system')}</Text>
                </View>

                {currentView === 'login' && renderLoginForm()}
                {currentView === 'register' && renderRegisterForm()}
                {currentView === 'recovery' && renderRecoveryForm()}
              </Animated.View>
            </BlurView>
          </Animated.View>
        </LinearGradient>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  glowContainer: {
    padding: 30,
    shadowColor: '#00FFFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 20,
    elevation: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FFFF',
    textAlign: 'center',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  logoSubtext: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.8,
  },
  formContainer: {
    alignItems: 'center',
  },
  scrollContainer: {
    maxHeight: height * 0.7,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
    width: '100%',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 15,
  },
  eyeButton: {
    padding: 5,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 15,
    marginVertical: 15,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  disabledButton: {
    opacity: 0.6,
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    color: '#00FFFF',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 5,
    textDecorationLine: 'underline',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    width: '100%',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#00FFFF',
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#00FFFF',
  },
  checkboxText: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
});

export default AuthScreen;