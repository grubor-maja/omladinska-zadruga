const db = require('./db/db');

async function addColumnsToKandidat() {
  try {
    console.log('Dodajem kolone u KandidatOsnovno tabelu...');

    await db.query(`ALTER TABLE KandidatOsnovno ADD BrojLicneKarte VARCHAR2(9)`);
    console.log('✓ Dodana BrojLicneKarte kolona');

    await db.query(`ALTER TABLE KandidatOsnovno ADD LBO CHAR(11)`);
    console.log('✓ Dodana LBO kolona');
    
    console.log('Sve kolone su uspešno dodate!');
    process.exit(0);
  } catch (err) {
    console.error('Greška:', err.message);
    process.exit(1);
  }
}

addColumnsToKandidat();
