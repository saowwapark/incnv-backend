import * as mysql from 'mysql2/promise';
import { db } from './../config';

const inCnvConfig = {
  connectionLimit: 10,
  host: db.host,
  user: db.user,
  password: db.password,
  database: 'inCNV',
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

export const inCnvPool = mysql.createPool(inCnvConfig);
export const bioGrch37Pool = mysql.createPool(bioGrch37Config);
export const bioGrch38Pool = mysql.createPool(bioGrch38Config);
