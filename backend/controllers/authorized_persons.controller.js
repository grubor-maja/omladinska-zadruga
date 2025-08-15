const db = require('../db/db');

exports.getAllAuthorizedPersons = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM OvlascenoLice');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createAuthorizedPerson = async (req, res) => {
    const { liceID, ime, prezime } = req.body;
    try {
        await db.query(
            `INSERT INTO OvlascenoLice (LiceID, Ime, Prezime)
             VALUES (:id, :ime, :prezime)`,
            [liceID, ime, prezime],
            { autoCommit: true }
        );
        res.status(201).json({ message: 'Authorized person created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateAuthorizedPerson = async (req, res) => {
    const id = req.params.id;
    const { ime, prezime } = req.body;
    try {
        await db.query(
            `UPDATE OvlascenoLice SET Ime = :ime, Prezime = :prezime
             WHERE LiceID = :id`,
            [ime, prezime, id],
            { autoCommit: true }
        );
        res.json({ message: 'Authorized person updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteAuthorizedPerson = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM OvlascenoLice WHERE LiceID = :id', [id], { autoCommit: true });
        res.json({ message: 'Authorized person deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
