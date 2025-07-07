import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, StyleSheet, BackHandler, ScrollView } from 'react-native';
import NotificationSystem from './NotificationSystem';
import { ThemeProvider } from '../../utils/ThemeContext';


const router = useRouter();

function ScreenNotificaciones() {
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
          
        />

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          <NotificationSystem />
          
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

export default ScreenNotificaciones;