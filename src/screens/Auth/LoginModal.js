import React from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';

;
export default function LoginModal({ visible, onClose, username, setUsername, password, setPassword, showPassword, setShowPassword, handleLogin }) {
   
const handleUsernameChange = (text) => {
    // Permite espacios durante la escritura
    setUsername(text);
  };

  const handleUsernameBlur = () => {
    // Elimina espacios al final solo cuando el campo pierde el foco (si fue autocompletado)
    setUsername(prev => prev.trim());
  };

  const handleUsernameSubmit = () => {
    // Elimina espacios al final al presionar "enter"
    setUsername(prev => prev.trim());
  };
  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Inicio de sesión</Text>
         <TextInput 
            style={styles.input}
            placeholder="Usuario"
            placeholderTextColor="#999"
            value={username}
            onChangeText={handleUsernameChange}
            onBlur={handleUsernameBlur}
            autoCapitalize="none"
            autoComplete="username"
            autoCorrect={false}
            onSubmitEditing={handleUsernameSubmit}
            textContentType="username" // iOS
            importantForAutofill="no" // Android
            inputMode="text"
          />
          
          {/* Campo Contraseña */}
          <View style={styles.passwordContainer}>
           <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Contraseña"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              textContentType="none"
              importantForAutofill="no"
              keyboardType="default"
              passwordRules="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? "eye-slash" : "eye"} size={20} color="gray" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.buttonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
  modalContent: { width: 300, padding: 20, backgroundColor: "#fff", borderRadius: 10 },
  modalTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, borderRadius: 5 },
  passwordContainer: { flexDirection: "row", alignItems: "center" },
  button: { backgroundColor: '#007bff', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8, marginTop: 10 },
  closeButton: { backgroundColor: '#d9534f', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' }
});
