require('dotenv').config();
const express = require('express');
const { InfluxDB } = require('@influxdata/influxdb-client');
const cors = require('cors');

const app = express();
app.use(cors());

// Configuración InfluxDB
const influxDB = new InfluxDB({
  url: process.env.INFLUX_URL || 'http://192.168.1.7:8086',
  token: process.env.INFLUX_TOKEN
});

const queryApi = influxDB.getQueryApi('af7a8ce35e82246d');

// Endpoint para datos en tiempo real
app.get('/api/energy', async (req, res) => {
  const fluxQuery = `
    from(bucket: "Datos_de_energia")
      |> range(start: -1m)
      |> filter(fn: (r) => r._measurement == "energy_measurement")
      |> last()
  `;

  try {
    const data = [];
    for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
      data.push(tableMeta.toObject(values));
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
const PORT2 = process.env.PORT2 || 5000;
app.listen(PORT2, () => {
  console.log(`Servidor API en http://192.168.1.7:${PORT2}`);
});