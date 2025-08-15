const db = require('../db/db');
const oracledb = require('oracledb'); 

exports.getAllForeignLanguages = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM z6.StraniJezik ORDER BY NazivJezika');
        res.json(result.rows.map(row => ({
        StraniJezikID: row[0],
        NazivJezika: row[1]
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createForeignLanguage = async (req, res) => {
    const { nazivJezika } = req.body;
    try {
        const sql = `
            INSERT INTO z6.StraniJezik (NazivJezika)
            VALUES (:nazivJezika)
            RETURNING StraniJezikID INTO :jezikId
        `;

        const result = await db.query(
            sql,
            {
                nazivJezika,
                jezikId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            },
            { autoCommit: true }
        );

        const jezikId = result.outBinds.jezikId;
        res.status(201).json({ message: 'Foreign language created', jezikId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateForeignLanguage = async (req, res) => {
    const id = req.params.id;
    const { nazivJezika } = req.body;
    try {
        await db.query(
            'UPDATE z6.StraniJezik SET NazivJezika = :nazivJezika WHERE StraniJezikID = :id',
            [nazivJezika, id],
            { autoCommit: true }
        );
        res.json({ message: 'Foreign language updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteForeignLanguage = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query(
            'DELETE FROM z6.StraniJezik WHERE StraniJezikID = :id',
            [id],
            { autoCommit: true }
        );
        res.json({ message: 'Foreign language deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
