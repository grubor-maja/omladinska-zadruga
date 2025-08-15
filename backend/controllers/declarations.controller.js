const db = require('../db/db');

exports.getAllDeclarations = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM PristupnaIzjava');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createDeclaration = async (req, res) => {
    const { izjavaID, datum, clanskiBroj, liceID, saglasan } = req.body;
    try {
        await db.query(
            `INSERT INTO PristupnaIzjava (IzjavaID, Datum, ClanskiBroj, LiceID, Saglasan)
             VALUES (:id, :datum, :clan, :lice, :saglasan)`,
            [izjavaID, datum, clanskiBroj, liceID, saglasan],
            { autoCommit: true }
        );
        res.status(201).json({ message: 'Declaration created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateDeclaration = async (req, res) => {
    const id = req.params.id;
    const { datum, saglasan, liceID } = req.body;
    try {
        await db.query(
            `UPDATE PristupnaIzjava SET Datum = :datum, Saglasan = :saglasan, LiceID = :lice
             WHERE IzjavaID = :id`,
            [datum, saglasan, liceID, id],
            { autoCommit: true }
        );
        res.json({ message: 'Declaration updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteDeclaration = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM PristupnaIzjava WHERE IzjavaID = :id', [id], { autoCommit: true });
        res.json({ message: 'Declaration deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
