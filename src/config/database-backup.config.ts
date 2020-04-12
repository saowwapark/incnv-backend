import mysqlPromise from 'mysql2/promise';
import mysql from 'mysql2';
import { dbEnv } from '../db-env';

const connectionConfig = {
  host: 'ec2-52-74-3-82.ap-southeast-1.compute.amazonaws.com',
  port: 7004,
  user: 'root',
  password: 'glk;4k8',
  connectTimeout: 100000,
  // acquireTimeout: 100000,
  connectionLimit: 30,
  queueLimit: 10000
};

const inCnvConfig = {
  host: 'ec2-52-74-3-82.ap-southeast-1.compute.amazonaws.com',
  port: 7004,
  user: 'root',
  password: 'glk;4k8',
  database: 'inCNV',
  connectTimeout: 100000,
  // acquireTimeout: 100000,
  connectionLimit: 20,
  queueLimit: 10000
};

const bioGrch37Config = {
  host: 'ec2-52-74-3-82.ap-southeast-1.compute.amazonaws.com',
  port: 7004,
  user: 'root',
  password: 'glk;4k8',
  database: 'bio_grch37',
  connectTimeout: 100000,
  //acquireTimeout: 100000,
  connectionLimit: 70,
  queueLimit: 10000
};

const bioGrch38Config = {
  host: 'ec2-52-74-3-82.ap-southeast-1.compute.amazonaws.com',
  port: 7004,
  user: 'root',
  password: 'glk;4k8',
  database: 'bio_grch38',
  connectTimeout: 100000,
  //acquireTimeout: 100000,
  connectionLimit: 70,
  queueLimit: 10000
};

export const bioGrch37Pool = mysqlPromise.createPool(bioGrch37Config);
export const bioGrch38Pool = mysqlPromise.createPool(bioGrch38Config);
export const inCnvPool = mysqlPromise.createPool(inCnvConfig);
export const dbPool = mysqlPromise.createPool(connectionConfig);
