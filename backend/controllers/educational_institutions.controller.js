const db = require('../db/db');
const oracledb = require('oracledb');

exports.getAllEducationalInstitutions = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM z6.ObrazovnaUstanova ORDER BY NazivObrazovneUstanove');
        res.json(result.rows.map(row => ({
        ObrazovnaUstanovaID: row[0],
        NazivObrazovneUstanove: row[1]
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createEducationalInstitution = async (req, res) => {
    const { nazivUstanove } = req.body;
    try {
        const sql = `
            INSERT INTO z6.ObrazovnaUstanova (NazivObrazovneUstanove)
            VALUES (:nazivUstanove)
            RETURNING ObrazovnaUstanovaID INTO :ustanovaId
        `;

        const result = await db.query(
            sql,
            {
                nazivUstanove,
                ustanovaId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            },
            { autoCommit: true }
        );

        const ustanovaId = result.outBinds.ustanovaId;
        res.status(201).json({ message: 'Educational institution created', ustanovaId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateEducationalInstitution = async (req, res) => {
    const id = req.params.id;
    const { nazivUstanove } = req.body;
    try {
        await db.query(
            'UPDATE z6.ObrazovnaUstanova SET NazivObrazovneUstanove = :nazivUstanove WHERE ObrazovnaUstanovaID = :id',
            [nazivUstanove, id],
            { autoCommit: true }
        );
        res.json({ message: 'Educational institution updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteEducationalInstitution = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query(
            'DELETE FROM z6.ObrazovnaUstanova WHERE ObrazovnaUstanovaID = :id',
            [id],
            { autoCommit: true }
        );
        res.json({ message: 'Educational institution deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};