// app/_layout.tsx
import { Stack, useRouter } from 'expo-router';
import { BackHandler ,View,StyleSheet,ScrollView} from 'react-native';
import { ThemeProvider } from 'C:/Users/amigo/Downloads/PROYECTO PYTHON/PROYECTOS CON REACT NATIVE/MyApp/src/utils/ThemeContext';
import { useEffect } from 'react';
import BackButton from 'C:/Users/amigo/Downloads/PROYECTO PYTHON/PROYECTOS CON REACT NATIVE/MyApp/src/utils/BackButton';
import QRTransactions from '../app/Settings/QRTrasactions';
const router = useRouter();
export default function Ventana7() {
  useEffect(() => {
    const backAction = () => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('./');
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
            headerLeft: () => <BackButton onPress={() => router.replace('./')} />,
          }}
        />

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          <QRTransactions />
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

