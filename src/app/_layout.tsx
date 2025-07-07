import { Stack } from 'expo-router';
import { useTheme } from 'C:/Users/amigo/Downloads/PROYECTO PYTHON/PROYECTOS CON REACT NATIVE/MyApp/src/utils/ThemeContext';
import { View, StyleSheet } from 'react-native';
import { ThemeProvider } from '../utils/ThemeContext';
import { LanguageProvider } from '../utils/LanguageContext';
import { I18nextProvider } from 'react-i18next';
import i18next from '../utils/i18n';

export default function Layout() {
  const { theme } = useTheme();

  const dynamicStyles = {
    container: {
      color: theme === 'dark' ? '#fff' : '#000',
      flex: 1
    },
  };
  
  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      flex: 1
    },
  });

  return (
    <ThemeProvider> 
      <I18nextProvider i18n={i18next}>
        <LanguageProvider>
          <View style={[styles.header, dynamicStyles.container]}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="recover" options={{ title: 'Recuperar Contraseña', headerShown: false }} />
              <Stack.Screen name="Ventana1" options={{title: 'consumo en tiempo Real ', headerShown: false}}  />
              <Stack.Screen name="Ventana2" options={{title: 'analisis de consumo', headerShown: false, }}  />
              <Stack.Screen name="Ventana3" options={{title: 'Inventario', headerShown: false }}   />
              <Stack.Screen name="Ventana4" options={{title: 'Ventas', headerShown: false }}    />
              <Stack.Screen name="Ventana5" options={{title: 'Clientes', headerShown: false }} />
              <Stack.Screen name="Ventana6" options={{title: 'Proveedores', headerShown: false }} />
              <Stack.Screen name="Ventana7" options={{headerShown: false}} />
              <Stack.Screen name="Ventana8" options={{headerShown: false}} />
              <Stack.Screen name="Ventana9" options={{headerShown: false}} />
              <Stack.Screen name="QRTrasactions" options={{headerShown: false }}  />
              <Stack.Screen name="PaymentMethods" options={{headerShown: false }}  />
              <Stack.Screen name="ventanaNotificacionesOnly" options={{headerShown: false }}  />
            </Stack>
          </View>
        </LanguageProvider>
      </I18nextProvider>
    </ThemeProvider>
  );
}

