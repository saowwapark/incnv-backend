const mysql = require('mysql2');

const dbConfig = {
  connectionLimit: 10,
  host: '127.0.0.1',
  user: 'root',
  password: 'glk;4k8',
  database: 'inCNV',
  supportBigNumbers: true,
  bigNumberStrings: true
};

const pool = mysql.createPool(dbConfig);

module.exports = pool.promise();
