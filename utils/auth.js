const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET;
//funcion para generarar un token despues de un logueo exitoso
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h'}); //token es valido por una hora
}

// Middleware para verificar el token en cada peticion
const verifyToken = (req, res, next ) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({message: 'token no proporcionado'});
    }
    try {
        const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET);
        req.user = decoded; //añadir la informacion del usuario a la peticion
        next(); //permitir que la peticion continue
    } catch (error) {
        return res.status(401).json({message: 'Token invalido'})
        
    }
};

module.exports = {generateToken, verifyToken};