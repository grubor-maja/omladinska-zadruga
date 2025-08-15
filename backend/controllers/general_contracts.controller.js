const db = require('../db/db');

exports.getAllContracts = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                g.BrojUgovora,
                g.UgovorPodaci.DatumPotpisivanja as DatumPotpisivanja,
                g.UgovorPodaci.DatumVazenja as DatumVazenja,
                g.UgovorPodaci.StatusUgovora as StatusUgovora,
                z.Ime || ' ' || z.Prezime as ZaposleniImePrezime,
                z.Pozicija,
                k.NazivKompanije,
                k.PIB
            FROM z6.GeneralniUgovor g
            JOIN z6.Zaposleni z ON g.ZaposleniID = z.ZaposleniID
            JOIN z6.Kompanija k ON g.PIB = k.PIB
            ORDER BY g.BrojUgovora DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getContractById = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await db.query(`
            SELECT 
                g.BrojUgovora,
                g.UgovorPodaci.DatumPotpisivanja as DatumPotpisivanja,
                g.UgovorPodaci.DatumVazenja as DatumVazenja,
                g.UgovorPodaci.StatusUgovora as StatusUgovora,
                g.ZaposleniID,
                g.PIB,
                z.Ime || ' ' || z.Prezime as ZaposleniImePrezime,
                z.Pozicija,
                k.NazivKompanije
            FROM z6.GeneralniUgovor g
            JOIN z6.Zaposleni z ON g.ZaposleniID = z.ZaposleniID
            JOIN z6.Kompanija k ON g.PIB = k.PIB
            WHERE g.BrojUgovora = :id
        `, [id]);
        res.json(result.rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createContract = async (req, res) => {
    const { pib } = req.body;
    
    try {

        const datumPotpisivanja = new Date().toISOString().split('T')[0];
        const datumVazenja = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
        const statusUgovora = 'Aktivan';
        const zaposleniId = 1; // Uvek Marko Markovic
        
        const sql = `INSERT INTO z6.GeneralniUgovor (UgovorPodaci, ZaposleniID, PIB)
                     VALUES (z6.obj_ugovor(TO_DATE(:datumPotpisivanja, 'YYYY-MM-DD'), 
                                           TO_DATE(:datumVazenja, 'YYYY-MM-DD'), 
                                           :statusUgovora), :zaposleniId, :pib)
                     RETURNING BrojUgovora INTO :brojUgovora`;
        
        const result = await db.query(sql, [
            datumPotpisivanja, datumVazenja, statusUgovora, zaposleniId, pib,
            { dir: db.BIND_OUT, type: db.NUMBER }
        ], { autoCommit: true });
        
        const brojUgovora = result.outBinds[0];
        res.status(201).json({ message: 'General contract created', brojUgovora: brojUgovora });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateContract = async (req, res) => {
  const id = req.params.id;
  let { datumPotpisivanja, datumVazenja, statusUgovora, zaposleniId, pib } = req.body;

  zaposleniId = Number(zaposleniId) || 1;

  datumVazenja = datumVazenja && datumVazenja.trim() !== '' ? datumVazenja : null;

  try {
    const sql = `
      UPDATE z6.GeneralniUgovor 
      SET UgovorPodaci = z6.obj_ugovor(
            TO_DATE(:dp, 'YYYY-MM-DD'),
            CASE WHEN :dv IS NULL THEN NULL ELSE TO_DATE(:dv, 'YYYY-MM-DD') END,
            :su
          ),
          ZaposleniID = :zid,
          PIB = :pib
      WHERE BrojUgovora = :id
    `;

    await db.query(
      sql,
      { dp: datumPotpisivanja, dv: datumVazenja, su: statusUgovora, zid: zaposleniId, pib, id },
      { autoCommit: true }
    );

    res.json({ message: 'Contract updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteContract = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM z6.GeneralniUgovor WHERE BrojUgovora = :id', [id], { autoCommit: true });
        res.json({ message: 'Contract deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
