const fs = require('fs');
const dgv_37 = require('../database').dgv_37;
const dgv_38 = require('../database').dgv_38;
const mysql = require('mysql2/promise');
const path = require('path');
const readline = require('readline-sync');


class MapDataSource {
  pool;
  fileName;

  constructor(reference) {
    if (reference === 'grch37') {
      this.pool = dgv_37;
      this.fileName = 'GRCh37_hg19_variants_2016-05-15.txt';
    } else {
      this.pool = dgv_38;
      this.fileName = 'GRCh38_hg38_variants_2016-08-31.txt';
    }
  }
  createVariantTable = async () => {
    await this.pool.execute(`DROP TABLE IF EXISTS variant`);
    const sql = `CREATE TABLE variant (
        variant_accession varchar(20) NOT NULL,
        chr varchar(45) NOT NULL,
        start int(4) unsigned NOT NULL,
        end int(4) unsigned DEFAULT NULL,
        variant_type varchar(45) DEFAULT NULL,
        variant_subtype varchar(45) DEFAULT NULL,
        reference varchar(255) DEFAULT NULL,
        pubmed_id varchar(45) DEFAULT NULL,
        method varchar(255) DEFAULT NULL,
        platform varchar(45) DEFAULT NULL,
        supporting_variants varchar(35000) DEFAULT NULL,
        genes varchar(1200) DEFAULT NULL,
        samples varchar(22000) DEFAULT NULL,
        PRIMARY KEY (variant_accession)
      ) ENGINE=InnoDB DEFAULT CHARSET=latin1;`;

    console.log(sql);
    await this.pool.query(sql);
  };

  addVaraints = async mapped => {
    const sql = mysql.format(
      `INSERT INTO variant (
          variant_accession,
          chr,
          start,
          end,
          variant_type,
          variant_subtype,
          reference,
          pubmed_id,
          method,
          platform,
          supporting_variants,
          genes,
          samples
          ) VALUES ?`,
      [mapped]
    );

    console.log(sql);
    const [resultSetHeader] = await this.pool.query(sql);
    console.log(resultSetHeader);
  };

  mapDataSource = () => {
    // read file
    const file = path.join(__dirname, 'source', this.fileName);
    const context = fs.readFileSync(file, 'utf8');
    const lines = context.split('\n');

    const datalist = [];
    for (const line of lines) {
      // line space
      if (!line || line === '') continue;

      //ignore a commented line
      if (line.charAt(0) === '#') continue;

      const columns = line.split('\t');

      const variant_accession = columns[0],
        chr = columns[1],
        start = columns[2],
        end = columns[3],
        variant_type = columns[4],
        variant_subtype = columns[5],
        reference = columns[6],
        pubmed_id = columns[7],
        method = columns[8],
        platform = columns[9],
        supporting_variants = columns[11],
        genes = columns[18],
        samples = columns[19];

      if (variant_type !== 'CNV') continue;

      const chosenVariantSubType = new Set([
        'gain',
        'loss',
        'gain+loss',
        'duplication',
        'deletion'
      ]);
      if (!chosenVariantSubType.has(variant_subtype)) continue;

      const data = [
        variant_accession,
        chr,
        start,
        end,
        variant_type,
        variant_subtype,
        reference,
        pubmed_id,
        method,
        platform,
        supporting_variants,
        genes,
        samples
      ];

      datalist.push(data);
    }
    return datalist;
  };

  async main() {
    console.log(`file name: ${this.fileName}`);
    const dataSource = this.mapDataSource();
    await this.createVariantTable();
    await this.addVaraints(dataSource);
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



// // Use Arguments
// console.log(`Please specify the reference: GRCh37 (1), GRCh38 (2)`);
// var args = process.argv.slice(2);
// if (args[0] === '1') {
//   const mapDataSource = new MapDataSource('grch37');
//   mapDataSource.main();
// }
// if (args[0] === '2') {
//   const mapDataSource = new MapDataSource('grch38');
//   mapDataSource.main();
// }
