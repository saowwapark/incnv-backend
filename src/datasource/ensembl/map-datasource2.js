const fs = require('fs');
const bio_grch37 = require('../database').bio_grch37;
const bio_grch38 = require('../database').bio_grch38;
const mysql = require('mysql2/promise');
const path = require('path');
const readline = require('readline-sync');

class MapDataSource {
  pool;
  fileName;

  constructor(reference) {
    if (reference === 'grch37') {
      this.pool = bio_grch37;
      this.fileName = 'Homo_sapiens.GRCh37.87.chr.gff3';
    } else {
      this.pool = bio_grch38;
      this.fileName = 'Homo_sapiens.GRCh38.98.chr.gff3';
    }
  }
  createGeneTable = async () => {
    await this.pool.execute(`DROP TABLE IF EXISTS gene`);
    const sql = `CREATE TABLE gene (
      gene_id VARCHAR(15) NOT NULL,
      gene_type VARCHAR(45) NULL,
      gene_symbol VARCHAR(45),
      chromosome VARCHAR(10) NULL,
      start_bp INT(10) NULL,
      end_bp INT(10) NULL,
      PRIMARY KEY (gene_id)) ENGINE=InnoDB DEFAULT CHARSET=latin1;`;

    console.log(sql);
    await this.pool.query(sql);
  };

  addGene = async mapped => {
    console.log(mapped[0]);
    const sql = mysql.format(
      `INSERT INTO gene (gene_id, gene_type, gene_symbol, chromosome, start_bp, end_bp) VALUES ?`,
      [mapped]
    );

    console.log(sql);
    const [resultSetHeader] = await this.pool.query(sql);
    console.log(resultSetHeader);
  };

  mapDataSource = () => {
   
    const geneSymbolDataList = this.mapGeneSymbolDataSource();

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

        for (const geneSymbolData of geneSymbolDataList) {
          if(geneSymbolData[0] === geneId) {
            datalist.push([geneId, type, geneSymbolData[1], chr, +start, +end]);
            break;
          }
        }
      }
    }
    return datalist;
  };



  // return [any[], any[]]
  mapGeneSymbolDataSource = ()  => {
    // read file
    const file = path.join(
      __dirname,
      'source',
      'gene_symbol.txt'
    );
    const context = fs.readFileSync(file, 'utf8');
    const lines = context.split('\n');

    const dataList = [];
  

    for (const line of lines) {
      // line space
      if (!line || line === '') continue;

      //ignore a commented line
      if (line.charAt(0) === '#') continue;

      const columns = line.split('\t');

      const  gene_symbol = columns[0], gene_id = columns[1];
     
        
    
      if(gene_symbol && gene_id) {
        const data = [ gene_id, gene_symbol];
        dataList.push(data);
      }
    
    }

    return dataList;
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