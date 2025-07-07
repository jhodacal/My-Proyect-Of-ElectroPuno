import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { useTheme } from '../../utils/ThemeContext';
import { useLanguage } from '../../utils/LanguageContext';
import { useRouter } from 'expo-router';
import BackButton from '../../utils/BackButton';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart } from 'react-native-chart-kit';

// Interfaz para datos de diagnóstico
interface DiagnosticoData {
  id: string;
  parametro: string;
  valor: number;
  unidad: string;
  estado: 'normal' | 'advertencia' | 'critico';
  minimo: number;
  maximo: number;
}

// Interfaz para historial de mantenimiento
interface MantenimientoHistorial {
  id: string;
  fecha: string;
  tipo: string;
  descripcion: string;
  tecnico: string;
  resultado: string;
}

const DiagnosticoMantenimiento = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vistaActual, setVistaActual] = useState<'diagnostico' | 'mantenimiento'>('diagnostico');
  const [parametrosDiagnostico, setParametrosDiagnostico] = useState<DiagnosticoData[]>([]);
  const [historialMantenimiento, setHistorialMantenimiento] = useState<MantenimientoHistorial[]>([]);
  const [estadoGeneral, setEstadoGeneral] = useState<'normal' | 'advertencia' | 'critico'>('normal');
  const [proximoMantenimiento, setProximoMantenimiento] = useState('2025-06-15');
  const [datosHistoricos, setDatosHistoricos] = useState<{
    labels: string[];
    datasets: { data: number[] }[];
  }>({ labels: [], datasets: [{ data: [] }] });

  // Configuración de gráficos
  const screenWidth = Dimensions.get("window").width - 40;
  const chartConfig = {
    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    backgroundGradientFrom: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    backgroundGradientTo: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => theme === 'dark' ? `rgba(100, 210, 255, ${opacity})` : `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => theme === 'dark' ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: theme === 'dark' ? "#3498db" : "#2980b9"
    }
  };

  // Cargar datos simulados
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      
      // Simulación de carga de datos desde API o base de datos
      setTimeout(() => {
        // Parámetros de diagnóstico simulados
        const parametrosSimulados: DiagnosticoData[] = [
          {
            id: '1',
            parametro: t('voltage'),
            valor: 220.5,
            unidad: 'V',
            estado: 'normal',
            minimo: 210,
            maximo: 230
          },
          {
            id: '2',
            parametro: t('current'),
            valor: 15.2,
            unidad: 'A',
            estado: 'normal',
            minimo: 0,
            maximo: 25
          },
          {
            id: '3',
            parametro: t('frequency'),
            valor: 59.8,
            unidad: 'Hz',
            estado: 'normal',
            minimo: 59.5,
            maximo: 60.5
          },
          {
            id: '4',
            parametro: t('powerFactor'),
            valor: 0.92,
            unidad: '',
            estado: 'normal',
            minimo: 0.85,
            maximo: 1
          },
          {
            id: '5',
            parametro: t('temperature'),
            valor: 42.5,
            unidad: '°C',
            estado: 'advertencia',
            minimo: 0,
            maximo: 40
          },
          {
            id: '6',
            parametro: t('batteryLevel'),
            valor: 85,
            unidad: '%',
            estado: 'normal',
            minimo: 20,
            maximo: 100
          },
          {
            id: '7',
            parametro: t('signalStrength'),
            valor: 65,
            unidad: '%',
            estado: 'normal',
            minimo: 30,
            maximo: 100
          }
        ];
        
        // Historial de mantenimiento simulado
        const historialSimulado: MantenimientoHistorial[] = [
          {
            id: '1',
            fecha: '2025-01-15',
            tipo: t('routineInspection'),
            descripcion: t('routineInspectionDesc'),
            tecnico: 'Carlos Rodríguez',
            resultado: t('optimal')
          },
          {
            id: '2',
            fecha: '2024-10-22',
            tipo: t('firmwareUpdate'),
            descripcion: t('firmwareUpdateDesc'),
            tecnico: 'Sistema',
            resultado: t('completed')
          },
          {
            id: '3',
            fecha: '2024-07-08',
            tipo: t('batteryReplacement'),
            descripcion: t('batteryReplacementDesc'),
            tecnico: 'Ana Gómez',
            resultado: t('replaced')
          },
          {
            id: '4',
            fecha: '2024-04-30',
            tipo: t('calibration'),
            descripcion: t('calibrationDesc'),
            tecnico: 'Miguel Torres',
            resultado: t('adjusted')
          }
        ];
        
        // Datos históricos para gráfico
        const datosHistoricosSimulados = {
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
          datasets: [
            {
              data: [220.2, 219.8, 221.5, 220.7, 220.5]
            }
          ]
        };
        
        // Determinar estado general basado en parámetros
        const tieneAdvertencia = parametrosSimulados.some(p => p.estado === 'advertencia');
        const tieneCritico = parametrosSimulados.some(p => p.estado === 'critico');
        
        if (tieneCritico) {
          setEstadoGeneral('critico');
        } else if (tieneAdvertencia) {
          setEstadoGeneral('advertencia');
        } else {
          setEstadoGeneral('normal');
        }
        
        setParametrosDiagnostico(parametrosSimulados);
        setHistorialMantenimiento(historialSimulado);
        setDatosHistoricos(datosHistoricosSimulados);
        setLoading(false);
      }, 1500);
    };
    
    cargarDatos();
  }, [t]);

  // Solicitar diagnóstico
  const solicitarDiagnostico = () => {
    setLoading(true);
    
    // Simulación de diagnóstico en tiempo real
    setTimeout(() => {
      Alert.alert(
        t('Diagnostico Completo'),
        t('Mensaje de diagnostico'),
        [{ text: t('ok') }]
      );
      setLoading(false);
    }, 2000);
  };

  // Solicitar mantenimiento
  const solicitarMantenimiento = () => {
    Alert.alert(
      t('Requiere Mantenimiento'),
      t('Confirmacion de requerimiento de mantenimiento'),
      [
        {
          text: t('cancelar'),
          style: 'cancel'
        },
        {
          text: t('confirmar'),
          onPress: () => {
            // Aquí iría la lógica para solicitar mantenimiento
            Alert.alert(
              t('Exito'),
              t('Pedido de requerimiento de mantenimiento exito')
            );
          }
        }
      ]
    );
  };

  // Obtener color según estado
  const obtenerColorEstado = (estado: 'normal' | 'advertencia' | 'critico') => {
    switch (estado) {
      case 'normal':
        return '#2ecc71'; // Verde
      case 'advertencia':
        return '#f39c12'; // Amarillo
      case 'critico':
        return '#e74c3c'; // Rojo
      default:
        return '#95a5a6'; // Gris
    }
  };

  // Obtener icono según estado
  const obtenerIconoEstado = (estado: 'normal' | 'advertencia' | 'critico') => {
    switch (estado) {
      case 'normal':
        return 'check-circle';
      case 'advertencia':
        return 'warning';
      case 'critico':
        return 'error';
      default:
        return 'help';
    }
  };

  // Obtener texto según estado
  const obtenerTextoEstado = (estado: 'normal' | 'advertencia' | 'critico') => {
    switch (estado) {
      case 'normal':
        return t('normal');
      case 'advertencia':
        return t('Advertencia');
      case 'critico':
        return t('critico');
      default:
        return t('Desconocido');
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
            {t('Diagnósticos y Mantenimiento')}
          </Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme === 'dark' ? '#3498db' : '#2980b9'} />
          <Text style={[
            styles.loadingText, 
            { color: theme === 'dark' ? '#fff' : '#000' }
          ]}>
            {t('Cargando Diagnosticos')}
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
          {t('Diagnósticos y Mantenimiento')}
        </Text>
      </View>
      
      {/* Selector de vista */}
      <View style={styles.vistaSelector}>
        <TouchableOpacity 
          style={[
            styles.vistaButton, 
            vistaActual === 'diagnostico' && styles.vistaActiva,
            { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
          ]}
          onPress={() => setVistaActual('diagnostico')}
        >
          <Icon 
            name="assessment" 
            size={20} 
            color={vistaActual === 'diagnostico' 
              ? '#fff' 
              : theme === 'dark' ? '#fff' : '#000'
            } 
          />
          <Text style={[
            styles.vistaText, 
            vistaActual === 'diagnostico' && styles.vistaTextoActivo,
            { color: theme === 'dark' ? '#fff' : '#000' }
          ]}>
            {t('diagnosticos')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.vistaButton, 
            vistaActual === 'mantenimiento' && styles.vistaActiva,
            { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
          ]}
          onPress={() => setVistaActual('mantenimiento')}
        >
          <Icon 
            name="build" 
            size={20} 
            color={vistaActual === 'mantenimiento' 
              ? '#fff' 
              : theme === 'dark' ? '#fff' : '#000'
            } 
          />
          <Text style={[
            styles.vistaText, 
            vistaActual === 'mantenimiento' && styles.vistaTextoActivo,
            { color: theme === 'dark' ? '#fff' : '#000' }
          ]}>
            {t('mantenimineto')}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        {vistaActual === 'diagnostico' ? (
          // Vista de diagnóstico
          <>
            {/* Estado general */}
            <View style={[
              styles.estadoCard, 
              { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
            ]}>
              <Text style={[
                styles.estadoTitle, 
                { color: theme === 'dark' ? '#fff' : '#000' }
              ]}>
                {t('generalStatus')}
              </Text>
              
              <View style={styles.estadoContent}>
                <View style={[
                  styles.estadoIconContainer, 
                  { backgroundColor: obtenerColorEstado(estadoGeneral) }
                ]}>
                  <Icon 
                    name={obtenerIconoEstado(estadoGeneral)} 
                    size={32} 
                    color="#fff" 
                  />
                </View>
                
                <View style={styles.estadoInfo}>
                  <Text style={[
                    styles.estadoTexto, 
                    { color: obtenerColorEstado(estadoGeneral) }
                  ]}>
                    {obtenerTextoEstado(estadoGeneral)}
                  </Text>
                  
                  <Text style={[
                    styles.estadoDescripcion, 
                    { color: theme === 'dark' ? '#ccc' : '#666' }
                  ]}>
                    {estadoGeneral === 'normal' 
                      ? t('allParametersNormal')
                      : estadoGeneral === 'advertencia'
                        ? t('Algunas Advertencias de Parametros')
                        : t('Algunas parametros criticosE')
                    }
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.diagnosticoButton, 
                  { backgroundColor: '#3498db' }
                ]}
                onPress={solicitarDiagnostico}
              >
                <Icon name="refresh" size={20} color="#fff" />
                <Text style={styles.diagnosticoButtonText}>
                  {t('Correr Diagnosticos')}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Parámetros de diagnóstico */}
            <Text style={[
              styles.sectionTitle, 
              { color: theme === 'dark' ? '#fff' : '#000' }
            ]}>
              {t('Parámetros de Diagnostico')}
            </Text>
            
            {parametrosDiagnostico.map(parametro => (
              <View 
                key={parametro.id} 
                style={[
                  styles.parametroItem, 
                  { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
                ]}
              >
                <View style={styles.parametroHeader}>
                  <Text style={[
                    styles.parametroNombre, 
                    { color: theme === 'dark' ? '#fff' : '#000' }
                  ]}>
                    {parametro.parametro}
                  </Text>
                  
                  <View style={[
                    styles.estadoIndicador, 
                    { backgroundColor: obtenerColorEstado(parametro.estado) }
                  ]}>
                    <Text style={styles.estadoIndicadorTexto}>
                      {obtenerTextoEstado(parametro.estado)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.parametroValores}>
                  <Text style={[
                    styles.parametroValor, 
                    { color: theme === 'dark' ? '#fff' : '#000' }
                  ]}>
                    {parametro.valor} {parametro.unidad}
                  </Text>
                  
                  <Text style={[
                    styles.parametroRango, 
                    { color: theme === 'dark' ? '#ccc' : '#666' }
                  ]}>
                    {t('rango')}: {parametro.minimo} - {parametro.maximo} {parametro.unidad}
                  </Text>
                </View>
                
                {/* Barra de progreso */}
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <View 
                      style={[
                        styles.progressBar,
                        { 
                          width: `${Math.min(100, Math.max(0, (parametro.valor - parametro.minimo) / (parametro.maximo - parametro.minimo) * 100))}%`,
                          backgroundColor: obtenerColorEstado(parametro.estado)
                        }
                      ]}
                    />
                  </View>
                </View>
              </View>
            ))}
            
            {/* Gráfico histórico */}
            <Text style={[
              styles.chartTitle, 
              { color: theme === 'dark' ? '#fff' : '#000' }
            ]}>
              {t('Historial de voltaje')}
            </Text>
            
            <LineChart
              data={datosHistoricos}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              yAxisSuffix=" V"
            />
          </>
        ) : (
          // Vista de mantenimiento
          <>
            {/* Próximo mantenimiento */}
            <View style={[
              styles.proximoCard, 
              { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
            ]}>
              <Text style={[
                styles.proximoTitle, 
                { color: theme === 'dark' ? '#fff' : '#000' }
              ]}>
                {t('Proximo Mantenimiento Programado')}
              </Text>
              
              <View style={styles.proximoContent}>
                <Icon 
                  name="event" 
                  size={32} 
                  color="#3498db" 
                  style={styles.proximoIcon} 
                />
                
                <View style={styles.proximoInfo}>
                  <Text style={[
                    styles.proximoFecha, 
                    { color: theme === 'dark' ? '#fff' : '#000' }
                  ]}>
                    {proximoMantenimiento}
                  </Text>
                  
                  <Text style={[
                    styles.proximoDescripcion, 
                    { color: theme === 'dark' ? '#ccc' : '#666' }
                  ]}>
                    {t('Inspeccion de rutina')}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.mantenimientoButton, 
                  { backgroundColor: '#2ecc71' }
                ]}
                onPress={solicitarMantenimiento}
              >
                <Icon name="build" size={20} color="#fff" />
                <Text style={styles.mantenimientoButtonText}>
                  {t('mantenimiento requerido')}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Historial de mantenimiento */}
            <Text style={[
              styles.sectionTitle, 
              { color: theme === 'dark' ? '#fff' : '#000' }
            ]}>
              {t('historial de mantenimiento')}
            </Text>
            
            {historialMantenimiento.map(item => (
              <View 
                key={item.id} 
                style={[
                  styles.historialItem, 
                  { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
                ]}
              >
                <View style={styles.historialHeader}>
                  <Text style={[
                    styles.historialFecha, 
                    { color: theme === 'dark' ? '#3498db' : '#2980b9' }
                  ]}>
                    {item.fecha}
                  </Text>
                  
                  <Text style={[
                    styles.historialTipo, 
                    { color: theme === 'dark' ? '#fff' : '#000' }
                  ]}>
                    {item.tipo}
                  </Text>
                </View>
                
                <Text style={[
                  styles.historialDescripcion, 
                  { color: theme === 'dark' ? '#ccc' : '#666' }
                ]}>
                  {item.descripcion}
                </Text>
                
                <View style={styles.historialFooter}>
                  <Text style={[
                    styles.historialTecnico, 
                    { color: theme === 'dark' ? '#ccc' : '#666' }
                  ]}>
                    {t('Técnico')}: {item.tecnico}
                  </Text>
                  
                  <Text style={[
                    styles.historialResultado, 
                    { color: theme === 'dark' ? '#2ecc71' : '#27ae60' }
                  ]}>
                    {item.resultado}
                  </Text>
                </View>
              </View>
            ))}
            
            {/* Recomendaciones de mantenimiento */}
            <View style={[
              styles.recomendacionesCard, 
              { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
            ]}>
              <Text style={[
                styles.recomendacionesTitle, 
                { color: theme === 'dark' ? '#fff' : '#000' }
              ]}>
                {t('Recomendaciones de Mantenimiento')}
              </Text>
              
              <View style={styles.recomendacionItem}>
                <Icon 
                  name="lightbulb" 
                  size={20} 
                  color="#f39c12" 
                  style={styles.recomendacionIcon} 
                />
                
                <Text style={[
                  styles.recomendacionText, 
                  { color: theme === 'dark' ? '#ccc' : '#666' }
                ]}>
                  {t('Mantenimiento Recomendado 1')}
                </Text>
              </View>
              
              <View style={styles.recomendacionItem}>
                <Icon 
                  name="lightbulb" 
                  size={20} 
                  color="#f39c12" 
                  style={styles.recomendacionIcon} 
                />
                
                <Text style={[
                  styles.recomendacionText, 
                  { color: theme === 'dark' ? '#ccc' : '#666' }
                ]}>
                  {t('Mantenimiento Recomendado 2')}
                </Text>
              </View>
              
              <View style={styles.recomendacionItem}>
                <Icon 
                  name="lightbulb" 
                  size={20} 
                  color="#f39c12" 
                  style={styles.recomendacionIcon} 
                />
                
                <Text style={[
                  styles.recomendacionText, 
                  { color: theme === 'dark' ? '#ccc' : '#666' }
                ]}>
                  {t('Mantenimiento Recomendado 4')}
                </Text>
              </View>
            </View>
          </>
        )}
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
  vistaSelector: {
    flexDirection: 'row',
    padding: 16,
  },
  vistaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  vistaActiva: {
    backgroundColor: '#3498db',
  },
  vistaText: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  vistaTextoActivo: {
    color: '#fff',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  estadoCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  estadoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  estadoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  estadoIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  estadoInfo: {
    flex: 1,
  },
  estadoTexto: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  estadoDescripcion: {
    fontSize: 14,
  },
  diagnosticoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  diagnosticoButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  parametroItem: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  parametroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  parametroNombre: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  estadoIndicador: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  estadoIndicadorTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  parametroValores: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  parametroValor: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  parametroRango: {
    fontSize: 12,
  },
  progressBarContainer: {
    marginTop: 4,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  chart: {
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  proximoCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  proximoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  proximoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  proximoIcon: {
    marginRight: 16,
  },
  proximoInfo: {
    flex: 1,
  },
  proximoFecha: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  proximoDescripcion: {
    fontSize: 14,
  },
  mantenimientoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  mantenimientoButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  historialItem: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  historialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historialFecha: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  historialTipo: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  historialDescripcion: {
    fontSize: 14,
    marginBottom: 8,
  },
  historialFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historialTecnico: {
    fontSize: 12,
  },
  historialResultado: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  recomendacionesCard: {
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  recomendacionesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  recomendacionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recomendacionIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  recomendacionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default DiagnosticoMantenimiento;
