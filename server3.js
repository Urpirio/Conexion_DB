 // Cargar variables de entorno desde .env
const express = require('express');
const mysql = require('mysql2/promise'); // Usar mysql2 con Promises para async/await
const cors = require('cors');
const morgan = require('morgan');

const app = express(); // Inicializa Express

// Configuración de Express
app.use(cors()); // Habilita CORS
app.use(morgan('dev')); // Registra solicitudes en consola
app.use(express.json()); // Permite recibir JSON en solicitudes

// Configuración de MySQL con un pool de conexiones
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DB || 'usuariosagendacitas',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Ruta para obtener todos los usuarios desde la base de datos
app.get('/api/citasagendadas', async (req, res) => {
    try {
        const connection = await pool.getConnection(); // Obtener conexión
        const [rows] = await connection.execute('SELECT * FROM citasagendadas'); // Ejecutar consulta
        connection.release(); // Liberar conexión

        res.status(200).json({ error: false, data: rows });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: true, message: 'Error al obtener citasagendadas' });
    }
});

app.post('/api/citasagendadas', async (req, res) => {
    const { InstitucionPublica, Cedula,DescripcionCita,Hora,FechaCita} = req.body;
    if (!InstitucionPublica || !Cedula || !DescripcionCita || !Hora || !FechaCita) {
        return res.status(400).json({ error: true, message: 'InstitucionPublica y Cedula son requeridos' });
    }
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute('INSERT INTO citasagendadas (InstitucionPublica, Cedula, DescripcionCita,Hora,FechaCita) VALUES (?, ?,?,?,?)', [InstitucionPublica, Cedula, DescripcionCita,Hora,FechaCita]);
        connection.release();
        res.status(201).json({ error: false, message: 'Servicio Agregado', data: result.insertId });
    } catch (error) {
        console.error('Error al Agregar servicio:', error);
        res.status(500).json({ error: true, message: 'Error al Agregar servicio' });
    }
});


// Configurar puerto del servidor
const PORT =  4200;
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});