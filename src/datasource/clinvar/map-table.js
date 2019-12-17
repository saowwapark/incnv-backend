const clinvar_37 = require('../database').clinvar_37;
const clinvar_38 = require('../database').clinvar_38;
const mysql = require('mysql2/promise');
const readline = require('readline-sync');

class MapTable {
  chr;
  pool;
  constructor(reference, chr) {
    this.chr = chr;
    this.pool = reference === 'grch37' ? clinvar_37 : clinvar_38;
  }
  chosenClinvars = async () => {
    const sql = mysql.format(
      `SELECT clinvar_id, start, end 
      FROM clinvar 
      WHERE chr = ? 
      ORDER BY start, end`,
      this.chr
    );
    console.log(sql);
    const [rows] = await this.pool.query(sql);
    return rows;
  };

  map(clinvar) {
    const mappedClinvars = [];
    for (let i = clinvar.start; i <= clinvar.end; i++) {
      // position: i, clinvar_id: clinvar.clinvar_id
      mappedClinvars.push([i, clinvar.clinvar_id]);
    }
    return mappedClinvars;
  }

  createMappedTable = async () => {
    await this.pool.execute(`DROP TABLE IF EXISTS mapped_chr${this.chr};`);
    // table name = 'mapped_chr1'
    // id = 'mapped_chr1_id
    const sql = `CREATE TABLE mapped_chr${this.chr} (
      mapped_chr${this.chr}_id INT unsigned NOT NULL AUTO_INCREMENT,
      position INT(10) NULL,
      clinvar_id INT(3) unsigned NOT NULL,
      PRIMARY KEY (mapped_chr${this.chr}_id))`;

    console.log(sql);
    await this.pool.query(sql);
  };

  addData = async maps => {
    const sql = mysql.format(
      `INSERT INTO mapped_chr${this.chr} (position, clinvar_id) VALUES ?`,
      [maps]
    );
    const [resultSetHeader] = await this.pool.query(sql);
  };
}

const mapAllChrs = async () => {
  const reference = 'grch37';
  const chrs = [];
  for (let i = 1; i < 23; i++) {
    chrs.push(i.toString());
  }
  chrs.push('X');
  chrs.push('Y');
  console.log(`####### Clinvar ${reference} ${Date()} ############`);
  // chr1 to Y
  for (const chr of chrs) {
    let index = 1;
    const mapTable = new MapTable(reference, chr);
    await mapTable.createMappedTable();
    const clinvars = await mapTable.chosenClinvars();
    for (const clinvar of clinvars) {
      console.log(
        `chromosome: ${chr}, clinvar at ${index} from ${clinvars.length}`
      );
      const mapClinvars = mapTable.map(clinvar);
      await mapTable.addData(mapClinvars);
      index++;
    }
  }
  console.log('SUCCESS!!');
};

const mapOneChr = async (reference, chr) => {
  console.log(`####### Clinvar ${reference} ${Date()} ############`);
  let index = 1;
  const mapTable = new MapTable(reference, chr);
  await mapTable.createMappedTable();
  const clinvars = await mapTable.chosenClinvars();
  for (const clinvar of clinvars) {
    console.log(
      `chromosome: ${chr}, clinvar at ${index} from ${clinvars.length}`
    );
    const mapClinvars = mapTable.map(clinvar);
    await mapTable.addData(mapClinvars);
    index++;
  }
  console.log('SUCCESS!!');
};


const main = async () => {
  printMemoryUsage();
  console.log(`Please specify parameters`);
  const refNumber = readline.question(
    `Please choose the reference. 
      '1' for GRCh37
      '2' for GRCh38\n`);

  const chr = readline.question(
    `Please choose chromosome.
      '1' for chromosome 1
      'x' for chromosome X
      'y' for chromosome Y
      'all' for all choromosomes\n`
  )
  if (refNumber !== '1' && refNumber !== '2') throw ('Reference Error, Please use 1 or 2.')

  let reference;
  if (refNumber === '1') reference = 'grch37';
  if (refNumber === '2') reference = 'grch38';

  const allChrs = [];
    for (let i = 1; i < 23; i++) {
      allChrs.push(i.toString());
    }
    allChrs.push('x');
    allChrs.push('y');
    allChrs.push('all');

  if (!allChrs.includes(chr)) throw ('Chromosome Error, Please use 1, 2, 3 ... x, y, or all.')

 
    if(chr === 'all') {
      await mapAllChrs(reference);
    } else {
      await mapOneChr(reference, chr);
    }

  
}

const printMemoryUsage = () => {
   const used = process.memoryUsage();
      for (let key in used) {
        console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
      }
}
main();