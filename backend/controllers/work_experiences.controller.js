const db = require('../db/db');
const oracledb = require('oracledb');

exports.getAllExperiences = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM RadnoIskustvo');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getExperiencesByCandidate = async (req, res) => {
    const memberId = req.params.candidateId; 
    try {
        const result = await db.query(`
            SELECT 
                ri.RadnoIskustvoID,
                ri.Kompanija as NazivKompanije,
                ri.Pozicija,
                ri.DatumOd as DatumOd,
                ri.DatumDo as DatumDo,
                'Radno iskustvo' as Opis
            FROM RadnoIskustvo ri
            INNER JOIN Biografija b ON ri.BiografijaID = b.BiografijaID
            INNER JOIN ZahtevZaPristupanje z ON b.ClanskiBroj = z.ClanskiBroj
            INNER JOIN KandidatOsnovno k ON z.KandidatID = k.KandidatID
            INNER JOIN ClanZadruge cz ON k.KandidatID = cz.ClanZadrugeID
            WHERE cz.ClanZadrugeID = :memberId
            ORDER BY ri.DatumOd DESC
        `, [memberId]);
        
        res.json(result.rows);
    } catch (err) {
        console.error('Work experience by candidate error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.createExperience = async (req, res) => {
    const { firma, pozicija, od, do_, clanskiBroj } = req.body;

    try {
        const sql = `INSERT INTO RadnoIskustvo 
            (IskustvoID, Firma, Pozicija, OdDatum, DoDatum, ClanskiBroj)
            VALUES ((SELECT NVL(MAX(IskustvoID), 0) + 1 FROM RadnoIskustvo), :firma, :pozicija, :od, :do, :clan)`;

        await db.query(sql, [firma, pozicija, od, do_, clanskiBroj], { autoCommit: true });
        res.status(201).json({ message: 'Work experience created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateExperience = async (req, res) => {
    const id = req.params.id;
    const { firma, pozicija, od, do_ } = req.body;
    try {
        await db.query(
            `UPDATE RadnoIskustvo SET Firma = :firma, Pozicija = :pozicija, 
             OdDatum = :od, DoDatum = :do_
             WHERE IskustvoID = :id`,
            [firma, pozicija, od, do_, id],
            { autoCommit: true }
        );
        res.json({ message: 'Experience updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteExperience = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM RadnoIskustvo WHERE IskustvoID = :id', [id], { autoCommit: true });
        res.json({ message: 'Experience deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
