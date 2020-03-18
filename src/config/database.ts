import mysqlPromise from 'mysql2/promise';
import mysql from 'mysql2';
import { dbEnv } from '../db-env';

const connectionConfig = {
  host: dbEnv.host,
  port: Number(dbEnv.port),
  user: dbEnv.user,
  password: dbEnv.password,
  connectTimeout: 100000,
  // acquireTimeout: 100000,
  connectionLimit: 30,
  queueLimit: 10000
};

const inCnvConfig = {
  host: dbEnv.host,
  port: Number(dbEnv.port),
  user: dbEnv.user,
  password: dbEnv.password,
  database: 'inCNV',
  connectTimeout: 100000,
  // acquireTimeout: 100000,
  connectionLimit: 30,
  queueLimit: 10000
};

const bioGrch37Config = {
  host: dbEnv.host,
  port: Number(dbEnv.port),
  user: dbEnv.user,
  password: dbEnv.password,
  database: 'bio_grch37',
  connectTimeout: 100000,
  // acquireTimeout: 100000,
  connectionLimit: 80,
  queueLimit: 10000
};

const bioGrch38Config = {
  host: dbEnv.host,
  port: Number(dbEnv.port),
  user: dbEnv.user,
  password: dbEnv.password,
  database: 'bio_grch38',
  connectTimeout: 100000,
  // acquireTimeout: 100000,
  connectionLimit: 80,
  queueLimit: 10000
};

export const bioGrch37Pool = mysqlPromise.createPool(bioGrch37Config);
export const bioGrch38Pool = mysqlPromise.createPool(bioGrch38Config);
export const inCnvPool = mysqlPromise.createPool(inCnvConfig);
export const dbPool = mysqlPromise.createPool(connectionConfig);
