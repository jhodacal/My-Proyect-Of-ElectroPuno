import React, { useState, useEffect } from 'react';
import {View,Text,StyleSheet, ScrollView, TouchableOpacity, Switch,Alert,ActivityIndicator} from 'react-native';
import { useTheme } from 'C:/Users/amigo/Downloads/PROYECTO PYTHON/PROYECTOS CON REACT NATIVE/MyApp/src/utils/ThemeContext';
import { useLanguage } from 'C:/Users/amigo/Downloads/PROYECTO PYTHON/PROYECTOS CON REACT NATIVE/MyApp/src/utils/LanguageContext';
import { useRouter } from 'expo-router';
import BackButton from 'C:/Users/amigo/Downloads/PROYECTO PYTHON/PROYECTOS CON REACT NATIVE/MyApp/src/utils/BackButton';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interfaz para alertas
interface Alerta {
  id: string;
  tipo: 'consumo' | 'voltaje' | 'corriente' | 'potencia' | 'sistema';
  umbral: number;
  unidad: string;
  activa: boolean;
  notificacion: boolean;
  email: boolean;
}

const AlertasConfiguracion = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [alertasHistorial, setAlertasHistorial] = useState<{
    fecha: string;
    mensaje: string;
    tipo: string;
    leida: boolean;
  }[]>([]);

  // Cargar configuración de alertas
  useEffect(() => {
    const cargarAlertas = async () => {
      try {
        // Intentar cargar desde almacenamiento local
        const alertasGuardadas = await AsyncStorage.getItem('alertasConfiguracion');
        
        if (alertasGuardadas) {
          setAlertas(JSON.parse(alertasGuardadas));
        } else {
          // Configuración predeterminada
          const alertasPredeterminadas: Alerta[] = [
            {
              id: '1',
              tipo: 'consumo',
              umbral: 30,
              unidad: 'kWh/día',
              activa: true,
              notificacion: true,
              email: false
            },
            {
              id: '2',
              tipo: 'voltaje',
              umbral: 240,
              unidad: 'V',
              activa: true,
              notificacion: true,
              email: true
            },
            {
              id: '3',
              tipo: 'corriente',
              umbral: 20,
              unidad: 'A',
              activa: true,
              notificacion: true,
              email: true
            },
            {
              id: '4',
              tipo: 'potencia',
              umbral: 5000,
              unidad: 'W',
              activa: true,
              notificacion: true,
              email: false
            },
            {
              id: '5',
              tipo: 'sistema',
              umbral: 0,
              unidad: '',
              activa: true,
              notificacion: true,
              email: true
            }
          ];
          
          setAlertas(alertasPredeterminadas);
          await AsyncStorage.setItem('alertasConfiguracion', JSON.stringify(alertasPredeterminadas));
        }
        
        // Cargar historial de alertas (simulado)
        const historialSimulado = [
          {
            fecha: '2025-05-20 08:45',
            mensaje: t('Alto Voltaje Detectado'),
            tipo: 'voltaje',
            leida: true
          },
          {
            fecha: '2025-05-19 14:30',
            mensaje: t('Alto Consummo Detectado'),
            tipo: 'consumo',
            leida: true
          },
          {
            fecha: '2025-05-18 22:15',
            mensaje: t('El sistema necesita Actualización'),
            tipo: 'sistema',
            leida: false
          },
          {
            fecha: '2025-05-17 10:20',
            mensaje: t('Alto Corriente Detectado'),
            tipo: 'corriente',
            leida: false
          },
          {
            fecha: '2025-05-16 16:05',
            mensaje: t('Subida de Tension Detectada'),
            tipo: 'potencia',
            leida: true
          }
        ];
        
        setAlertasHistorial(historialSimulado);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar alertas:', error);
        setLoading(false);
      }
    };
    
    cargarAlertas();
  }, [t]);

  // Guardar cambios en configuración
  const guardarCambios = async () => {
    try {
      await AsyncStorage.setItem('alertasConfiguracion', JSON.stringify(alertas));
      Alert.alert(
        t('Exito'),
        t('Se guardo la configuracion de Alertas')
      );
    } catch (error) {
      console.error('Error al guardar alertas:', error);
      Alert.alert(
        t('Error'),
        t('Error al guardar las configuraciones')
      );
    }
  };

  // Cambiar estado de alerta
  const cambiarEstadoAlerta = (id: string, campo: 'activa' | 'notificacion' | 'email', valor: boolean) => {
    setAlertas(prev => 
      prev.map(alerta => 
        alerta.id === id 
          ? { ...alerta, [campo]: valor } 
          : alerta
      )
    );
  };

  // Cambiar umbral de alerta
  const cambiarUmbralAlerta = (id: string, incremento: number) => {
    setAlertas(prev => 
      prev.map(alerta => {
        if (alerta.id === id) {
          // No permitir valores negativos
          const nuevoUmbral = Math.max(0, alerta.umbral + incremento);
          return { ...alerta, umbral: nuevoUmbral };
        }
        return alerta;
      })
    );
  };

  // Marcar alerta como leída
  const marcarComoLeida = (index: number) => {
    setAlertasHistorial(prev => {
      const nuevasAlertas = [...prev];
      nuevasAlertas[index] = { ...nuevasAlertas[index], leida: true };
      return nuevasAlertas;
    });
  };

  // Limpiar historial de alertas
  const limpiarHistorial = () => {
    Alert.alert(
      t('Limpiar historial De Alertas'),
      t('¿Seguro/a que desea limpiar el Historial de Alertas?'),
      [
        {
          text: t('Cancelar'),
          style: 'cancel'
        },
        {
          text: t('Confirmar'),
          onPress: () => setAlertasHistorial([])
        }
      ]
    );
  };

  // Obtener icono según tipo de alerta
  const obtenerIconoAlerta = (tipo: string) => {
    switch (tipo) {
      case 'consumo':
        return 'trending-up';
      case 'voltaje':
        return 'bolt';
      case 'corriente':
        return 'electrical-services';
      case 'potencia':
        return 'power';
      case 'sistema':
        return 'system-update';
      default:
        return 'warning';
    }
  };

  // Obtener color según tipo de alerta
  const obtenerColorAlerta = (tipo: string) => {
    switch (tipo) {
      case 'consumo':
        return '#3498db';
      case 'voltaje':
        return '#e74c3c';
      case 'corriente':
        return '#f39c12';
      case 'potencia':
        return '#9b59b6';
      case 'sistema':
        return '#2ecc71';
      default:
        return '#95a5a6';
    }
  };

  // Obtener nombre de alerta según tipo
  const obtenerNombreAlerta = (tipo: string) => {
    switch (tipo) {
      case 'consumo':
        return t('Alerta de Consumo');
      case 'voltaje':
        return t('Alerta de Voltaje');
      case 'corriente':
        return t('Alerta de Corriente');
      case 'potencia':
        return t('Alerta de Potencia');
      case 'sistema':
        return t('Alerta del Sistema');
      default:
        return t('Alerta');
    }
  };

  if (loading) {
    return (
      <View style={[
        styles.container, 
        { backgroundColor: theme === 'dark' ? '#121212' : '#f5f5f5' }
      ]}>
        <View style={styles.header}>
          <BackButton 
            onPress={() => router.back()} 
            tintColor={theme === 'dark' ? '#fff' : '#000'} 
          />
          <Text style={[
            styles.headerTitle, 
            { color: theme === 'dark' ? '#fff' : '#000' }
          ]}>
            {t('Alerta y Notificaciones')}
          </Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme === 'dark' ? '#3498db' : '#2980b9'} />
          <Text style={[
            styles.loadingText, 
            { color: theme === 'dark' ? '#fff' : '#000' }
          ]}>
            {t('lCargando...')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[
      styles.container, 
      { backgroundColor: theme === 'dark' ? '#121212' : '#f5f5f5' }
    ]}>
      <View style={styles.header}>
        <BackButton 
          onPress={() => router.back()} 
          tintColor={theme === 'dark' ? '#fff' : '#000'} 
        />
        <Text style={[
          styles.headerTitle, 
          { color: theme === 'dark' ? '#fff' : '#000' }
        ]}>
          {t('Alerta y Notificaciones')}
        </Text>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        {/* Configuración de alertas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[
              styles.sectionTitle, 
              { color: theme === 'dark' ? '#fff' : '#000' }
            ]}>
              {t('Configuración')}
            </Text>
            
            <TouchableOpacity 
              style={[
                styles.saveButton, 
                { backgroundColor: '#2ecc71' }
              ]}
              onPress={guardarCambios}
            >
              <Icon name="save" size={16} color="#fff" />
              <Text style={styles.saveButtonText}>{t('Guardar')}</Text>
            </TouchableOpacity>
          </View>
          
          {alertas.map(alerta => (
            <View 
              key={alerta.id} 
              style={[
                styles.alertaCard, 
                { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
              ]}
            >
              <View style={styles.alertaHeader}>
                <View style={styles.alertaIconContainer}>
                  <Icon 
                    name={obtenerIconoAlerta(alerta.tipo)} 
                    size={24} 
                    color={obtenerColorAlerta(alerta.tipo)} 
                  />
                </View>
                
                <Text style={[
                  styles.alertaNombre, 
                  { color: theme === 'dark' ? '#fff' : '#000' }
                ]}>
                  {obtenerNombreAlerta(alerta.tipo)}
                </Text>
                
                <Switch
                  value={alerta.activa}
                  onValueChange={(value) => cambiarEstadoAlerta(alerta.id, 'activa', value)}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={alerta.activa ? '#3498db' : '#f4f3f4'}
                />
              </View>
              
              {alerta.tipo !== 'sistema' && (
                <View style={styles.umbralContainer}>
                  <Text style={[
                    styles.umbralLabel, 
                    { color: theme === 'dark' ? '#ccc' : '#666' }
                  ]}>
                    {t('Limite de consumo')}:
                  </Text>
                  
                  <View style={styles.umbralControles}>
                    <TouchableOpacity 
                      style={[
                        styles.umbralBoton, 
                        { backgroundColor: theme === 'dark' ? '#2c3e50' : '#ecf0f1' }
                      ]}
                      onPress={() => cambiarUmbralAlerta(alerta.id, -1)}
                    >
                      <Icon name="remove" size={20} color={theme === 'dark' ? '#fff' : '#000'} />
                    </TouchableOpacity>
                    
                    <Text style={[
                      styles.umbralValor, 
                      { color: theme === 'dark' ? '#fff' : '#000' }
                    ]}>
                      {alerta.umbral} {alerta.unidad}
                    </Text>
                    
                    <TouchableOpacity 
                      style={[
                        styles.umbralBoton, 
                        { backgroundColor: theme === 'dark' ? '#2c3e50' : '#ecf0f1' }
                      ]}
                      onPress={() => cambiarUmbralAlerta(alerta.id, 1)}
                    >
                      <Icon name="add" size={20} color={theme === 'dark' ? '#fff' : '#000'} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              
              <View style={styles.notificacionesContainer}>
                <View style={styles.notificacionItem}>
                  <Text style={[
                    styles.notificacionLabel, 
                    { color: theme === 'dark' ? '#ccc' : '#666' }
                  ]}>
                    {t('Notificaciones')}
                  </Text>
                  
                  <Switch
                    value={alerta.notificacion}
                    onValueChange={(value) => cambiarEstadoAlerta(alerta.id, 'notificacion', value)}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={alerta.notificacion ? '#3498db' : '#f4f3f4'}
                    disabled={!alerta.activa}
                  />
                </View>
                
                <View style={styles.notificacionItem}>
                  <Text style={[
                    styles.notificacionLabel, 
                    { color: theme === 'dark' ? '#ccc' : '#666' }
                  ]}>
                    {t('Notificaciones por correo')}
                  </Text>
                  
                  <Switch
                    value={alerta.email}
                    onValueChange={(value) => cambiarEstadoAlerta(alerta.id, 'email', value)}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={alerta.email ? '#3498db' : '#f4f3f4'}
                    disabled={!alerta.activa}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
        
        {/* Historial de alertas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[
              styles.sectionTitle, 
              { color: theme === 'dark' ? '#fff' : '#000' }
            ]}>
              {t('Historial de Alertas')}
            </Text>
            
            {alertasHistorial.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={limpiarHistorial}
              >
                <Text style={styles.clearButtonText}>{t('Limpiar Todo')}</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {alertasHistorial.length === 0 ? (
            <View style={[
              styles.emptyContainer, 
              { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
            ]}>
              <Icon name="notifications-off" size={48} color="#95a5a6" />
              <Text style={[
                styles.emptyText, 
                { color: theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                {t('No hay Alertas')}
              </Text>
            </View>
          ) : (
            alertasHistorial.map((alerta, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.historialItem, 
                  { 
                    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
                    borderLeftColor: obtenerColorAlerta(alerta.tipo)
                  },
                  !alerta.leida && styles.alertaNoLeida
                ]}
                onPress={() => {
                  if (!alerta.leida) {
                    marcarComoLeida(index);
                  }
                  
                  // Mostrar detalles de la alerta
                  Alert.alert(
                    obtenerNombreAlerta(alerta.tipo),
                    `${alerta.mensaje}\n\n${alerta.fecha}`,
                    [{ text: t('ok') }]
                  );
                }}
              >
                <View style={styles.historialIcono}>
                  <Icon 
                    name={obtenerIconoAlerta(alerta.tipo)} 
                    size={24} 
                    color={obtenerColorAlerta(alerta.tipo)} 
                  />
                </View>
                
                <View style={styles.historialContenido}>
                  <View style={styles.historialEncabezado}>
                    <Text style={[
                      styles.historialTitulo, 
                      { color: theme === 'dark' ? '#fff' : '#000' },
                      !alerta.leida && styles.textoNegrita
                    ]}>
                      {obtenerNombreAlerta(alerta.tipo)}
                    </Text>
                    
                    {!alerta.leida && (
                      <View style={styles.indicadorNoLeido} />
                    )}
                  </View>
                  
                  <Text style={[
                    styles.historialMensaje, 
                    { color: theme === 'dark' ? '#ccc' : '#666' }
                  ]} numberOfLines={2}>
                    {alerta.mensaje}
                  </Text>
                  
                  <Text style={[
                    styles.historialFecha, 
                    { color: theme === 'dark' ? '#aaa' : '#999' }
                  ]}>
                    {alerta.fecha}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
        
        {/* Información adicional */}
        <View style={[
          styles.infoCard, 
          { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
        ]}>
          <Text style={[
            styles.infoTitle, 
            { color: theme === 'dark' ? '#fff' : '#000' }
          ]}>
            {t('Acerca de Alertas')}
          </Text>
          
          <Text style={[
            styles.infoText, 
            { color: theme === 'dark' ? '#ccc' : '#666' }
          ]}>
            {t('descripción de Alertas')}
          </Text>
          
          <TouchableOpacity 
            style={styles.infoButton}
            onPress={() => {
              // Aquí iría la navegación a una página de ayuda
              Alert.alert(t('Ayuda'), t('La pagina de ayuda comenzara pronto'));
            }}
          >
            <Text style={styles.infoButtonText}>{t('Saber mas')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 14,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    color: '#3498db',
    fontSize: 14,
  },
  alertaCard: {
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  alertaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  alertaIconContainer: {
    marginRight: 12,
  },
  alertaNombre: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  umbralContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  umbralLabel: {
    fontSize: 14,
  },
  umbralControles: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  umbralBoton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  umbralValor: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 10,
    minWidth: 60,
    textAlign: 'center',
  },
  notificacionesContainer: {
    padding: 12,
  },
  notificacionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificacionLabel: {
    fontSize: 14,
  },
  emptyContainer: {
    padding: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  historialItem: {
    flexDirection: 'row',
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    borderLeftWidth: 4,
  },
  alertaNoLeida: {
    borderLeftWidth: 4,
  },
  historialIcono: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historialContenido: {
    flex: 1,
    padding: 12,
  },
  historialEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historialTitulo: {
    fontSize: 16,
    marginBottom: 4,
    flex: 1,
  },
  textoNegrita: {
    fontWeight: 'bold',
  },
  indicadorNoLeido: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3498db',
    marginLeft: 8,
  },
  historialMensaje: {
    fontSize: 14,
    marginBottom: 8,
  },
  historialFecha: {
    fontSize: 12,
  },
  infoCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  infoButton: {
    alignSelf: 'flex-start',
  },
  infoButtonText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default AlertasConfiguracion;
