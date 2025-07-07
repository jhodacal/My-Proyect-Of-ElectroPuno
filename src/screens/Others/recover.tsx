import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function RecoverPasswordScreen() {
  const router = useRouter();
  const { dni, token: initialToken } = useLocalSearchParams();
  const [token, setToken] = useState(initialToken || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validaciones mejoradas
    const validations = [
      { condition: !token, message: 'Ingresa el token recibido' },
      { condition: !newPassword || !confirmPassword, message: 'Completa ambos campos de contraseña' },
      { condition: newPassword !== confirmPassword, message: 'Las contraseñas no coinciden' },
      { condition: newPassword.length < 6, message: 'La contraseña debe tener al menos 6 caracteres' }
    ];

    const error = validations.find(v => v.condition);
    if (error) return Alert.alert('Error', error.message);

    setLoading(true);
    try {
      const response = await fetch('http://192.168.1.7:4000/update-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          dni,
          newPassword,
          token 
        })
      });

      // Manejo mejorado de la respuesta
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          `Error ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      
      if (data.success) {
        Alert.alert(
          'Éxito', 
          'Contraseña actualizada correctamente',
          [{ text: 'OK', onPress: () => router.replace('/') }]
        );
      } else {
        throw new Error(data.message || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      Alert.alert(
        'Error', 
        error.message || 'Error de conexión con el servidor',
        [{ text: 'Reintentar', onPress: () => setLoading(false) }]
      );
    } finally {
      if (!loading) setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restablecer Contraseña</Text>
      <Text style={styles.subtitle}>Para el DNI: {dni}</Text>

      <TextInput
        style={styles.input}
        placeholder="Token recibido por correo"
        value={token}
        onChangeText={setToken}
        autoCapitalize="none"
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Nueva contraseña (mín. 6 caracteres)"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Procesando...' : 'Cambiar Contraseña'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});