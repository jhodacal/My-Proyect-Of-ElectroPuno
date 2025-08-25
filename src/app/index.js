import React, { useState, useEffect, useRef } from "react";
import {StatusBar ,Animated,ScrollView,View,Text,ImageBackground, TouchableOpacity,Alert,Platform,KeyboardAvoidingView,BackHandler, TextInput, Dimensions, StyleSheet} from "react-native";
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useTheme } from '../herramientasDeLaApp/ThemeContext';
import SideMenu from '../PantallasSecundarias/SideMenu/SideMenu.tsx';
import ChatBot from '../PantallasSecundarias/chatbot/ChatBot';
import { useLanguage } from '../herramientasDeLaApp/LanguageContext';
import AnimatedCarousel from './AnimatedCarousel';

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Estilos para el componente HomeScreen/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const { width, height } = Dimensions.get('window');
 
const styles = StyleSheet.create({
  // Estilos de AuthScreen integrados
  container: {flex: 1,height: '110%'},
  backgroundImage: {flex: 1,width: '100%',height: '100%',position: 'absolute',marginTop: 0 },
  overlay: {flex: 1, justifyContent: 'center',alignItems: 'center',paddingHorizontal: 20, },
  //inicio de estilos de login y registro
  contentContainer: {
    width: '110%',
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
    marginBottom: 80,
    marginTop:0,
    paddingTop:0,
  },
    logoTextEmoji: {
      marginTop: 20,
    fontSize: 50,
    fontWeight: 'bold',
    color: '#00FFFF',
    textAlign: 'center',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  logoText1: {
    position: 'absolute',
    fontSize: 55,
    fontWeight: 'bold',
    color: '#00FFFF',
    textAlign: 'center',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
    logoText2: {
    position: 'absolute',
    fontSize: 44,
    fontWeight: 'bold',
    color: '#00FFFF',
    textAlign: 'center',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginTop: 50,
  },
  logoSubtext: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 30,
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
    fontSize: 14, // Reduced font size to fit smaller buttons
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    flexShrink: 1, // Allow text to shrink if needed
    flexWrap: 'wrap', // Allow text to wrap to the next line
    paddingHorizontal: 5,
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

  // Estilos originales para la pantalla principal
  ajustes: {
    flex: 1,
    padding: 20,
    marginLeft: 200,
    marginBottom: 450,
    borderWidth: 10,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10
  },
  image: {
    height: "100%",
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    resizeMode: "cover"
  },
  button: {
    shadowOpacity: 0.8,
    elevation: 10,
    marginTop: 30,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 500
  },
  dashboardContainer: {
    justifyContent: "center",
    alignItems: "center"
  },
  title1: {
    alignItems:"center",
    fontStyle:"italic",
    fontSize: 60,
    top: 50,
    marginRight: 10,
    marginLeft:10,
    fontWeight: "bold",
    position: "absolute",
    textAlign: "center"
  },
  title2: {
    alignItems:"center",
    fontStyle:"italic",
    fontSize: 60,
    top: 120,
    marginRight: 10,
    marginLeft:10,
    fontWeight: "bold",
    position: "absolute",
    textAlign: "center"
  },
headerwelcome: {
  
  marginTop:20,
  alignSelf: 'center',
  paddingVertical: 15,
  paddingHorizontal: 60,
  shadowColor: '#00d4ff',
  shadowOffset: { width: 0, height: 8 },
  shadowRadius: 20,
  elevation: 15,
},


headerGradientwelcome: {
  
  paddingVertical: 15,
  paddingHorizontal: 0,
  borderRadius: 25,
  alignSelf: 'center',
},


welcomeText: {
  fontSize: 40,
  fontWeight: 'bold',
  color: '#00d4ff',
  textAlign: 'center',
  textShadowColor: '#00d4ff',
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 10,
},

  recoverButton: {
    backgroundColor: 'orange',
    marginTop: 10,
    borderRadius: 6,
    padding: 10
  },
  buttonContainer: {
    flexDirection: 'row', // Change to row for multi-column
    flexWrap: 'wrap', // Allow buttons to wrap to the next row
    justifyContent: 'space-between', // Space buttons evenly
    paddingHorizontal: 10, // Add padding to the container
    alignItems: 'center',
  },
  squareButton: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15, // Reduced margin for better spacing
    marginHorizontal: 5, // Add horizontal margin for spacing between columns
    borderRadius: 15,
    flexDirection: 'row',
    width: (width - 40) / 2, // Divide screen width for two columns, accounting for padding
  },
  recoverButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  menuButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 100,
    padding: 10,
    borderRadius: 20,
    elevation: 3,
  },

  letra: {
    color:"grey"
  },
  closeButton: {
    position: 'absolute',
    top: 1,
    right: 1,
    zIndex: 1
  },
  themeSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingLeft: 30
  },
  buttonIcon: {
    marginRight: 3,
    marginLeft: 10,
  },

});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Definición actualizada de ventanas con traducciones, con colores e íconos para cada boton de ventana///////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const ventanas = [
  { number: 1, titleKey: 'consumo en tiempo real', color: '#3498db', icon: 'electric-bolt' },
  { number: 2, titleKey: 'Analisis de Consumo', color: '#065828ff', icon: 'show-chart' },
  { number: 3, titleKey: 'Historial de Consumo', color: '#e74c3c', icon: 'history' },
  { number: 4, titleKey: 'Comparaciones y Tendencias  ', color: '#9b59b6', icon: 'compare' },
  { number: 5, titleKey: 'Diagnosticos y Mantenimiento', color: '#40d916ff', icon: 'build' },
  { number: 6, titleKey: 'Alertas y Notificaciones', color: '#f39c12', icon: 'notifications' }, 
  { number: 9, titleKey: 'configuración', color: '#34495e', icon: 'settings' },

];




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Componente VentanaButton con navegacion de ventanas////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const VentanaButton = ({ number, titleKey, color, icon }) => {
  const router = useRouter();
  const { t } = useLanguage();
  const handlePress = () => {
    const routeMap = { /* Mapeo de números a rutas específicas */ };
    if (routeMap[number]) {
      router.push(routeMap[number]);
    } else {
      router.push(`./Ventana${number}`);
    }
  };
  return (
    <TouchableOpacity style={[styles.squareButton, { backgroundColor: color }]} onPress={handlePress}>
      <Icon name={icon} size={30} color="white" style={styles.buttonIcon} />
      <Text style={[styles.buttonText, { color: 'white' }]}>{t(titleKey)}</Text>
    </TouchableOpacity>
  )
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Funcion de la pantalla principal HomeScreen, que contiene el estado de la aplicacion, el manejo de login, registro, recuperacion de contraseña y el menu lateral con chat bot//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function HomeScreen() {
 
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  // Estados para autenticación
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'recovery'
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usernameDisplay, setUsernameDisplay] = useState("");

  // Estados para login
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
    showPassword: false,
  });

  // Estados para registro
  const [registerData, setRegisterData] = useState({
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

  // Estados para recuperación
  const [recoveryData, setRecoveryData] = useState({
    dni: '',
    token: '',
    newPassword: '',
    confirmPassword: '',
    showPassword: false,
    step: 1,
  });

  const [menuVisible, setMenuVisible] = useState(false);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const textColorStyle = { color: theme === 'dark' ? '#fff' : '#26dd12'};
  
  // Estado para datos de usuario
  const [userData, setUserData] = useState({
    email: '',
    phone: '',
    loading: false,
    error: null
  });

  // Función para buscar datos de usuario
  const BuscarDatosDeUsuario = async (username) => {
    setUserData(prev => ({...prev, loading: true, error: null}));
    try {
      const response = await fetch('http://10.10.7.245:4000/user-data', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username } )
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al obtener datos');
      setUserData({
        email: data.email || '',
        phone: data.phone || '',
        loading: false,
        error: null
      });
    } catch (error) {
      setUserData(prev => ({...prev, loading: false, error: error.message || 'Error de conexión'}));
    }
  };

  // Función para actualizar datos de usuario
  const updateUserData = async (username, newEmail, newPhone) => {
    setUserData(prev => ({...prev, loading: true, error: null}));
    try {
      const response = await fetch('http://10.10.7.245:4000/update-user-data', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username, email: newEmail, phone: newPhone } )
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al actualizar datos');
      setUserData({ email: data.email, phone: data.phone, loading: false, error: null });
      Alert.alert(t('success'), data.message || 'Datos actualizados correctamente');
      return true;
    } catch (error) {
      setUserData(prev => ({ ...prev, loading: false, error: error.message }));
      Alert.alert('Error', error.message || 'No se pudieron actualizar los datos');
      return false;
    }
  };
useEffect(() => {
  StatusBar.setHidden(true, 'fade');
  return () => {
    // Cleanup opcional para restaurar si sales de la pantalla
  };
}, []);

  // Función de login
  const handleLogin = async () => {
    const { username, password } = loginData;
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('http://10.10.7.245:4000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: username.trim( ), password: password.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem('loginUsername', username.trim());
        await AsyncStorage.setItem('isLoggedIn', 'true');
        setUsernameDisplay(username.trim());
        Alert.alert('Bienvenido', `Hola, ${username.trim()}`);
        setIsLoggedIn(true);
        setLoginData({ username: '', password: '', showPassword: false });
        await BuscarDatosDeUsuario(username.trim());
      } else {
        Alert.alert('Error', data.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setIsLoading(false);
    }
  };

// (Continuación del código anterior...)

  // Función de registro
  const handleRegister = async () => {
    const { name, lastnamePaterno, lastnameMaterno, dni, email, phone, username, password, confirmPassword, termsAccepted } = registerData;

    if (!name || !lastnamePaterno || !lastnameMaterno || !dni || !email || !phone || !username || !password || !confirmPassword) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    if (!termsAccepted) {
      Alert.alert('Error', 'Debes aceptar los términos y condiciones');
      return;
    }
    if (!/^\d{8}$/.test(dni)) {
      Alert.alert('Error', 'El DNI debe tener 8 dígitos');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
      return;
    }
    if (!/^\d{9}$/.test(phone)) {
      Alert.alert('Error', 'Por favor ingresa un número de celular válido');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://10.10.7.245:4000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          lastnamePaterno,
          lastnameMaterno,
          dni,
          email,
          phone,
          username,
          password,
        } ),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Éxito', 'Usuario registrado exitosamente');
        setCurrentView('login');
        setRegisterData({ // Limpiar formulario
          name: '', lastnamePaterno: '', lastnameMaterno: '', dni: '', email: '', phone: '',
          username: '', password: '', confirmPassword: '', showPassword: false,
          showConfirmPassword: false, termsAccepted: false,
        });
      } else {
        Alert.alert('Error', data.message || 'Error en el registro');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para solicitar token de recuperación
  const handleRecoveryRequest = async () => {
    if (!/^\d{8}$/.test(recoveryData.dni)) {
      Alert.alert('Error', 'El DNI debe tener 8 dígitos');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('http://10.10.7.245:4000/recover-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni: recoveryData.dni } ),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Éxito', data.message);
        setRecoveryData(prev => ({ ...prev, step: 2 }));
      } else {
        Alert.alert('Error', data.message || 'Error al solicitar recuperación');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para actualizar contraseña
  const handlePasswordUpdate = async () => {
    const { dni, token, newPassword, confirmPassword } = recoveryData;
    if (!token || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('http://10.10.7.245:4000/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, token, newPassword } ),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Éxito', 'Contraseña actualizada exitosamente');
        setCurrentView('login');
        setRecoveryData({ // Limpiar formulario
          dni: '', token: '', newPassword: '', confirmPassword: '',
          showPassword: false, step: 1,
        });
      } else {
        Alert.alert('Error', data.message || 'Error al actualizar contraseña');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect para animaciones y estado de login
  useEffect(() => {
    // Animaciones de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    // Animación de pulso
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    );
    pulseAnimation.start();

    // Animación de brillo
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 3000, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 3000, useNativeDriver: false }),
      ])
    );
    glowAnimation.start();

    // Cargar estado de login
    const loadLoginState = async () => {
      const storedLogin = await AsyncStorage.getItem('isLoggedIn');
      if (storedLogin === 'true') {
        const username = await AsyncStorage.getItem('loginUsername');
        if (username) {
          setUsernameDisplay(username);
          setIsLoggedIn(true);
          await BuscarDatosDeUsuario(username);
        }
      }
    };
    loadLoginState();

    return () => {
      pulseAnimation.stop();
      glowAnimation.stop();
    };
  }, [fadeAnim, slideAnim, pulseAnim, glowAnim]);

  // useEffect para manejar botón de retroceso
  useEffect(() => {
    const backAction = () => {
      if (isLoggedIn) {
        BackHandler.exitApp();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [isLoggedIn]);

  // Renderizar formulario de login
  const renderLoginForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>INICIAR SESIÓN</Text>
      <Text style={styles.subtitle}>Accede a tu cuenta</Text>
      <View style={styles.inputContainer}>
        <Icon name="person" size={20} color="#00FFFF" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Usuario"
          placeholderTextColor="#666"
          value={loginData.username}
          onChangeText={(text) => setLoginData(prev => ({ ...prev, username: text }))}
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color="#00FFFF" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#666"
          value={loginData.password}
          onChangeText={(text) => setLoginData(prev => ({ ...prev, password: text }))}
          secureTextEntry={!loginData.showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setLoginData(prev => ({ ...prev, showPassword: !prev.showPassword }))} style={styles.eyeButton}>
          <Icon name={loginData.showPassword ? "visibility-off" : "visibility"} size={20} color="#00FFFF" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={[styles.primaryButton, isLoading && styles.disabledButton]} onPress={handleLogin} disabled={isLoading}>
        <LinearGradient colors={['#00FFFF', '#0080FF', '#8000FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
          <Text style={styles.buttonText}>{isLoading ? 'INICIANDO...' : 'INICIAR SESIÓN'}</Text>
        </LinearGradient>
      </TouchableOpacity>
      <View style={styles.linkContainer}>
        <TouchableOpacity onPress={() => setCurrentView('recovery')}><Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setCurrentView('register')}><Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text></TouchableOpacity>
      </View>
    </View>
  );

  // Renderizar formulario de registro
  const renderRegisterForm = () => (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>REGISTRO</Text>
        <Text style={styles.subtitle}>Crea tu cuenta</Text>
        {/* Inputs para nombre, apellidos, dni, email, etc. */}
        <View style={styles.inputContainer}><Icon name="person" size={20} color="#00FFFF" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Nombre" placeholderTextColor="#666" value={registerData.name} onChangeText={(text) => setRegisterData(prev => ({ ...prev, name: text }))} /></View>
        <View style={styles.inputContainer}><Icon name="person" size={20} color="#00FFFF" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Apellido Paterno" placeholderTextColor="#666" value={registerData.lastnamePaterno} onChangeText={(text) => setRegisterData(prev => ({ ...prev, lastnamePaterno: text }))} /></View>
        <View style={styles.inputContainer}><Icon name="person" size={20} color="#00FFFF" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Apellido Materno" placeholderTextColor="#666" value={registerData.lastnameMaterno} onChangeText={(text) => setRegisterData(prev => ({ ...prev, lastnameMaterno: text }))} /></View>
        <View style={styles.inputContainer}><Icon name="credit-card" size={20} color="#00FFFF" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="DNI" placeholderTextColor="#666" value={registerData.dni} onChangeText={(text) => setRegisterData(prev => ({ ...prev, dni: text }))} keyboardType="numeric" maxLength={8} /></View>
        <View style={styles.inputContainer}><Icon name="email" size={20} color="#00FFFF" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Correo Electrónico" placeholderTextColor="#666" value={registerData.email} onChangeText={(text) => setRegisterData(prev => ({ ...prev, email: text }))} keyboardType="email-address" autoCapitalize="none" /></View>
        <View style={styles.inputContainer}><Icon name="phone" size={20} color="#00FFFF" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Número de Celular" placeholderTextColor="#666" value={registerData.phone} onChangeText={(text) => setRegisterData(prev => ({ ...prev, phone: text }))} keyboardType="phone-pad" maxLength={9} /></View>
        <View style={styles.inputContainer}><Icon name="account-circle" size={20} color="#00FFFF" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Usuario" placeholderTextColor="#666" value={registerData.username} onChangeText={(text) => setRegisterData(prev => ({ ...prev, username: text }))} autoCapitalize="none" /></View>
        <View style={styles.inputContainer}><Icon name="lock" size={20} color="#00FFFF" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Contraseña" placeholderTextColor="#666" value={registerData.password} onChangeText={(text) => setRegisterData(prev => ({ ...prev, password: text }))} secureTextEntry={!registerData.showPassword} autoCapitalize="none" /><TouchableOpacity onPress={() => setRegisterData(prev => ({ ...prev, showPassword: !prev.showPassword }))} style={styles.eyeButton}><Icon name={registerData.showPassword ? "visibility-off" : "visibility"} size={20} color="#00FFFF" /></TouchableOpacity></View>
        <View style={styles.inputContainer}><Icon name="lock" size={20} color="#00FFFF" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Confirmar Contraseña" placeholderTextColor="#666" value={registerData.confirmPassword} onChangeText={(text) => setRegisterData(prev => ({ ...prev, confirmPassword: text }))} secureTextEntry={!registerData.showConfirmPassword} autoCapitalize="none" /><TouchableOpacity onPress={() => setRegisterData(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))} style={styles.eyeButton}><Icon name={registerData.showConfirmPassword ? "visibility-off" : "visibility"} size={20} color="#00FFFF" /></TouchableOpacity></View>
        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRegisterData(prev => ({ ...prev, termsAccepted: !prev.termsAccepted }))}>
          <View style={[styles.checkbox, registerData.termsAccepted && styles.checkboxChecked]}>{registerData.termsAccepted && (<Icon name="check" size={16} color="#000" />)}</View>
          <Text style={styles.checkboxText}>Acepto los términos y condiciones</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.primaryButton, isLoading && styles.disabledButton]} onPress={handleRegister} disabled={isLoading}>
          <LinearGradient colors={['#00FFFF', '#0080FF', '#8000FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
            <Text style={styles.buttonText}>{isLoading ? 'REGISTRANDO...' : 'REGISTRAR'}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCurrentView('login')}><Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });
  // Renderizar formulario de recuperación
  const renderRecoveryForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>RECUPERAR CONTRASEÑA</Text>
      <Text style={styles.subtitle}>{recoveryData.step === 1 ? 'Ingresa tu DNI' : 'Ingresa el código y nueva contraseña'}</Text>
      {recoveryData.step === 1 ? (
        <>
          <View style={styles.inputContainer}><Icon name="credit-card" size={20} color="#00FFFF" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="DNI" placeholderTextColor="#666" value={recoveryData.dni} onChangeText={(text) => setRecoveryData(prev => ({ ...prev, dni: text }))} keyboardType="numeric" maxLength={8} /></View>
          <TouchableOpacity style={[styles.primaryButton, isLoading && styles.disabledButton]} onPress={handleRecoveryRequest} disabled={isLoading}>
            <LinearGradient colors={['#00FFFF', '#0080FF', '#8000FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
              <Text style={styles.buttonText}>{isLoading ? 'ENVIANDO...' : 'ENVIAR CÓDIGO'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.inputContainer}><Icon name="vpn-key" size={20} color="#00FFFF" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Código de recuperación" placeholderTextColor="#666" value={recoveryData.token} onChangeText={(text) => setRecoveryData(prev => ({ ...prev, token: text }))} autoCapitalize="none" /></View>
          <View style={styles.inputContainer}><Icon name="lock" size={20} color="#00FFFF" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Nueva contraseña" placeholderTextColor="#666" value={recoveryData.newPassword} onChangeText={(text) => setRecoveryData(prev => ({ ...prev, newPassword: text }))} secureTextEntry={!recoveryData.showPassword} autoCapitalize="none" /><TouchableOpacity onPress={() => setRecoveryData(prev => ({ ...prev, showPassword: !prev.showPassword }))} style={styles.eyeButton}><Icon name={recoveryData.showPassword ? "visibility-off" : "visibility"} size={20} color="#00FFFF" /></TouchableOpacity></View>
          <View style={styles.inputContainer}><Icon name="lock" size={20} color="#00FFFF" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Confirmar nueva contraseña" placeholderTextColor="#666" value={recoveryData.confirmPassword} onChangeText={(text) => setRecoveryData(prev => ({ ...prev, confirmPassword: text }))} secureTextEntry={!recoveryData.showPassword} autoCapitalize="none" /></View>
          <TouchableOpacity style={[styles.primaryButton, isLoading && styles.disabledButton]} onPress={handlePasswordUpdate} disabled={isLoading}>
            <LinearGradient colors={['#00FFFF', '#0080FF', '#8000FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
              <Text style={styles.buttonText}>{isLoading ? 'ACTUALIZANDO...' : 'ACTUALIZAR CONTRASEÑA'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity onPress={() => setCurrentView('login')}><Text style={styles.linkText}>Volver al inicio de sesión</Text></TouchableOpacity>
    </View>
  );

  // Retorna el frontend con todas las funcionalidades
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
       <StatusBar
    barStyle="light-content"
    backgroundColor={Platform.OS === 'android' ? '#0f0f23' : 'transparent'}
    translucent={Platform.OS === 'android' ? true : false}
  />
      {!isLoggedIn ? (
        <ImageBackground source={require('../Imagenes/FondosDePantalla/circuit_bg (1).jpg')} style={styles.backgroundImage} resizeMode="cover">
          <LinearGradient colors={['rgba(0,0,0,0.8)', 'rgba(0,0,50,0.6)', 'rgba(0,0,0,0.8)']} style={styles.overlay}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoTextEmoji}>⚡                  ⚡</Text>
              <Text style={[styles.logoText1, { color: theme === 'dark' ? '#fcfcfcff' : '#044ff3ff' }]}>Pioneros</Text>
              <Text style={[styles.logoText2, { color: theme === 'dark' ? '#fcfcfcff' : '#044ff3ff' }]}>GreenWare</Text>
              <Text style={styles.logoSubtext}>SISTEMA DE AUTENTICACIÓN</Text>
            </View>
            <Animated.View style={[styles.contentContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: pulseAnim }] }]}>
              <BlurView intensity={20} style={styles.blurContainer}>
                <Animated.View style={[styles.glowContainer, { shadowOpacity: glowAnim }]}>
                  {currentView === 'login' && renderLoginForm()}
                  {currentView === 'register' && renderRegisterForm()}
                  {currentView === 'recovery' && renderRecoveryForm()}
                </Animated.View>
              </BlurView>
            </Animated.View>
          </LinearGradient>
        </ImageBackground>
      ) : (
        <View style={styles.container}>
          <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }} style={styles.image} />
          <Text style={[styles.title1, { color: theme === 'dark' ? '#fcfcfcff' : '#1dcfeaff' }]}>{t('   Pioneros' )}</Text>
          <Text style={[styles.title2, { color: theme === 'dark' ? '#fcfcfcff' : '#1dcfeaff' }]}>{t('  GreenWare')}</Text>
          <TouchableOpacity style={[styles.menuButton, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]} onPress={() => setMenuVisible(true)}>
            <Icon name="menu" size={30} color={theme === 'dark' ? '#fff' : '#000'} />
          </TouchableOpacity>
          
         

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ backgroundColor: theme === 'dark' ? '#0f0f23' : '#f0f0f0' }} showsVerticalScrollIndicator={false}>
          

           <Animated.View style={[styles.headerwelcome, { shadowOpacity: glowOpacity }]}>
                   <LinearGradient
                     colors={[theme === 'dark' ? '#030632ff' : '#4371e6ff', '#4e9aadff']}
                     style={styles.headerGradientwelcome}
                   > 
            <Text style={[styles.welcomeText, textColorStyle]}>{t('bienvenido', { username: usernameDisplay })}</Text>
                </LinearGradient >
                </Animated.View>

            <AnimatedCarousel />
            <Animated.View style={[styles.buttonContainer, { transform: [{ translateY: slideAnim }] }]}>
              {ventanas.map((ventana) => (
                <VentanaButton key={ventana.number} number={ventana.number} titleKey={ventana.titleKey} color={ventana.color} icon={ventana.icon} />
              ))}
            </Animated.View>
            
          </ScrollView>
          
          <SideMenu
            isVisible={menuVisible}
            onClose={() => setMenuVisible(false)}
            username={usernameDisplay}
            email={userData.email}
            phone={userData.phone}
            loading={userData.loading}
            error={userData.error}
            onUpdate={async (newEmail, newPhone) => await updateUserData(usernameDisplay, newEmail, newPhone)}
            onLogout={async () => {
              await AsyncStorage.multiRemove(['isLoggedIn', 'loginUsername']);
              setIsLoggedIn(false);
              setUsernameDisplay("");s
            }}
          />
          <ChatBot />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

export default HomeScreen;
