from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from influxdb_client import InfluxDBClient
from influxdb_client.client.exceptions import InfluxDBError
from functools import wraps
import jwt as pyjwt
import jwt
import os
from datetime import datetime, timedelta, timezone
import logging
from dotenv import load_dotenv
from influxdb_client import InfluxDBClient
from influxdb_client.client.write_api import SYNCHRONOUS

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuración InfluxDB
INFLUX_URL = os.getenv('INFLUXDB_URL', 'http://192.168.1.7:8086')
INFLUX_TOKEN = os.getenv('INFLUXDB_TOKEN','xC_L3_e59K130VqbQtRsMS1jWSDpr3Oyo3Ymz9jk1I5AmH0evoSoUJ8b06GSqKUjOfXytRBpoiZ4reEuqw24Ag==')
INFLUX_ORG = os.getenv('INFLUXDB_ORG', 'Jhodacal')
INFLUX_BUCKET = os.getenv('INFLUX_BUCKET', 'Datos_de_energia')
JWT_SECRET = os.getenv('JWT_SECRET', '123456789/jhodacal')
device_id = "ESP32_EnergyMonitor"

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cliente InfluxDB
influx_client = InfluxDBClient(
    url=INFLUX_URL,
    token=INFLUX_TOKEN,
    org=INFLUX_ORG,
    timeout=30_000,
    verify_ssl=False,
    debug=True
)

# Verificar conexión inicial
try:
    health = influx_client.health()
    print(f"✔ Conexión a InfluxDB exitosa. Status: {health.status}, Version: {health.version}")
except Exception as e:
    print(f"❌ Error conectando a InfluxDB: {str(e)}")
    raise

CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:19006",
            "exp://192.168.1.*:19000",
            "http://192.168.1.*:19006"
        ],
        "methods": ["GET", "POST"],
        "allow_headers": ["Authorization", "Content-Type"]
    }
})

# Decorador para autenticación JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            token = token.split()[1]  # Eliminar 'Bearer '
            data = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        except Exception as e:
            logger.error(f"Error de autenticación: {str(e)}")
            return jsonify({'error': 'Token is invalid'}), 401
        
        return f(*args, **kwargs)
    return decorated

# Generar token JWT para autenticación
@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        auth_data = request.get_json()
        if not auth_data:
            return jsonify({"error": "Missing JSON data"}), 400

        username = auth_data.get('username')
        password = auth_data.get('password')

        if not username or not password:
            return jsonify({"error": "Missing username or password"}), 400

        # Verificación básica
        if username == 'admin' and password == 'secret':
            token = pyjwt.encode(
                {
                    'user': username,
                    'exp': datetime.utcnow() + timedelta(hours=12)
                },
                JWT_SECRET,
                algorithm='HS256'
            )
            return jsonify({"token": token})

        return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    
@app.route('/')
def home():
    return jsonify({
        "message": "Bienvenido a la API de Energía con Historial",
        "endpoints": {
            "login": "POST /api/auth/login",
            "energy_data": "GET /api/energy/<device_id>",
            "energy_history": "GET /api/energy/<device_id>/history",
            "health": "GET /api/health"
        }
    })

# Health check del servicio
@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        health = influx_client.health()
        return jsonify({
            'status': 'healthy',
            'influxdb': {
                'status': health.status,
                'version': health.version
            },
            'timestamp': datetime.utcnow().isoformat()
        })
    except InfluxDBError as e:
        logger.error(f"InfluxDB health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 503

# Endpoint para datos de energía en tiempo real
@app.route('/api/energy/<device_id>', methods=['GET'])
@token_required
def get_energy_data(device_id):
    try:
        query = f'''
        from(bucket: "{INFLUX_BUCKET}")
          |> range(start: -5m)
          |> filter(fn: (r) => r["_measurement"] == "energy_readings")
          |> filter(fn: (r) => r["device"] == "{device_id}")
          |> last()
        '''
        result = influx_client.query_api().query(query)
        
        # Inicializar objeto de datos de energía con valores por defecto
        energy_data = {
            "voltage": 0.0,
            "current": 0.0,
            "power": 0.0,
            "energy": 0.0,
            "power_factor": 0.0,
            "frequency": 50.0,
            "timestamp": datetime.utcnow().isoformat(),
            "device_id": device_id
        }
        
        # Procesar los resultados de InfluxDB
        for table in result:
            for record in table.records:
                field_name = record.get_field()
                field_value = record.get_value()
                
                # Mapear los campos de InfluxDB a las propiedades esperadas
                if field_name in energy_data:
                    energy_data[field_name] = float(field_value) if field_value is not None else 0.0
                    energy_data["timestamp"] = record.get_time().isoformat()
        
        # Si no hay datos recientes, devolver datos simulados para pruebas
        if not result or len(list(result)) == 0:
            logger.warning(f"No data found for device {device_id}, returning simulated data")
            energy_data.update({
                "voltage": 220.5,
                "current": 2.3,
                "power": 506.15,
                "energy": 1.25,
                "power_factor": 0.95,
                "frequency": 50.0,
                "timestamp": datetime.utcnow().isoformat(),
                "device_id": device_id
            })
        
        logger.info(f"Returning energy data: {energy_data}")
        return jsonify(energy_data)
    
    except Exception as e:
        logger.error(f"ERROR CRÍTICO: {str(e)}")
        return jsonify({
            "error": str(e),
            "message": "Error al obtener datos de energía",
            "timestamp": datetime.utcnow().isoformat()
        }), 500

# NUEVO ENDPOINT: Historial de consumo de energía
@app.route('/api/energy/<device_id>/history', methods=['GET'])
@token_required
def get_energy_history(device_id):
    try:
        # Obtener parámetros de consulta
        period = request.args.get('period', '24h')  # Por defecto últimas 24 horas
        interval = request.args.get('interval', '1h')  # Intervalo de agregación por defecto 1 hora
        limit = request.args.get('limit', '100')  # Límite de registros
        
        # Validar parámetros
        valid_periods = ['1h', '6h', '12h', '24h', '7d', '30d']
        valid_intervals = ['5m', '15m', '30m', '1h', '6h', '12h', '1d']
        
        if period not in valid_periods:
            period = '24h'
        if interval not in valid_intervals:
            interval = '1h'
        
        try:
            limit = int(limit)
            if limit > 1000:  # Limitar a máximo 1000 registros
                limit = 1000
        except:
            limit = 100
        
        logger.info(f"Obteniendo historial para {device_id}: period={period}, interval={interval}, limit={limit}")
        
        # Query para obtener historial con agregación
        query = f'''
        from(bucket: "{INFLUX_BUCKET}")
          |> range(start: -{period})
          |> filter(fn: (r) => r["_measurement"] == "energy_readings")
          |> filter(fn: (r) => r["device"] == "{device_id}")
          |> aggregateWindow(every: {interval}, fn: mean, createEmpty: false)
          |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
          |> sort(columns: ["_time"], desc: true)
          |> limit(n: {limit})
        '''
        
        logger.info(f"Ejecutando query de historial: {query}")
        result = influx_client.query_api().query(query)
        
        # Procesar resultados
        history_data = []
        for table in result:
            for record in table.records:
                # Crear objeto de datos históricos
                data_point = {
                    "timestamp": record.get_time().isoformat(),
                    "voltage": float(record.values.get('voltage', 0)) if record.values.get('voltage') is not None else 0.0,
                    "current": float(record.values.get('current', 0)) if record.values.get('current') is not None else 0.0,
                    "power": float(record.values.get('power', 0)) if record.values.get('power') is not None else 0.0,
                    "energy": float(record.values.get('energy', 0)) if record.values.get('energy') is not None else 0.0,
                    "power_factor": float(record.values.get('power_factor', 0)) if record.values.get('power_factor') is not None else 0.0,
                    "frequency": float(record.values.get('frequency', 50)) if record.values.get('frequency') is not None else 50.0,
                    "device_id": device_id
                }
                history_data.append(data_point)
        
        # Si no hay datos históricos, generar datos simulados para pruebas
        if not history_data:
            logger.warning(f"No historical data found for device {device_id}, generating simulated data")
            
            # Generar datos simulados para las últimas horas
            import random
            from datetime import datetime, timedelta
            
            now = datetime.utcnow()
            for i in range(min(24, limit)):  # Últimas 24 horas o el límite especificado
                timestamp = now - timedelta(hours=i)
                
                # Simular variaciones realistas
                base_voltage = 220 + random.uniform(-5, 5)
                base_current = 2.0 + random.uniform(-0.5, 1.0)
                base_power = base_voltage * base_current * random.uniform(0.8, 0.95)
                
                data_point = {
                    "timestamp": timestamp.isoformat(),
                    "voltage": round(base_voltage, 2),
                    "current": round(base_current, 2),
                    "power": round(base_power, 2),
                    "energy": round(base_power * 0.001, 3),  # kWh
                    "power_factor": round(random.uniform(0.85, 0.95), 2),
                    "frequency": 50.0,
                    "device_id": device_id
                }
                history_data.append(data_point)
        
        # Calcular estadísticas del período
        if history_data:
            voltages = [d['voltage'] for d in history_data if d['voltage'] > 0]
            currents = [d['current'] for d in history_data if d['current'] > 0]
            powers = [d['power'] for d in history_data if d['power'] > 0]
            energies = [d['energy'] for d in history_data if d['energy'] > 0]
            
            statistics = {
                "period": period,
                "interval": interval,
                "total_records": len(history_data),
                "voltage": {
                    "min": round(min(voltages) if voltages else 0, 2),
                    "max": round(max(voltages) if voltages else 0, 2),
                    "avg": round(sum(voltages) / len(voltages) if voltages else 0, 2)
                },
                "current": {
                    "min": round(min(currents) if currents else 0, 2),
                    "max": round(max(currents) if currents else 0, 2),
                    "avg": round(sum(currents) / len(currents) if currents else 0, 2)
                },
                "power": {
                    "min": round(min(powers) if powers else 0, 2),
                    "max": round(max(powers) if powers else 0, 2),
                    "avg": round(sum(powers) / len(powers) if powers else 0, 2)
                },
                "total_energy": round(sum(energies) if energies else 0, 3)
            }
        else:
            statistics = {
                "period": period,
                "interval": interval,
                "total_records": 0,
                "voltage": {"min": 0, "max": 0, "avg": 0},
                "current": {"min": 0, "max": 0, "avg": 0},
                "power": {"min": 0, "max": 0, "avg": 0},
                "total_energy": 0
            }
        
        response = {
            "device_id": device_id,
            "period": period,
            "interval": interval,
            "statistics": statistics,
            "data": history_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        logger.info(f"Returning {len(history_data)} historical records")
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"ERROR en historial: {str(e)}")
        return jsonify({
            "error": str(e),
            "message": "Error al obtener historial de energía",
            "timestamp": datetime.utcnow().isoformat()
        }), 500

# NUEVO ENDPOINT: Resumen de consumo por períodos
@app.route('/api/energy/<device_id>/summary', methods=['GET'])
@token_required
def get_energy_summary(device_id):
    try:
        # Obtener resúmenes para diferentes períodos
        periods = ['24h', '7d', '30d']
        summary_data = {}
        
        for period in periods:
            query = f'''
            from(bucket: "{INFLUX_BUCKET}")
              |> range(start: -{period})
              |> filter(fn: (r) => r["_measurement"] == "energy_readings")
              |> filter(fn: (r) => r["device"] == "{device_id}")
              |> filter(fn: (r) => r["_field"] == "energy" or r["_field"] == "power")
              |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
            '''
            
            result = influx_client.query_api().query(query)
            
            total_energy = 0
            avg_power = 0
            record_count = 0
            
            for table in result:
                for record in table.records:
                    if record.get_field() == "energy":
                        total_energy += float(record.get_value() or 0)
                    elif record.get_field() == "power":
                        avg_power += float(record.get_value() or 0)
                        record_count += 1
            
            avg_power = avg_power / record_count if record_count > 0 else 0
            
            # Calcular costo estimado (tarifa promedio en Perú)
            cost_per_kwh = 0.15  # PEN por kWh
            estimated_cost = total_energy * cost_per_kwh
            
            summary_data[period] = {
                "total_energy_kwh": round(total_energy, 3),
                "average_power_w": round(avg_power, 2),
                "estimated_cost_pen": round(estimated_cost, 2),
                "records": record_count
            }
        
        response = {
            "device_id": device_id,
            "summary": summary_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"ERROR en resumen: {str(e)}")
        return jsonify({
            "error": str(e),
            "message": "Error al obtener resumen de energía",
            "timestamp": datetime.utcnow().isoformat()
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Not found',
        'message': str(error),
        'timestamp': datetime.utcnow().isoformat()
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal server error',
        'message': str(error),
        'timestamp': datetime.utcnow().isoformat()
    }), 500

if __name__ == '__main__':
    print("Iniciando servidor Flask con endpoints de historial...")
    app.run(host='0.0.0.0', port=5000, debug=True)

