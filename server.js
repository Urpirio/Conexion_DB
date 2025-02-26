require('dotenv').config(); // Cargar variables de entorno desde .env
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
app.get('/api/Users', async (req, res) => {
    try {
        const connection = await pool.getConnection(); // Obtener conexión
        const [rows] = await connection.execute('SELECT * FROM usuarios'); // Ejecutar consulta
        connection.release(); // Liberar conexión

        res.status(200).json({ error: false, data: rows });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: true, message: 'Error al obtener usuarios' });
    }
});

app.post('/api/Users', async (req, res) => {
    const { NombreCompleto, Gmail,Password,Cedula} = req.body;
    if (!NombreCompleto || !Gmail || !Password || !Cedula) {
        return res.status(400).json({ error: true, message: 'Tenemos un error en el server' });
    }
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute('INSERT INTO usuarios (NombreCompleto, Gmail,Password,Cedula) VALUES (?, ?,?,?)', [NombreCompleto, Gmail,Password,Cedula]);
        connection.release();
        res.status(201).json({ error: false, message: 'Usuario creado', data: result.insertId });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: true, message: 'Error al crear usuario' });
    }
});

app.put('/api/Password/:ID', async (req, res) => {
    // const { ID } = req.params;
    const { Password, ID } = req.body;
    if (!Password || !ID) {
        return res.status(400).json({ error: true, message: 'Tenemos un error' });
    }
    try {
        const connection = await pool.getConnection();

        const [result] = await connection.execute(`UPDATE usuarios SET Password = ? WHERE id = ?`, [ Password,ID]);
        connection.release();
        if (result.affectedRows > 0) {
            res.status(200).json({ error: false, message: 'Usuario actualizado', data: result.insertId  });
        } else {
            res.status(404).json({ error: true, message: 'Usuario no encontrado' , data: result.insertId });
        }
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ error: true, message: 'Error al actualizar usuario' });
    }
});
app.put('/api/Users/:ID', async (req, res) => {
    // const { ID } = req.params;
    const { InicioSesion , ID } = req.body;
    if (!InicioSesion  || !ID) {
        return res.status(400).json({ error: true, message: 'Tenemos un error' });
    }
    try {
        const connection = await pool.getConnection();

        const [result] = await connection.execute(`UPDATE usuarios SET InicioSesion  = ? WHERE id = ?`, [ InicioSesion ,ID]);
        connection.release();
        if (result.affectedRows > 0) {
            res.status(200).json({ error: false, message: 'Usuario actualizado', data: result.insertId  });
        } else {
            res.status(404).json({ error: true, message: 'Usuario no encontrado' , data: result.insertId });
        }
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ error: true, message: 'Error al actualizar usuario' });
    }
});


// Configurar puerto del servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
