const db = require('../db/db');



exports.getAllRequests = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM ZahtevZaPristupanje');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createRequest = async (req, res) => {
    const { zahtevID, datum, clanskiBroj, status } = req.body;
    try {
        await db.query(
            `INSERT INTO ZahtevZaPristupanje (ZahtevID, Datum, ClanskiBroj, Status)
             VALUES (:id, :datum, :clan, :status)`,
            [zahtevID, datum, clanskiBroj, status],
            { autoCommit: true }
        );
        res.status(201).json({ message: 'Access request created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateRequest = async (req, res) => {
    const id = req.params.id;
    const { status, datum } = req.body;
    try {
        await db.query(
            `UPDATE ZahtevZaPristupanje SET Status = :status, Datum = :datum
             WHERE ZahtevID = :id`,
            [status, datum, id],
            { autoCommit: true }
        );
        res.json({ message: 'Request updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteRequest = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM ZahtevZaPristupanje WHERE ZahtevID = :id', [id], { autoCommit: true });
        res.json({ message: 'Request deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
