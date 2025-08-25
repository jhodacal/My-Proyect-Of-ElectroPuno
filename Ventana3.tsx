import React  from 'react';
import { Stack, useRouter } from 'expo-router';
import { BackHandler ,View,StyleSheet,Text,ScrollView} from 'react-native';
import { useEffect } from 'react';
import { ThemeProvider } from '../herramientasDeLaApp/ThemeContext';
import BackButton from '../herramientasDeLaApp/BackButton';
import { useTheme } from '../herramientasDeLaApp/ThemeContext';
import { useLanguage } from '../herramientasDeLaApp/LanguageContext';
import EnergyMonitoringSystem from './Settings/HistorialConsumo';


const router = useRouter();

function Ventana3() {
  const { theme } = useTheme();
  const { t } = useLanguage();
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
      <View style={[styles.container, themedStyles.container(theme)]}>
        <Stack.Screen />
        {/* Header fijo */}
        <View style={[styles.header, themedStyles.header(theme)]}>
          <BackButton onPress={() => router.back()} tintColor={themedStyles.text(theme).color} />
          <Text style={[styles.title,themedStyles.text(theme)]}> {t('Consumo En Tiempo Real')}</Text>
        </View>

        {/* Contenido desplazable */}
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          <EnergyMonitoringSystem />
        </ScrollView>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
   container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderBottomWidth: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
    marginTop: 60, // Altura del header
  },
  scrollContent: {
    flexGrow: 1,
  },
});

const themedStyles = {
  container: (theme: string) => ({ backgroundColor: theme === 'dark' ? '#121212' : '#f8f9fa' }),
  header: (theme: string) => ({
    backgroundColor: theme === 'dark' ? '#1f1f1f' : '#ffffff',
      borderBottomColor: theme === 'dark' ? '#ffffff' : '#1f1f1f',
     borderBottomWidth: 1,
  }),
  text: (theme: string) => ({ color: theme === 'dark' ? '#ffffff' : '#000000' }),
};

export default Ventana3;