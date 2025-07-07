import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

interface VentanaButtonProps {
  number: number;
  title: string;
  color: string;
}

const VentanaButton: React.FC<VentanaButtonProps> = ({ number, title, color }) => {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const buttonWidth = screenWidth * 0.9;

  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: color, width: buttonWidth }]}
      onPress={() => router.push(`./Ventana${number}`)}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 20,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default VentanaButton;