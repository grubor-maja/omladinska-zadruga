const db = require('../db/db');

exports.getAllFees = async (req, res) => {
  try {
    const sql = `
      SELECT
        ClanarinaID,
        ClanZadrugeID,
        TO_CHAR(DatumUplate,'YYYY-MM-DD') AS DatumUplate,
        IznosClanarine AS Iznos
      FROM z6.Clanarina
      ORDER BY ClanarinaID
    `;
    const result = await db.query(sql);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFeeById = async (req, res) => {
  const id = req.params.id;
  try {
    const sql = `
      SELECT
        ClanarinaID,
        ClanZadrugeID,
        TO_CHAR(DatumUplate,'YYYY-MM-DD') AS DatumUplate,
        IznosClanarine AS Iznos
      FROM z6.Clanarina
      WHERE ClanarinaID = :id
    `;
    const result = await db.query(sql, [id]);
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFeesByMember = async (req, res) => {
  const ClanZadrugeID = req.params.memberId;
  console.log('Getting fees for member ID:', ClanZadrugeID);
  
  try {
    const sql = `
      SELECT
        ClanarinaID,
        ClanZadrugeID,
        TO_CHAR(DatumUplate,'YYYY-MM-DD') AS DatumUplate,
        IznosClanarine
      FROM z6.Clanarina
      WHERE ClanZadrugeID = :id
      ORDER BY DatumUplate DESC, ClanarinaID DESC
    `;
    const result = await db.query(sql, [ClanZadrugeID]);
    console.log('Found fees:', result.rows.length, 'rows');
    console.log('Raw fee data:', result.rows);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting fees by member:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.createFee = async (req, res) => {
  const { clanZadrugeID, datumUplate, iznos } = req.body;
  const amount = Number(iznos);

  if (!clanZadrugeID || !datumUplate || !Number.isFinite(amount)) {
    console.log('Validation failed:', {
      clanZadrugeID: !!clanZadrugeID,
      datumUplate: !!datumUplate,
      isFiniteAmount: Number.isFinite(amount)
    });
    return res.status(400).json({ error: 'clanZadrugeID, datumUplate i iznos su obavezni (iznos mora biti broj)' });
  }

  try {
    console.log('createFee: starting with data:', { clanZadrugeID, datumUplate, amount });

    const sql = `
      INSERT INTO z6.Clanarina (ClanZadrugeID, DatumUplate, IznosClanarine)
      VALUES (:clanZadrugeID, TO_DATE(:datumUplate,'YYYY-MM-DD'), :iznos)
    `;
    const params = { clanZadrugeID, datumUplate, iznos: amount };


    const result = await db.query(sql, params, { autoCommit: true });
    console.log('createFee: execute result', result);

    res.status(201).json({ message: 'Članarina je uspešno kreirana!' });
    console.log('createFee: success response sent');
  } catch (err) {
    console.error('createFee database error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateFee = async (req, res) => {
  const id = req.params.id;
  const { datumUplate, iznos } = req.body;

  const updates = [];
  const binds = [];

  if (datumUplate !== undefined) {
    updates.push(`DatumUplate = TO_DATE(:datumUplate,'YYYY-MM-DD')`);
    binds.push(datumUplate);
  }
  if (iznos !== undefined) {
    updates.push(`IznosClanarine = :iznos`);
    binds.push(Number(iznos));
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'Nema polja za ažuriranje' });
  }

  const sql = `
    UPDATE z6.Clanarina
       SET ${updates.join(', ')}
     WHERE ClanarinaID = :id
  `;
  binds.push(id);

  try {
    await db.query(sql, binds, { autoCommit: true });
    res.json({ message: 'Članarina je uspešno ažurirana!' });
  } catch (err) {
    console.error('Error updating fee:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteFee = async (req, res) => {
  const id = req.params.id;
  try {
    await db.query('DELETE FROM z6.Clanarina WHERE ClanarinaID = :id', [id], { autoCommit: true });
    res.json({ message: 'Članarina je obrisana' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
