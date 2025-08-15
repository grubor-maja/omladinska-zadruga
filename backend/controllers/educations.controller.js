const db = require('../db/db');
const oracledb = require('oracledb'); 

exports.getAllEducations = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Obrazovanje');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getEducationById = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await db.query('SELECT * FROM Obrazovanje WHERE ObrazovanjeID = :id', [id]);
        res.json(result.rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getEducationsByCandidate = async (req, res) => {
    const memberId = req.params.candidateId; // Ovo je zapravo član ID
    try {
        const result = await db.query(`
            SELECT 
                o.ObrazovanjeID,
                o.ObrazovnaUstanovaID,
                u.NazivObrazovneUstanove as NazivObrazovneUstanove,
                o.NivoSS as NivoSS,
                o.Zvanje as Zvanje
            FROM Obrazovanje o
            LEFT JOIN ObrazovnaUstanova u ON o.ObrazovnaUstanovaID = u.ObrazovnaUstanovaID
            INNER JOIN KandidatOsnovno k ON o.KandidatID = k.KandidatID
            INNER JOIN ClanZadruge cz ON k.KandidatID = cz.ClanZadrugeID
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
        nivo, tip, smer, godinaZavrsetka,
        brojDiplome, ustanovaID, clanskiBroj
    } = req.body;

    try {
        const sql = `INSERT INTO Obrazovanje (
            ObrazovanjeID, Nivo, Tip, Smer, GodinaZavrsetka,
            BrojDiplome, UstanovaID, ClanskiBroj
        ) VALUES (
            (SELECT NVL(MAX(ObrazovanjeID), 0) + 1 FROM Obrazovanje),
            :nivo, :tip, :smer, :godina, :broj, :ustanova, :clan
        )
        RETURNING ObrazovanjeID INTO :id`;

        const result = await db.query(sql, [
            nivo, tip, smer, godinaZavrsetka, brojDiplome, ustanovaID, clanskiBroj,
            { dir: require('oracledb').BIND_OUT, type: require('oracledb').NUMBER }
        ], { autoCommit: true });

        const newId = result.outBinds.id;
        res.status(201).json({ message: 'Education created', id: newId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateEducation = async (req, res) => {
    const id = req.params.id;
    const {
        nivo, tip, smer, godinaZavrsetka,
        brojDiplome, ustanovaID
    } = req.body;

    try {
        await db.query(`UPDATE Obrazovanje SET
            Nivo = :nivo,
            Tip = :tip,
            Smer = :smer,
            GodinaZavrsetka = :godina,
            BrojDiplome = :broj,
            UstanovaID = :ustanova
        WHERE ObrazovanjeID = :id`, [
            nivo, tip, smer, godinaZavrsetka, brojDiplome, ustanovaID, id
        ], { autoCommit: true });

        res.json({ message: 'Education updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteEducation = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM Obrazovanje WHERE ObrazovanjeID = :id', [id], { autoCommit: true });
        res.json({ message: 'Education deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
