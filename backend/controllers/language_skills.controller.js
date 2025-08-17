const db = require('../db/db');
const oracledb = require('oracledb'); 

exports.getAllSkills = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM ZnanjeJezika');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSkillById = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await db.query('SELECT * FROM ZnanjeJezika WHERE ZnanjeJezikaID = :id', [id]);
        res.json(result.rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSkillsByCandidate = async (req, res) => {
    const memberId = req.params.candidateId; 
    try {
        const result = await db.query(`
            SELECT 
                zj.ZnanjeJezikaID,
                zj.StraniJezikID,
                sj.NazivJezika as NazivJezika,
                zj.NivoZnanja,
                zj.NivoZnanja as NivoZnanja
            FROM ZnanjeJezika zj
            LEFT JOIN StraniJezik sj ON zj.StraniJezikID = sj.StraniJezikID
            INNER JOIN Biografija b ON zj.BiografijaID = b.BiografijaID
            INNER JOIN ZahtevZaPristupanje z ON b.ClanskiBroj = z.ClanskiBroj
            INNER JOIN KandidatOsnovno k ON z.KandidatID = k.KandidatID
            INNER JOIN ClanZadruge cz ON k.KandidatID = cz.ClanZadrugeID
            WHERE cz.ClanZadrugeID = :memberId
            ORDER BY sj.NazivJezika
        `, [memberId]);
        
        res.json(result.rows);
    } catch (err) {
        console.error('Language skills by candidate error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.createSkill = async (req, res) => {
    const {
        biografijaID, straniJezikID, nivoZnanja
    } = req.body;

    try {
        const sql = `
            INSERT INTO ZnanjeJezika (
                BiografijaID, StraniJezikID, NivoZnanja
            ) VALUES (
                :biografija, :jezik, :nivo
            )
        `;

        await db.query(
            sql,
            [biografijaID, straniJezikID, nivoZnanja],
            { autoCommit: true }
        );

        res.status(201).json({ message: 'Language skill added successfully' });
    } catch (err) {
        console.error('Error creating language skill:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateSkill = async (req, res) => {
    const id = req.params.id;
    const { nivoZnanja } = req.body;

    try {
        await db.query(`
            UPDATE ZnanjeJezika 
            SET NivoZnanja = :nivo
            WHERE ZnanjeJezikaID = :id
        `, [nivoZnanja, id], { autoCommit: true });

        res.json({ message: 'Language skill updated successfully' });
    } catch (err) {
        console.error('Error updating language skill:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteSkill = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM ZnanjeJezika WHERE ZnanjeJezikaID = :id', [id], { autoCommit: true });
        res.json({ message: 'Language skill deleted successfully' });
    } catch (err) {
        console.error('Error deleting language skill:', err);
        res.status(500).json({ error: err.message });
    }
};
