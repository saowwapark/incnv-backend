//import * as mysql from 'mysql2/promise';

const mysql = require('mysql2/promise');

const ensembl_37_config = {
  connectionLimit: 10,
  host: '127.0.0.1',
  user: 'root',
  password: 'glk;4k8',
  database: 'ensembl_grch37',
  supportBigNumbers: true,
  bigNumberStrings: true
};

const ensembl_38_config = {
  connectionLimit: 10,
  host: '127.0.0.1',
  user: 'root',
  password: 'glk;4k8',
  database: 'ensembl_grch38',
  supportBigNumbers: true,
  bigNumberStrings: true
};

const clinvar_37_config = {
  connectionLimit: 10,
  host: '127.0.0.1',
  user: 'root',
  password: 'glk;4k8',
  database: 'clinvar_grch37',
  supportBigNumbers: true,
  bigNumberStrings: true
};

const clinvar_38_config = {
  connectionLimit: 10,
  host: '127.0.0.1',
  user: 'root',
  password: 'glk;4k8',
  database: 'clinvar_grch38',
  supportBigNumbers: true,
  bigNumberStrings: true
};

const dgv_37_config = {
  connectionLimit: 10,
  host: '127.0.0.1',
  user: 'root',
  password: 'glk;4k8',
  database: 'dgv_grch37',
  supportBigNumbers: true,
  bigNumberStrings: true
};

const dgv_38_config = {
  connectionLimit: 10,
  host: '127.0.0.1',
  user: 'root',
  password: 'glk;4k8',
  database: 'dgv_grch38',
  supportBigNumbers: true,
  bigNumberStrings: true
};

exports.ensembl_37 = mysql.createPool(ensembl_37_config);
exports.ensembl_38 = mysql.createPool(ensembl_38_config);
exports.clinvar_37 = mysql.createPool(clinvar_37_config);
exports.clinvar_38 = mysql.createPool(clinvar_38_config);
exports.dgv_37 = mysql.createPool(dgv_37_config);
exports.dgv_38 = mysql.createPool(dgv_38_config);
