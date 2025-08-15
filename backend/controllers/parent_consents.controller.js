const db = require('../db/db');

exports.getAllConsents = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM SaglasnostRoditelja');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createConsent = async (req, res) => {
    const { saglasnostID, roditeljID, datum, jeSaglasan } = req.body;
    try {
        await db.query(
            `INSERT INTO SaglasnostRoditelja (SaglasnostID, RoditeljID, Datum, JeSaglasan)
             VALUES (:id, :roditeljID, :datum, :jeSaglasan)`,
            [saglasnostID, roditeljID, datum, jeSaglasan],
            { autoCommit: true }
        );
        res.status(201).json({ message: 'Consent added' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateConsent = async (req, res) => {
    const id = req.params.id;
    const { datum, jeSaglasan } = req.body;
    try {
        await db.query(
            `UPDATE SaglasnostRoditelja SET Datum = :datum, JeSaglasan = :jeSaglasan
             WHERE SaglasnostID = :id`,
            [datum, jeSaglasan, id],
            { autoCommit: true }
        );
        res.json({ message: 'Consent updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteConsent = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM SaglasnostRoditelja WHERE SaglasnostID = :id', [id], { autoCommit: true });
        res.json({ message: 'Consent deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
