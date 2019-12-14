const fs = require('fs');
const ensembl_37 = require('../database').ensembl_37;
const ensembl_38 = require('../database').ensembl_38;
const mysql = require('mysql2/promise');
const path = require('path');
const readline = require('readline-sync');

class MapDataSource {
  pool;
  fileName;

  constructor(reference) {
    if (reference === 'grch37') {
      this.pool = ensembl_37;
      this.fileName = 'Homo_sapiens.GRCh37.87.chr.gff3';
    } else {
      this.pool = ensembl_38;
      this.fileName = 'Homo_sapiens.GRCh38.98.chr.gff3';
    }
  }
  createGeneTable = async () => {
    await this.pool.execute(`DROP TABLE IF EXISTS gene`);
    const sql = `CREATE TABLE gene (
      gene_id VARCHAR(15) NOT NULL,
      gene_type VARCHAR(45) NULL,
      chr VARCHAR(10) NULL,
      start INT(10) NULL,
      end INT(10) NULL,
      PRIMARY KEY (gene_id)) ENGINE=InnoDB DEFAULT CHARSET=latin1;`;

    console.log(sql);
    await this.pool.query(sql);
  };

  addGene = async mapped => {
    const sql = mysql.format(
      `INSERT INTO gene (gene_id, gene_type, chr, start, end) VALUES ?`,
      [mapped]
    );

    console.log(sql);
    const [resultSetHeader] = await this.pool.query(sql);
    console.log(resultSetHeader);
  };

  mapDataSource = () => {
    // read file
    const file = path.join(
      __dirname,
      'source',
      this.fileName
    );
    const context = fs.readFileSync(file, 'utf8');
    const lines = context.split('\n');

    const datalist = [];
    for (const line of lines) {
      // line space
      if (!line || line === '') continue;

      //ignore a commented line
      if (line.charAt(0) === '#') continue;

      const columns = line.split('\t');

      const chr = columns[0];
      const type = columns[2];
      const start = columns[3];
      const end = columns[4];
      const attributes = columns[8].split(';');

      //ignore a biological_region line
      if (type === 'biological_region') continue;

      //ID=gene:ENSG00000279516
      const firstAttr = attributes[0];
      if (firstAttr.slice(0, 7) === 'ID=gene') {
        const geneId = firstAttr.slice(8);
        datalist.push([geneId, type, chr, +start, +end]);
      }
    }
    return datalist;
  };

  async main() {
    console.log(`file name: ${this.fileName}`);
    const dataSource = this.mapDataSource();
    await this.createGeneTable();
    await this.addGene(dataSource);
    console.log('SUCCESS');
  }
}

const refNumber = readline.question(
  `Please choose the reference. 
    '1' for GRCh37
    '2' for GRCh38\n`);
if (refNumber === '1') {
  const mapDataSource = new MapDataSource('grch37');
  mapDataSource.main();
}
if (refNumber === '2') {
  const mapDataSource = new MapDataSource('grch38');
  mapDataSource.main();
}