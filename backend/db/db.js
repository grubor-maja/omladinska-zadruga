const oracledb = require('oracledb');

const config = {
    user: 'z6',
    password: 'S',
    connectString: 'localhost/XEPDB1'
};

async function query(sql, params = [], options = {}) {
    let connection;
    try {
        connection = await oracledb.getConnection(config);
        const result = await connection.execute(sql, params, options);
        return result;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function getConnection() {
    return await oracledb.getConnection(config);
}

module.exports = {
    query,
    BIND_OUT: oracledb.BIND_OUT,
    BIND_IN: oracledb.BIND_IN,
    NUMBER: oracledb.NUMBER,
    STRING: oracledb.STRING,
    getConnection
};

