const express = require('express');
const router = express.Router();
const db = require('../database');


router.post('/', (req, res) => {
    
    const { jugador, puntos } = req.body;
    
    console.log(`🎮 Guardando récord: ${jugador} - ${puntos} pts`); 

   
    const sql = 'INSERT INTO puntajes (jugador, puntaje) VALUES (?, ?)';
    
    db.query(sql, [jugador, puntos], (err, result) => {
        if (err) {
            console.error("❌ Error guardando:", err);
          
            return res.status(500).json({ error: err.message });
        }
       
        res.json({ status: 'ok', id: result.insertId });
    });
});


router.get('/', (req, res) => {
    // ✅ CORRECCIÓN: Usar tabla 'puntajes' y ordenar por 'puntaje'
    const sql = 'SELECT * FROM puntajes ORDER BY puntaje DESC LIMIT 5';
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

module.exports = router;