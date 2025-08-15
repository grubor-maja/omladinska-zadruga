const db = require('../db/db');
const oracledb = require('oracledb');

exports.getAllRequests = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                z.ZahtevID,
                z.Napomena,
                z.RadnoVreme,
                z.ProfilIZanimanje,
                z.DatumZahteva,
                z.PeriodObracuna,
                z.TipCeneRada,
                z.OpisCeneRada,
                z.NazivKompanije,
                z.PIB
            FROM z6.ZahtevZaRadnicima z
            ORDER BY z.DatumZahteva DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRequestById = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await db.query('SELECT * FROM z6.ZahtevZaRadnicima WHERE ZahtevID = :id', [id]);
        res.json(result.rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRequestDetails = async (req, res) => {
    const id = req.params.id;
    try {

        const requestResult = await db.query(`
            SELECT 
                z.ZahtevID,
                z.Napomena,
                z.RadnoVreme,
                z.ProfilIZanimanje,
                z.DatumZahteva,
                z.PeriodObracuna,
                z.TipCeneRada,
                z.OpisCeneRada,
                z.NazivKompanije,
                z.PIB,
                k.MaticniBroj,
                k.TekuciRacun,
                k.SifraDelatnosti,
                k.KontaktPodaci.Mejl as Email,
                k.KontaktPodaci.MobilniTelefon as MobilniTelefon,
                k.KontaktPodaci.FiksniTelefon as FiksniTelefon
            FROM z6.ZahtevZaRadnicima z
            LEFT JOIN z6.Kompanija k ON z.PIB = k.PIB
            WHERE z.ZahtevID = :id
        `, [id]);

        if (requestResult.rows.length === 0) {
            return res.status(404).json({ error: 'Zahtev nije pronađen' });
        }

        const structureResult = await db.query(`
            SELECT 
                StrukturaRadnikaID,
                BrojRadnika,
                Pol
            FROM z6.StrukturaRadnika 
            WHERE ZahtevID = :id
            ORDER BY Pol
        `, [id]);

        const requestData = requestResult.rows[0];
        const workerStructures = structureResult.rows.map(row => ({
            StrukturaRadnikaID: row[0],
            BrojRadnika: row[1],
            Pol: row[2]
        }));

        const response = {
            request: {
                ZahtevID: requestData[0],
                Napomena: requestData[1],
                RadnoVreme: requestData[2],
                ProfilIZanimanje: requestData[3],
                DatumZahteva: requestData[4],
                PeriodObracuna: requestData[5],
                TipCeneRada: requestData[6],
                OpisCeneRada: requestData[7],
                NazivKompanije: requestData[8],
                PIB: requestData[9]
            },
            company: {
                PIB: requestData[9],
                NazivKompanije: requestData[8],
                MaticniBroj: requestData[10],
                TekuciRacun: requestData[11],
                SifraDelatnosti: requestData[12],
                Email: requestData[13],
                MobilniTelefon: requestData[14],
                FiksniTelefon: requestData[15]
            },
            workerStructures: workerStructures
        };

        res.json(response);
    } catch (err) {
        console.error('Error getting request details:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.createRequest = async (req, res) => {
    const {
        napomena, radnoVreme, profilIZanimanje, datumZahteva,
        periodObracuna, tipCeneRada, opisCeneRada, pib
    } = req.body;

    try {

        const kompanijaResult = await db.query(
            'SELECT NazivKompanije FROM z6.Kompanija WHERE PIB = :pib',
            { pib }
        );

        const nazivKompanije = kompanijaResult.rows?.[0]?.[0];

        if (!nazivKompanije) {
            return res.status(400).json({ error: 'Invalid PIB – company not found.' });
        }

        const sql = `
            INSERT INTO z6.ZahtevZaRadnicima 
            (Napomena, RadnoVreme, ProfilIZanimanje, DatumZahteva, PeriodObracuna,
             TipCeneRada, OpisCeneRada, NazivKompanije, PIB)
            VALUES (
                :napomena, :radnoVreme, :profilIZanimanje,
                TO_DATE(:datumZahteva, 'YYYY-MM-DD'),
                :periodObracuna, :tipCeneRada, :opisCeneRada,
                :nazivKompanije, :pib
            )
            RETURNING ZahtevID INTO :zahtevId
        `;

        const result = await db.query(
            sql,
            {
                napomena,
                radnoVreme,
                profilIZanimanje,
                datumZahteva,
                periodObracuna,
                tipCeneRada,
                opisCeneRada,
                nazivKompanije,
                pib,
                zahtevId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            },
            { autoCommit: true }
        );

        const zahtevId = result.outBinds.zahtevId[0];

        res.status(201).json({ message: 'Request created', zahtevId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateRequest = async (req, res) => {
  const id = req.params.id;
  const {
    napomena, radnoVreme, profilIZanimanje, datumZahteva,
    periodObracuna, tipCeneRada, opisCeneRada, pib
  } = req.body;

  try {
    const sql = `
      UPDATE z6.ZahtevZaRadnicima
      SET Napomena        = :napomena,
          RadnoVreme      = :radnoVreme,
          ProfilIZanimanje= :profil,
          DatumZahteva    = TO_DATE(:datumZahteva, 'YYYY-MM-DD'),
          PeriodObracuna  = :period,
          TipCeneRada     = :tip,
          OpisCeneRada    = :opis,
          PIB             = :pib          -- ⬅️ naziv kompanije NE diramo; trigger ga ažurira
      WHERE ZahtevID = :id
    `;

    await db.query(
      sql,
      {
        napomena,
        radnoVreme,
        profil: profilIZanimanje,
        datumZahteva,
        period: periodObracuna,
        tip: tipCeneRada,
        opis: opisCeneRada,
        pib,
        id
      },
      { autoCommit: true }
    );

    res.json({ message: 'Request updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRequest = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM z6.ZahtevZaRadnicima WHERE ZahtevID = :id', [id], { autoCommit: true });
        res.json({ message: 'Request deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
