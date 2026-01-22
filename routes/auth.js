const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../database');

const { generateToken } = require('../utils/auth');

// LOGIN
router.post('/login', async (req, res) => {

    const { usu_usuario, usu_contrasena } = req.body;//nombre segun la tabla

    db.query("SELECT usu_id, usu_usuario, usu_contrasena, usu_nombre FROM usuarios WHERE usu_usuario = ?", [usu_usuario], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error en el servidor" });
        }
        if (results.length === 0) {
            return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
        }
        const user = results[0];
        const isPasswordValid = await bcrypt.compare(usu_contrasena, user.usu_contrasena);


        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
        //Si el Login es exitoso, genera un token y lo envía en la respuesta
        //console.log({ id: user.usu_id, usu_usuario: user.usu_nombre })
        const token = generateToken({ id: user.usu_id, usu_usuario: user.usu_nombre });
        res.json({ message: 'Login exitoso', token });
    });
});

module.exports = router;