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

const ensembl_37_config = {
  connectionLimit: 10,
  host: db.host,
  user: db.user,
  password: db.password,
  database: 'ensembl_grch37',
  supportBigNumbers: true,
  bigNumberStrings: true
};

const ensembl_38_config = {
  connectionLimit: 10,
  host: db.host,
  user: db.user,
  password: db.password,
  database: 'ensembl_grch38',
  supportBigNumbers: true,
  bigNumberStrings: true
};

const clinvar_37_config = {
  connectionLimit: 10,
  host: db.host,
  user: db.user,
  password: db.password,
  database: 'clinvar_grch37',
  supportBigNumbers: true,
  bigNumberStrings: true
};

const clinvar_38_config = {
  connectionLimit: 10,
  host: db.host,
  user: db.user,
  password: db.password,
  database: 'clinvar_grch38',
  supportBigNumbers: true,
  bigNumberStrings: true
};

const dgv_37_config = {
  connectionLimit: 10,
  host: db.host,
  user: db.user,
  password: db.password,
  database: 'dgv_grch37',
  supportBigNumbers: true,
  bigNumberStrings: true
};

const dgv_38_config = {
  connectionLimit: 10,
  host: db.host,
  user: db.user,
  password: db.password,
  database: 'dgv_grch38',
  supportBigNumbers: true,
  bigNumberStrings: true
};

export const inCnvPool = mysql.createPool(inCnvConfig);
export const ensembl_37 = mysql.createPool(ensembl_37_config);
export const ensembl_38 = mysql.createPool(ensembl_38_config);
export const clinvar_37 = mysql.createPool(clinvar_37_config);
export const clinvar_38 = mysql.createPool(clinvar_38_config);
export const dgv_37 = mysql.createPool(dgv_37_config);
export const dgv_38 = mysql.createPool(dgv_38_config);
