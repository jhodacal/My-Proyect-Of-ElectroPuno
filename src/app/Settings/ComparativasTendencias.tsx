import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useTheme } from 'C:/Users/amigo/Downloads/PROYECTO PYTHON/PROYECTOS CON REACT NATIVE/MyApp/src/utils/ThemeContext';
import { useLanguage } from 'C:/Users/amigo/Downloads/PROYECTO PYTHON/PROYECTOS CON REACT NATIVE/MyApp/src/utils/LanguageContext';
import { useRouter } from 'expo-router';
import BackButton from 'C:/Users/amigo/Downloads/PROYECTO PYTHON/PROYECTOS CON REACT NATIVE/MyApp/src/utils/BackButton';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart } from 'react-native-chart-kit';

// Interfaz para datos de comparativa
interface ComparativaData {
  periodo: string;
  consumoActual: number;
  consumoAnterior: number;
  diferencia: number;
  porcentaje: number;
}

// Interfaz para datos de tendencia
interface TendenciaData {
  periodo: string;
  consumo: number;
  prediccion: number;
}

// Interfaz para datos de vecindario
interface VecindarioData {
  tipo: string;
  consumoPromedio: number;
  tuConsumo: number;
  diferencia: number;
}

const ComparativasTendencias = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vistaActual, setVistaActual] = useState<'comparativas' | 'tendencias' | 'vecindario'>('comparativas');
  const [datosComparativa, setDatosComparativa] = useState<ComparativaData[]>([]);
  const [datosTendencia, setDatosTendencia] = useState<TendenciaData[]>([]);
  const [datosVecindario, setDatosVecindario] = useState<VecindarioData[]>([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<'mensual' | 'anual'>('mensual');
  const [ahorroEstimado, setAhorroEstimado] = useState(0);
  const [prediccionProximoMes, setPrediccionProximoMes] = useState(0);

  // Configuración de gráficos
  const screenWidth = Dimensions.get("window").width - 40;
  const chartConfig = {
    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    backgroundGradientFrom: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    backgroundGradientTo: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    decimalPlaces: 0,
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
        // Datos de comparativa simulados
        const comparativaSimulada: ComparativaData[] = periodoSeleccionado === 'mensual' 
          ? [
              {
                periodo: t('january'),
                consumoActual: 320,
                consumoAnterior: 350,
                diferencia: -30,
                porcentaje: -8.57
              },
              {
                periodo: t('february'),
                consumoActual: 310,
                consumoAnterior: 330,
                diferencia: -20,
                porcentaje: -6.06
              },
              {
                periodo: t('march'),
                consumoActual: 340,
                consumoAnterior: 320,
                diferencia: 20,
                porcentaje: 6.25
              },
              {
                periodo: t('april'),
                consumoActual: 300,
                consumoAnterior: 340,
                diferencia: -40,
                porcentaje: -11.76
              },
              {
                periodo: t('may'),
                consumoActual: 290,
                consumoAnterior: 310,
                diferencia: -20,
                porcentaje: -6.45
              }
            ]
          : [
              {
                periodo: '2021',
                consumoActual: 3800,
                consumoAnterior: 4100,
                diferencia: -300,
                porcentaje: -7.32
              },
              {
                periodo: '2022',
                consumoActual: 3900,
                consumoAnterior: 3800,
                diferencia: 100,
                porcentaje: 2.63
              },
              {
                periodo: '2023',
                consumoActual: 3750,
                consumoAnterior: 3900,
                diferencia: -150,
                porcentaje: -3.85
              },
              {
                periodo: '2024',
                consumoActual: 3600,
                consumoAnterior: 3750,
                diferencia: -150,
                porcentaje: -4.00
              },
              {
                periodo: '2025',
                consumoActual: 3500,
                consumoAnterior: 3600,
                diferencia: -100,
                porcentaje: -2.78
              }
            ];
        
        // Datos de tendencia simulados
        const tendenciaSimulada: TendenciaData[] = periodoSeleccionado === 'mensual'
          ? [
              { periodo: t('january'), consumo: 320, prediccion: 0 },
              { periodo: t('february'), consumo: 310, prediccion: 0 },
              { periodo: t('march'), consumo: 340, prediccion: 0 },
              { periodo: t('april'), consumo: 300, prediccion: 0 },
              { periodo: t('may'), consumo: 290, prediccion: 0 },
              { periodo: t('june'), consumo: 0, prediccion: 285 },
              { periodo: t('july'), consumo: 0, prediccion: 280 }
            ]
          : [
              { periodo: '2021', consumo: 3800, prediccion: 0 },
              { periodo: '2022', consumo: 3900, prediccion: 0 },
              { periodo: '2023', consumo: 3750, prediccion: 0 },
              { periodo: '2024', consumo: 3600, prediccion: 0 },
              { periodo: '2025', consumo: 3500, prediccion: 0 },
              { periodo: '2026', consumo: 0, prediccion: 3450 }
            ];
        
        // Datos de vecindario simulados
        const vecindarioSimulado: VecindarioData[] = [
          {
            tipo: t('similarHomes'),
            consumoPromedio: 320,
            tuConsumo: 290,
            diferencia: -30
          },
          {
            tipo: t('efficientHomes'),
            consumoPromedio: 250,
            tuConsumo: 290,
            diferencia: 40
          },
          {
            tipo: t('neighborhood'),
            consumoPromedio: 350,
            tuConsumo: 290,
            diferencia: -60
          }
        ];0
        
        // Calcular ahorro estimado y predicción
        setAhorroEstimado(periodoSeleccionado === 'mensual' ? 45 : 540);
        setPrediccionProximoMes(285);
        
        setDatosComparativa(comparativaSimulada);
        setDatosTendencia(tendenciaSimulada);
        setDatosVecindario(vecindarioSimulado);
        setLoading(false);
      }, 1500);
    };
    
    cargarDatos();
  }, [periodoSeleccionado, t]);

  // Preparar datos para gráfico de comparativa
  const prepararDatosComparativa = () => {
    return {
      labels: datosComparativa.map(item => item.periodo),
      datasets: [
        {
          data: datosComparativa.map(item => item.consumoActual),
          color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
          strokeWidth: 2,
          label: t('currentPeriod')
        },
        {
          data: datosComparativa.map(item => item.consumoAnterior),
          color: (opacity = 1) => `rgba(149, 165, 166, ${opacity})`,
          strokeWidth: 2,
          label: t('previousPeriod')
        }
      ],
      legend: [t('currentPeriod'), t('previousPeriod')]
    };
  };

  // Preparar datos para gráfico de tendencia
  const prepararDatosTendencia = () => {
    return {
      labels: datosTendencia.map(item => item.periodo),
      datasets: [
        {
          data: datosTendencia.map(item => item.consumo || null),
          color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
          strokeWidth: 2
        },
        {
          data: datosTendencia.map(item => item.prediccion || null),
          color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
          strokeWidth: 2,
          dashArray: [5, 5]
        }
      ],
      legend: [t('actualConsumption'), t('predictedConsumption')]
    };
  };

  // Preparar datos para gráfico de vecindario
  const prepararDatosVecindario = () => {
    return {
      labels: datosVecindario.map(item => item.tipo),
      datasets: [
        {
          data: datosVecindario.map(item => item.consumoPromedio),
          color: (opacity = 1) => `rgba(149, 165, 166, ${opacity})`,
          strokeWidth: 2
        },
        {
          data: datosVecindario.map(() => datosVecindario[0].tuConsumo),
          color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: [t('averageConsumption'), t('yourConsumption')]
    };
  };

  // Cambiar período
  const cambiarPeriodo = (periodo: 'mensual' | 'anual') => {
    setPeriodoSeleccionado(periodo);
  };

  // Cambiar vista
  const cambiarVista = (vista: 'comparativas' | 'tendencias' | 'vecindario') => {
    setVistaActual(vista);
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
            {t('Comparaciones y Tendencias')}
          </Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme === 'dark' ? '#3498db' : '#2980b9'} />
          <Text style={[
            styles.loadingText, 
            { color: theme === 'dark' ? '#fff' : '#000' }
          ]}>
            {t('Analizando Datos ...')}
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
          {t('Comparaciones y Tendencias')}
        </Text>
      </View>
      
      {/* Selector de vista */}
      <View style={styles.vistaSelector}>
        <TouchableOpacity 
          style={[
            styles.vistaButton, 
            vistaActual === 'comparativas' && styles.vistaActiva,
            { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
          ]}
          onPress={() => cambiarVista('comparativas')}
        >
          <Icon 
            name="compare-arrows" 
            size={20} 
            color={vistaActual === 'comparativas' 
              ? '#fff' 
              : theme === 'dark' ? '#fff' : '#000'
            } 
          />
          <Text style={[
            styles.vistaText, 
            vistaActual === 'comparativas' && styles.vistaTextoActivo,
            { color: theme === 'dark' ? '#fff' : '#000' }
          ]}>
            {t('comparisons')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.vistaButton, 
            vistaActual === 'tendencias' && styles.vistaActiva,
            { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
          ]}
          onPress={() => cambiarVista('tendencias')}
        >
          <Icon 
            name="trending-up" 
            size={20} 
            color={vistaActual === 'tendencias' 
              ? '#fff' 
              : theme === 'dark' ? '#fff' : '#000'
            } 
          />
          <Text style={[
            styles.vistaText, 
            vistaActual === 'tendencias' && styles.vistaTextoActivo,
            { color: theme === 'dark' ? '#fff' : '#000' }
          ]}>
            {t('trends')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.vistaButton, 
            vistaActual === 'vecindario' && styles.vistaActiva,
            { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
          ]}
          onPress={() => cambiarVista('vecindario')}
        >
          <Icon 
            name="location-city" 
            size={20} 
            color={vistaActual === 'vecindario' 
              ? '#fff' 
              : theme === 'dark' ? '#fff' : '#000'
            } 
          />
          <Text style={[
            styles.vistaText, 
            vistaActual === 'vecindario' && styles.vistaTextoActivo,
            { color: theme === 'dark' ? '#fff' : '#000' }
          ]}>
            {t('neighborhood')}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Selector de período */}
      <View style={styles.periodoSelector}>
        <TouchableOpacity 
          style={[
            styles.periodoButton, 
            periodoSeleccionado === 'mensual' && styles.periodoActivo,
            { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
          ]}
          onPress={() => cambiarPeriodo('mensual')}
        >
          <Text style={[
            styles.periodoText, 
            periodoSeleccionado === 'mensual' && styles.periodoTextoActivo,
            { color: theme === 'dark' ? '#fff' : '#000' }
          ]}>
            {t('monthly')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.periodoButton, 
            periodoSeleccionado === 'anual' && styles.periodoActivo,
            { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
          ]}
          onPress={() => cambiarPeriodo('anual')}
        >
          <Text style={[
            styles.periodoText, 
            periodoSeleccionado === 'anual' && styles.periodoTextoActivo,
            { color: theme === 'dark' ? '#fff' : '#000' }
          ]}>
            {t('yearly')}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        {vistaActual === 'comparativas' && (
          // Vista de comparativas
          <>
            {/* Resumen de ahorro */}
            <View style={[
              styles.ahorroCard, 
              { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
            ]}>
              <Text style={[
                styles.ahorroTitle, 
                { color: theme === 'dark' ? '#fff' : '#000' }
              ]}>
                {t('savingSummary')}
              </Text>
              
              <View style={styles.ahorroContent}>
                <View style={styles.ahorroIconContainer}>
                  <Icon name="savings" size={40} color="#2ecc71" />
                </View>
                
                <View style={styles.ahorroInfo}>
                  <Text style={[
                    styles.ahorroValor, 
                    { color: theme === 'dark' ? '#2ecc71' : '#27ae60' }
                  ]}>
                    {ahorroEstimado} kWh
                  </Text>
                  
                  <Text style={[
                    styles.ahorroDescripcion, 
                    { color: theme === 'dark' ? '#ccc' : '#666' }
                  ]}>
                    {t('estimatedSavings')} ({periodoSeleccionado === 'mensual' ? t('lastMonth') : t('lastYear')})
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Gráfico de comparativa */}
            <Text style={[
              styles.chartTitle, 
              { color: theme === 'dark' ? '#fff' : '#000' }
            ]}>
              {t('consumptionComparison')}
            </Text>
            
            <LineChart
              data={prepararDatosComparativa()}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              yAxisSuffix=" kWh"
              legend={prepararDatosComparativa().legend}
            />
            
            {/* Tabla de comparativa */}
            <Text style={[
              styles.tableTitle, 
              { color: theme === 'dark' ? '#fff' : '#000' }
            ]}>
              {t('detailedComparison')}
            </Text>
            
            <View style={[
              styles.tableContainer, 
              { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
            ]}>
              <View style={styles.tableHeader}>
                <Text style={[
                  styles.tableHeaderText, 
                  styles.tableColumn1, 
                  { color: theme === 'dark' ? '#fff' : '#000' }
                ]}>
                  {t('period')}
                </Text>
                <Text style={[
                  styles.tableHeaderText, 
                  styles.tableColumn2, 
                  { color: theme === 'dark' ? '#fff' : '#000' }
                ]}>
                  {t('current')}
                </Text>
                <Text style={[
                  styles.tableHeaderText, 
                  styles.tableColumn2, 
                  { color: theme === 'dark' ? '#fff' : '#000' }
                ]}>
                  {t('previous')}
                </Text>
                <Text style={[
                  styles.tableHeaderText, 
                  styles.tableColumn3, 
                  { color: theme === 'dark' ? '#fff' : '#000' }
                ]}>
                  {t('change')}
                </Text>
              </View>
              
              {datosComparativa.map((item, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.tableRow,
                    index % 2 === 0 && { 
                      backgroundColor: theme === 'dark' ? '#2c3e50' : '#f5f5f5' 
                    }
                  ]}
                >
                  <Text style={[
                    styles.tableCell, 
                    styles.tableColumn1, 
                    { color: theme === 'dark' ? '#fff' : '#000' }
                  ]}>
                    {item.periodo}
                  </Text>
                  <Text style={[
                    styles.tableCell, 
                    styles.tableColumn2, 
                    { color: theme === 'dark' ? '#fff' : '#000' }
                  ]}>
                    {item.consumoActual} kWh
                  </Text>
                  <Text style={[
                    styles.tableCell, 
                    styles.tableColumn2, 
                    { color: theme === 'dark' ? '#fff' : '#000' }
                  ]}>
                    {item.consumoAnterior} kWh
                  </Text>
                  <Text style={[
                    styles.tableCell, 
                    styles.tableColumn3, 
                    { 
                      color: item.diferencia < 0 
                        ? theme === 'dark' ? '#2ecc71' : '#27ae60' 
                        : theme === 'dark' ? '#e74c3c' : '#c0392b' 
                    }
                  ]}>
                    {item.diferencia > 0 ? '+' : ''}{item.diferencia} ({item.porcentaje > 0 ? '+' : ''}{item.porcentaje.toFixed(1)}%)
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
        
        {vistaActual === 'tendencias' && (
          // Vista de tendencias
          <>
            {/* Predicción */}
            <View style={[
              styles.prediccionCard, 
              { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
            ]}>
              <Text style={[
                styles.prediccionTitle, 
                { color: theme === 'dark' ? '#fff' : '#000' }
              ]}>
                {t('consumptionForecast')}
              </Text>
              
              <View style={styles.prediccionContent}>
                <View style={styles.prediccionIconContainer}>
                  <Icon name="insights" size={40} color="#3498db" />
                </View>
                
                <View style={styles.prediccionInfo}>
                  <Text style={[
                    styles.prediccionValor, 
                    { color: theme === 'dark' ? '#3498db' : '#2980b9' }
                  ]}>
                    {prediccionProximoMes} kWh
                  </Text>
                  
                  <Text style={[
                    styles.prediccionDescripcion, 
                    { color: theme === 'dark' ? '#ccc' : '#666' }
                  ]}>
                    {t('predictedNextMonth')}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Gráfico de tendencia */}
            <Text style={[
              styles.chartTitle, 
              { color: theme === 'dark' ? '#fff' : '#000' }
            ]}>
              {t('consumptionTrend')}
            </Text>
            
            <LineChart
              data={prepararDatosTendencia()}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              yAxisSuffix=" kWh"
              legend={prepararDatosTendencia().legend}
            />
            
            {/* Recomendaciones basadas en tendencias */}
            <View style={[
              styles.recomendacionesCard, 
              { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
            ]}>
              <Text style={[
                styles.recomendacionesTitle, 
                { color: theme === 'dark' ? '#fff' : '#000' }
              ]}>
                {t('recommendationsBasedOnTrends')}
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
                  {t('trendRecommendation1')}
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
                  {t('trendRecommendation2')}
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
                  {t('trendRecommendation3')}
                </Text>
              </View>
            </View>
          </>
        )}
        
        {vistaActual === 'vecindario' && (
          // Vista de vecindario
          <>
            {/* Comparativa con vecindario */}
            <View style={[
              styles.vecindarioCard, 
              { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
            ]}>
              <Text style={[
                styles.vecindarioTitle, 
                { color: theme === 'dark' ? '#fff' : '#000' }
              ]}>
                {t('neighborhoodComparison')}
              </Text>
              
              <Text style={[
                styles.vecindarioDescripcion, 
                { color: theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                {t('neighborhoodComparisonDesc')}
              </Text>
            </View>
            
            {/* Gráfico de vecindario */}
            <Text style={[
              styles.chartTitle, 
              { color: theme === 'dark' ? '#fff' : '#000' }
            ]}>
              {t('consumptionComparison')}
            </Text>
            
            <BarChart
              data={prepararDatosVecindario()}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisSuffix=" kWh"
              showValuesOnTopOfBars
              fromZero
              withInnerLines={false}
            />
            
            {/* Tabla de vecindario */}
            <Text style={[
              styles.tableTitle, 
              { color: theme === 'dark' ? '#fff' : '#000' }
            ]}>
              {t('detailedComparison')}
            </Text>
            
            <View style={[
              styles.tableContainer, 
              { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
            ]}>
              <View style={styles.tableHeader}>
                <Text style={[
                  styles.tableHeaderText, 
                  styles.tableColumn1, 
                  { color: theme === 'dark' ? '#fff' : '#000' }
                ]}>
                  {t('category')}
                </Text>
                <Text style={[
                  styles.tableHeaderText, 
                  styles.tableColumn2, 
                  { color: theme === 'dark' ? '#fff' : '#000' }
                ]}>
                  {t('average')}
                </Text>
                <Text style={[
                  styles.tableHeaderText, 
                  styles.tableColumn2, 
                  { color: theme === 'dark' ? '#fff' : '#000' }
                ]}>
                  {t('yours')}
                </Text>
                <Text style={[
                  styles.tableHeaderText, 
                  styles.tableColumn3, 
                  { color: theme === 'dark' ? '#fff' : '#000' }
                ]}>
                  {t('difference')}
                </Text>
              </View>
              
              {datosVecindario.map((item, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.tableRow,
                    index % 2 === 0 && { 
                      backgroundColor: theme === 'dark' ? '#2c3e50' : '#f5f5f5' 
                    }
                  ]}
                >
                  <Text style={[
                    styles.tableCell, 
                    styles.tableColumn1, 
                    { color: theme === 'dark' ? '#fff' : '#000' }
                  ]}>
                    {item.tipo}
                  </Text>
                  <Text style={[
                    styles.tableCell, 
                    styles.tableColumn2, 
                    { color: theme === 'dark' ? '#fff' : '#000' }
                  ]}>
                    {item.consumoPromedio} kWh
                  </Text>
                  <Text style={[
                    styles.tableCell, 
                    styles.tableColumn2, 
                    { color: theme === 'dark' ? '#fff' : '#000' }
                  ]}>
                    {item.tuConsumo} kWh
                  </Text>
                  <Text style={[
                    styles.tableCell, 
                    styles.tableColumn3, 
                    { 
                      color: item.diferencia < 0 
                        ? theme === 'dark' ? '#2ecc71' : '#27ae60' 
                        : theme === 'dark' ? '#e74c3c' : '#c0392b' 
                    }
                  ]}>
                    {item.diferencia > 0 ? '+' : ''}{item.diferencia} kWh
                  </Text>
                </View>
              ))}
            </View>
            
            {/* Consejos de eficiencia */}
            <View style={[
              styles.consejosCard, 
              { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
            ]}>
              <Text style={[
                styles.consejosTitle, 
                { color: theme === 'dark' ? '#fff' : '#000' }
              ]}>
                {t('efficiencyTips')}
              </Text>
              
              <Text style={[
                styles.consejosDescripcion, 
                { color: theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                {t('efficiencyTipsDesc')}
              </Text>
              
              <TouchableOpacity 
                style={[
                  styles.consejosButton, 
                  { backgroundColor: '#3498db' }
                ]}
                onPress={() => {
                  // Aquí iría la navegación a una página de consejos
                }}
              >
                <Text style={styles.consejosButtonText}>
                  {t('viewAllTips')}
                </Text>
              </TouchableOpacity>
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
    paddingBottom: 8,
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
  periodoSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  periodoButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  periodoActivo: {
    backgroundColor: '#3498db',
  },
  periodoText: {
    fontSize: 14,
  },
  periodoTextoActivo: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  ahorroCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  ahorroTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  ahorroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ahorroIconContainer: {
    marginRight: 16,
  },
  ahorroInfo: {
    flex: 1,
  },
  ahorroValor: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ahorroDescripcion: {
    fontSize: 14,
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
  tableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  tableContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  tableHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tableCell: {
    fontSize: 14,
  },
  tableColumn1: {
    flex: 2,
  },
  tableColumn2: {
    flex: 1.5,
    textAlign: 'center',
  },
  tableColumn3: {
    flex: 2,
    textAlign: 'right',
  },
  prediccionCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  prediccionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  prediccionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prediccionIconContainer: {
    marginRight: 16,
  },
  prediccionInfo: {
    flex: 1,
  },
  prediccionValor: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  prediccionDescripcion: {
    fontSize: 14,
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
  vecindarioCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  vecindarioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  vecindarioDescripcion: {
    fontSize: 14,
    lineHeight: 20,
  },
  consejosCard: {
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
  consejosTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  consejosDescripcion: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  consejosButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  consejosButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ComparativasTendencias;
