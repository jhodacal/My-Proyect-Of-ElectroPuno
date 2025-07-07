#!/usr/bin/env python3
"""
Script de prueba para validar la funcionalidad de la API de monitoreo de energía.
"""

import requests
import json
import time
from datetime import datetime

API_BASE_URL = 'http://192.168.1.7:8086/api'
DEVICE_ID = '000000'

def test_health_endpoint():
    """Prueba el endpoint de salud"""
    print("🔍 Probando endpoint de salud...")
    try:
        response = requests.get(f'{API_BASE_URL}/energy/health', timeout=5)
        if response.status_code == 200:
            print("✅ Endpoint de salud: OK")
            return True
        else:
            print(f"❌ Endpoint de salud falló: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Error conectando al servidor: {e}")
        return False

def test_config_endpoint():
    """Prueba el endpoint de configuración"""
    print("🔍 Probando endpoint de configuración...")
    try:
        response = requests.get(f'{API_BASE_URL}/energy/config', timeout=5)
        if response.status_code == 200:
            config = response.json()
            print("✅ Endpoint de configuración: OK")
            print(f"   Tarifa pico: {config['tariff']['peak_rate']}")
            print(f"   Tarifa valle: {config['tariff']['off_peak_rate']}")
            return True
        else:
            print(f"❌ Endpoint de configuración falló: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Error en endpoint de configuración: {e}")
        return False

def test_realtime_endpoint():
    """Prueba el endpoint de datos en tiempo real"""
    print("🔍 Probando endpoint de datos en tiempo real...")
    try:
        response = requests.get(f'{API_BASE_URL}/energy/realtime/{DEVICE_ID}', timeout=5)
        if response.status_code == 404:
            print("⚠️  Endpoint de tiempo real: No hay datos (esperado sin InfluxDB)")
            return True
        elif response.status_code == 200:
            data = response.json()
            print("✅ Endpoint de tiempo real: OK")
            print(f"   Voltaje: {data.get('voltage', 'N/A')} V")
            print(f"   Corriente: {data.get('current', 'N/A')} A")
            return True
        else:
            print(f"❌ Endpoint de tiempo real falló: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Error en endpoint de tiempo real: {e}")
        return False

def test_historical_endpoint():
    """Prueba el endpoint de datos históricos"""
    print("🔍 Probando endpoint de datos históricos...")
    try:
        params = {
            'period': 'day',
            'date': datetime.now().strftime('%Y-%m-%d')
        }
        response = requests.get(
            f'{API_BASE_URL}/energy/history/{DEVICE_ID}', 
            params=params, 
            timeout=5
        )
        if response.status_code == 404:
            print("⚠️  Endpoint histórico: No hay datos (esperado sin InfluxDB)")
            return True
        elif response.status_code == 200:
            data = response.json()
            print("✅ Endpoint histórico: OK")
            print(f"   Período: {data.get('period', 'N/A')}")
            print(f"   Fecha: {data.get('date', 'N/A')}")
            return True
        else:
            print(f"❌ Endpoint histórico falló: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Error en endpoint histórico: {e}")
        return False

def test_costs_endpoint():
    """Prueba el endpoint de cálculo de costos"""
    print("🔍 Probando endpoint de cálculo de costos...")
    try:
        params = {
            'period': 'month',
            'date': datetime.now().strftime('%Y-%m')
        }
        response = requests.get(
            f'{API_BASE_URL}/energy/costs/{DEVICE_ID}', 
            params=params, 
            timeout=5
        )
        if response.status_code == 404:
            print("⚠️  Endpoint de costos: No hay datos (esperado sin InfluxDB)")
            return True
        elif response.status_code == 200:
            data = response.json()
            print("✅ Endpoint de costos: OK")
            print(f"   Consumo total: {data.get('consumption', {}).get('total_kwh', 'N/A')} kWh")
            print(f"   Costo total: {data.get('costs', {}).get('total_cost', 'N/A')} PEN")
            return True
        else:
            print(f"❌ Endpoint de costos falló: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Error en endpoint de costos: {e}")
        return False

def test_analysis_endpoint():
    """Prueba el endpoint de análisis de dispositivos"""
    print("🔍 Probando endpoint de análisis...")
    try:
        params = {
            'period': 'month',
            'date': datetime.now().strftime('%Y-%m')
        }
        response = requests.get(
            f'{API_BASE_URL}/energy/analysis/{DEVICE_ID}', 
            params=params, 
            timeout=5
        )
        if response.status_code == 404:
            print("⚠️  Endpoint de análisis: No hay datos (esperado sin InfluxDB)")
            return True
        elif response.status_code == 200:
            data = response.json()
            print("✅ Endpoint de análisis: OK")
            print(f"   Dispositivos: {len(data.get('devices', []))}")
            print(f"   Consumo total: {data.get('total_consumption', 'N/A')} kWh")
            return True
        else:
            print(f"❌ Endpoint de análisis falló: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Error en endpoint de análisis: {e}")
        return False

def test_diagnostics_endpoint():
    """Prueba el endpoint de diagnósticos"""
    print("🔍 Probando endpoint de diagnósticos...")
    try:
        response = requests.get(f'{API_BASE_URL}/energy/diagnostics/{DEVICE_ID}', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Endpoint de diagnósticos: OK")
            print(f"   Estado del dispositivo: {data.get('device_status', 'N/A')}")
            print(f"   Salud general: {data.get('overall_health', 'N/A')}")
            return True
        else:
            print(f"❌ Endpoint de diagnósticos falló: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Error en endpoint de diagnósticos: {e}")
        return False

def test_alerts_endpoint():
    """Prueba el endpoint de alertas"""
    print("🔍 Probando endpoint de alertas...")
    try:
        response = requests.get(f'{API_BASE_URL}/energy/alerts/{DEVICE_ID}', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Endpoint de alertas: OK")
            print(f"   Alertas activas: {len(data.get('alerts', []))}")
            return True
        else:
            print(f"❌ Endpoint de alertas falló: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Error en endpoint de alertas: {e}")
        return False

def run_all_tests():
    """Ejecuta todas las pruebas"""
    print("🚀 Iniciando pruebas de la API de monitoreo de energía")
    print("=" * 60)
    
    tests = [
        test_health_endpoint,
        test_config_endpoint,
        test_realtime_endpoint,
        test_historical_endpoint,
        test_costs_endpoint,
        test_analysis_endpoint,
        test_diagnostics_endpoint,
        test_alerts_endpoint
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
            print()  # Línea en blanco entre pruebas
        except Exception as e:
            print(f"❌ Error inesperado en {test.__name__}: {e}")
            print()
    
    print("=" * 60)
    print(f"📊 Resultados: {passed}/{total} pruebas pasaron")
    
    if passed == total:
        print("🎉 ¡Todas las pruebas pasaron exitosamente!")
        return True
    else:
        print("⚠️  Algunas pruebas fallaron. Revisar configuración.")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)

