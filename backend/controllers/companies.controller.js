const db = require('../db/db');
const oracledb = require('oracledb');

exports.getAllCompanies = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                PIB,
                NazivKompanije,
                k.KontaktPodaci.Mejl as Mejl,
                k.KontaktPodaci.MobilniTelefon as MobilniTelefon,
                k.KontaktPodaci.FiksniTelefon as FiksniTelefon,
                MaticniBroj,
                TekuciRacun,
                SifraDelatnosti,
                AdresaID
            FROM z6.Kompanija k
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getCompanyByPIB = async (req, res) => {
    const pib = req.params.pib;
    try {
        const result = await db.query('SELECT * FROM z6.Kompanija WHERE PIB = :pib', [pib]);
        res.json(result.rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createCompany = async (req, res) => {
    const {
        pib, naziv, mejl, mobilni, fiksni,
        maticniBroj, tekuciRacun, sifraDelatnosti, adresaID
    } = req.body;

    try {
        const sql = `INSERT INTO z6.Kompanija 
                     (PIB, NazivKompanije, KontaktPodaci, MaticniBroj, TekuciRacun, SifraDelatnosti, AdresaID)
                     VALUES (:pib, :naziv, z6.obj_kontakt(:mejl, :mobilni, :fiksni), :maticni, :racun, :sifra, :adresa)`;
        
        await db.query(sql, {
            pib,
            naziv,
            mejl,
            mobilni,
            fiksni,
            maticni: maticniBroj,
            racun: tekuciRacun,
            sifra: sifraDelatnosti,
            adresa: adresaID
        }, { autoCommit: true });

        res.status(201).json({ message: 'Kompanija je uspešno kreirana' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createCompanyWithContract = async (req, res) => {
  const {
    pib, naziv, mejl, mobilni, fiksni,
    maticniBroj, tekuciRacun, sifraDelatnosti, adresaID
  } = req.body;

  const zaposleniId = 1;

  let conn;
  try {
    conn = await db.getConnection();
    await conn.execute('SAVEPOINT beforeInsert');

    await conn.execute(
      `INSERT INTO z6.Kompanija 
       (PIB, NazivKompanije, KontaktPodaci, MaticniBroj, TekuciRacun, SifraDelatnosti, AdresaID)
       VALUES (:pib, :naziv, z6.obj_kontakt(:mejl, :mobilni, :fiksni), :maticni, :racun, :sifra, :adresa)`,
      { pib, naziv, mejl, mobilni, fiksni, maticni: maticniBroj, racun: tekuciRacun, sifra: sifraDelatnosti, adresa: adresaID }
    );

    await conn.execute(
      `INSERT INTO z6.GeneralniUgovor (UgovorPodaci, ZaposleniID, PIB)
       VALUES (z6.obj_ugovor(TRUNC(SYSDATE), ADD_MONTHS(TRUNC(SYSDATE), 12), 'Aktivan'), :zaposleniId, :pib)`,
      { zaposleniId, pib }
    );

    await conn.commit();
    return res.status(201).json({ message: 'Kompanija i ugovor uspešno kreirani' });
  } catch (err) {
    if (conn) await conn.rollback();

    if (String(err.message).includes('ORA-00001')) {
      return res.status(409).json({ error: 'PIB već postoji (duplikat primarnog ključa u Kompanija).' });
    }
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};

exports.updateCompany = async (req, res) => {
    const pib = req.params.pib;
    const {
        naziv, mejl, mobilni, fiksni, maticniBroj,
        tekuciRacun, sifraDelatnosti, adresaID
    } = req.body;

    try {
        const sql = `UPDATE z6.Kompanija
        SET NazivKompanije = :naziv,
            KontaktPodaci = z6.obj_kontakt(:mejl, :mobilni, :fiksni),
            MaticniBroj = :maticni,
            TekuciRacun = :racun,
            SifraDelatnosti = :sifra,
            AdresaID = :adresaID
        WHERE PIB = :pib`;

        await db.query(sql, [naziv, mejl, mobilni, fiksni, maticniBroj, tekuciRacun, sifraDelatnosti, adresaID, pib], { autoCommit: true });

        res.json({ message: 'Company updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteCompany = async (req, res) => {
    const pib = req.params.pib;
    try {
        await db.query('DELETE FROM z6.Kompanija WHERE PIB = :pib', [pib], { autoCommit: true });
        res.json({ message: 'Company deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
