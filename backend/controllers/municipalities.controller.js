const db = require('../db/db');
const oracledb = require('oracledb');

exports.getAllMunicipalities = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT o.OpstinaID, o.NazivOpstine, o.GradID, g.NazivGrada
            FROM z6.Opstina o
            JOIN z6.Grad g ON o.GradID = g.GradID
            ORDER BY g.NazivGrada, o.NazivOpstine
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMunicipalitiesByCity = async (req, res) => {
    const gradId = req.params.gradId;
    try {
        const result = await db.query('SELECT * FROM z6.Opstina WHERE GradID = :gradId ORDER BY NazivOpstine', [gradId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createMunicipality = async (req, res) => {
    const { nazivOpstine, gradID } = req.body;
    try {
        const sql = `INSERT INTO z6.Opstina (OpstinaID, NazivOpstine, GradID)
                     VALUES ((SELECT NVL(MAX(OpstinaID), 0) + 1 FROM z6.Opstina), :nazivOpstine, :gradID)
                     RETURNING OpstinaID INTO :opstinaId`;

        const bindParams = {
            nazivOpstine,
            gradID,
            opstinaId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };

        const result = await db.query(sql, bindParams, { autoCommit: true });
        res.status(201).json({ message: 'Municipality created', opstinaId: result.outBinds.opstinaId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateMunicipality = async (req, res) => {
    const id = req.params.id;
    const { nazivOpstine, gradID } = req.body;
    try {
        await db.query(
            'UPDATE z6.Opstina SET NazivOpstine = :nazivOpstine, GradID = :gradID WHERE OpstinaID = :id',
            [nazivOpstine, gradID, id],
            { autoCommit: true }
        );
        res.json({ message: 'Municipality updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteMunicipality = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM z6.Opstina WHERE OpstinaID = :id', [id], { autoCommit: true });
        res.json({ message: 'Municipality deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
