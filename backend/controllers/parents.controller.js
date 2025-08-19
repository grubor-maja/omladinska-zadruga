const db = require('../db/db');

exports.getAllParents = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Roditelj');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getParentsByCandidate = async (req, res) => {
    const memberId = req.params.candidateId; 
    try {
        const result = await db.query(`
            SELECT 
                r.RoditeljID,
                r.Ime as ImeRoditelja,
                r.Prezime as PrezimeRoditelja,
                r.JMBG as JMBGRoditelja,
                r.Kontakt as AdresaRoditelja,
                r.Kontakt as Telefon
            FROM Roditelj r
            INNER JOIN SaglasnostRoditelja sr ON r.RoditeljID = sr.RoditeljID
            INNER JOIN ZahtevZaPristupanje z ON sr.ClanskiBroj = z.ClanskiBroj
            INNER JOIN KandidatOsnovno k ON z.KandidatID = k.KandidatID
            INNER JOIN ClanZadruge cz ON k.KandidatID = cz.ClanZadrugeID
            WHERE cz.ClanZadrugeID = :memberId
            ORDER BY r.RoditeljID
        `, [memberId]);
        
        res.json(result.rows);
    } catch (err) {
        console.error('Parents by candidate error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.createParent = async (req, res) => {
    const { roditeljID, ime, prezime, telefon, clanskiBroj } = req.body;
    try {
        await db.query(
            `INSERT INTO Roditelj (RoditeljID, Ime, Prezime, Telefon, ClanskiBroj)
             VALUES (:id, :ime, :prezime, :telefon, :clan)`,
            [roditeljID, ime, prezime, telefon, clanskiBroj],
            { autoCommit: true }
        );
        res.status(201).json({ message: 'Parent added' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateParent = async (req, res) => {
    const id = req.params.id;
    const { ime, prezime, telefon } = req.body;
    try {
        await db.query(
            `UPDATE Roditelj SET Ime = :ime, Prezime = :prezime, Telefon = :telefon
             WHERE RoditeljID = :id`,
            [ime, prezime, telefon, id],
            { autoCommit: true }
        );
        res.json({ message: 'Parent updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteParent = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM Roditelj WHERE RoditeljID = :id', [id], { autoCommit: true });
        res.json({ message: 'Parent deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
