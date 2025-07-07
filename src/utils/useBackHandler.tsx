// hooks/useBackHandler.ts
import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useRouter } from 'expo-router';

const useBackHandler = (customAction?: () => void) => {
  const router = useRouter();

  useEffect(() => {
    const backAction = () => {
      if (customAction) {
        customAction();
      } else {
        router.back(); // Navega atrás por defecto
      }
      return true; // Evita que la app se cierre
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [router, customAction]);
};
export default useBackHandler;