const db = require('../db/db');
const oracledb = require('oracledb');

exports.getAllEmployees = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                ZaposleniID,
                Ime,
                Prezime,
                Pozicija,
                username,
                password
            FROM z6.Zaposleni
            ORDER BY Ime, Prezime
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getEmployeeById = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await db.query('SELECT * FROM z6.Zaposleni WHERE ZaposleniID = :id', [id]);
        res.json(result.rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createEmployee = async (req, res) => {
    const { ime, prezime, pozicija, username, password } = req.body;
    
    try {
        const sql = `INSERT INTO z6.Zaposleni (Ime, Prezime, Pozicija, username, password)
                     VALUES (:ime, :prezime, :pozicija, :username, :password)
                     RETURNING ZaposleniID INTO :zaposleniId`;
        
        const result = await db.query(sql, [
            ime, prezime, pozicija, username, password,
            { dir: oracledb.BIND_OUT, type: oracledb.NUMBER, name: 'zaposleniId' }
        ], { autoCommit: true });
        
        const zaposleniId = result.outBinds.zaposleniId;
        res.status(201).json({ message: 'Employee created', zaposleniId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateEmployee = async (req, res) => {
    const id = req.params.id;
    const { ime, prezime, pozicija, username, password } = req.body;
    
    try {
        const sql = `UPDATE z6.Zaposleni 
                     SET Ime = :ime, Prezime = :prezime, Pozicija = :pozicija,
                         username = :username, password = :password
                     WHERE ZaposleniID = :id`;
        
        await db.query(sql, [ime, prezime, pozicija, username, password, id], { autoCommit: true });
        res.json({ message: 'Employee updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteEmployee = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM z6.Zaposleni WHERE ZaposleniID = :id', [id], { autoCommit: true });
        res.json({ message: 'Employee deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
