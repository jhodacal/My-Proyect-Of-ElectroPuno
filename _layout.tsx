import { Stack } from 'expo-router';
import { useTheme } from '../herramientasDeLaApp/ThemeContext';
import { View, StyleSheet } from 'react-native';
import { ThemeProvider } from '../herramientasDeLaApp/ThemeContext';
import { LanguageProvider } from '../herramientasDeLaApp/LanguageContext';
import { I18nextProvider } from 'react-i18next';
import i18next from '../herramientasDeLaApp/i18n';
import {AuthProvider} from '../herramientasDeLaApp/AuthContext'
import { GestureHandlerRootView } from 'react-native-gesture-handler';


export default function Layout() {
  const { theme } = useTheme();

  const dynamicStyles = {
    container: {
      color: theme === 'dark' ? '#fff' : '#000',
      flex: 1
    },
  };
  
  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
            <I18nextProvider i18n={i18next}>
              <LanguageProvider>
              <AuthProvider>
                <View style={[ dynamicStyles.container]}>
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
                    <Stack.Screen name="Ventana9" options={{headerShown: false}} />
                    <Stack.Screen name="VentanaAyuda" options={{headerShown: false}} />
                    <Stack.Screen name="VentanaAbout" options={{headerShown: false}} />
                    <Stack.Screen name="VentanaPrivacidad" options={{headerShown: false}} />
                    <Stack.Screen name="VentanaTerminos" options={{headerShown: false}} />
                    <Stack.Screen name="VentanaBoletaInfo" options={{headerShown: false}} />
                    <Stack.Screen name="QRTrasactions" options={{headerShown: false }}  />
                    <Stack.Screen name="ventana_pago" options={{headerShown: false }}  />
                    <Stack.Screen name="ventanaNotificacionesOnly" options={{headerShown: false }}  />
                  </Stack>
                </View>
                </AuthProvider>
              </LanguageProvider>
            </I18nextProvider>
        </ThemeProvider>
     </GestureHandlerRootView>
  );
}

