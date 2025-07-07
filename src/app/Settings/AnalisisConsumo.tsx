import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,Alert,Dimensions} from 'react-native';
import { useTheme } from '../../utils/ThemeContext';
import { useLanguage } from '../../utils/LanguageContext';
import { useRouter } from 'expo-router';
import BackButton from '../../utils/BackButton';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { PieChart } from 'react-native-chart-kit';

// Interfaz para dispositivos
interface Dispositivo { id: string;nombre: string;tipo: string; consumo: number; porcentaje: number; activo: boolean; color: string;}

function AnalisisConsumo  ()  {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [consumoTotal, setConsumoTotal] = useState(0);
  const [costoEstimado, setCostoEstimado] = useState(0);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<'diario' | 'semanal' | 'mensual'>('mensual');
  const [recomendaciones, setRecomendaciones] = useState<string[]>([]);
  // Configuración de gráficos
  const screenWidth = Dimensions.get("window").width - 40;
   // Cargar datos simulados
  useEffect(() => { const cargarDatos = async () => { setLoading(true);
      // Simulación de carga de datos desde API o base de datos
      setTimeout(() => {  const dispositivosSimulados: Dispositivo[] = [
          { id: '1',nombre: t('refrigerator'),tipo: 'electrodomestico',consumo: 120,porcentaje: 25,activo: true, color: '#FF6384'},
          {id: '2', nombre: t('airConditioner'),tipo: 'climatizacion',consumo: 180,porcentaje: 38,activo: true,color: '#36A2EB'},
          {id: '3', nombre: t('washingMachine'),tipo: 'electrodomestico',consumo: 45,porcentaje: 9,activo: true,color: '#FFCE56'},
          {id: '4', nombre: t('lighting'),tipo: 'iluminacion',consumo: 35,porcentaje: 7,activo: true,color: '#4BC0C0'},
          {id: '5',nombre: t('television'),tipo: 'entretenimiento',consumo: 50,porcentaje: 11,activo: true,color: '#9966FF'},
          {id: '6', nombre: t('otherDevices'),tipo: 'otros',consumo: 48,porcentaje: 10,activo: true,color: '#FF9F40'}];
        
        // Calcular consumo total
        const total = dispositivosSimulados.reduce((sum, device) => sum + device.consumo, 0);
        setConsumoTotal(total);
                // Calcular costo estimado (precio por kWh: 0.15)
        setCostoEstimado(total * 0.15);
                // Generar recomendaciones basadas en los dispositivos
        const recomendacionesGeneradas = [
          t('recommendationRefrigerator'),
          t('recommendationAC'),
          t('recommendationStandby'),
          t('recommendationLighting'),
          t('recommendationPeakHours')
        ];
        setDispositivos(dispositivosSimulados);
        setRecomendaciones(recomendacionesGeneradas);
        setLoading(false);
      }, 1500);
    };
    
    cargarDatos();
  }, [periodoSeleccionado, t]);

  // Preparar datos para gráfico de pastel
  const prepararDatosPastel = () => {
    return dispositivos.map(dispositivo => ({
      name: dispositivo.nombre,
      consumption: dispositivo.consumo,
      percentage: dispositivo.porcentaje,
      color: dispositivo.color,
      legendFontColor: theme === 'dark' ? '#FFF' : '#000',
      legendFontSize: 12
    })); };

  // Cambiar período
  const cambiarPeriodo = (periodo: 'diario' | 'semanal' | 'mensual') => { setPeriodoSeleccionado(periodo); };

  // Compartir análisis
  const compartirAnalisis = () => { Alert.alert( t('shareAnalysis'), t('shareAnalysisConfirmation'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('share'),onPress: () => {  Alert.alert(t('success'), t('analysisShared')); } }
      ]
    );};

  // Generar informe detallado
  const generarInforme = () => {Alert.alert(t('generateReport'), t('generateReportConfirmation'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('generate'), onPress: () => {Alert.alert(t('success'), t('reportGenerated')); }}
      ]
    );};

  if (loading) {
    return (
      <View style={[ styles.container, { backgroundColor: theme === 'dark' ? '#121212' : '#f5f5f5' }]}>
              <View style={styles.header}>
                <BackButton onPress={() => router.back()} tintColor={theme === 'dark' ? '#fff' : '#000'} />
                <Text style={[styles.headerTitle,{ color: theme === 'dark' ? '#fff' : '#000' }]}>
                  {t('Analisis de Consumo')}
                </Text>
          </View>
          
          <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme === 'dark' ? '#3498db' : '#2980b9'} />
                <Text style={[styles.loadingText,{ color: theme === 'dark' ? '#fff' : '#000' } ]}>
                  {t('Analizando el consumo ...')}
                </Text>
          </View>
      </View>
    );}
  return (
    <View style={[ styles.container,  { backgroundColor: theme === 'dark' ? '#121212' : '#f5f5f5' } ]}>
          <View style={styles.header}>
              <BackButton onPress={() => router.back()} tintColor={theme === 'dark' ? '#fff' : '#000'}  />
              <Text style={[ styles.headerTitle, { color: theme === 'dark' ? '#fff' : '#000' } ]}>
                {t('Analisis de Consumo')}
              </Text>
          </View>
        
      <ScrollView style={styles.scrollContainer}>
          {/* SELECCION DE PERIODO */}
            <View style={styles.periodoSelector}>
                <TouchableOpacity style={[styles.periodoButton,periodoSeleccionado === 'diario' && styles.periodoActivo,{ backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}
                onPress={() => cambiarPeriodo('diario')}>
                    <Text style={[styles.periodoText,periodoSeleccionado === 'diario' && styles.periodoTextoActivo,{ color: theme === 'dark' ? '#fff' : '#000' }]}>
                      {t('daily')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.periodoButton, periodoSeleccionado === 'semanal' && styles.periodoActivo,{ backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' } ]}
                onPress={() => cambiarPeriodo('semanal')}>
                  <Text style={[ styles.periodoText, periodoSeleccionado === 'semanal' && styles.periodoTextoActivo, { color: theme === 'dark' ? '#fff' : '#000' } ]}>
                    {t('weekly')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.periodoButton, periodoSeleccionado === 'mensual' && styles.periodoActivo, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}
                onPress={() => cambiarPeriodo('mensual')} >
                  <Text style={[styles.periodoText,periodoSeleccionado === 'mensual' && styles.periodoTextoActivo,{ color: theme === 'dark' ? '#fff' : '#000' }]}>
                    {t('monthly')}
                  </Text>
                </TouchableOpacity>
            </View>
          {/* RESUMEN DEL CONSUMO */}
            <View style={[styles.resumenCard, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
                <Text style={[styles.resumenTitle, { color: theme === 'dark' ? '#fff' : '#000' }]}>
                  {t('consumptionSummary')}
                </Text>
                <View style={styles.resumenItem}>
                    <Text style={[styles.resumenLabel, { color: theme === 'dark' ? '#ccc' : '#666' }]}>
                      {t('totalConsumption')}:
                    </Text>
                    <Text style={[styles.resumenValue, { color: theme === 'dark' ? '#fff' : '#000' }]}>{consumoTotal} kWh </Text>
                </View>
                <View style={styles.resumenItem}>
                    <Text style={[styles.resumenLabel, { color: theme === 'dark' ? '#ccc' : '#666' }]}>
                      {t('estimatedCost')}:
                    </Text>
                    <Text style={[styles.resumenValue, { color: theme === 'dark' ? '#fff' : '#000' }]}>
                      S/. {costoEstimado.toFixed(2)}
                    </Text>
                </View>
                <View style={styles.resumenItem}>
                    <Text style={[styles.resumenLabel,{ color: theme === 'dark' ? '#ccc' : '#666' }]}>
                      {t('activePeriod')}:
                    </Text>
                    <Text style={[styles.resumenValue, { color: theme === 'dark' ? '#fff' : '#000' }]}>{periodoSeleccionado === 'diario' ? t('today') : periodoSeleccionado === 'semanal'
                          ? t('currentWeek')
                          : t('currentMonth')  }
                    </Text>
                </View>
            </View>
          
          {/* GRAFICO DE DISTRIBUCIÓN */}
            <Text style={[ styles.chartTitle,  { color: theme === 'dark' ? '#fff' : '#000' }]}>
              {t('consumptionDistribution')}
            </Text>
              <View style={styles.chartContainer}>
                    <PieChart
                      data={prepararDatosPastel()}
                      width={screenWidth}
                      height={220}
                      chartConfig={{
                      backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
                      backgroundGradientFrom: theme === 'dark' ? '#1e1e1e' : '#ffffff',
                      backgroundGradientTo: theme === 'dark' ? '#1e1e1e' : '#ffffff',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      labelColor: (opacity = 1) => theme === 'dark' ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
                      }}
                      accessor="percentage"
                      backgroundColor="transparent"
                      paddingLeft="15"
                      absolute
                    />
              </View>
          
          {/* lISTA DE DISPOSITIVOS */}
            <Text style={[ styles.sectionTitle, { color: theme === 'dark' ? '#fff' : '#000' }]}> {t('devicesList')} </Text>
              {dispositivos.map(dispositivo => (
                <View key={dispositivo.id} style={[styles.dispositivoItem, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
                    <View style={[styles.dispositivoColor, { backgroundColor: dispositivo.color }]} />
                    <View style={styles.dispositivoInfo}>
                          <Text style={[styles.dispositivoNombre, { color: theme === 'dark' ? '#fff' : '#000' } ]}> {dispositivo.nombre} </Text>
                          <Text style={[styles.dispositivoTipo, {color: theme === 'dark' ? '#ccc' : '#666' }]}>{dispositivo.tipo}</Text>
                    </View>
                    <View style={styles.dispositivoConsumo}>
                      <Text style={[styles.consumoValor, { color: theme === 'dark' ? '#fff' : '#000' } ]}> {dispositivo.consumo} kWh </Text>
                      <Text style={[styles.consumoPorcentaje, { color: dispositivo.color }]}> {dispositivo.porcentaje}% </Text>
                    </View>
                </View>
            ))}
          
          {/* RECOMENDACIONES DE AHORRO*/}
            <View style={[styles.recomendacionesCard,{backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
                <Text style={[styles.recomendacionesTitle,{ color: theme === 'dark' ? '#fff' : '#000' } ]}>
                  {t('savingRecommendations')}
                </Text>
                {recomendaciones.map((recomendacion, index) => (
                <View key={index} style={styles.recomendacionItem}>
                  <Icon name="lightbulb"  size={20} color="#f39c12"  style={styles.recomendacionIcon} />
                  <Text style={[styles.recomendacionText, { color: theme === 'dark' ? '#ccc' : '#666' } ]}> {recomendacion} </Text>
                </View> ))}
            </View>
          
          {/* BOTONES DE ACCION */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#3498db' }]} onPress={compartirAnalisis} >
                <Icon name="share" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>{t('shareAnalysis')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#2ecc71' }]}onPress={generarInforme}>
                <Icon name="description" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>{t('generateReport')}</Text>
              </TouchableOpacity>
            </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1,},
  header: {flexDirection: 'row',alignItems: 'center',padding: 16,borderBottomWidth: 1,borderBottomColor: '#ccc',},
  headerTitle: {fontSize: 20,fontWeight: 'bold',marginLeft: 16,},
  loadingContainer: {flex: 1,justifyContent: 'center',alignItems: 'center',},
  loadingText: {marginTop: 10,fontSize: 16,},
  scrollContainer: {flex: 1,padding: 16,},
  periodoSelector: {flexDirection: 'row',justifyContent: 'space-between',marginBottom: 16,},
  periodoButton: {flex: 1,paddingVertical: 8,paddingHorizontal: 12,borderRadius: 20,marginHorizontal: 4,elevation: 1,shadowColor: '#000',shadowOffset: { width: 0, height: 1 },shadowOpacity: 0.1,shadowRadius: 1,alignItems: 'center', },
  periodoActivo: {backgroundColor: '#3498db',},
  periodoText: {fontSize: 14,},
  periodoTextoActivo: {color: '#fff',fontWeight: 'bold',},
  resumenCard: {borderRadius: 8,padding: 16,marginBottom: 16,elevation: 2,shadowColor: '#000',shadowOffset: { width: 0, height: 1 },shadowOpacity: 0.2,shadowRadius: 1.41,},
  resumenTitle: {fontSize: 16,fontWeight: 'bold',marginBottom: 12,},
  resumenItem: {flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center',paddingVertical: 8,borderBottomWidth: 1,borderBottomColor: 'rgba(0,0,0,0.1)',},
  resumenLabel: {fontSize: 14,},
  resumenValue: {fontSize: 16,fontWeight: 'bold',},
  chartTitle: {fontSize: 16,fontWeight: 'bold',marginTop: 16,marginBottom: 8,},
  chartContainer: {alignItems: 'center',marginBottom: 16,},
  sectionTitle: {fontSize: 16,fontWeight: 'bold',marginTop: 16,marginBottom: 8,},
  dispositivoItem: {flexDirection: 'row',alignItems: 'center',padding: 12,borderRadius: 8,marginBottom: 8,elevation: 1,shadowColor: '#000',shadowOffset: { width: 0, height: 1 },shadowOpacity: 0.1, shadowRadius: 1,},
  dispositivoColor: {width: 16,height: 16,borderRadius: 8, marginRight: 12,},
  dispositivoInfo: {flex: 1,},
  dispositivoNombre: {fontSize: 16,fontWeight: 'bold',marginBottom: 4,},
  dispositivoTipo: {fontSize: 12,},
  dispositivoConsumo: {alignItems: 'flex-end',},
  consumoValor: { fontSize: 14,fontWeight: 'bold',marginBottom: 4,},
  consumoPorcentaje: {fontSize: 12,fontWeight: 'bold',},
  recomendacionesCard: {borderRadius: 8,padding: 16,marginTop: 16,marginBottom: 16,elevation: 2,shadowColor: '#000',shadowOffset: { width: 0, height: 1 },shadowOpacity: 0.2,shadowRadius: 1.41,},
  recomendacionesTitle: {fontSize: 16,fontWeight: 'bold',marginBottom: 12,},
  recomendacionItem: {flexDirection: 'row',alignItems: 'flex-start',marginBottom: 12},
  recomendacionIcon: {marginRight: 8,marginTop: 2,},
  recomendacionText: {flex: 1,fontSize: 14,lineHeight: 20, },
  actionButtons: {flexDirection: 'row',justifyContent: 'space-between',marginBottom: 24,},
  actionButton: {flexDirection: 'row',alignItems: 'center',justifyContent: 'center',padding: 12,borderRadius: 8,flex: 1, marginHorizontal: 5,},
  actionButtonText: {color: '#fff',fontWeight: 'bold',marginLeft: 5,},
});

export default AnalisisConsumo;
