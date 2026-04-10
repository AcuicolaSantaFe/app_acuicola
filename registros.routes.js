const express = require('express');
const router = express.Router();
const pool = require('./bd');
const ExcelJS = require('exceljs');

// ==========================
// GUARDAR REGISTRO
// ==========================
router.post('/', async (req, res) => {
    try {
        const {
            fecha,
            sitio_id,
            modulo_id,
            estanque_id,
            marca_id,
            tipo_producto_id,
            kg_dia,
            observaciones
        } = req.body;

        const result = await pool.query(
            `INSERT INTO registro_alimento_diario
            (fecha, sitio_id, modulo_id, estanque_id, marca_id, tipo_producto_id, kg_dia, observaciones)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING *`,
            [
                fecha,
                sitio_id,
                modulo_id,
                estanque_id,
                marca_id,
                tipo_producto_id,
                kg_dia,
                observaciones
            ]
        );

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al guardar el registro'
        });
    }
});

// ==========================
// OBTENER REGISTROS CON FILTROS
// ==========================
router.get('/', async (req, res) => {
    try {
        const { fecha, sitio_id, modulo_id, estanque_id } = req.query;

        let query = `
            SELECT 
                r.id,
                r.fecha,
                s.nombre AS sitio,
                m.nombre AS modulo,
                e.nombre AS estanque,
                e.hectareas,
                ma.nombre AS marca,
                tp.nombre AS tipo_producto,
                r.kg_dia,
                r.observaciones
            FROM registro_alimento_diario r
            INNER JOIN sitios s ON r.sitio_id = s.id
            INNER JOIN modulos m ON r.modulo_id = m.id
            INNER JOIN estanques e ON r.estanque_id = e.id
            INNER JOIN marcas ma ON r.marca_id = ma.id
            INNER JOIN tipos_producto tp ON r.tipo_producto_id = tp.id
            WHERE 1=1
        `;

        const params = [];
        let index = 1;

        if (fecha) {
            query += ` AND r.fecha = $${index}`;
            params.push(fecha);
            index++;
        }

        if (sitio_id) {
            query += ` AND r.sitio_id = $${index}`;
            params.push(sitio_id);
            index++;
        }

        if (modulo_id) {
            query += ` AND r.modulo_id = $${index}`;
            params.push(modulo_id);
            index++;
        }

        if (estanque_id) {
            query += ` AND r.estanque_id = $${index}`;
            params.push(estanque_id);
            index++;
        }

        query += ` ORDER BY r.fecha DESC, r.id DESC`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener registros'
        });
    }
});

// ==========================
// EXPORTAR A EXCEL
// ==========================
router.get('/export/excel', async (req, res) => {
    try {
        const { fecha, sitio_id, modulo_id, estanque_id } = req.query;

        let query = `
            SELECT 
                r.fecha,
                s.nombre AS sitio,
                m.nombre AS modulo,
                e.nombre AS estanque,
                e.hectareas,
                ma.nombre AS marca,
                tp.nombre AS tipo_producto,
                r.kg_dia,
                r.observaciones
            FROM registro_alimento_diario r
            INNER JOIN sitios s ON r.sitio_id = s.id
            INNER JOIN modulos m ON r.modulo_id = m.id
            INNER JOIN estanques e ON r.estanque_id = e.id
            INNER JOIN marcas ma ON r.marca_id = ma.id
            INNER JOIN tipos_producto tp ON r.tipo_producto_id = tp.id
            WHERE 1=1
        `;

        const params = [];
        let index = 1;

        if (fecha) {
            query += ` AND r.fecha = $${index}`;
            params.push(fecha);
            index++;
        }

        if (sitio_id) {
            query += ` AND r.sitio_id = $${index}`;
            params.push(sitio_id);
            index++;
        }

        if (modulo_id) {
            query += ` AND r.modulo_id = $${index}`;
            params.push(modulo_id);
            index++;
        }

        if (estanque_id) {
            query += ` AND r.estanque_id = $${index}`;
            params.push(estanque_id);
            index++;
        }

        query += ` ORDER BY r.fecha DESC, r.id DESC`;

        const result = await pool.query(query, params);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Registros Camaron');

        worksheet.columns = [
            { header: 'Fecha', key: 'fecha', width: 15 },
            { header: 'Sitio', key: 'sitio', width: 20 },
            { header: 'Módulo', key: 'modulo', width: 20 },
            { header: 'Estanque', key: 'estanque', width: 20 },
            { header: 'Hectáreas', key: 'hectareas', width: 15 },
            { header: 'Marca', key: 'marca', width: 20 },
            { header: 'Tipo de Producto', key: 'tipo_producto', width: 20 },
            { header: 'Kg al Día', key: 'kg_dia', width: 15 },
            { header: 'Observaciones', key: 'observaciones', width: 30 }
        ];

        result.rows.forEach(row => {
            worksheet.addRow(row);
        });

        worksheet.getRow(1).font = { bold: true };

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=registros_camaron.xlsx'
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al exportar a Excel'
        });
    }
});

module.exports = router;