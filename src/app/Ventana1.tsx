import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, StyleSheet, BackHandler, ScrollView } from 'react-native';
import ConsumoEnTiempoReal from './Settings/ConsumoEnTiempoReal';
import { ThemeProvider } from 'C:/Users/amigo/Downloads/PROYECTO PYTHON/PROYECTOS CON REACT NATIVE/MyApp/src/utils/ThemeContext';
import BackButton from 'C:/Users/amigo/Downloads/PROYECTO PYTHON/PROYECTOS CON REACT NATIVE/MyApp/src/utils/BackButton';

const router = useRouter();

function Ventana1() {
  useEffect(() => {
    const backAction = () => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [router]);

  return (
    <ThemeProvider>
      <View style={styles.container}>
        
        <Stack.Screen
          options={{
            headerLeft: () => <BackButton onPress={() => router.replace('/')} />,
          }}
        />

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          <ConsumoEnTiempoReal />
          {/* Puedes seguir agregando más componentes aquí */}
        </ScrollView>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    
    flexGrow: 1, // Esto permite que el contenido se expanda y sea desplazable
  },
});

export default Ventana1;