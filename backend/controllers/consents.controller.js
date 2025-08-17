const db = require('../db/db');

exports.getAllConsents = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM z6.PristupnaIzjava');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createConsent = async (req, res) => {
    const { datumPotpisa, clanskiBroj } = req.body;
    try {
        await db.query(
            `INSERT INTO z6.PristupnaIzjava (DATUMPOTPISA, CLANSKIBROJ)
             VALUES (TO_DATE(:datumPotpisa, 'YYYY-MM-DD'), :clanskiBroj)`,
            [datumPotpisa, clanskiBroj],
            { autoCommit: true }
        );
        res.status(201).json({ message: 'Pristupna izjava je kreirana' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateConsent = async (req, res) => {
    const id = req.params.id;
    const { datumPotpisa, clanskiBroj } = req.body;
    try {
        await db.query(
            `UPDATE z6.PristupnaIzjava 
             SET DATUMPOTPISA = TO_DATE(:datumPotpisa, 'YYYY-MM-DD'), 
                 CLANSKIBROJ = :clanskiBroj
             WHERE OVLASCENOLOICEID = :id`,
            [datumPotpisa, clanskiBroj, id],
            { autoCommit: true }
        );
        res.json({ message: 'Pristupna izjava je ažurirana' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteConsent = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query(
            'DELETE FROM z6.PristupnaIzjava WHERE OVLASCENOLOICEID = :id', 
            [id], 
            { autoCommit: true }
        );
        res.json({ message: 'Pristupna izjava je obrisana' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
