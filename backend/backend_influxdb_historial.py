# Backend Mejorado con Consultas Flux Separadas (5 UTC a 5 UTC)
# Sistema con consultas separadas para evitar fechas futuras y mejor control

from flask import Flask, jsonify, request
from flask_cors import CORS
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
from influxdb_client.client.exceptions import InfluxDBError
import os
import logging
import pytz
from datetime import datetime, timedelta, timezone,date
import calendar
import jwt as pyjwt
from functools import wraps

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuración
INFLUXDB_URL = os.getenv('INFLUXDB_URL', 'http://34.58.1.3:8086' )
INFLUXDB_TOKEN = os.getenv('INFLUXDB_TOKEN', 'YiyyBVm8n8pbUarvtheXR2myfjlpzOarhxBX1Wy4lPrg5V_p3-ErZ4MUOKe3YbF22jul_p0beJRmlg01_26wtQ==')
INFLUXDB_ORG = os.getenv('INFLUXDB_ORG', 'Jhodacal')
INFLUXDB_BUCKET = "Datos_de_energia"

# Configuración JWT
JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key')

# Zona horaria de Lima
LIMA_TIMEZONE = pytz.timezone('America/Lima')

# Configuración de tarifas eléctricas
TARIFA_ELECTRICA = {
    "tramo_1_kwh": 30.0,
    "precio_tramo_1": 0.5585,  # soles/kWh para primeros 30 kWh
    "precio_tramo_2": 0.77,  # soles/kWh para consumo adicional
    "igv": 0.18,  # 18% IGV
    "cargo_fijo_mensual": 2.50,  # soles
    "moneda": "PEN"
}

# Inicializar Flask
app = Flask(__name__)
CORS(app, origins="*")

# Cliente InfluxDB
influx_client = None
write_api = None
try:
    influx_client = InfluxDBClient(
        url=INFLUXDB_URL,
        token=INFLUXDB_TOKEN,
        org=INFLUXDB_ORG,
        timeout=900000
    )
    write_api = influx_client.write_api(write_options=SYNCHRONOUS)
    logger.info("✓ Cliente InfluxDB inicializado correctamente")
except Exception as e:
    logger.error(f"✗ Error inicializando cliente InfluxDB: {e}")
    
class ConsultasFluxSeparadas:
    """
    Clase que implementa consultas Flux separadas y optimizadas.
    La lógica clave es mapear cada punto a su "día de consumo" (5 UTC a 5 UTC)
    ANTES de realizar cualquier agregación para garantizar la precisión.
    """
    def __init__(self, client, bucket):
        self.client = client
        self.bucket = bucket
        self.query_api = client.query_api() if client else None

    def _ejecutar_consulta_tabla(self, query, nombre_consulta):
        """Ejecuta una consulta Flux y devuelve los resultados como lista de diccionarios."""
        logger.info(f"Ejecutando consulta: {nombre_consulta}")
        datos = []
        try:
            if not self.query_api: 
                logger.warning(f"No se puede ejecutar la consulta {nombre_consulta}: cliente InfluxDB no disponible.")
                return datos
            
            logger.debug(f"FLUX QUERY [{nombre_consulta}]:\n{query}") # Log para depuración
            
            result = self.query_api.query(query)
            for table in result:
                for record in table.records:
                    record_dict = record.values.copy()
                    # El campo _time ahora representa el inicio del día de consumo (00:00 UTC)
                    record_dict["_time"] = record.get_time()
                    datos.append(record_dict)
            logger.info(f"Consulta {nombre_consulta} completada: {len(datos)} registros")
            return datos
        except Exception as e:
            logger.error(f"Error en {nombre_consulta}: {e}", exc_info=True)
            return datos

    def obtener_consumo_diario(self, device_id, start_date_str, end_date_str):
        """
        CONSULTA MEJORADA: Consumo total diario (kWh).
        El día de consumo es de 5 UTC a 5 UTC.
        """
        query = f'''
        import "date"

        from(bucket: "{self.bucket}")
            |> range(start: {start_date_str}T05:00:00Z, stop: {end_date_str}T05:00:00Z)
            |> filter(fn: (r) => 
                r._measurement == "energy_readings" and
                r.device == "{device_id}" and
                r._field == "power"
            )
            |> map(fn: (r) => ({{
                _time: r._time,
                _value: r._value,
                // Asigna cada punto a su día de consumo correcto (5 UTC a 5 UTC)
                dia_de_consumo: date.truncate(t: date.add(d: -5h, to: r._time), unit: 1d)
            }}))
            |> group(columns: ["dia_de_consumo"])
            |> aggregateWindow(every: 1h, fn: mean, createEmpty: false) // Calcula el promedio por hora
            |> sum(column: "_value") // Suma los promedios horarios para obtener la energía total del día
            |> map(fn: (r) => ({{
                _time: r.dia_de_consumo,
                consumo_total_dia_kwh: r._value / 1000.0
            }}))
            |> group()
            |> sort(columns: ["_time"], desc: false)
        '''
        return self._ejecutar_consulta_tabla(query, "consumo_diario")

    def obtener_potencia_promedio_maximo_diario(self, device_id, start_date_str, end_date_str):
        """
        CONSULTA MEJORADA: Potencia máxima y promedio diaria (W).
        El día de consumo es de 5 UTC a 5 UTC.
        """
        query = f'''
        import "date"

        from(bucket: "{self.bucket}")
            |> range(start: {start_date_str}T05:00:00Z, stop: {end_date_str}T05:00:00Z)
            |> filter(fn: (r) => 
                r._measurement == "energy_readings" and
                r.device == "{device_id}" and
                r._field == "power"
            )
            |> map(fn: (r) => ({{
                _time: r._time,
                _value: r._value,
                // Asigna cada punto a su día de consumo correcto (5 UTC a 5 UTC)
                dia_de_consumo: date.truncate(t: date.add(d: -5h, to: r._time), unit: 1d)
            }}))
            |> group(columns: ["dia_de_consumo"])
            |> reduce(
                identity: {{
                    potencia_max_W: 0.0,
                    potencia_sum_W: 0.0,
                    count: 0
                }},
                fn: (r, accumulator) => ({{
                    potencia_max_W: if r._value > accumulator.potencia_max_W then r._value else accumulator.potencia_max_W,
                    potencia_sum_W: r._value + accumulator.potencia_sum_W,
                    count: accumulator.count + 1
                }})
            )
            |> map(fn: (r) => ({{
                _time: r.dia_de_consumo,
                potencia_maxima_dia_W: r.potencia_max_W,
                potencia_promedio_dia_W: if r.count > 0 then r.potencia_sum_W / float(v: r.count) else 0.0
            }}))
            |> group()
            |> sort(columns: ["_time"], desc: false)
        '''
        return self._ejecutar_consulta_tabla(query, "potencia_promedio_maximo_diario")

    def obtener_consumo_por_hora(self, device_id, start_date_str, end_date_str):
        """
        CONSULTA MEJORADA: Consumo por hora (kWh).
        Alinea las ventanas de 1 hora a la zona horaria de Lima (UTC-5).
        """
        query = f'''
        import "timezone"

        option location = timezone.location(name: "America/Lima")

        from(bucket: "{self.bucket}")
            |> range(start: {start_date_str}T05:00:00Z, stop: {end_date_str}T05:00:00Z)
            |> filter(fn: (r) => 
                r._measurement == "energy_readings" and
                r.device == "{device_id}" and
                r._field == "power"
            )
            |> aggregateWindow(every: 1h, fn: mean, createEmpty: false, location: location)
            |> map(fn: (r) => ({{
                _time: r._time,
                consumo_kwh_hora: r._value / 1000.0,
                potencia_W: r._value
            }}))
            |> yield(name: "consumo_por_hora")
        '''
        return self._ejecutar_consulta_tabla(query, "consumo_por_hora")

    def obtener_datos_tiempo_real(self, device_id):
        """CONSULTA: Datos más recientes del dispositivo (sin cambios, es correcta)"""
        query = f"""
        from(bucket: "{self.bucket}")
          |> range(start: -5m)
          |> filter(fn: (r) => r._measurement == "energy_readings" and r.device == "{device_id}")
          |> last()
          |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        """
        datos = self._ejecutar_consulta_tabla(query, "datos_tiempo_real")
        
        if not datos:
            return {
                "status": "no_data",
                "device_id": device_id,
                "timestamp": datetime.now(LIMA_TIMEZONE).isoformat()
            }
        
        ultimo_dato = datos[0]
        return {
            "status": "ok",
            "device_id": device_id,
            "timestamp": ultimo_dato["_time"].isoformat(),
            "voltage": ultimo_dato.get('voltage', 0),
            "current": ultimo_dato.get('current', 0),
            "power": ultimo_dato.get('power', 0),
            "frequency": ultimo_dato.get('frequency', 0)
        }

# Instanciar la clase de consultas separadas
consultas_db = ConsultasFluxSeparadas(influx_client, INFLUXDB_BUCKET) if influx_client else None

# --- Lógica de Negocio ---

def calcular_costo_diario(consumo_kwh_diario, consumo_acumulado_mes=0):
    """
    Calcula el costo diario basado en las tarifas eléctricas.
    """
    costo_base = 0.0
    if consumo_acumulado_mes <= TARIFA_ELECTRICA["tramo_1_kwh"]:
        if consumo_acumulado_mes + consumo_kwh_diario <= TARIFA_ELECTRICA["tramo_1_kwh"]:
            costo_base = consumo_kwh_diario * TARIFA_ELECTRICA["precio_tramo_1"]
        else:
            kwh_primer_tramo = TARIFA_ELECTRICA["tramo_1_kwh"] - consumo_acumulado_mes
            kwh_segundo_tramo = consumo_kwh_diario - kwh_primer_tramo
            costo_base = (kwh_primer_tramo * TARIFA_ELECTRICA["precio_tramo_1"]) + (kwh_segundo_tramo * TARIFA_ELECTRICA["precio_tramo_2"])
    else:
        costo_base = consumo_kwh_diario * TARIFA_ELECTRICA["precio_tramo_2"]
    
    igv = costo_base * TARIFA_ELECTRICA["igv"]
    return {'costo_total': costo_base + igv}

def procesar_detalles_dia_completo(consumo_diario, potencia_diaria, datos_horarios, fecha_str):
    """
    Procesa todos los datos del día y genera la respuesta completa.
    """
    # Extraer consumo total del día
    consumo_total_kwh = 0
    if consumo_diario and len(consumo_diario) > 0:
        consumo_total_kwh = consumo_diario[0].get('consumo_total_dia_kwh', 0)
    
    # Extraer potencia promedio y máxima
    potencia_promedio_w = 0
    potencia_maxima_w = 0
    if potencia_diaria and len(potencia_diaria) > 0:
        potencia_promedio_w = potencia_diaria[0].get('potencia_promedio_dia_W', 0)
        potencia_maxima_w = potencia_diaria[0].get('potencia_maxima_dia_W', 0)
    
    # Calcular costo
    costo_info = calcular_costo_diario(consumo_total_kwh)
    
    # Procesar datos horarios
    datos_por_hora = procesar_datos_horarios(datos_horarios)
    
    return {
        "date": fecha_str,
        "daily_summary": {
            "total_kwh": consumo_total_kwh,
            "total_cost": costo_info["costo_total"],
            "avg_power": potencia_promedio_w,
            "peak_power": potencia_maxima_w,
            "currency": TARIFA_ELECTRICA["moneda"],
            "hours_with_data": len(datos_por_hora)
        },
        "hourly_data": datos_por_hora
    }
def obtener_fecha_utc5(timestamp_utc):
    """Convierte un timestamp UTC a la fecha correspondiente en UTC-5 (día de consumo)."""
    return (timestamp_utc - timedelta(hours=5)).strftime('%Y-%m-%d')
def procesar_datos_horarios(datos_horarios):
    """
    Procesa los datos horarios para formato de respuesta.
    CORRECCIÓN: Ajusta el timestamp para que represente la HORA DE INICIO
    de la ventana de agregación, no la hora de fin.
    """
    hourly_data = []
    lima_tz = pytz.timezone('America/Lima')

    for dato in datos_horarios:
        timestamp_fin_ventana = dato.get("_time")
        if not timestamp_fin_ventana:
            continue

        # CORRECCIÓN CLAVE: Restar una hora al timestamp para obtener la hora de inicio.
        # aggregateWindow marca el final de la ventana (e.g., 15:00 para el intervalo 14:00-15:00).
        # Al restar una hora, obtenemos la hora de inicio (14:00).
        timestamp_inicio_ventana = timestamp_fin_ventana - timedelta(hours=1)
        
        # Convertir a la zona horaria de Lima para extraer la hora correcta.
        timestamp_local = timestamp_inicio_ventana.astimezone(lima_tz)
        hora_local = timestamp_local.hour # Esto ahora será la hora de inicio.
        
        potencia_w = dato.get('power_W', 0)
        consumo_kwh = dato.get('consumo_kwh_hora', 0)
        
        hourly_data.append({
            "hour": hora_local, # Hora de inicio (e.g., 14 para el consumo de 14:00 a 15:00)
            "timestamp": timestamp_inicio_ventana.isoformat(), # Timestamp de inicio
            "power": potencia_w,
            "energy_kwh": consumo_kwh,
            "voltage": 220,
            "current": potencia_w / 220 if potencia_w > 0 else 0
        })
    
    return sorted(hourly_data, key=lambda x: x["hour"])
# --- Decorador de Autenticación ---

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "Token is missing"}), 401
        
        try:
            token = token.split()[1]
            data = pyjwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        except Exception as e:
            logger.error(f"Error de autenticación: {str(e)}")
            return jsonify({"error": "Token is invalid"}), 401
        
        return f(*args, **kwargs)
    return decorated

# --- ENDPOINTS CORREGIDOS ---

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Endpoint de autenticación"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if username == 'admin' and password == 'secret':
            token = pyjwt.encode(
                {
                    'user_id': 1,
                    'username': username,
                    'exp': datetime.now(timezone.utc) + timedelta(hours=12)
                },
                JWT_SECRET,
                algorithm='HS256'
            )
            return jsonify({"token": token, "user_id": 1, "username": username})

        return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/energy/<device_id>', methods=['GET'])
@token_required
def get_realtime_energy(device_id):
    """Endpoint para datos en tiempo real"""
    try:
        if not consultas_db:
            return jsonify({"error": "InfluxDB client not available"}), 500
        
        logger.info(f"Obteniendo datos en tiempo real para dispositivo: {device_id}")
        data = consultas_db.obtener_datos_tiempo_real(device_id)
        
        if data.get('status') == 'no_data':
            return jsonify({
                **data,
                "message": "No hay datos disponibles en los últimos 5 minutos"
            }), 200
        
        return jsonify(data)
        
    except Exception as e:
        logger.error(f"Error obteniendo datos en tiempo real para {device_id}: {str(e)}")
        return jsonify({
            "error": "Error interno del servidor",
            "device_id": device_id,
            "timestamp": datetime.now(LIMA_TIMEZONE).isoformat()
        }), 500

# ... (todo el código anterior, incluidas las funciones de consulta y procesamiento, permanece igual) ...

@app.route('/api/day/<device_id>', methods=['GET'])
@token_required
def get_day_details(device_id):
    """
    Endpoint para obtener detalles COMPLETOS de un día específico.
    Incluye: consumo total, costo total, potencia promedio, potencia máxima y datos por hora.
    CORRECCIÓN DEFINITIVA: Se ajusta el rango de fechas para cada consulta para que pida
    exactamente el día de consumo (de 5 UTC a 5 UTC del día siguiente), evitando cualquier
    ambigüedad o datos de otros días.
    """
    try:
        if not consultas_db:
            return jsonify({"error": "Cliente InfluxDB no disponible"}), 500

        date_str = request.args.get('date')
        if not date_str:
            return jsonify({"error": "Parámetro 'date' es requerido."}), 400

        try:
            # La fecha de referencia es el día que el usuario quiere ver.
            ref_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"error": "Formato de fecha inválido. Use YYYY-MM-DD"}), 400

        # Para el día de consumo de 5 UTC a 5 UTC del día siguiente:
        # La consulta debe empezar a las 05:00:00Z del día de referencia
        # y terminar a las 05:00:00Z del día siguiente al de referencia.
        query_start_str = ref_date.strftime('%Y-%m-%d')
        query_end_str = (ref_date + timedelta(days=1)).strftime('%Y-%m-%d')

        logger.info(f"Obteniendo detalles para el día: {date_str}")
        logger.info(f"Rango de consulta Flux para el día: de {query_start_str}T05:00:00Z a {query_end_str}T05:00:00Z")

        # Obtener datos de consumo y potencia para el día
        consumo_diario = consultas_db.obtener_consumo_diario(device_id, query_start_str, query_end_str)
        potencia_diaria = consultas_db.obtener_potencia_promedio_maximo_diario(device_id, query_start_str, query_end_str)
        datos_horarios = consultas_db.obtener_consumo_por_hora(device_id, query_start_str, query_end_str)

        # Procesar y devolver los datos
        return jsonify(procesar_detalles_dia_completo(consumo_diario, potencia_diaria, datos_horarios, date_str))

    except Exception as e:
        logger.error(f"Error en get_day_details para {device_id}: {str(e)}", exc_info=True)
        return jsonify({"error": "Error interno del servidor al procesar los detalles del día"}), 500

@app.route('/api/calendar/<device_id>', methods=['GET'])
@token_required
def get_calendar_data(device_id):
    """
    Endpoint para obtener datos de resumen por día para un mes específico.
    Asegura que los datos corresponden al día de consumo (5 UTC a 5 UTC).
    """
    try:
        if not consultas_db:
            return jsonify({"error": "Cliente InfluxDB no disponible"}), 500

        year = int(request.args.get('year', datetime.now().year))
        month = int(request.args.get('month', datetime.now().month))

        # Calcular el primer y último día del mes calendario
        start_of_month_cal = date(year, month, 1)
        _, num_days_in_month = calendar.monthrange(year, month)
        end_of_month_cal = date(year, month, num_days_in_month)

        # Rango de consulta Flux: desde el inicio del primer día de consumo hasta el final del último día de consumo.
        # Esto significa desde 5 UTC del día 1 del mes hasta 5 UTC del día 1 del mes siguiente.
        query_start_str = start_of_month_cal.strftime('%Y-%m-%d')
        query_end_str = (end_of_month_cal + timedelta(days=1)).strftime('%Y-%m-%d')

        logger.info(f"Obteniendo datos de calendario para {year}-{month}")
        logger.info(f"Rango de consulta Flux para calendario: de {query_start_str}T05:00:00Z a {query_end_str}T05:00:00Z")

        consumo_data = consultas_db.obtener_consumo_diario(device_id, query_start_str, query_end_str)
        potencia_data = consultas_db.obtener_potencia_promedio_maximo_diario(device_id, query_start_str, query_end_str)

        # Mapear datos a un diccionario para fácil acceso
        daily_stats = {}
        for record in consumo_data:
            day_key = record['_time'].strftime('%Y-%m-%d')
            daily_stats.setdefault(day_key, {})['total_kwh'] = record.get('consumo_total_dia_kwh', 0)
        for record in potencia_data:
            day_key = record['_time'].strftime('%Y-%m-%d')
            daily_stats.setdefault(day_key, {})['peak_power'] = record.get('potencia_maxima_dia_W', 0)

        days_list = []
        month_total_kwh = 0
        month_total_cost = 0
        days_with_data = 0

        current_day = start_of_month_cal
        while current_day <= end_of_month_cal:
            date_key = current_day.strftime('%Y-%m-%d')
            day_data = daily_stats.get(date_key, {})
            
            energy_kwh = float(day_data.get('total_kwh', 0) or 0)
            cost = calcular_costo_diario(energy_kwh)['costo_total']

            if energy_kwh > 0:
                days_with_data += 1
                month_total_kwh += energy_kwh
                month_total_cost += cost

            days_list.append({
                "date": date_key,
                "total_kwh": energy_kwh,
                "total_cost": cost,
                "has_data": energy_kwh > 0,
                "peak_power": float(day_data.get('peak_power', 0) or 0),
                "avg_voltage": 220, # Valor fijo, ajustar si es dinámico
                "avg_current": (float(day_data.get('total_kwh', 0) or 0) * 1000 / 24 / 220) if energy_kwh > 0 else 0 # Estimación
            })
            current_day += timedelta(days=1)

        return jsonify({
            "year": year,
            "month": month,
            "month_name": calendar.month_name[month],
            "days": days_list,
            "summary": {
                "month_total_kwh": month_total_kwh,
                "month_total_cost": month_total_cost,
                "days_with_data": days_with_data,
                "days_without_data": num_days_in_month - days_with_data,
                "avg_daily_kwh": (month_total_kwh / days_with_data) if days_with_data > 0 else 0,
            }
        })

    except Exception as e:
        logger.error(f"Error en get_calendar_data para {device_id}: {str(e)}", exc_info=True)
        return jsonify({"error": "Error interno del servidor al procesar los datos del calendario"}), 500

@app.route('/api/period-summary/<device_id>', methods=['GET'])
@token_required
def get_period_summary(device_id):
    try:
        period = request.args.get('period')
        date_str = request.args.get('date', datetime.now(LIMA_TIMEZONE).strftime('%Y-%m-%d'))
        
        if not period in ['week', 'month', 'year']:
            return jsonify({"error": "Parámetro 'period' debe ser 'week', 'month' o 'year'."}), 400
        
        ref_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        
        print(f"--- PROCESANDO PETICIÓN: Periodo='{period}', Fecha Ref='{ref_date}' ---")

        # 1. CALCULAR EL RANGO DE CALENDARIO CORRECTO
        if period == 'week':
            start_date_cal = ref_date - timedelta(days=ref_date.weekday())
            end_date_cal = start_date_cal + timedelta(days=6)
            print(f"Calculando SEMANA: {start_date_cal} a {end_date_cal}")
        elif period == 'month':
            start_date_cal = ref_date.replace(day=1)
            _, num_days = calendar.monthrange(ref_date.year, ref_date.month)
            end_date_cal = date(ref_date.year, ref_date.month, num_days)
            print(f"Calculando MES: {start_date_cal} a {end_date_cal}")
        elif period == 'year':
            start_date_cal = date(ref_date.year, 1, 1)
            end_date_cal = date(ref_date.year, 12, 31)
            print(f"Calculando AÑO: {start_date_cal} a {end_date_cal}")

        # 2. CALCULAR RANGO DE CONSULTA FLUX
        query_start_str = start_date_cal.strftime('%Y-%m-%d')
        query_end_str = (end_date_cal + timedelta(days=1)).strftime('%Y-%m-%d')

        # 3. EJECUTAR CONSULTAS
        consumo_data = consultas_db.obtener_consumo_diario(device_id, query_start_str, query_end_str)
        potencia_data = consultas_db.obtener_potencia_promedio_maximo_diario(device_id, query_start_str, query_end_str)

        # 4. COMBINAR DATOS
        combined_data = {}
        for record in consumo_data:
            combined_data.setdefault(record['_time'].strftime('%Y-%m-%d'), {}).update(record)
        for record in potencia_data:
            combined_data.setdefault(record['_time'].strftime('%Y-%m-%d'), {}).update(record)
        
        # 5. CONSTRUIR RESPUESTA FINAL
        daily_data = []
        current_date_iter = start_date_cal
        while current_date_iter <= end_date_cal:
            date_key = current_date_iter.strftime('%Y-%m-%d')
            day_stats = combined_data.get(date_key, {})
            daily_data.append({
                "date": date_key,
                "energy_kwh": day_stats.get('consumo_total_dia_kwh', 0),
                "avg_power": day_stats.get('potencia_promedio_dia_W', 0)
            })
            current_date_iter += timedelta(days=1)

        print(f"Respuesta generada con {len(daily_data)} días.")
        return jsonify({
            "period": period,
            "start_date": start_date_cal.isoformat(),
            "end_date": end_date_cal.isoformat(),
            "daily_data": daily_data
        })

    except Exception as e:
        logger.error(f"Error en get_period_summary: {e}", exc_info=True)
        return jsonify({"error": "Error interno del servidor"}), 500


@app.route('/api/period-custom/<device_id>', methods=['GET'])
@token_required
def get_custom_period_summary(device_id):
    """
    Endpoint para obtener un resumen de datos para un período personalizado.
    """
    try:
        if not consultas_db:
            return jsonify({"error": "Cliente InfluxDB no disponible"}), 500

        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')

        if not start_date_str or not end_date_str:
            return jsonify({"error": "Los parámetros 'start_date' y 'end_date' son requeridos."}), 400

        try:
            start_date_cal = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date_cal = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"error": "Formato de fecha inválido. Use YYYY-MM-DD"}), 400

        if start_date_cal > end_date_cal:
            return jsonify({"error": "La fecha de inicio no puede ser posterior a la fecha de fin."}), 400

        # --- DEFINIR EL RANGO PARA LA CONSULTA FLUX (CON EL AJUSTE DE +1 DÍA AL INICIO Y AL FINAL) ---
        # Similar a get_period_summary, ajustamos el rango de la consulta para asegurar todos los datos.
        query_start_date = start_date_cal - timedelta(days=1)
        query_end_date = end_date_cal + timedelta(days=1)

        query_start_flux_str = query_start_date.strftime('%Y-%m-%d')
        query_end_flux_str = query_end_date.strftime('%Y-%m-%d')

        logger.info(f"Calculando período personalizado: {start_date_str} a {end_date_str}")
        logger.info(f"Rango de consulta Flux para personalizado: de {query_start_flux_str}T05:00:00Z a {query_end_flux_str}T05:00:00Z")

        consumo_data = consultas_db.obtener_consumo_diario(device_id, query_start_flux_str, query_end_flux_str)
        potencia_data = consultas_db.obtener_potencia_promedio_maximo_diario(device_id, query_start_flux_str, query_end_flux_str)

        combined_data = {}
        for record in consumo_data:
            day_key = record['_time'].strftime('%Y-%m-%d')
            combined_data.setdefault(day_key, {})['consumo_total_dia_kwh'] = record.get('consumo_total_dia_kwh', 0)

        for record in potencia_data:
            day_key = record['_time'].strftime('%Y-%m-%d')
            combined_data.setdefault(day_key, {})['potencia_promedio_dia_W'] = record.get('potencia_promedio_dia_W', 0)
            combined_data.setdefault(day_key, {})['potencia_maxima_dia_W'] = record.get('potencia_maxima_dia_W', 0)

        daily_data = []
        total_kwh = total_cost = total_avg_power_sum = 0.0
        peak_power_period = 0.0
        days_with_data = 0

        current_date_iter = start_date_cal
        while current_date_iter <= end_date_cal:
            date_key = current_date_iter.strftime('%Y-%m-%d')
            day_stats = combined_data.get(date_key, {})

            daily_kwh = float(day_stats.get('consumo_total_dia_kwh', 0) or 0)
            daily_avg_power = float(day_stats.get('potencia_promedio_dia_W', 0) or 0)
            daily_peak_power = float(day_stats.get('potencia_maxima_dia_W', 0) or 0)
            daily_cost = calcular_costo_diario(daily_kwh)['costo_total']

            if daily_kwh > 0 or daily_avg_power > 0:
                days_with_data += 1
                total_kwh += daily_kwh
                total_cost += daily_cost
                total_avg_power_sum += daily_avg_power
                peak_power_period = max(peak_power_period, daily_peak_power)

            daily_data.append({
                "date": date_key,
                "energy_kwh": daily_kwh,
                "avg_power": daily_avg_power,
                "avg_voltage": 220, # Asumiendo un valor fijo, ajustar si es dinámico
                "avg_current": (daily_avg_power / 220) if daily_avg_power > 0 else 0 # Estimación
            })
            current_date_iter += timedelta(days=1)

        total_days_in_period = (end_date_cal - start_date_cal).days + 1
        avg_daily_kwh = (total_kwh / days_with_data) if days_with_data > 0 else 0
        avg_power_period = (total_avg_power_sum / days_with_data) if days_with_data > 0 else 0

        return jsonify({
            "period": "custom",
            "start_date": start_date_cal.isoformat(),
            "end_date": end_date_cal.isoformat(),
            "daily_data": daily_data,
            "period_summary": {
                "total_kwh": total_kwh,
                "total_cost": total_cost,
                "avg_daily_kwh": avg_daily_kwh,
                "avg_power": avg_power_period,
                "peak_power": peak_power_period,
                "days_with_data": days_with_data,
                "total_days": total_days_in_period,
                "currency": TARIFA_ELECTRICA["moneda"]
            }
        })

    except Exception as e:
        logger.error(f"Error en get_custom_period_summary para {device_id}: {str(e)}", exc_info=True)
        return jsonify({"error": "Error interno del servidor al procesar el período personalizado"}), 500
@app.route('/api/device/<device_id>/validate', methods=['GET'])
@token_required
def validate_device_exists(device_id):
    """
    Endpoint para validar si un dispositivo existe en la base de datos.
    Realiza una consulta rápida y ligera para verificar la existencia.
    """
    try:
        if not consultas_db:
            return jsonify({"error": "Cliente InfluxDB no disponible"}), 500

        logger.info(f"Validando existencia del dispositivo: {device_id}")

        # Consulta Flux optimizada solo para verificar existencia
        query = f'''
        from(bucket: "{consultas_db.bucket}")
            |> range(start: -30d) // Rango de tiempo razonable para buscar datos
            |> filter(fn: (r) => r._measurement == "energy_readings" and r.device == "{device_id}")
            |> limit(n: 1) // Solo necesitamos un registro para confirmar que existe
            |> keep(columns: ["_time"]) // Mantenemos una columna mínima
        '''
        
        result = consultas_db.query_api.query(query)
        
        # Si la consulta devuelve alguna tabla/registro, el dispositivo existe
        if result:
            logger.info(f"✓ Dispositivo '{device_id}' validado exitosamente.")
            return jsonify({"exists": True, "device_id": device_id}), 200
        else:
            logger.warning(f"✗ Dispositivo '{device_id}' no encontrado.")
            return jsonify({"exists": False, "error": "Dispositivo no encontrado"}), 404

    except Exception as e:
        logger.error(f"Error validando dispositivo {device_id}: {str(e)}", exc_info=True)
        return jsonify({"error": "Error interno del servidor al validar el dispositivo"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
