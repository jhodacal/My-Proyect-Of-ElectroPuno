
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from 'C:/Users/amigo/Downloads/PROYECTO PYTHON/PROYECTOS CON REACT NATIVE/MyApp/src/app/index';
import RecoverPasswordScreen from "../screens/Others/recover";
import Ventana1 from '../app/Ventana1';
import Ventana2 from '../app/Ventana2';
import Ventana3 from '../app/Ventana3';
import Ventana4 from '../app/Ventana4';
import Ventana5 from '../app/Ventana5';
import Ventana6 from '../app/Ventana6';
import Ventana7 from '../app/Ventana7';
import Ventana8 from '../app/Ventana8';
import Ventana9 from '../app/Ventana9';
import QRTransactions from '../screens/Others/QRTrasactions';
import PaymentMethods from '../app/Settings/PaymentMethods';
import NotificationSystem from 'C:/Users/amigo/Downloads/PROYECTO PYTHON/PROYECTOS CON REACT NATIVE/MyApp/src/app/Settings/ventanaNotificacionesOnly';

const Stack = createStackNavigator();

function AppNavigator () {
  return (
    
      <Stack.Navigator  screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" component={HomeScreen} />
                <Stack.Screen name="Recover" component={RecoverPasswordScreen} />
                <Stack.Screen name="Ventana1" component={Ventana1} />
                <Stack.Screen name="Ventana2" component={Ventana2} />
                <Stack.Screen name="Ventana3" component={Ventana3} />
                <Stack.Screen name="Ventana4" component={Ventana4} />
                <Stack.Screen name="Ventana5" component={Ventana5} />
                <Stack.Screen name="Ventana6" component={Ventana6} />
                <Stack.Screen name="Ventana7" component={Ventana7} />
                <Stack.Screen name="Ventana8" component={Ventana8} />
                <Stack.Screen name="Ventana9" component={Ventana9} />
                <Stack.Screen name="QRTrasactions" component={QRTransactions} />
                <Stack.Screen name="PaymentMethods" component={PaymentMethods} />
                <Stack.Screen name="ventanaNotificacionesOnly" component={NotificationSystem} />

      </Stack.Navigator>
    
  );
}
export default AppNavigator;