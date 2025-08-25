import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Animated,
  Dimensions,
  StyleSheet,
  Alert,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';


const { width, height } = Dimensions.get('window');

const RecoverPasswordScreen = ({ route }) => {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: DNI, 2: Token y nueva contraseña
  const [isLoading, setIsLoading] = useState(false);
  const [dni, setDni] = useState(route?.params?.dni || '');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const electricAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Animación eléctrica continua
    const electricAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(electricAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(electricAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    );
    electricAnimation.start();

    // Animación de rotación
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    return () => {
      electricAnimation.stop();
      rotateAnimation.stop();
    };
  }, []);

  const handleRequestToken = async () => {
    if (!/^\d{8}$/.test(dni)) {
      Alert.alert('Error', 'El DNI debe tener 8 dígitos');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://10.10.7.245:4000/recover-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dni }),
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('Éxito', data.message);
        setStep(2);
        // Animación de transición
        Animated.sequence([
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Alert.alert('Error', data.message || 'Error al solicitar recuperación');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
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
        Alert.alert(
          'Éxito',
          'Contraseña actualizada exitosamente',
          [
            {
              text: 'OK',
              onPress: () => router.replace(
                {
                  pathname: '/',
                }
              ),
            },
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'Error al actualizar contraseña');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Animated.View
          style={[
            styles.electricIcon,
            {
              transform: [
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Icon name="flash-on" size={60} color="#FFD700" />
        </Animated.View>
      </View>

      <Text style={styles.stepTitle}>RECUPERACIÓN DE CONTRASEÑA</Text>
      <Text style={styles.stepSubtitle}>
        Ingresa tu DNI para recibir un código de recuperación
      </Text>

      <View style={styles.inputContainer}>
        <Icon name="credit-card" size={24} color="#00FFFF" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu DNI"
          placeholderTextColor="#888"
          value={dni}
          onChangeText={setDni}
          keyboardType="numeric"
          maxLength={8}
        />
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, isLoading && styles.disabledButton]}
        onPress={handleRequestToken}
        disabled={isLoading}
      >
        <LinearGradient
          colors={['#FFD700', '#FF8C00', '#FF4500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'ENVIANDO...' : 'ENVIAR CÓDIGO'}
          </Text>
          <Icon name="send" size={20} color="#FFF" style={styles.buttonIcon} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Animated.View
          style={[
            styles.electricIcon,
            {
              shadowOpacity: electricAnim,
            },
          ]}
        >
          <Icon name="vpn-key" size={60} color="#00FF00" />
        </Animated.View>
      </View>

      <Text style={styles.stepTitle}>NUEVA CONTRASEÑA</Text>
      <Text style={styles.stepSubtitle}>
        Ingresa el código recibido y tu nueva contraseña
      </Text>

      <View style={styles.inputContainer}>
        <Icon name="vpn-key" size={24} color="#00FFFF" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Código de recuperación"
          placeholderTextColor="#888"
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock" size={24} color="#00FFFF" style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Nueva contraseña"
          placeholderTextColor="#888"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeButton}
        >
          <Icon
            name={showPassword ? "visibility-off" : "visibility"}
            size={24}
            color="#00FFFF"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock" size={24} color="#00FFFF" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Confirmar nueva contraseña"
          placeholderTextColor="#888"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, isLoading && styles.disabledButton]}
        onPress={handleUpdatePassword}
        disabled={isLoading}
      >
        <LinearGradient
          colors={['#00FF00', '#00CC00', '#009900']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'ACTUALIZANDO...' : 'ACTUALIZAR CONTRASEÑA'}
          </Text>
          <Icon name="check-circle" size={20} color="#FFF" style={styles.buttonIcon} />
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => setStep(1)}
      >
        <Text style={styles.secondaryButtonText}>Volver atrás</Text>
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
        source={{ uri: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2013&q=80' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.9)', 'rgba(25,0,50,0.7)', 'rgba(0,0,0,0.9)']}
          style={styles.overlay}
        >
          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <BlurView intensity={30} style={styles.blurContainer}>
              <Animated.View
                style={[
                  styles.glowContainer,
                  {
                    shadowOpacity: electricAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 0.8],
                    }),
                  },
                ]}
              >
                {step === 1 ? renderStep1() : renderStep2()}
              </Animated.View>
            </BlurView>
          </Animated.View>

          {/* Partículas eléctricas animadas */}
          <Animated.View
            style={[
              styles.particle1,
              {
                opacity: electricAnim,
                transform: [
                  {
                    translateX: electricAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 50],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.particle2,
              {
                opacity: electricAnim,
                transform: [
                  {
                    translateY: electricAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -30],
                    }),
                  },
                ],
              },
            ]}
          />
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
  },
  blurContainer: {
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
  },
  glowContainer: {
    padding: 40,
    shadowColor: '#00FFFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 25,
    elevation: 25,
  },
  stepContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  electricIcon: {
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 20,
    elevation: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderWidth: 2,
    borderColor: 'rgba(0,255,255,0.4)',
    width: '100%',
    shadowColor: '#00FFFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  inputIcon: {
    marginRight: 15,
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
    borderRadius: 20,
    marginVertical: 20,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  gradientButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  buttonIcon: {
    marginLeft: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  secondaryButton: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#00FFFF',
    backgroundColor: 'rgba(0,255,255,0.1)',
  },
  secondaryButtonText: {
    color: '#00FFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  particle1: {
    position: 'absolute',
    top: '20%',
    right: '10%',
    width: 4,
    height: 4,
    backgroundColor: '#00FFFF',
    borderRadius: 2,
    shadowColor: '#00FFFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 10,
    elevation: 10,
  },
  particle2: {
    position: 'absolute',
    bottom: '30%',
    left: '15%',
    width: 6,
    height: 6,
    backgroundColor: '#FFD700',
    borderRadius: 3,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 15,
    elevation: 15,
  },
});

export default RecoverPasswordScreen;