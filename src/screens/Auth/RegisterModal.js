import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function RegisterModal({ visible, onClose, handleRegister }) {
  const [name, setName] = useState("");
  const [lastnamePaterno, setLastnamePaterno] = useState("");
  const [lastnameMaterno, setLastnameMaterno] = useState("");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleRegisterForm = () => {
    try {
      // Validación de las contraseñas
      if (password !== passwordRepeat) {
        alert("Las contraseñas no coinciden.");
        return;
      }
  
      // Validación de aceptación de términos
      if (!termsAccepted) {
        alert("Debes aceptar los términos y condiciones.");
        return;
      }
  
      // Validación de correo electrónico
      if (!email.includes("@")) {
        alert("Por favor ingresa un correo electrónico válido.");
        return;
      }
  
      // Validación de número de celular
      if (!phone.match(/^\d{9}$/)) {
        alert("Por favor ingresa un número de celular válido.");
        return;
      }
  
      // Crear el objeto de datos
      const userData = { name, lastnamePaterno, lastnameMaterno, dni, email, phone, username, password };
      
      // Mostrar los datos en la consola
      console.log("Datos enviados al servidor:", userData); // ✅ VERIFICACIÓN
      
      // Llamar a la función handleRegister
      handleRegister(userData);
    } catch (error) {
      // Si ocurre un error, mostrarlo en la consola
      console.error("Error al registrar:", error);
    }
  };
  

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Registro</Text>
          <TextInput style={styles.input} placeholder="Nombre" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Apellido Paterno" value={lastnamePaterno} onChangeText={setLastnamePaterno} />
          <TextInput style={styles.input} placeholder="Apellido Materno" value={lastnameMaterno} onChangeText={setLastnameMaterno} />
          <TextInput style={styles.input} placeholder="DNI" value={dni} onChangeText={setDni} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Correo Electrónico" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <TextInput style={styles.input} placeholder="Número de Celular" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextInput style={styles.input} placeholder="Usuario" value={username} onChangeText={setUsername} autoCapitalize="none"/>
          <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} autoCapitalize="none"/>
          <TextInput style={styles.input} placeholder="Repetir Contraseña" secureTextEntry value={passwordRepeat} onChangeText={setPasswordRepeat} autoCapitalize="none"/>
          
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setTermsAccepted(!termsAccepted)}
            >
            <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]} />
            <Text style={{ marginLeft: 8 }}>Acepto los términos y condiciones</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleRegisterForm}>
            <Text style={styles.buttonText}>Registrar</Text>
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
  button: { backgroundColor: '#007bff', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8, marginTop: 10 },
  closeButton: { backgroundColor: '#d9534f', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  recoveryText: { color: '#007bff', textAlign: 'center', marginTop: 10 },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 4,
    alignItems: 'center'
  },
  checkboxChecked: {
    backgroundColor: '#007bff',
    alignItems: 'left'
  },
});
