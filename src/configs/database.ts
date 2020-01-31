import * as mysql from 'mysql2/promise';
import { db } from './../config';

const inCnvConfig = {
  connectionLimit: 10,
  host: db.host,
  user: db.user,
  password: db.password,
  database: 'inCnv',
  supportBigNumbers: true,
  bigNumberStrings: true
};

const bioGrch37Config = {
  connectionLimit: 10,
  host: db.host,
  user: db.user,
  password: db.password,
  database: 'bio_grch37',
  supportBigNumbers: true,
  bigNumberStrings: true
};

const bioGrch38Config = {
  connectionLimit: 10,
  host: db.host,
  user: db.user,
  password: db.password,
  database: 'bio_grch38',
  supportBigNumbers: true,
  bigNumberStrings: true
};

// export const inCnvPool = mysql.createPool(inCnvConfig);
export const bioGrch37Pool = mysql.createPool(bioGrch37Config);
export const bioGrch38Pool = mysql.createPool(bioGrch38Config);
export const inCnvPool = mysql.createPool(inCnvConfig);

// const testConfig = {
//   connectionLimit: 10,
//   host: '127.0.0.1',
//   user: 'root',
//   password: 'glk;4k8',
//   database: 'test',
//   supportBigNumbers: true,
//   bigNumberStrings: true
// };

// async function createDb(dbConfig) {
//   try {
//     console.log(`check db connection for ${dbConfig.database}`);
//     await mysql.createConnection(dbConfig);
//     console.log('connect!');
//   } catch (err) {
//     const database = dbConfig.database;
//     testConfig.database = '';
//     const connection = await mysql.createConnection(dbConfig);
//     const sql = `CREATE DATABASE IF NOT EXISTS ${database}`;
//     console.log(sql);
//     await connection.execute(sql);
//     await connection.end();
//   }
// }

// createDb(testConfig);
