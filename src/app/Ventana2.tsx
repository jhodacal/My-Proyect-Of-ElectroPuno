// app/_layout.tsx
import { Stack, useRouter } from 'expo-router';
import { BackHandler ,View,StyleSheet,ScrollView} from 'react-native';
import { useEffect } from 'react';
import { ThemeProvider } from '../utils/ThemeContext';
import BackButton from '../utils/BackButton';
import AnalisisConsumo from './Settings/AnalisisConsumo';
const router = useRouter();

  

function Ventana2() {
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
          <AnalisisConsumo />
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

export default Ventana2;