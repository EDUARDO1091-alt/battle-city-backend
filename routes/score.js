const express = require('express');
const router = express.Router();
const db = require('../database');

// GUARDAR PUNTUACIÓN (El juego llamará a esto al perder)
router.post('/', (req, res) => {
    const { jugador, puntos } = req.body;
    console.log(`🎮 Guardando récord: ${jugador} - ${puntos} pts`); // Mensaje en consola
    
    const sql = 'INSERT INTO puntuaciones (jugador, puntos) VALUES (?, ?)';
    db.query(sql, [jugador, puntos], (err, result) => {
        if (err) {
            console.error("❌ Error guardando:", err);
            return res.status(500).send(err);
        }
        res.json({ status: 'ok', id: result.insertId });
    });
});

// VER RANKING (Para mostrar los mejores)
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM puntuaciones ORDER BY puntos DESC LIMIT 5';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

module.exports = router;