require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const cors = require('cors');
const axios = require('axios');



/*const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const http = require('http');

const socketIo = require('socket.io');
*/
const app = express();
/*const server = http.createServer(app);
/*const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});*/
app.use(express.json());
app.use(cors());


// Configuración de la base de datos
const dbConfig = {
  host: '192.168.1.7',
  user: 'root',
  password: 'my-secret-pw',
  database: 'usuarios',
  port: 3307
 
};

const mqttConfig = {
  broker: process.env.MQTT_BROKER || 'ws://broker.emqx.io:8083/mqtt',
  topic: process.env.MQTT_TOPIC || 'energy_monitor/+/data',
  clientId: `backend_${Math.random().toString(16).slice(3)}`
};
/*const influxConfig = {
  url: process.env.INFLUXDB_URL || 'http://localhost:8086',
  token: process.env.INFLUXDB_TOKEN || 'J5R5GgooeVgffBoJ8QVBEUy_UqyWQ3VvhQduXlEOaMKrGKMRXok1Rf3VxiB6jt7In5BO8AhOSI3HBShqduEMyA==',
  org: process.env.INFLUXDB_ORG || 'ELectroJhoda',
  bucket: process.env.INFLUXDB_BUCKET || 'medidores'
};

const influxClient = new InfluxDB({ url: influxConfig.url, token: influxConfig.token });
let mqttClient = null;*/
// Configuración del transporter de correo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});
const knowledgeBase = {
  company: {
    es: [
      "Electro Puno es la empresa de distribución eléctrica que opera en la región de Puno, Perú.",
      "Nuestra misión es brindar un servicio eléctrico de calidad, confiable y seguro a todos nuestros clientes.",
      "Electro Puno fue fundada en 1999 y desde entonces ha trabajado para mejorar la infraestructura eléctrica de la región.",
      "Contamos con oficinas de atención al cliente en las principales ciudades de la región de Puno."
    ],
    en: [
      "Electro Puno is the electricity distribution company operating in the Puno region, Peru.",
      "Our mission is to provide quality, reliable, and safe electrical service to all our customers.",
      "Electro Puno was founded in 1999 and has since worked to improve the electrical infrastructure in the region.",
      "We have customer service offices in the main cities of the Puno region."
    ],
    qu: [
      "Electro Puno nisqaqa Puno suyupi k'anchayta aypachiq empresam.",
      "Ñuqaykuq ruwayniykuqa llapan runakuna allin k'anchayniyuq kanankupaqmi.",
      "Electro Puno nisqaqa 1999 watapim paqarimurqa, chaymantapacham Puno suyupi k'anchay aypachiy allichasqa kachkan.",
      "Puno suyupi hatun llaqtakunapi runakuna yanapana wasikunayuqmi kayku."
    ],
    ay: [
      "Electro Puno Puno markanx thaqanchirinaka electricidad apnaqiri empresawa.",
      "Uñstawinakax suma, chiqap electricidad apnaqirinak luririwa.",
      "Electro Puno 1999 maranx kamachatawa, ukatsti Puno markanx electricidad apnaqirinak sum luriri.",
      "Puno markanx jach'a markanakanx uñstawinak uñt'ayirin utjinakaniwa."
    ]
  },
  billing: {
    es: [
      "Puede pagar su factura a través de nuestra aplicación, en nuestras oficinas o mediante transferencia bancaria.",
      "El ciclo de facturación es mensual, y recibirá su factura aproximadamente 5 días después de la lectura de su medidor.",
      "Si tiene dudas sobre su factura, puede consultar el detalle en la sección 'Facturación' de la aplicación.",
      "Los pagos realizados se reflejan en el sistema en un plazo máximo de 24 horas."
    ],
    en: [
      "You can pay your bill through our application, at our offices, or via bank transfer.",
      "The billing cycle is monthly, and you will receive your bill approximately 5 days after your meter reading.",
      "If you have questions about your bill, you can check the details in the 'Billing' section of the application.",
      "Payments made are reflected in the system within a maximum period of 24 hours."
    ],
    qu: [
      "Qullqi pagayta atinki kay aplicación nisqawan, ñuqaykuq wasikunapi utaq banco nisqaman qullqi apachispa.",
      "Sapa killa factura nisqata chaskinkichik, medidor ñawinchasqamanta pichqa p'unchaw qhipata.",
      "Sichus factura nisqamanta tapukuyniyki kanman chayqa, 'Facturación' nisqapi qhawayta atinki.",
      "Pagasqaykiqa 24 hora ukhupin sistemapi rikukunqa."
    ],
    ay: [
      "Facturamax pagar sarasñax aplicacionanxa, uñt'ayirin utjinakaxa utaq bancotanxa.",
      "Sapa phaxsin facturax qillqatawa, medidor uñakipañanx phisqa urun qhiparux.",
      "Facturamax jisk'a amuyunakaxa 'Facturación' seccionanxa aplicacionanxa uñt'ayaña.",
      "Pagatañanakax sistema ukhunxa 24 horanxa uñt'atawa."
    ]
  },
  smartMeter: {
    es: [
      "El medidor inteligente le permite monitorear su consumo eléctrico en tiempo real.",
      "Puede ver estadísticas detalladas de su consumo diario, mensual y anual en la sección 'Medidor Inteligente'.",
      "Si detecta alguna anomalía en su medidor, puede reportarla a través de la aplicación.",
      "Los medidores inteligentes se actualizan automáticamente cada 15 minutos."
    ],
    en: [
      "The smart meter allows you to monitor your electricity consumption in real-time.",
      "You can view detailed statistics of your daily, monthly, and annual consumption in the 'Smart Meter' section.",
      "If you detect any anomaly in your meter, you can report it through the application.",
      "Smart meters are automatically updated every 15 minutes."
    ],
    qu: [
      "Yuyaysapa medidor nisqaqa kunan pachapi k'anchay aypachiy qhawayta atichisunki.",
      "Sapa p'unchaw, sapa killa, sapa wata k'anchay aypachisqaykita 'Yuyaysapa Medidor' nisqapi qhawayta atinki.",
      "Sichus medidorniykipi ima mana allin kasqata rikunki chayqa, kay aplicación nisqawan willakuyta atinki.",
      "Yuyaysapa medidorkunaqa sapa chunka pichqayuq minutupin kikillanmanta musuqchasqa."
    ],
    ay: [
      "Yatiña medidorax kunan pachax electricidad apnaqirix uñt'ayañawa.",
      "Sapa uru, sapa phaxsi, sapa maran electricidad apnaqirix 'Yatiña Medidor' seccionanxa uñt'ayaña.",
      "Yatiña medidorax pantjasipkaxa, aplicacionanx willañawa.",
      "Yatiña medidornakax tunka phisqa minutunakapin kikipanx musphachatawa."
    ]
  },
  app: {
    es: [
      "Esta aplicación le permite gestionar su cuenta de Electro Puno, ver su consumo y realizar pagos.",
      "Puede cambiar el idioma de la aplicación en la sección 'Configuración'.",
      "Para reportar problemas técnicos con la aplicación, use la opción 'Ayuda' en el menú.",
      "La aplicación se actualiza regularmente para mejorar su experiencia y añadir nuevas funcionalidades."
    ],
    en: [
      "This application allows you to manage your Electro Puno account, view your consumption, and make payments.",
      "You can change the language of the application in the 'Settings' section.",
      "To report technical issues with the application, use the 'Help' option in the menu.",
      "The application is regularly updated to improve your experience and add new features."
    ],
    qu: [
      "Kay aplicación nisqaqa Electro Puno cuentaykita kamachiy, k'anchay aypachisqaykita qhaway, pagaykunata ruway atichisunki.",
      "Aplicación nisqap siminta 'Kamachikuna' nisqapi tikrayta atinki.",
      "Aplicación nisqapi sasachakuykuna kaqtin, 'Yanapay' nisqata menú nisqapi ñit'iy.",
      "Kay aplicación nisqaqa sapa kutim musuqchasqa allin kananpaq, musuq ruwaykunatapas yapaspa."
    ],
    ay: [
      "Aka aplicacionax Electro Puno cuentamax kamachiri, electricidad apnaqirix uñt'ayañawa, paguña utjayañataki.",
      "Aplicacionanx arunxa 'Ajustenaka' seccionanxa mayjt'ayaña.",
      "Aplicacionanx pantjasipkaxa, 'Yanapaña' menunxa apnaqaña.",
      "Aplicacionax sapa kuti musphachatawa, suma uñt'ayañataki, musuq lurawinak uñt'ayañataki."
    ]
  },
  energySaving: {
    es: [
      "Apague las luces y desconecte los aparatos electrónicos cuando no los esté usando.",
      "Utilice bombillas LED, que consumen hasta un 80% menos de energía que las incandescentes.",
      "Configure su refrigerador a la temperatura recomendada por el fabricante.",
      "Aproveche la luz natural durante el día y evite encender luces innecesariamente."
    ],
    en: [
      "Turn off lights and unplug electronic devices when not in use.",
      "Use LED bulbs, which consume up to 80% less energy than incandescent ones.",
      "Set your refrigerator to the temperature recommended by the manufacturer.",
      "Take advantage of natural light during the day and avoid turning on unnecessary lights."
    ],
    qu: [
      "K'anchaykuna wañuchiy, aparatokuna t'uqyachiy mana llamk'achispaqa.",
      "LED bombillakuna llamk'achiy, chaykuna 80% aswan pisita k'anchayta mikhunku.",
      "Refrigeradorykita fabricante nisqap kamachisqanman hina churay.",
      "P'unchawpi inti k'anchayta llamk'achiy, ama yanqaqa k'anchaykuna hap'ichiychu."
    ],
    ay: [
      "Layranak apagayaña, aparatonak desconectayaña mana uskipanxa.",
      "LED bombillanak apnaqaña, ch'amanchañaxa 80% pisita ch'amampi.",
      "Refrigeradoramax fabricantep kamachisina temperaturaxa churayaña.",
      "Urup inti layra apnaqaña, ama layranak apagayaña mana necesidaxa."
    ]
  }
};

async function testConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.end();
    console.log('✅ Conexión a MySQL establecida');
  } catch (err) {
    console.error('❌ Error al conectar a MySQL:', err);
    process.exit(1);
  }
}

testConnection();
/*
async function getUserIdByDeviceCode(deviceCode) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [results] = await connection.query(
      'SELECT user_id FROM device_users WHERE device_code = ? AND is_active = TRUE',
      [deviceCode]
    );
    
    if (results.length > 0) {
      return results[0].user_id;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener user_id:', error);
    return null;
  } finally {
    if (connection) await connection.end();
  }
}*/

app.post('/chat', async (req, res) => {
  const { message, language } = req.body;

  if (!message || !language) {
    return res.status(400).json({ success: false, error: 'Mensaje e idioma son requeridos' });
  }

  // Cambié XAI_KEY por DEEPSEEK_KEY para mayor claridad
  if (!process.env.GROQ_KEY) {
    console.error('GROQ_KEY no está definido en .env');
    return res.status(500).json({ success: false, error: 'Configuración de servidor inválida' });
  }

  try {
   const response = await axios.post(
  'https://api.groq.com/openai/v1/chat/completions',
  {
    model: 'llama3-70b-8192', // Modelo gratuito
    messages: [
      {
        role: 'system',
        content: `Eres un asistente de Electro Puno. Responde en ${language}.` 
      },
      { role: 'user', content: message }
    ],
    temperature: 0.7,
    max_tokens: 1024
  },
  {
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_KEY}`, // Regístrate en groq.com
      'Content-Type': 'application/json'
    }
  }
);

    res.json({ 
      success: true, 
      reply: response.data.choices[0].message.content 
    });

  } catch (error) {
    console.error('Error en /chat:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error?.message || 'Error al procesar la solicitud'
    });
  }
});
// Resto de los endpoints existentes
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Servidor funcionando',
    timestamp: new Date() 
  });
});


app.post('/login', async (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [results] = await connection.query(
      'SELECT * FROM usuarios WHERE usuario = ?', 
      [usuario]
    );

    if (results.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = results[0];
    const hashedPassword = user.password;

    const bcryptResult = await bcrypt.compare(password, hashedPassword);
    if (!bcryptResult) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    res.status(200).json({ 
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido_paterno: user.apellido_paterno,
        apellido_materno: user.apellido_materno,
        dni: user.dni,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (connection) await connection.end();
  }
});


// Endpoint para obtener datos del usuario - Versión corregida
app.post('/user-data', async (req, res) => {
  let connection;
  try {
    const { username } = req.body;
    
    console.log('Solicitud de datos para usuario:', username); // Log de depuración

    if (!username) {
      return res.status(400).json({ 
        success: false,
        error: 'Username es requerido' 
      });
    }

    connection = await mysql.createConnection(dbConfig);

    const [results] = await connection.query(
      'SELECT email, telefono FROM usuarios WHERE usuario = ?',
      [username]
    );

    if (results.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuario no encontrado' 
      });
    }

    const userData = results[0];
    console.log('Datos encontrados:', userData); // Log de depuración

    res.json({
      success: true,
      email: userData.email,
      phone: userData.telefono
    });

  } catch (error) {
    console.error('Error en user-data:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error del servidor',
      details: error.message 
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Endpoint para actualizar datos - Versión corregida
app.post('/update-user-data', async (req, res) => {
  let connection;
  try {
    const { username, email, phone } = req.body;
    
    console.log('Datos recibidos para actualización:', { username, email, phone }); // Log de depuración

    if (!username) {
      return res.status(400).json({ 
        success: false,
        error: 'Username es requerido' 
      });
    }

    // Validación mejorada
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'El email no tiene un formato válido'
      });
    }

    if (phone && !/^[0-9]{9,15}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        error: 'El teléfono debe contener solo números (9-15 dígitos)'
      });
    }

    connection = await mysql.createConnection(dbConfig);

    // Iniciar transacción
    await connection.beginTransaction();

    // 1. Verificar que el usuario existe
    const [users] = await connection.query(
      'SELECT id FROM usuarios WHERE usuario = ?',
      [username]
    );

    if (users.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false,
        error: 'Usuario no encontrado' 
      });
    }

    // 2. Actualizar datos
    const [result] = await connection.query(
      'UPDATE usuarios SET email = ?, telefono = ? WHERE usuario = ?',
      [email, phone, username]
    );

    console.log('Resultado de la actualización:', result); // Log de depuración

    // Verificar que realmente se actualizó
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(500).json({ 
        success: false,
        error: 'No se pudo actualizar el usuario' 
      });
    }

    // 3. Obtener los datos actualizados para devolverlos
    const [updatedUser] = await connection.query(
      'SELECT email, telefono FROM usuarios WHERE usuario = ?',
      [username]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Datos actualizados correctamente',
      email: updatedUser[0].email,
      phone: updatedUser[0].telefono
    });

  } catch (error) {
    console.error('Error en update-user-data:', error);
    if (connection) await connection.rollback();
    res.status(500).json({ 
      success: false,
      error: 'Error del servidor',
      details: error.message 
    });
  } finally {
    if (connection) await connection.end();
  }
});

app.post("/register", async (req, res) => {
  const {
    name,
    lastnamePaterno,
    lastnameMaterno,
    dni,
    email,
    phone,
    username,
    password
    // confirmPassword eliminado
  } = req.body;

  console.log('Datos recibidos del cliente para registro:', req.body); // Log de los datos recibidos

  // Ya no se valida confirmPassword
  if (!name || !lastnamePaterno || !lastnameMaterno || !dni || !email || !phone || !username || !password) {
    console.log('Faltan campos obligatorios');
    return res.status(400).json({ message: "Campos incompletos" });
  }

  if (!/^\d{8}$/.test(dni)) {
    console.log('DNI inválido, debe tener 8 dígitos');
    return res.status(400).json({ message: "El DNI debe tener 8 dígitos" });
  }

  let connection;
  try {
    console.log('Estableciendo conexión a la base de datos...');
    connection = await mysql.createConnection(dbConfig);

    const [results] = await connection.query(
      "SELECT * FROM usuarios WHERE usuario = ? OR email = ? OR dni = ?",
      [username, email, dni]
    );

    const errors = [];
    if (results.some(u => u.usuario === username)) errors.push("El usuario ya existe");
    if (results.some(u => u.email === email)) errors.push("El email ya está registrado");
    if (results.some(u => u.dni === dni)) errors.push("El DNI ya está registrado");

    if (errors.length > 0) {
      console.log('Errores de registro:', errors);
      return res.status(400).json({ message: "Error en registro", errors });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Contraseña encriptada:', hashedPassword);

    await connection.query(
      `INSERT INTO usuarios (
        nombre, apellido_paterno, apellido_materno,
        dni, email, telefono, usuario, password
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, lastnamePaterno, lastnameMaterno, dni, email, phone, username, hashedPassword]
    );

    console.log('Usuario registrado exitosamente');
    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ message: "Error en el servidor" });
  } finally {
    if (connection) await connection.end();
  }
});

// Ruta para recuperación de contraseña
app.post('/recover-password', async (req, res) => {
  let connection;
  try {
    const { dni } = req.body;

    if (!dni || !/^\d{8}$/.test(dni)) {
      return res.status(400).json({ 
        success: false, 
        message: 'El DNI debe tener 8 dígitos' 
      });
    }

    connection = await mysql.createConnection(dbConfig);
    
    // 1. Buscar usuario
    const [users] = await connection.query(
      'SELECT * FROM usuarios WHERE dni = ?', 
      [dni]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    const user = users[0];
    const token = crypto.randomBytes(20).toString('hex');
    // Cambia esto en server.js
    const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    // En tu ruta /recover-password en server.js
    console.log('Token generado:', token); // Añade esto antes de guardar en DB
    console.log('Fecha de expiración:', expires); // Añade esto también
    // 2. Actualizar usuario con token (usando los nombres de columna exactos)
    await connection.query(
      'UPDATE usuarios SET reset_password_token = ?, reset_password_expires = ? WHERE dni = ?',
      [token, expires, dni]
    );

    // 3. Enviar correo
    const mailOptions = {
      from: `"Soporte" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Recuperación de contraseña',
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Hola ${user.nombre},</p>
        <p>Para restablecer tu contraseña, usa el siguiente código:</p>
        <h3>${token}</h3>
        <p>Este código expirará en 15 minutos.</p>
        <p>Si no solicitaste este cambio, ignora este mensaje.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ 
      success: true,
      message: 'Token enviado al correo registrado'
    });
  } catch (error) {
    console.error('Error en recuperación:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al procesar la solicitud'
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Ruta para resetear contraseña
app.post('/reset-password', async (req, res) => {
   
  const { dni, token, newPassword } = req.body;

  
  
  // Validaciones básicas
  if (!dni || !token || !newPassword) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  let connection;
  try {
     connection = await mysql.createConnection(dbConfig);
    const [users] = await db.query(
      `SELECT * FROM usuarios 
       WHERE dni = ? 
       AND reset_password_token = ? 
       AND reset_password_expires > NOW()`,
      [dni, token]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    // 2. Actualizar contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await db.query(
      `UPDATE usuarios 
       SET password = ?, 
           reset_password_token = NULL, 
           reset_password_expires = NULL 
       WHERE dni = ?`,
      [hashedPassword, dni]
    );

    res.json({ success: true, message: 'Contraseña actualizada' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.post('/update-password', async (req, res) => {
  let connection;
  try {
    const { dni, token, newPassword } = req.body;
    
    // Validaciones mejoradas
    if (!dni || !token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "DNI, token y nueva contraseña son requeridos"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 6 caracteres"
      });
    }

    connection = await mysql.createConnection(dbConfig);
    
    // 1. Verificar token válido
    const [users] = await connection.query(
      `SELECT * FROM usuarios 
       WHERE dni = ? 
       AND reset_password_token = ? 
       AND reset_password_expires > NOW()`,
      [dni, token]
    );
    console.log('Resultado de la consulta:', {
    dni: dni,
    token: token,
    usersFound: users.length
});
    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Token inválido o expirado"
      });
    }

    // 2. Actualizar contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await connection.query(
      `UPDATE usuarios 
       SET password = ?, 
           reset_password_token = NULL, 
           reset_password_expires = NULL 
       WHERE dni = ?`,
      [hashedPassword, dni]
    );
    
    res.json({ 
      success: true,
      message: "Contraseña actualizada exitosamente"
    });
  } catch (error) {
    console.error('Error en update-password:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date()
    });
    
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (connection) await connection.end();
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});