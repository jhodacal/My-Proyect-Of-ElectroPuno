import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { useTheme } from '../../utils/ThemeContext';
import { useLanguage } from '../../utils/LanguageContext';
import { useRouter } from 'expo-router';
import BackButton from '../../utils/BackButton';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BarChart, LineChart } from 'react-native-chart-kit';

// Configuración de la API - CAMBIAR POR TU URL DE SERVIDOR
const API_BASE_URL = 'http://192.168.1.7:5000'; // Cambiar por la URL de tu servidor Flask

// Interfaz para datos de consumo desde InfluxDB
interface ConsumoData {
  timestamp: string;
  voltage: number;
  current: number;
  power: number;
  energy: number;
  power_factor: number;
  frequency: number;
}

interface HistorialResponse {
  period: string;
  date: string;
  data: ConsumoData[];
  summary: {
    total_energy: number;
    avg_power: number;
    max_power: number;
    min_power: number;
  };
}

interface CostosResponse {
  period: string;
  date: string;
  consumption: {
    total_kwh: number;
    daily_average: number;
    peak_hours_kwh: number;
    off_peak_kwh: number;
  };
  costs: {
    total_cost: number;
    peak_hours_cost: number;
    off_peak_cost: number;
    currency: string;
  };
  tariff: {
    peak_rate: number;
    off_peak_rate: number;
    peak_hours: string;
  };
}

function HistorialConsumo() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [datosHistorial, setDatosHistorial] = useState<HistorialResponse | null>(null);
  const [datosCostos, setDatosCostos] = useState<CostosResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filtroFecha, setFiltroFecha] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM formato

  // ID del dispositivo real en InfluxDB
  const DEVICE_ID = 'ESP32_EnergyMonitor';

  // Configuración de gráficos
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
      r: "4",
      strokeWidth: "2",
      stroke: theme === 'dark' ? "#3498db" : "#2980b9"
    }
  };

  const screenWidth = Dimensions.get("window").width - 40;

  // Cargar datos reales desde InfluxDB
  const cargarDatosInfluxDB = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Formatear fecha según el período
      let fechaParam = filtroFecha;
      if (periodoSeleccionado === 'day') {
        fechaParam = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      } else if (periodoSeleccionado === 'year') {
        fechaParam = new Date().getFullYear().toString(); // YYYY
      }

      console.log(`Cargando datos de InfluxDB: período=${periodoSeleccionado}, fecha=${fechaParam}, dispositivo=${DEVICE_ID}`);

      // Obtener datos históricos
      const historialResponse = await fetch(
        `${API_BASE_URL}/energy/history/${DEVICE_ID}?period=${periodoSeleccionado}&date=${fechaParam}&aggregation=mean`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!historialResponse.ok) {
        throw new Error(`Error obteniendo historial: ${historialResponse.status}`);
      }

      const historialData = await historialResponse.json();
      setDatosHistorial(historialData);

      // Obtener datos de costos
      const costosResponse = await fetch(
        `${API_BASE_URL}/energy/costs/${DEVICE_ID}?period=${periodoSeleccionado}&date=${fechaParam}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!costosResponse.ok) {
        throw new Error(`Error obteniendo costos: ${costosResponse.status}`);
      }

      const costosData = await costosResponse.json();
      setDatosCostos(costosData);

      console.log('Datos cargados exitosamente:', {
        puntos_historial: historialData.data?.length || 0,
        energia_total: historialData.summary?.total_energy || 0,
        costo_total: costosData.costs?.total_cost || 0
      });

    } catch (err) {
      console.error('Error cargando datos de InfluxDB:', err);
      setError(t('Error conectando con InfluxDB. Verificar servidor y configuración.'));
      Alert.alert(
        t('Error de Conexión'),
        t('No se pudieron cargar los datos de InfluxDB. Verificar:\n• Servidor Flask ejecutándose\n• InfluxDB conectado\n• Datos disponibles para el período seleccionado'),
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos cuando cambia el período o fecha
  useEffect(() => {
    cargarDatosInfluxDB();
  }, [periodoSeleccionado, filtroFecha]);

  // Preparar datos para gráfico de líneas (consumo de energía)
  const prepararDatosGraficoLineas = () => {
    if (!datosHistorial || !datosHistorial.data || datosHistorial.data.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{ data: [0] }]
      };
    }

    // Limitar puntos para mejor visualización
    const datos = datosHistorial.data;
    const maxPuntos = 20;
    const paso = Math.max(1, Math.floor(datos.length / maxPuntos));
    const datosFiltrados = datos.filter((_, index) => index % paso === 0);

    return {
      labels: datosFiltrados.map((item, index) => {
        const fecha = new Date(item.timestamp);
        switch (periodoSeleccionado) {
          case 'day':
            return fecha.getHours().toString().padStart(2, '0') + 'h';
          case 'week':
            return ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][fecha.getDay()];
          case 'month':
            return fecha.getDate().toString();
          case 'year':
            return (fecha.getMonth() + 1).toString();
          default:
            return index.toString();
        }
      }),
      datasets: [
        {
          data: datosFiltrados.map(item => item.energy || 0),
          color: (opacity = 1) => theme === 'dark' ? `rgba(100, 210, 255, ${opacity})` : `rgba(0, 122, 255, ${opacity})`,
          strokeWidth: 2
        }
      ]
    };
  };

  // Preparar datos para gráfico de barras (potencia promedio)
  const prepararDatosGraficoBarras = () => {
    if (!datosHistorial || !datosHistorial.data || datosHistorial.data.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{ data: [0] }]
      };
    }

    // Agrupar datos para mejor visualización
    const datos = datosHistorial.data;
    const maxBarras = 7;
    const tamaño = Math.max(1, Math.floor(datos.length / maxBarras));
    const grupos = [];

    for (let i = 0; i < maxBarras && i * tamaño < datos.length; i++) {
      const inicio = i * tamaño;
      const fin = Math.min(inicio + tamaño, datos.length);
      const grupo = datos.slice(inicio, fin);
      const promedioEnergia = grupo.reduce((sum, item) => sum + (item.energy || 0), 0) / grupo.length;
      
      grupos.push({
        label: `${i + 1}`,
        energia: promedioEnergia
      });
    }

    return {
      labels: grupos.map(g => g.label),
      datasets: [
        {
          data: grupos.map(g => g.energia)
        }
      ]
    };
  };

  // Cambiar período
  const cambiarPeriodo = (periodo: 'day' | 'week' | 'month' | 'year') => {
    setPeriodoSeleccionado(periodo);
  };

  // Cambiar filtro de fecha
  const cambiarFecha = (incremento: number) => {
    const fecha = new Date(filtroFecha + '-01');
    
    if (periodoSeleccionado === 'month') {
      fecha.setMonth(fecha.getMonth() + incremento);
      setFiltroFecha(fecha.toISOString().slice(0, 7));
    } else if (periodoSeleccionado === 'year') {
      fecha.setFullYear(fecha.getFullYear() + incremento);
      setFiltroFecha(fecha.getFullYear().toString());
    } else if (periodoSeleccionado === 'day') {
      fecha.setDate(fecha.getDate() + incremento);
      setFiltroFecha(fecha.toISOString().slice(0, 10));
    } else if (periodoSeleccionado === 'week') {
      fecha.setDate(fecha.getDate() + (incremento * 7));
      setFiltroFecha(fecha.toISOString().slice(0, 10));
    }
  };

  // Formatear fecha según el período
  const formatearFecha = () => {
    const meses = [
      t('january'), t('february'), t('march'), t('april'), 
      t('may'), t('june'), t('july'), t('august'), 
      t('september'), t('october'), t('november'), t('december')
    ];
    
    switch (periodoSeleccionado) {
      case 'day':
        const fechaDay = new Date(filtroFecha);
        return `${fechaDay.getDate()} ${meses[fechaDay.getMonth()]} ${fechaDay.getFullYear()}`;
      case 'week':
        const fechaWeek = new Date(filtroFecha);
        return `${t('week')} ${Math.ceil(fechaWeek.getDate() / 7)}, ${meses[fechaWeek.getMonth()]} ${fechaWeek.getFullYear()}`;
      case 'month':
        const [year, month] = filtroFecha.split('-');
        return `${meses[parseInt(month) - 1]} ${year}`;
      case 'year':
        return filtroFecha;
      default:
        return '';
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
            {t('Historial de Consumo')}
          </Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme === 'dark' ? '#3498db' : '#2980b9'} />
          <Text style={[
            styles.loadingText, 
            { color: theme === 'dark' ? '#fff' : '#000' }
          ]}>
            {t('Cargando datos de InfluxDB...')}
          </Text>
          <Text style={[
            styles.loadingSubText, 
            { color: theme === 'dark' ? '#ccc' : '#666' }
          ]}>
            {t('Consultando bucket "Datos_de_energia"')}
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
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
            {t('Historial de Consumo')}
          </Text>
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={[
            styles.errorText, 
            { color: theme === 'dark' ? '#ff6b6b' : '#d9534f' }
          ]}>
            {error}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme === 'dark' ? '#3498db' : '#2980b9' }]}
            onPress={cargarDatosInfluxDB}
          >
            <Text style={styles.retryButtonText}>{t('Reintentar')}</Text>
          </TouchableOpacity>
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
          {t('Historial de Consumo - InfluxDB')}
        </Text>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        {/* Selector de período */}
        <View style={styles.periodoSelector}>
          <TouchableOpacity 
            style={[
              styles.periodoButton, 
              periodoSeleccionado === 'day' && styles.periodoActivo,
              { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
            ]}
            onPress={() => cambiarPeriodo('day')}
          >
            <Text style={[
              styles.periodoText, 
              periodoSeleccionado === 'day' && styles.periodoTextoActivo,
              { color: theme === 'dark' ? '#fff' : '#000' }
            ]}>
              {t('Día')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.periodoButton, 
              periodoSeleccionado === 'week' && styles.periodoActivo,
              { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
            ]}
            onPress={() => cambiarPeriodo('week')}
          >
            <Text style={[
              styles.periodoText, 
              periodoSeleccionado === 'week' && styles.periodoTextoActivo,
              { color: theme === 'dark' ? '#fff' : '#000' }
            ]}>
              {t('Semana')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.periodoButton, 
              periodoSeleccionado === 'month' && styles.periodoActivo,
              { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
            ]}
            onPress={() => cambiarPeriodo('month')}
          >
            <Text style={[
              styles.periodoText, 
              periodoSeleccionado === 'month' && styles.periodoTextoActivo,
              { color: theme === 'dark' ? '#fff' : '#000' }
            ]}>
              {t('Mes')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.periodoButton, 
              periodoSeleccionado === 'year' && styles.periodoActivo,
              { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
            ]}
            onPress={() => cambiarPeriodo('year')}
          >
            <Text style={[
              styles.periodoText, 
              periodoSeleccionado === 'year' && styles.periodoTextoActivo,
              { color: theme === 'dark' ? '#fff' : '#000' }
            ]}>
              {t('Año')}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Selector de fecha */}
        <View style={styles.fechaSelector}>
          <TouchableOpacity onPress={() => cambiarFecha(-1)}>
            <Icon name="chevron-left" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
          </TouchableOpacity>
          
          <Text style={[
            styles.fechaText, 
            { color: theme === 'dark' ? '#fff' : '#000' }
          ]}>
            {formatearFecha()}
          </Text>
          
          <TouchableOpacity onPress={() => cambiarFecha(1)}>
            <Icon name="chevron-right" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>
        
        {/* Resumen de consumo desde InfluxDB */}
        <View style={[
          styles.resumenCard, 
          { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
        ]}>
          <Text style={[
            styles.resumenTitle,
            { color: theme === 'dark' ? '#fff' : '#000' }
          ]}>
            {t('Resumen del Período')}
          </Text>
          
          <View style={styles.resumenItem}>
            <Text style={[
              styles.resumenLabel, 
              { color: theme === 'dark' ? '#ccc' : '#666' }
            ]}>
              {t('Consumo Total')}:
            </Text>
            <Text style={[
              styles.resumenValue, 
              { color: theme === 'dark' ? '#fff' : '#000' }
            ]}>
              {datosCostos?.consumption.total_kwh.toFixed(2) || '0.00'} kWh
            </Text>
          </View>
          
          <View style={styles.resumenItem}>
            <Text style={[
              styles.resumenLabel, 
              { color: theme === 'dark' ? '#ccc' : '#666' }
            ]}>
              {t('Costo Total')}:
            </Text>
            <Text style={[
              styles.resumenValue, 
              { color: theme === 'dark' ? '#81c784' : '#388e3c' }
            ]}>
              S/ {datosCostos?.costs.total_cost.toFixed(2) || '0.00'}
            </Text>
          </View>
          
          <View style={styles.resumenItem}>
            <Text style={[
              styles.resumenLabel, 
              { color: theme === 'dark' ? '#ccc' : '#666' }
            ]}>
              {t('Promedio Diario')}:
            </Text>
            <Text style={[
              styles.resumenValue, 
              { color: theme === 'dark' ? '#fff' : '#000' }
            ]}>
              {datosCostos?.consumption.daily_average.toFixed(2) || '0.00'} kWh
            </Text>
          </View>
          
          <View style={styles.resumenItem}>
            <Text style={[
              styles.resumenLabel, 
              { color: theme === 'dark' ? '#ccc' : '#666' }
            ]}>
              {t('Potencia Máxima')}:
            </Text>
            <Text style={[
              styles.resumenValue, 
              { color: theme === 'dark' ? '#ff9800' : '#f57c00' }
            ]}>
              {datosHistorial?.summary.max_power.toFixed(2) || '0.00'} W
            </Text>
          </View>
          
          <View style={styles.resumenItem}>
            <Text style={[
              styles.resumenLabel, 
              { color: theme === 'dark' ? '#ccc' : '#666' }
            ]}>
              {t('Horas Pico')} ({datosCostos?.tariff.peak_hours}):
            </Text>
            <Text style={[
              styles.resumenValue, 
              { color: theme === 'dark' ? '#fff' : '#000' }
            ]}>
              {datosCostos?.consumption.peak_hours_kwh.toFixed(2) || '0.00'} kWh
            </Text>
          </View>
        </View>
        
        {/* Gráfico de líneas - Tendencia de consumo */}
        <Text style={[
          styles.chartTitle, 
          { color: theme === 'dark' ? '#fff' : '#000' }
        ]}>
          {t('Tendencia de Consumo (kWh)')}
        </Text>
        
        <LineChart
          data={prepararDatosGraficoLineas()}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          yAxisSuffix=" kWh"
        />
        
        {/* Gráfico de barras - Distribución de energía */}
        <Text style={[
          styles.chartTitle, 
          { color: theme === 'dark' ? '#fff' : '#000' }
        ]}>
          {t('Distribución de Energía')}
        </Text>
        
        <BarChart
          data={prepararDatosGraficoBarras()}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          yAxisSuffix=" kWh"
          showValuesOnTopOfBars
        />
        
        {/* Información de la fuente de datos */}
        <View style={[
          styles.infoCard, 
          { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
        ]}>
          <Text style={[
            styles.infoTitle,
            { color: theme === 'dark' ? '#fff' : '#000' }
          ]}>
            {t('Información de Datos')}
          </Text>
          
          <Text style={[
            styles.infoText,
            { color: theme === 'dark' ? '#ccc' : '#666' }
          ]}>
            📊 {t('Fuente')}: InfluxDB - Bucket "Datos_de_energia"
          </Text>
          
          <Text style={[
            styles.infoText,
            { color: theme === 'dark' ? '#ccc' : '#666' }
          ]}>
            🔌 {t('Dispositivo')}: ESP32_EnergyMonitor
          </Text>
          
          <Text style={[
            styles.infoText,
            { color: theme === 'dark' ? '#ccc' : '#666' }
          ]}>
            📈 {t('Puntos de datos')}: {datosHistorial?.data.length || 0}
          </Text>
          
          <Text style={[
            styles.infoText,
            { color: theme === 'dark' ? '#ccc' : '#666' }
          ]}>
            💰 {t('Tarifas')}: Pico S/{datosCostos?.tariff.peak_rate}/kWh, Valle S/{datosCostos?.tariff.off_peak_rate}/kWh
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubText: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  periodoSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginVertical: 20,
  },
  periodoButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3498db',
  },
  periodoActivo: {
    backgroundColor: '#3498db',
  },
  periodoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  periodoTextoActivo: {
    color: '#fff',
  },
  fechaSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  fechaText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resumenCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resumenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  resumenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  resumenLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  resumenValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  chart: {
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
  },
});

export default HistorialConsumo;

