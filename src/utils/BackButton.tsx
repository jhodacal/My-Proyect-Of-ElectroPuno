// components/BackButton.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface BackButtonProps {
  tintColor?: string;
  size?: number;
  onPress?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  tintColor = '#3498db', 
  size = 24,
  onPress
}) => {
  return (
    <TouchableOpacity 
      style={styles.button}
      onPress={onPress}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
    >
      <Icon name="arrow-back" size={size} color={tintColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    marginLeft: 0,
    borderRadius: 20,
  }
});

export default BackButton;