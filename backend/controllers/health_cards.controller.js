const db = require('../db/db');

// nije vise potreban fajl

exports.getAllHealthCards = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM ZdravstvenaLegitimacija');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createHealthCard = async (req, res) => {
    const {
        zdravstvenaID, broj, izabraniLekar,
        datumOvere, clanskiBroj
    } = req.body;

    try {
        await db.query(
            `INSERT INTO ZdravstvenaLegitimacija 
            (ZdravstvenaID, Broj, IzabraniLekar, DatumOvere, ClanskiBroj)
            VALUES (:id, :broj, :lekar, :datum, :clan)`,
            [zdravstvenaID, broj, izabraniLekar, datumOvere, clanskiBroj],
            { autoCommit: true }
        );
        res.status(201).json({ message: 'Health card created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateHealthCard = async (req, res) => {
    const id = req.params.id;
    const { broj, izabraniLekar, datumOvere } = req.body;
    try {
        await db.query(
            `UPDATE ZdravstvenaLegitimacija SET 
            Broj = :broj, IzabraniLekar = :lekar, DatumOvere = :datum
            WHERE ZdravstvenaID = :id`,
            [broj, izabraniLekar, datumOvere, id],
            { autoCommit: true }
        );
        res.json({ message: 'Health card updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteHealthCard = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM ZdravstvenaLegitimacija WHERE ZdravstvenaID = :id', [id], { autoCommit: true });
        res.json({ message: 'Health card deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
