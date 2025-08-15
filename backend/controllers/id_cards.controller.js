const db = require('../db/db');

// nije vise potreban fajl

exports.getAllIDCards = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Legitimacija');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createIDCard = async (req, res) => {
    const { legitimacijaID, broj, datumIzdavanja, slika, clanskiBroj } = req.body;
    try {
        await db.query(
            `INSERT INTO Legitimacija (LegitimacijaID, Broj, DatumIzdavanja, Slika, ClanskiBroj)
             VALUES (:id, :broj, :datum, :slika, :clan)`,
            [legitimacijaID, broj, datumIzdavanja, slika, clanskiBroj],
            { autoCommit: true }
        );
        res.status(201).json({ message: 'ID card created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateIDCard = async (req, res) => {
    const id = req.params.id;
    const { broj, datumIzdavanja, slika } = req.body;
    try {
        await db.query(
            `UPDATE Legitimacija SET Broj = :broj, DatumIzdavanja = :datum, Slika = :slika
             WHERE LegitimacijaID = :id`,
            [broj, datumIzdavanja, slika, id],
            { autoCommit: true }
        );
        res.json({ message: 'ID card updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteIDCard = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM Legitimacija WHERE LegitimacijaID = :id', [id], { autoCommit: true });
        res.json({ message: 'ID card deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
