const db = require('../db/db');

exports.getStructuresByRequestId = async (req, res) => {
    const zahtevId = req.params.zahtevId;
    try {
        const result = await db.query(`
            SELECT 
                StrukturaRadnikaID,
                ZahtevID,
                BrojRadnika,
                Pol
            FROM z6.StrukturaRadnika 
            WHERE ZahtevID = :zahtevId
            ORDER BY Pol
        `, [zahtevId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getStructureById = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await db.query('SELECT * FROM z6.StrukturaRadnika WHERE StrukturaRadnikaID = :id', [id]);
        res.json(result.rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createStructure = async (req, res) => {
    const { zahtevId, brojRadnika, pol } = req.body;
    
    try {
        const sql = `INSERT INTO z6.StrukturaRadnika (ZahtevID, BrojRadnika, Pol)
                     VALUES (:zahtevId, :brojRadnika, :pol)`;
        
        await db.query(sql, [zahtevId, brojRadnika, pol], { autoCommit: true });
        res.status(201).json({ message: 'Worker structure created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStructure = async (req, res) => {
    const id = req.params.id;
    const { brojRadnika, pol } = req.body;
    
    try {
        const sql = `UPDATE z6.StrukturaRadnika 
                     SET BrojRadnika = :brojRadnika, Pol = :pol
                     WHERE StrukturaRadnikaID = :id`;
        
        await db.query(sql, [brojRadnika, pol, id], { autoCommit: true });
        res.json({ message: 'Worker structure updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteStructure = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM z6.StrukturaRadnika WHERE StrukturaRadnikaID = :id', [id], { autoCommit: true });
        res.json({ message: 'Worker structure deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteStructuresByRequestId = async (req, res) => {
    const zahtevId = req.params.zahtevId;
    try {
        await db.query('DELETE FROM z6.StrukturaRadnika WHERE ZahtevID = :zahtevId', [zahtevId], { autoCommit: true });
        res.json({ message: 'All worker structures for request deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
