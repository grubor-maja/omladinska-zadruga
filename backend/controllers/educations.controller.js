const db = require('../db/db');
const oracledb = require('oracledb'); 

exports.getAllEducations = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM z6.Obrazovanje');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getEducationById = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await db.query('SELECT * FROM z6.Obrazovanje WHERE ObrazovanjeID = :id', [id]);
        res.json(result.rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getEducationsByCandidate = async (req, res) => {
    const memberId = req.params.candidateId; 
    try {
        const result = await db.query(`
            SELECT 
                o.ObrazovanjeID,
                o.ObrazovnaUstanovaID,
                u.NazivObrazovneUstanove as NazivObrazovneUstanove,
                o.NivoSS as NivoSS,
                o.Zvanje as Zvanje
            FROM z6.Obrazovanje o
            LEFT JOIN z6.ObrazovnaUstanova u ON o.ObrazovnaUstanovaID = u.ObrazovnaUstanovaID
            INNER JOIN z6.KandidatOsnovno k ON o.KandidatID = k.KandidatID
            INNER JOIN z6.ClanZadruge cz ON k.KandidatID = cz.ClanZadrugeID
            WHERE cz.ClanZadrugeID = :memberId
            ORDER BY o.ObrazovanjeID DESC
        `, [memberId]);
        
        res.json(result.rows);
    } catch (err) {
        console.error('Education by candidate error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.createEducation = async (req, res) => {
    const {
        kandidatID, obrazovnaUstanovaID, nivoSS, zvanje
    } = req.body;

    try {
        const sql = `INSERT INTO z6.Obrazovanje (
            KandidatID, ObrazovnaUstanovaID, NivoSS, Zvanje
        ) VALUES (
            :kandidatID, :obrazovnaUstanovaID, :nivoSS, :zvanje
        )`;

        await db.query(sql, [
            kandidatID, obrazovnaUstanovaID, nivoSS, zvanje
        ], { autoCommit: true });

        res.status(201).json({ message: 'Education created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateEducation = async (req, res) => {
    const id = req.params.id;
    const {
        kandidatID, obrazovnaUstanovaID, nivoSS, zvanje
    } = req.body;

    try {
        await db.query(`UPDATE z6.Obrazovanje SET
            KandidatID = :kandidatID,
            ObrazovnaUstanovaID = :obrazovnaUstanovaID,
            NivoSS = :nivoSS,
            Zvanje = :zvanje
        WHERE ObrazovanjeID = :id`, [
            kandidatID, obrazovnaUstanovaID, nivoSS, zvanje, id
        ], { autoCommit: true });

        res.json({ message: 'Education updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteEducation = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM z6.Obrazovanje WHERE ObrazovanjeID = :id', [id], { autoCommit: true });
        res.json({ message: 'Education deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
