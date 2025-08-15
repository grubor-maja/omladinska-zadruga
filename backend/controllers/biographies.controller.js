const db = require('../db/db');

exports.getAllBiographies = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Biografija');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getBiographyById = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await db.query('SELECT * FROM Biografija WHERE BiografijaID = :id', [id]);
        res.json(result.rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getBiographyByCandidate = async (req, res) => {
    const memberId = req.params.candidateId; // Ovo je zapravo član ID
    try {
        const result = await db.query(`
            SELECT 
                b.BiografijaID,
                b.VozackaDozvola,
                b.ITVestine,
                b.ProfilIZanimanje as ProfilZanimanje,
                b.Mejl,
                b.NeformalnoObrazovanje,
                b.DatumUpisa,
                b.RadniStatus as StatusZaposlenja,
                CASE 
                    WHEN b.RadniStatus = 'zaposleni' THEN 'Preuzimanje kratkih zadataka'
                    WHEN b.RadniStatus = 'nezaposleni' THEN 'Dostupan za sve vrste poslova'
                    ELSE 'Ograničeno dostupan'
                END as SklonostKaPoslovima
            FROM Biografija b
            INNER JOIN ZahtevZaPristupanje z ON b.ClanskiBroj = z.ClanskiBroj
            INNER JOIN KandidatOsnovno k ON z.KandidatID = k.KandidatID
            INNER JOIN ClanZadruge cz ON k.KandidatID = cz.ClanZadrugeID
            WHERE cz.ClanZadrugeID = :memberId
        `, [memberId]);
        
        res.json(result.rows);
    } catch (err) {
        console.error('Biography by candidate error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.createBiography = async (req, res) => {
    const {
        vozackaDozvola, itVestine, profilIZanimanje, mejl,
        neformalnoObrazovanje, datumUpisa, radniStatus, clanskiBroj
    } = req.body;

    try {
        const sql = `INSERT INTO Biografija 
        (VozackaDozvola, ITVestine, ProfilIZanimanje, Mejl,
         NeformalnoObrazovanje, DatumUpisa, RadniStatus, ClanskiBroj)
        VALUES (:vozacka, :it, :profil, :mejl, :neformalno, TO_DATE(:datum, 'YYYY-MM-DD'), :status, :clan)`;

        await db.query(sql, [
            vozackaDozvola, itVestine, profilIZanimanje, mejl,
            neformalnoObrazovanje, datumUpisa, radniStatus, clanskiBroj
        ], { autoCommit: true });

        res.status(201).json({ message: 'Biography created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateBiography = async (req, res) => {
    const id = req.params.id;
    const {
        vozackaDozvola, itVestine, profilIZanimanje, mejl,
        neformalnoObrazovanje, datumUpisa, radniStatus
    } = req.body;

    try {
        const sql = `UPDATE Biografija SET
            VozackaDozvola = :vozacka,
            ITVestine = :it,
            ProfilIZanimanje = :profil,
            Mejl = :mejl,
            NeformalnoObrazovanje = :neformalno,
            DatumUpisa = TO_DATE(:datum, 'YYYY-MM-DD'),
            RadniStatus = :status
        WHERE BiografijaID = :id`;

        await db.query(sql, [
            vozackaDozvola, itVestine, profilIZanimanje, mejl,
            neformalnoObrazovanje, datumUpisa, radniStatus, id
        ], { autoCommit: true });

        res.json({ message: 'Biography updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteBiography = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM Biografija WHERE BiografijaID = :id', [id], { autoCommit: true });
        res.json({ message: 'Biography deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
