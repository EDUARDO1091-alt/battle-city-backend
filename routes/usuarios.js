const express = require("express");
const router = express.Router();
const db = require("../database");
const { verifyToken } = require("../utils/auth");
const bcrypt = require('bcrypt');
const { error } = require("console");

// Método GET para registro único
router.get('/:usu_id', verifyToken, (req, res) => {
    const { id } = req.params; // capturar la id desde los parámetros de la URL
    const query = 'SELECT * FROM `usuarios` WHERE usu_id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener usuario' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // CORREGIDO: debe ser res.json
        res.json(results[0]);
    });
});

// Método GET para múltiples registros con paginación y busqueda
router.get('/', verifyToken, (req, res) => {
    // Obtener parámetros de la URL
    const page = parseInt(req.query.page) || 1; // página actual por defecto 1
    const limit = parseInt(req.query.limit) || 10; // límite de registros por defecto 10
    const offset = (page - 1) * limit; // punto de inicio de la consulta

    const cadena = req.query.cadena;
    let whereClause = '';
    let queryParams = [];
    if (cadena) {
        whereClause = 'where usu_usuario like ? or usu_nombre like ? or usu_correo like ?';
        const searchTerm = `%${cadena}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
    }


    // Consulta para obtener total de registros
    const countQuery = `SELECT COUNT(*) AS total FROM usuarios ${whereClause}`;

    db.query(countQuery, queryParams, (err, countResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener total de usuarios' });
        }

        const totalUsuarios = countResult[0].total;
        const totalPages = Math.ceil(totalUsuarios / limit);

        // Consulta para obtener los registros de la página
        const usuariosQuery = `SELECT * FROM usuarios ${whereClause} LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);
        db.query(usuariosQuery, queryParams, (err, usuariosResult) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error al obtener los usuarios' });
            }

            // Enviar respuesta con los datos y la información de paginación
            res.json({
                totalItems: totalUsuarios,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
                data: usuariosResult
            });
        });
    });
});

// METODO POST para crear usuario
router.post('/', verifyToken, async (req, res) => {

    // obtener los datos
    const { usu_usuario, usu_contrasena, usu_nombre, usu_correo, usu_fecha_registro, usu_rol } = req.body;
    const search_query = 'select count(*) as contador from usuarios where usu_usuario = ? or usu_correo = ?';
    db.query(search_query, [usu_usuario, usu_correo], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Error interno al verificar el Usuario o Correo" });
        }
        if (result[0].contador > 0) {
            return res.status(409).json({ error: "El usuario con nombre " + usu_usuario + " o correo " + usu_correo + " ya existe" });
        }

    })
    const query = 'INSERT INTO usuarios values (null, ?, ?, ?, ?,?, ?)';
    try {
        const claveIncriptada = await bcrypt.hash(usu_contrasena, 12);
        const values = [usu_usuario, claveIncriptada, usu_nombre, usu_correo, usu_fecha_registro, usu_rol];
        db.query(query, values, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Error al insertar usuario' });
            }
            res.status(201).json({
                message: 'Usuario insertado correctamente',
                ideliente: result.insertId
            })
        })
    } catch (error) {
        return res.status(500).json({ error: 'Error al insertar usuario' });
    }

});

//Metodo put para actualizar
router.put('/:usu_id', verifyToken, async (req, res) => {
    const { usu_id } = req.params;
    const { usu_usuario, usu_nombre, usu_correo, usu_fecha_registro, usu_rol } = req.body;
    const query = 'update usuarios set usu_usuario = ?, usu_nombre = ?, usu_correo = ?, usu_fecha_registro = ?, usu_rol = ? where usu_id = ?';
    const values = [usu_usuario, usu_nombre, usu_correo, usu_fecha_registro, usu_rol, usu_id];
    db.query(query, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error al actualizar usuario' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" })
        }
        res.status(200).json({
            message: 'Usuario actualizado correctamente',
        })
    })
})

/*Metodo delete para eliminar
router.delete('/:usu_id', verifyToken, (req, res) => {
    // 1. Obtener el ID de los parámetros de la URL
    const { usu_id } = req.params;

    // 2. Definir la consulta SQL para eliminar
    const query = 'DELETE FROM usuarios WHERE usu_id = ?';

    // 3. Ejecutar la consulta en la base de datos
    db.query(query, [usu_id], (err, result) => {
        // 4. Manejar un posible error de la base de datos
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error al eliminar el usuario' });
        }

        // 5. Verificar si se eliminó alguna fila.
        // Si affectedRows es 0, significa que no se encontró un usuario con ese ID.
        // (Exactamente igual que en tu método PUT)
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // 6. Enviar una respuesta de éxito
        res.status(200).json({
            message: 'Usuario eliminado correctamente'
        });
    });
});*/
router.delete('/:usu_id', verifyToken, async (req, res) => {
    const { usu_id } = req.params;
    const search_query = 'select count(*) as contador from artistas where usu_id = ?';
    db.query(search_query, [usu_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Error interno al verificar artista" });
        }
        if (result[0].contador > 0) {
            return res.status(409).json({ error: "El usuario no se puede eliminar porque tiene vinculado artistas" });
        }
        const query = 'DELETE FROM usuarios WHERE usu_id = ?';
        const values = [usu_id];
        db.query(query, values, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Error al eliminar cliente' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Cliente no encontrado" })
            }
            res.status(200).json({
                message: 'Usuario eliminado correctamente',
            })
        })

    })

})


module.exports = router;