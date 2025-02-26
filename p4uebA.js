require('dotenv').config(); // Cargar variables de entorno desde .env
const express = require('express');
const mysql = require('mysql2/promise'); // Usar mysql2 con Promises para async/await
const cors = require('cors');
const morgan = require('morgan');

const app = express(); // Inicializa Express

// Middleware
app.use(cors()); // Habilita CORS
app.use(morgan('dev')); // Registra solicitudes en consola
app.use(express.json()); // Permite recibir JSON en solicitudes

// Configuración de MySQL con un pool de conexiones
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DB || 'usuariosagenda',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 📌 Obtener todos los usuarios (READ)
app.get('/api/Users', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT * FROM registrados');
        connection.release();
        res.status(200).json({ error: false, data: rows });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: true, message: 'Error al obtener usuarios' });
    }
});

// 📌 Obtener un usuario por ID (READ ONE)
app.get('/api/Users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT * FROM registrados WHERE id = ?', [id]);
        connection.release();
        if (rows.length > 0) {
            res.status(200).json({ error: false, data: rows[0] });
        } else {
            res.status(404).json({ error: true, message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ error: true, message: 'Error al obtener usuario' });
    }
});

// 📌 Crear un usuario (CREATE)


// 📌 Actualizar un usuario (UPDATE)
app.put('/api/Users/:id', async (req, res) => {
    const { id } = req.params;
    const { Nombre, Email } = req.body;
    if (!Nombre || !Email) {
        return res.status(400).json({ error: true, message: 'Nombre y Email son requeridos' });
    }
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute('UPDATE registrados SET Nombre = ?, Email = ? WHERE id = ?', [Nombre, Email, id]);
        connection.release();
        if (result.affectedRows > 0) {
            res.status(200).json({ error: false, message: 'Usuario actualizado' });
        } else {
            res.status(404).json({ error: true, message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ error: true, message: 'Error al actualizar usuario' });
    }
});

// 📌 Eliminar un usuario (DELETE)
app.delete('/api/Users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute('DELETE FROM registrados WHERE id = ?', [id]);
        connection.release();
        if (result.affectedRows > 0) {
            res.status(200).json({ error: false, message: 'Usuario eliminado' });
        } else {
            res.status(404).json({ error: true, message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: true, message: 'Error al eliminar usuario' });
    }
});

// Configurar puerto del servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
