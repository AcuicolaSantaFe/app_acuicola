const express = require('express');
const router = express.Router();
const pool = require('./bd');

// ==========================
// OBTENER SITIOS
// ==========================
router.get('/sitios', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM sitios ORDER BY nombre');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener sitios' });
    }
});

// ==========================
// OBTENER MODULOS POR SITIO
// ==========================
router.get('/modulos/:sitioId', async (req, res) => {
    try {
        const { sitioId } = req.params;
        const result = await pool.query(
            'SELECT * FROM modulos WHERE sitio_id = $1 ORDER BY nombre',
            [sitioId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener módulos' });
    }
});

// ==========================
// OBTENER ESTANQUES POR MODULO
// ==========================
router.get('/estanques/:moduloId', async (req, res) => {
    try {
        const { moduloId } = req.params;
        const result = await pool.query(
            'SELECT * FROM estanques WHERE modulo_id = $1 ORDER BY nombre',
            [moduloId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener estanques' });
    }
});

// ==========================
// OBTENER MARCAS
// ==========================
router.get('/marcas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM marcas ORDER BY nombre');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener marcas' });
    }
});

// ==========================
// AGREGAR MARCA
// ==========================
router.post('/marcas', async (req, res) => {
    try {
        const { nombre } = req.body;

        const result = await pool.query(
            'INSERT INTO marcas (nombre) VALUES ($1) RETURNING *',
            [nombre]
        );

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error(error);

        if (error.code === '23505') {
            return res.status(400).json({
                success: false,
                message: 'La marca ya existe'
            });
        }

        res.status(500).json({ success: false, message: 'Error al agregar marca' });
    }
});

// ==========================
// OBTENER TIPOS DE PRODUCTO
// ==========================
router.get('/tipos-producto', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tipos_producto ORDER BY nombre');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener tipos de producto' });
    }
});

// ==========================
// AGREGAR TIPO DE PRODUCTO
// ==========================
router.post('/tipos-producto', async (req, res) => {
    try {
        const { nombre } = req.body;

        const result = await pool.query(
            'INSERT INTO tipos_producto (nombre) VALUES ($1) RETURNING *',
            [nombre]
        );

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error(error);

        if (error.code === '23505') {
            return res.status(400).json({
                success: false,
                message: 'El tipo de producto ya existe'
            });
        }

        res.status(500).json({ success: false, message: 'Error al agregar tipo de producto' });
    }
});

module.exports = router;