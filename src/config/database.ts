import mysqlPromise from 'mysql2/promise';
import mysql from 'mysql2';
import { dbEnv } from '../db-env';

const connectionConfig = {
  host: dbEnv.host,
  port: Number(dbEnv.port),
  user: dbEnv.user,
  password: dbEnv.password,
  connectTimeout: 60000
};

const inCnvConfig = {
  host: dbEnv.host,
  port: Number(dbEnv.port),
  user: dbEnv.user,
  password: dbEnv.password,
  database: 'inCNV',
  connectTimeout: 60000
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
  database: 'bio_grch37',
  connectTimeout: 60000
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
  database: 'bio_grch38',
  connectTimeout: 60000
  // // --- only mysql --
  // connectionLimit: 10,
  // supportBigNumbers: true,
  // bigNumberStrings: true
  // multipleStatements: true
};

// // in case use connection instread pool
// export let connectionPromise;
// const connectDb = () => {
//   connectionPromise = mysqlPromise
//     .createConnection(connectionConfig)
//     .catch(err => {
//       console.error(err);
//       connectDb();
//     });
// };
// connectDb();

export const bioGrch37Pool = mysqlPromise.createPool(bioGrch37Config);
export const bioGrch38Pool = mysqlPromise.createPool(bioGrch38Config);
export const inCnvPool = mysqlPromise.createPool(inCnvConfig);
export const dbPool = mysqlPromise.createPool(connectionConfig);
