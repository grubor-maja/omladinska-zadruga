const db = require('../db/db');

exports.getAllAddresses = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                a.AdresaID,
                a.Ulica,
                a.Broj,
                a.OpstinaID,
                o.NazivOpstine,
                g.NazivGrada
            FROM z6.Adresa a
            JOIN z6.Opstina o ON a.OpstinaID = o.OpstinaID
            JOIN z6.Grad g ON o.GradID = g.GradID
            ORDER BY g.NazivGrada, o.NazivOpstine, a.Ulica, a.Broj
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createAddress = async (req, res) => {
    const { ulica, broj, opstinaID } = req.body;
    try {
        const sql = `
            INSERT INTO z6.Adresa (Ulica, Broj, OpstinaID)
            VALUES (:ulica, :broj, :opstinaID)
            RETURNING AdresaID INTO :adresaId
        `;

        const bindParams = {
            ulica,
            broj,
            opstinaID,
            adresaId: { dir: db.BIND_OUT, type: db.NUMBER }
        };

        const result = await db.query(sql, bindParams, { autoCommit: true });
        res.status(201).json({ message: 'Address created', adresaId: result.outBinds.adresaId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateAddress = async (req, res) => {
    const id = req.params.id;
    const { ulica, broj, opstinaID } = req.body;
    try {
        await db.query(
            'UPDATE z6.Adresa SET Ulica = :ulica, Broj = :broj, OpstinaID = :opstinaID WHERE AdresaID = :id',
            [ulica, broj, opstinaID, id],
            { autoCommit: true }
        );
        res.json({ message: 'Address updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteAddress = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM z6.Adresa WHERE AdresaID = :id', [id], { autoCommit: true });
        res.json({ message: 'Address deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
