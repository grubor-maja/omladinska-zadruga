const db = require('./db/db');

async function checkBiografija() {
  try {
    console.log('BIOGRAFIJA columns:');
    const result = await db.query(`SELECT COLUMN_NAME FROM USER_TAB_COLUMNS WHERE TABLE_NAME = 'BIOGRAFIJA' ORDER BY COLUMN_ID`);
    result.rows.forEach(row => console.log('  ' + row[0]));
    
    console.log('\nZAHTEVZAPRISTUPANJE columns:');
    const result2 = await db.query(`SELECT COLUMN_NAME FROM USER_TAB_COLUMNS WHERE TABLE_NAME = 'ZAHTEVZAPRISTUPANJE' ORDER BY COLUMN_ID`);
    result2.rows.forEach(row => console.log('  ' + row[0]));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkBiografija();
