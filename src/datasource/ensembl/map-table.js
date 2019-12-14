
const ensembl_37 = require('../database').ensembl_37;
const ensembl_38 = require('../database').ensembl_38;
const mysql = require('mysql2/promise');
const readline = require('readline-sync');

// const fs = require('fs');
// const path = require('path');
// const logFile = path.join(__dirname, 'log.txt');
// const logger = fs.createWriteStream(logFile);
// logger.write('test\n');

class MapTable {
  chr;
  pool;
  constructor(reference, chr) {
    this.chr = chr;
    this.pool = reference === 'grch37' ? ensembl_37 : ensembl_38;
  }
  chosenGenes = async () => {
    const sql = mysql.format(
      `SELECT gene_id, start, end 
      FROM gene 
      WHERE chr = ? 
      ORDER BY start, end`,
      this.chr
    );
    console.log(sql);
    const [rows] = await this.pool.query(sql);
    return rows;
  };

  map(gene) {
    const mappedGenes = [];
    for (let i = gene.start; i <= gene.end; i++) {
      // position: i, gend_id: gene.gene_id
      mappedGenes.push([i, gene.gene_id]);
    }
    return mappedGenes;
  }

  createMappedTable = async () => {
    await this.pool.execute(`DROP TABLE IF EXISTS mapped_chr${this.chr};`);
    // table name = 'mapped_chr1'
    // id = 'mapped_chr1_id
    const sql = `CREATE TABLE mapped_chr${this.chr} (
      mapped_chr${this.chr}_id INT unsigned NOT NULL AUTO_INCREMENT,
      position INT(10) NULL,
      gene_id varchar(15) NULL,
      PRIMARY KEY (mapped_chr${this.chr}_id))`;

    console.log(sql);
    await this.pool.query(sql);
  };

  addData = async maps => {
    const sql = mysql.format(
      `INSERT INTO mapped_chr${this.chr} (position, gene_id) VALUES ?`,
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
  console.log(`####### Ensembl ${reference} ${Date()} ############\n`);
  // chr1 to Y
  for (const chr of chrs) {
    let index = 1;
    const mapTable = new MapTable(reference, chr);
    await mapTable.createMappedTable();
    const genes = await mapTable.chosenGenes();
    for (const gene of genes) {
      console.log(
        `chromosome: ${chr}, gene at ${index} from ${genes.length}`
      );
      const mapGenes = mapTable.map(gene);
      await mapTable.addData(mapGenes);
      index++;
    }
  }
  console.log('SUCCESS!!');
};

const mapOneChr = async (reference, chr) => {
  console.log(`####### Ensembl ${reference} ${Date()} ############`);
  let index = 1;
  const mapTable = new MapTable(reference, chr);
  await mapTable.createMappedTable();
  const genes = await mapTable.chosenGenes();
  for (const gene of genes) {
    console.log(`chromosome: ${chr}, gene at ${index} from ${genes.length}`);
    const mapGenes = mapTable.map(gene);
    await mapTable.addData(mapGenes);
    index++;
  }
  console.log('SUCCESS!!');
};

const main = async() => {
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

main();
