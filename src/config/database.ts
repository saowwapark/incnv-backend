import mysqlPromise from 'mysql2/promise';
import mysql from 'mysql2';
import { dbEnv } from '../db-env';

const connectionConfig = {
  host: dbEnv.host,
  port: Number(dbEnv.port),
  user: dbEnv.user,
  password: dbEnv.password
};

const inCnvConfig = {
  host: dbEnv.host,
  port: Number(dbEnv.port),
  user: dbEnv.user,
  password: dbEnv.password,
  database: 'inCNV'
  // // --- only mysql --
  // connectionLimit: 10,
  // supportBigNumbers: true,
  // bigNumberStrings: true
};

const bioGrch37Config = {
  host: dbEnv.host,
  port: Number(dbEnv.port),
  user: dbEnv.user,
  password: dbEnv.password,
  database: 'bio_grch37'
  // // --- only mysql --
  // connectionLimit: 10,
  // supportBigNumbers: true,
  // bigNumberStrings: true
  // multipleStatements: true
};

const bioGrch38Config = {
  host: dbEnv.host,
  port: Number(dbEnv.port),
  user: dbEnv.user,
  password: dbEnv.password,
  database: 'bio_grch38'
  // // --- only mysql --
  // connectionLimit: 10,
  // supportBigNumbers: true,
  // bigNumberStrings: true
  // multipleStatements: true
};

export const connectionPromise = mysqlPromise.createConnection(
  connectionConfig
);
export const connection = mysql.createConnection(connectionConfig);
export const bioGrch37Pool = mysqlPromise.createPool(bioGrch37Config);
export const bioGrch38Pool = mysqlPromise.createPool(bioGrch38Config);
export const inCnvPool = mysqlPromise.createPool(inCnvConfig);

// connection.connect(function(err) {
//   if (err) {
//     console.error('error connecting: ' + err.stack);
//     return;
//   }

//   console.log('connected as id ' + connection.threadId);
// });
