#!/usr/bin/env python3
"""
Servidor de prueba simplificado para demostrar la funcionalidad de la API.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import random

app = Flask(__name__)
CORS(app)

# Datos simulados para demostración
def generate_sample_data():
    """Genera datos de muestra para demostración"""
    now = datetime.now()
    return {
        'timestamp': now.isoformat(),
        'voltage': round(220 + random.uniform(-5, 5), 2),
        'current': round(random.uniform(1, 15), 2),
        'power': round(random.uniform(200, 3000), 2),
        'energy': round(random.uniform(0.1, 5), 3),
        'power_factor': round(random.uniform(0.8, 1.0), 2),
        'frequency': round(60 + random.uniform(-0.5, 0.5), 1),
        'device_id': 'device_001'
    }

@app.route('/api/energy/health', methods=['GET'])
def health_check():
    """Endpoint de salud"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
        'influxdb_connected': False,  # Simulado
        'message': 'API funcionando correctamente'
    })

@app.route('/api/energy/config', methods=['GET'])
def get_config():
    """Obtener configuración de tarifas"""
    return jsonify({
        'tariff': {
            'peak_rate': 0.18,
            'off_peak_rate': 0.13,
            'peak_hours': '18:00-22:00',
            'currency': 'PEN'
        },
        'device_settings': {
            'sampling_rate': 5,
            'data_retention_days': 365
        }
    })

@app.route('/api/energy/realtime/<device_id>', methods=['GET'])
def get_realtime_data(device_id):
    """Obtener datos en tiempo real"""
    if device_id != 'device_001':
        return jsonify({'error': 'Device not found'}), 404
    
    return jsonify(generate_sample_data())

@app.route('/api/energy/history/<device_id>', methods=['GET'])
def get_historical_data(device_id):
    """Obtener datos históricos"""
    if device_id != 'device_001':
        return jsonify({'error': 'Device not found'}), 404
    
    period = request.args.get('period', 'day')
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    
    # Generar datos históricos simulados
    data_points = []
    for i in range(24):  # 24 horas de datos
        timestamp = datetime.now().replace(hour=i, minute=0, second=0, microsecond=0)
        data_points.append({
            'timestamp': timestamp.isoformat(),
            'voltage': round(220 + random.uniform(-3, 3), 2),
            'current': round(random.uniform(0.5, 12), 2),
            'power': round(random.uniform(100, 2500), 2),
            'energy': round(random.uniform(0.1, 3), 3),
            'power_factor': round(random.uniform(0.85, 0.98), 2),
            'frequency': round(60 + random.uniform(-0.2, 0.2), 1)
        })
    
    return jsonify({
        'period': period,
        'date': date,
        'data': data_points,
        'summary': {
            'total_energy': sum(d['energy'] for d in data_points),
            'avg_power': sum(d['power'] for d in data_points) / len(data_points),
            'max_power': max(d['power'] for d in data_points),
            'min_power': min(d['power'] for d in data_points)
        }
    })

@app.route('/api/energy/costs/<device_id>', methods=['GET'])
def get_cost_data(device_id):
    """Calcular costos de energía"""
    if device_id != 'device_001':
        return jsonify({'error': 'Device not found'}), 404
    
    period = request.args.get('period', 'month')
    date = request.args.get('date', datetime.now().strftime('%Y-%m'))
    
    # Simulación de cálculo de costos
    total_kwh = random.uniform(200, 400)
    peak_kwh = total_kwh * 0.3
    off_peak_kwh = total_kwh * 0.7
    
    peak_cost = peak_kwh * 0.18
    off_peak_cost = off_peak_kwh * 0.13
    total_cost = peak_cost + off_peak_cost + 5.50  # Cargo fijo
    
    return jsonify({
        'period': period,
        'date': date,
        'consumption': {
            'total_kwh': round(total_kwh, 2),
            'daily_average': round(total_kwh / 30, 2),
            'peak_hours_kwh': round(peak_kwh, 2),
            'off_peak_kwh': round(off_peak_kwh, 2)
        },
        'costs': {
            'total_cost': round(total_cost, 2),
            'peak_hours_cost': round(peak_cost, 2),
            'off_peak_cost': round(off_peak_cost, 2),
            'currency': 'PEN'
        },
        'tariff': {
            'peak_rate': 0.18,
            'off_peak_rate': 0.13,
            'peak_hours': '18:00-22:00'
        },
        'comparison': {
            'consumption': round(random.uniform(-10, 15), 1),
            'cost': round(random.uniform(-8, 12), 1),
            'change_percent': round(random.uniform(-15, 20), 1)
        }
    })

@app.route('/api/energy/analysis/<device_id>', methods=['GET'])
def get_analysis_data(device_id):
    """Análisis de consumo por dispositivos"""
    if device_id != 'device_001':
        return jsonify({'error': 'Device not found'}), 404
    
    period = request.args.get('period', 'month')
    date = request.args.get('date', datetime.now().strftime('%Y-%m'))
    
    devices = [
        {
            'device_name': 'Aire Acondicionado',
            'device_type': 'HVAC',
            'consumption_kwh': round(random.uniform(80, 120), 2),
            'percentage': round(random.uniform(35, 45), 1),
            'cost': round(random.uniform(15, 25), 2),
            'efficiency_rating': 'B+',
            'recommendations': [
                'Ajustar temperatura a 24°C para ahorrar energía',
                'Limpiar filtros mensualmente'
            ]
        },
        {
            'device_name': 'Refrigeradora',
            'device_type': 'Appliance',
            'consumption_kwh': round(random.uniform(40, 60), 2),
            'percentage': round(random.uniform(18, 25), 1),
            'cost': round(random.uniform(8, 12), 2),
            'efficiency_rating': 'A',
            'recommendations': [
                'Verificar sellado de puertas',
                'Descongelar regularmente'
            ]
        },
        {
            'device_name': 'Iluminación',
            'device_type': 'Lighting',
            'consumption_kwh': round(random.uniform(20, 35), 2),
            'percentage': round(random.uniform(10, 15), 1),
            'cost': round(random.uniform(4, 7), 2),
            'efficiency_rating': 'A+',
            'recommendations': [
                'Cambiar a LED si no lo ha hecho',
                'Usar sensores de movimiento'
            ]
        }
    ]
    
    total_consumption = sum(d['consumption_kwh'] for d in devices)
    total_cost = sum(d['cost'] for d in devices)
    
    return jsonify({
        'period': period,
        'date': date,
        'devices': devices,
        'total_consumption': round(total_consumption, 2),
        'total_cost': round(total_cost, 2)
    })

@app.route('/api/energy/diagnostics/<device_id>', methods=['GET'])
def get_diagnostics(device_id):
    """Diagnósticos del dispositivo"""
    if device_id != 'device_001':
        return jsonify({'error': 'Device not found'}), 404
    
    return jsonify({
        'device_id': device_id,
        'device_status': 'online',
        'last_reading': datetime.now().isoformat(),
        'overall_health': 'good',
        'metrics': {
            'uptime_hours': random.randint(100, 1000),
            'data_quality': 'excellent',
            'connection_stability': 'stable',
            'sensor_calibration': 'ok'
        },
        'issues': [],
        'recommendations': [
            'Sistema funcionando correctamente',
            'Próxima calibración en 30 días'
        ]
    })

@app.route('/api/energy/alerts/<device_id>', methods=['GET'])
def get_alerts(device_id):
    """Obtener alertas del dispositivo"""
    if device_id != 'device_001':
        return jsonify({'error': 'Device not found'}), 404
    
    alerts = []
    
    # Simular algunas alertas ocasionales
    if random.random() < 0.3:  # 30% probabilidad
        alerts.append({
            'id': 'alert_001',
            'type': 'high_consumption',
            'severity': 'warning',
            'message': 'Consumo 15% por encima del promedio',
            'timestamp': datetime.now().isoformat(),
            'resolved': False
        })
    
    if random.random() < 0.1:  # 10% probabilidad
        alerts.append({
            'id': 'alert_002',
            'type': 'voltage_fluctuation',
            'severity': 'info',
            'message': 'Fluctuaciones menores de voltaje detectadas',
            'timestamp': (datetime.now() - timedelta(hours=2)).isoformat(),
            'resolved': True
        })
    
    return jsonify({
        'device_id': device_id,
        'alerts': alerts,
        'total_active': len([a for a in alerts if not a['resolved']]),
        'last_check': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🚀 Iniciando servidor de prueba de API de monitoreo de energía")
    print("📡 Servidor disponible en: http://localhost:5000")
    print("🔍 Endpoints disponibles:")
    print("   - GET /api/energy/health")
    print("   - GET /api/energy/config")
    print("   - GET /api/energy/realtime/<device_id>")
    print("   - GET /api/energy/history/<device_id>")
    print("   - GET /api/energy/costs/<device_id>")
    print("   - GET /api/energy/analysis/<device_id>")
    print("   - GET /api/energy/diagnostics/<device_id>")
    print("   - GET /api/energy/alerts/<device_id>")
    print()
    
    app.run(host='0.0.0.0', port=5000, debug=True)

