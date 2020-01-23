//import * as mysql from 'mysql2/promise';

const mysql = require('mysql2/promise');


const bioGrch37Config = {
  connectionLimit: 10,
  host: '127.0.0.1',
  user: 'root',
  password: 'glk;4k8',
  database: 'bio_grch37',
  supportBigNumbers: true,
  bigNumberStrings: true
};

const bioGrch38Config = {
  connectionLimit: 10,
  host: '127.0.0.1',
  user: 'root',
  password: 'glk;4k8',
  database: 'bio_grch38',
  supportBigNumbers: true,
  bigNumberStrings: true
};

const bioConfig = {
  connectionLimit: 10,
  host: '127.0.0.1',
  user: 'root',
  password: 'glk;4k8',
  database: 'bio',
  supportBigNumbers: true,
  bigNumberStrings: true
}

exports.bio_grch37 = mysql.createPool(bioGrch37Config);
exports.bio_grch38 = mysql.createPool(bioGrch38Config);
exports.bio = mysql.createPool(bioConfig);
