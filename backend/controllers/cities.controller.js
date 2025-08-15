const db = require('../db/db');
const oracledb = require('oracledb');

exports.getAllCities = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM z6.Grad ORDER BY NazivGrada');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createCity = async (req, res) => {
    const { nazivGrada } = req.body;
    try {
        const sql = `INSERT INTO z6.Grad (GradID, NazivGrada)
                     VALUES ((SELECT NVL(MAX(GradID), 0) + 1 FROM z6.Grad), :nazivGrada)
                     RETURNING GradID INTO :gradId`;

        const binds = {
            nazivGrada: nazivGrada,
            gradId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };

        const result = await db.query(sql, binds, { autoCommit: true });

        res.status(201).json({ message: 'City created', gradId: result.outBinds.gradId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateCity = async (req, res) => {
    const id = req.params.id;
    const { nazivGrada } = req.body;
    try {
        await db.query('UPDATE z6.Grad SET NazivGrada = :nazivGrada WHERE GradID = :id', [nazivGrada, id], { autoCommit: true });
        res.json({ message: 'City updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteCity = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM z6.Grad WHERE GradID = :id', [id], { autoCommit: true });
        res.json({ message: 'City deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
