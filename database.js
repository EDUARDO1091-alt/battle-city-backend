const mysql = require('mysql2');
require('dotenv').config();

// CREAMOS LA CONEXION
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT, // <--- Agregamos el puerto para TiDB (4000)
    ssl: {
        rejectUnauthorized: false // <--- ¡ESTO ES LA CLAVE! Permite la conexión segura
    }
});

db.connect(err => {
    if (err) {
        console.log('ERROR AL CONECTAR LA BASE DE DATOS: ', err);
        return;
    }
    console.log('CONEXIÓN EXITOSA A LA BASE DE DATOS MYSQL')
});

module.exports = db;