const express = require('express');
const cors = require('cors'); // 1. Importamos cors una sola vez
require('dotenv').config();

const app = express(); // 2. Creamos la app (¡Importante hacer esto antes de usarla!)
const port = process.env.PORT || 5000;

// 3. Activamos cors y json
app.use(cors()); 
app.use(express.json());

//IMPORTAR RUTAS
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');




//USAR LA RUTA
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/score', require('./routes/score'));




//RUTA DE EJEMPLO
app.get('/', (req , res) => {
    res.send('HOLA DESDE EL SERVIDOR EXPRESS');
});

//INICIA EL SERVIDOR
app.listen(port, ()=>{
    console.log(`SERVIDOR ESCUCHANDO EL PUERTO ${port}`);
});