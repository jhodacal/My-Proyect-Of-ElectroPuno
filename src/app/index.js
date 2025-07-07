import React, { useState, useEffect, useRef } from "react";
import {Animated,ImageBackground, ScrollView, View, Text, Image, TouchableOpacity, Alert, BackHandler, TextInput, Dimensions,} from "react-native";
import LoginModal from "../screens/Auth/LoginModal";
import RegisterModal from "../screens/Auth/RegisterModal";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useTheme } from '../utils/ThemeContext';
import { StyleSheet } from 'react-native';
import SideMenu from '../screens/Others/SideMenu';
import ChatBot from '../screens/Others/ChatBot';
import { useLanguage } from 'C:/Users/amigo/Downloads/PROYECTO PYTHON/PROYECTOS CON REACT NATIVE/MyApp/src/utils/LanguageContext'; // Importar el contexto de idioma



// Definición actualizada de ventanas con traducciones
const ventanas = [
  { number: 1, titleKey: 'consumo en tiempo real', color: '#3498db', icon: 'electric-bolt' },
  { number: 2, titleKey: 'Analisis de Consumo', color: '#2ecc71', icon: 'show-chart' },
  { number: 3, titleKey: 'Historial de Consumo', color: '#e74c3c', icon: 'history' },
  { number: 4, titleKey: 'Comparaciones y Tendencias  ', color: '#9b59b6', icon: 'compare' },
  { number: 5, titleKey: 'Diagnosticos y Mantenimiento', color: '#9b59b6', icon: 'build' },
  { number: 6, titleKey: 'Alertas y Notificaciones', color: '#f39c12', icon: 'notifications' },
  { number: 7, titleKey: 'Pagos por QR', color: '#1abc9c', icon: 'qr-code' },
  { number: 8, titleKey: 'proveedores', color: '#1abc9c', icon: 'local-shipping' },
  { number: 9, titleKey: 'configuración', color: '#34495e', icon: 'settings' },
  { number:10, titleKey: 'Ayuda', color: '#7f8c8d', icon: 'help' },
  ];
  
const styles = StyleSheet.create({
  ajustes: { flex: 1, padding: 20, marginLeft: 200, marginBottom: 450,borderWidth: 10, borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
  container: { flex: 1, alignItems: "center",alignContent: "center", backgroundColor:"black"  },
  image: {  height: 200, width: 200, position: "absolute", top: 220, left: '50%',marginLeft: -100 },
  button: {  backgroundColor: '#007bff', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8, marginTop: 500 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  dashboardContainer: { justifyContent: "center", alignItems: "center" },
  title: { alignItems:"center",backgroundSize:"red",fontStyle:"italic", fontSize: 50, top: 50, fontWeight: "bold", color: "skyblue", position: "absolute" },
  welcomeText: {  marginTop: 50, fontSize: 50, fontWeight: "bold", marginBottom: 20,  textAlign: 'center' },
  recoverButton: { backgroundColor: 'orange', marginTop: 10, borderRadius: 6, padding: 10 },
  buttonContainer: { flexDirection: "column",paddingBottom: 20 ,alignItems: "center"},
  input: { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6, width: 200, textAlign: 'center',color: '#000'},
  squareButton: {height: 100, justifyContent: "center", alignItems: "center", marginVertical: 20, borderRadius: 30,flexDirection: 'row',width: 360},
  linkText: { color: "#1E90FF", textDecorationLine: "underline", fontSize: 14 },
  recoverButtonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  menuButton: {position: 'absolute',top: 50,left: 20,zIndex: 100,padding: 10,borderRadius: 20,elevation: 3,},
  letra:{color:"grey"},
  closeButton: { position: 'absolute', top: 1, right: 1, zIndex: 1 },
  themeSwitchContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10, paddingLeft: 30 },
  buttonIcon: {marginRight: 10},
  // Estilos para el selector de idioma
  languageSelector: {position: 'absolute',top: 50,right: 20,zIndex: 100,flexDirection: 'row',backgroundColor: 'rgba(0,0,0,0.1)',borderRadius: 20,padding: 5,},
  languageButton: {paddingHorizontal: 10,paddingVertical: 5,borderRadius: 15,marginHorizontal: 2,},
  activeLanguage: {backgroundColor: '#3498db'},
  languageText: {fontWeight: 'bold', },  
  
});

// Componente VentanaButton actualizado con soporte para traducciones
const VentanaButton = ({ number, titleKey, color, icon }) => {
    const router = useRouter();
    const { theme } = useTheme();
    const { t } = useLanguage(); // Usar el hook de idioma
    const handlePress = () => {
            // Mapeo de números a rutas específicas para las nuevas ventanas
      const routeMap = { 
        1: '../../Ventana1', 
        2: '../../Ventana2', 
        3: '../../Ventana3',
        4: '../../Ventana4', 
        5: '../../Ventana5',
        6: '../../Ventana6',
        7: '../../Ventana7',
        8: '../../Ventana8',
        9: '../../Ventana9',
        10: '../../AlertasConfiguracion',};
            // Si es una de las nuevas ventanas, usar la ruta específica
            if (routeMap[number]) { router.push(routeMap[number]);} 
            else {  router.push(`./Ventana${number}`);}  };
    return (
              <TouchableOpacity style={[styles.squareButton, { backgroundColor: color }]} onPress={handlePress}>
                  <Icon name={icon} size={30} color="white" style={styles.buttonIcon} />
                  <Text style={[styles.buttonText, { color: 'white' }]}>{t(titleKey)}</Text>
              </TouchableOpacity>);
  };
  
function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t} = useLanguage(); // Usar el hook de idioma
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [recoveryDni, setRecoveryDni] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const colorScheme = useColorScheme();
  const slideAnim = useRef(new Animated.Value(100)).current;
  const [usernameDisplay, setUsernameDisplay] = useState("");
  const screenWidth = Dimensions.get('window').width;
  const horizontalScrollViewPadding = 16;
  const itemWidth = screenWidth - (horizontalScrollViewPadding * 2);
  
  const stylescontainer = { flex: 1, alignItems: "center", backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0', };
  const textColorStyle = { color: theme === 'dark' ? '#fff' : '#000'};
  const linkColorStyle = { color: theme === 'dark' ? '#1E90FF' : '#1E90FF' };
  // Estado para notificaciones
  const [userData, setUserData] = useState({ email: '',   phone: '',  loading: false,  error: null });

  const fetchUserData = async (username) => {setUserData(prev => ({...prev, loading: true, error: null}));
      try {console.log('Obteniendo datos para:', username); // Log de depuración
          const response = await fetch('http://192.168.1.7:4000/user-data', {
          method: 'POST', headers: {'Content-Type': 'application/json',},
          body: JSON.stringify({ username })
          });
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Respuesta no JSON:', text);
          throw new Error(`Error del servidor: ${text.substring(0, 100)}`);
         }
      const data = await response.json();
      console.log('Datos recibidos:', data); // Log de depuración
      if (!response.ok || !data.success) {throw new Error(data.error || 'Error al obtener datos');}
      setUserData({ email: data.email || '', phone: data.phone || '', loading: false,  error: null });} 
      catch (error) {console.error('Error en fetchUserData:', error);
      setUserData(prev => ({
        ...prev, loading: false, error: error.message || 'Error de conexión'  })); } };
  // Función mejorada para actualizar datos
  const updateUserData = async (username, newEmail, newPhone) => {
    setUserData(prev => ({...prev, loading: true, error: null}));
    
    try {
      console.log('Enviando actualización:', { username, newEmail, newPhone }); // Log de depuración
        const response = await fetch('http://192.168.1.7:4000/update-user-data', {
        method: 'POST', headers: {'Content-Type': 'application/json', },
        body: JSON.stringify({ username,email: newEmail,phone: newPhone }) });
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Respuesta no JSON:', text);
        throw new Error(`Error del servidor: ${text.substring(0, 100)}`);
      }
      const data = await response.json();
      console.log('Respuesta del servidor:', data); // Log de depuración
      if (!response.ok || !data.success) {throw new Error(data.error || 'Error al actualizar datos');}
      // Actualizar el estado local con los datos confirmados por el servidor
      setUserData({ email: data.email, phone: data.phone,loading: false,error: null});
      Alert.alert('Éxito', data.message || 'Datos actualizados correctamente');
      return true;
    } catch (error) {
      console.error('Error en updateUserData:', error);
      setUserData(prev => ({ ...prev, loading: false,error: error.message }));
      Alert.alert('Error', error.message || 'No se pudieron actualizar los datos');
      return false;
    }
  };
    // Estilos dinámicos

  useEffect(() => { if (isLoggedIn) { Animated.timing(slideAnim, {toValue: 0, duration: 500,useNativeDriver: true, }).start();}}, [isLoggedIn]);
  useEffect(() => {
      const loadLoginState = async () => {
      const storedLogin = await AsyncStorage.getItem('isLoggedIn');
      if (storedLogin === 'true') {setIsLoggedIn(true);
        const username = await AsyncStorage.getItem('loginUsername');
        if (username) setUsernameDisplay(username); } };
    loadLoginState(); }, []);

  useEffect(() => {const backAction = () => { if (isLoggedIn) { BackHandler.exitApp(); return true;}
      return false; };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove(); }, [isLoggedIn]);

  const handleLogin = async () => { if (!loginUsername || !loginPassword) {
      Alert.alert("Error", t('pleaseCompleteAllFields')); return; }
    try {
      const response = await fetch("http://192.168.1.7:4000/login", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ usuario: loginUsername, password: loginPassword }), });

      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem('loginUsername', loginUsername);
        await AsyncStorage.setItem('isLoggedIn', 'true');
        setUsernameDisplay(loginUsername);
        Alert.alert(t('welcome'), `${t('hello')}, ${loginUsername}`);
        setIsLoggedIn(true);
        setLoginModalVisible(false);
        setLoginUsername("");
        setLoginPassword("");
        console.log('Obteniendo datos adicionales...');
        await fetchUserData(loginUsername);} 
        else { Alert.alert(t('error'), data.error || t('incorrectCredentials'));}} 
        catch (error) {Alert.alert(t('error'), t('couldNotConnectToServer')); } };

  const handleRegister = async (formData) => {
    const { name, lastnamePaterno, lastnameMaterno, dni, email, phone, username, password } = formData;
    if (!name || !lastnamePaterno || !lastnameMaterno || !dni || !email || !phone || !username || !password) {
      Alert.alert(t('error'), t('allFieldsRequired')); return; }
    try { const response = await fetch("http://192.168.1.7:4000/register", {
              method: "POST", headers: { "Content-Type": "application/json" },   body: JSON.stringify(formData), });
      const data = await response.json();
      if (response.ok) {Alert.alert(t('success'), t('userRegisteredSuccessfully'));
        setRegisterModalVisible(false);} 
      else {Alert.alert(t('error'), data.message || t('registrationError'));}} 
      catch (error) { Alert.alert(t('error'), t('couldNotConnectToServer')); } };
  const handleRecovery = async () => {
    if (!/^\d{8}$/.test(recoveryDni)) {Alert.alert(t('error'), t('dniMustHave8Digits'));return; }
    try {const response = await fetch('http://192.168.1.7:4000/recover-password', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },body: JSON.stringify({ dni: recoveryDni }) });
      const data = await response.json();
      if (!response.ok) { throw new Error(data.message || t('requestError')); }
      Alert.alert(t('success'),  data.message, [{ text: 'OK', onPress: () => router.push(`/recover?dni=${recoveryDni}`) }]); } 
      catch (error) {console.error('Error completo:', error);
      Alert.alert(t('error'), error.message || t('couldNotCompleteRequest')); }};



  

  // Función para cambiar el idioma
  return (
  
    <View style= {styles.container} >
          <Text style={[styles.title, { color: theme === 'dark' ? '#fff' : '#f0f0f0' }]}> {t('Electro Puno')}  </Text>
          <Image 
              source={{ uri: "https://play-lh.googleusercontent.com/DYqaWw8yc736ZEBR39J3pL6DvEDxKxM66LZ-Nc240OwpCWICFogJj7eH80Ls4EgveLE=w600-h300-pc0xffffff-pd" }} 
              style={styles.image}  />
          {!isLoggedIn ? (
            <>
              <TouchableOpacity  style={[styles.button, { marginTop: 500 }]} onPress={() => setLoginModalVisible(true)} >
                  <Text style={styles.buttonText}>{t('Iniciar_sesión')}</Text>
              </TouchableOpacity>
              
              <View style={{ marginTop: 30 }}>
                  <Text style={[styles.letra, { marginBottom: 8 }, {marginLeft:20}]}>{t('Olvidaste_contraseña?')} </Text>
                  <TextInput placeholder={t('Ingresa_tu_DNI')} value={recoveryDni} onChangeText={setRecoveryDni} style={styles.input} 
                    keyboardType="numeric" placeholderTextColor="#999"
                  />
                  <TouchableOpacity style={styles.recoverButton} onPress={handleRecovery}>
                      <Text style={styles.recoverButtonText}>{t('Recuperar_Contraseña')}</Text>
                  </TouchableOpacity>
              </View>
              
              <View style={{ flexDirection: 'row', marginTop: 30 }}>
                  <Text style={styles.letra}>{t('no tienes cuenta?')} </Text>
                  <Text style={[styles.linkText, linkColorStyle]} onPress={() => setRegisterModalVisible(true)}>
                    {t('Registrate Aquí')}
                  </Text>
              </View>
            </>
      ) : (
            <>
              <TouchableOpacity style={[styles.menuButton, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]} onPress={() => setMenuVisible(true)}>
                    <Icon name="menu" size={30} color={theme === 'dark' ? '#fff' : '#000'} />
              </TouchableOpacity>   
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{  padding: horizontalScrollViewPadding,backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0'}} showsVerticalScrollIndicator={false} >
                    <Text style={[styles.welcomeText, textColorStyle]}> {t('bienvenido', { username: usernameDisplay })} </Text>
                    <Animated.View style={[styles.buttonContainer, { transform: [{ translateY: slideAnim }] }]}>
                      {ventanas.map((ventana) => ( <VentanaButton key={ventana.number} number={ventana.number} titleKey={ventana.titleKey} color={ventana.color} icon={ventana.icon}/>))}
                    </Animated.View>
              </ScrollView>
              <SideMenu isVisible={menuVisible}
                        onClose={() => setMenuVisible(false)}
                        username={usernameDisplay}
                        email={userData.email}
                        phone={userData.phone}
                        loading={userData.loading}
                        error={userData.error}
                        onUpdate={async (newEmail, newPhone) => {const success = await updateUserData(usernameDisplay, newEmail, newPhone);
                                                                return success; }}
                onLogout={async () => { await AsyncStorage.removeItem('isLoggedIn');  setIsLoggedIn(false);}} />
              <ChatBot />
            </>
      )}

      <LoginModal
        visible={loginModalVisible}
        onClose={() => setLoginModalVisible(false)}
        username={loginUsername}
        setUsername={setLoginUsername}
        password={loginPassword}
        setPassword={setLoginPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        handleLogin={handleLogin}
      />

      <RegisterModal
        visible={registerModalVisible}
        onClose={() => setRegisterModalVisible(false)}
        handleRegister={handleRegister}
      />
    </View>
 
  );
}

export default HomeScreen;