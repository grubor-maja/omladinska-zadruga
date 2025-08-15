const db = require('./db/db');

async function checkTables() {
  try {
    const tables = ['RODITELJ', 'OBRAZOVANJE', 'LEGITIMACIJA', 'ZDRAVSTVENALEGITIMACIJA', 'ZNANJEJEZIKA', 'RADNOISKUSTVO'];
    
    for (let table of tables) {
      console.log('\n' + table + ' columns:');
      const result = await db.query(`SELECT COLUMN_NAME FROM USER_TAB_COLUMNS WHERE TABLE_NAME = '${table}' ORDER BY COLUMN_ID`);
      result.rows.forEach(row => console.log('  ' + row[0]));
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkTables();
